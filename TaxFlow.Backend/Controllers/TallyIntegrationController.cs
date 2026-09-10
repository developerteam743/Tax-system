using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers;

[ApiController]
[Route("api/tally")]
public sealed class TallyIntegrationController : ControllerBase
{
    private readonly TaxFlowDbContext _db;
    private readonly ITallyIntegrationService _tally;

    public TallyIntegrationController(TaxFlowDbContext db, ITallyIntegrationService tally)
    {
        _db = db;
        _tally = tally;
    }

    public sealed record TallyConnectionRequest(string BaseUrl = "http://localhost:9000", string? CompanyName = null);
    public sealed record TallySyncRequest(string BaseUrl = "http://localhost:9000", string CompanyName = "Apex Electronics & Traders", string Direction = "push", string Data = "all");
    public sealed record TallyPullRequest(string BaseUrl = "http://localhost:9000", string CompanyName = "Apex Electronics & Traders", DateTime? From = null, DateTime? To = null);

    [HttpPost("test-connection")]
    public async Task<IActionResult> TestConnection([FromBody] TallyConnectionRequest request, CancellationToken ct)
        => Ok(await _tally.TestConnectionAsync(request.BaseUrl, request.CompanyName, ct));

    [HttpPost("companies")]
    public async Task<IActionResult> Companies([FromBody] TallyConnectionRequest request, CancellationToken ct)
        => Ok(await _tally.PullCompaniesAsync(request.BaseUrl, ct));

    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] TallySyncRequest request, CancellationToken ct)
    {
        if (!string.Equals(request.Direction, "push", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Use /api/tally/pull for Tally-to-TaxFlow reads." });

        var data = request.Data.ToLowerInvariant();
        var results = new List<TallySyncResult>();

        if (data is "all" or "masters")
        {
            var parties = await _db.Parties.AsNoTracking().ToListAsync(ct);
            var stock = await _db.StockItems.AsNoTracking().ToListAsync(ct);
            results.Add(await _tally.PushMastersAsync(request.BaseUrl, request.CompanyName, parties, stock, ct));
        }

        if (data is "all" or "sales")
        {
            var sales = await _db.SalesInvoices.Include(x => x.Items).AsNoTracking().OrderBy(x => x.Date).ToListAsync(ct);
            results.Add(await _tally.PushSalesAsync(request.BaseUrl, request.CompanyName, sales, ct));
        }

        if (data is "all" or "purchases")
        {
            var purchases = await _db.PurchaseInvoices.Include(x => x.Items).AsNoTracking().OrderBy(x => x.Date).ToListAsync(ct);
            results.Add(await _tally.PushPurchasesAsync(request.BaseUrl, request.CompanyName, purchases, ct));
        }

        return Ok(new { success = results.All(x => x.Success), results, timestampUtc = DateTime.UtcNow });
    }

    [HttpPost("pull")]
    public async Task<IActionResult> Pull([FromBody] TallyPullRequest request, CancellationToken ct)
    {
        var (from, to) = Range(request);
        var result = await _tally.PullDaybookAsync(request.BaseUrl, request.CompanyName, from, to, ct);
        return Ok(new { result, from, to, note = "Read-only pull; no TaxFlow records are mutated." });
    }

    [HttpPost("masters-preview")]
    public async Task<IActionResult> MastersPreview([FromBody] TallyConnectionRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName)) return BadRequest(new { message = "CompanyName is required." });
        var pulled = await _tally.PullMastersAsync(request.BaseUrl, request.CompanyName, ct);
        var parties = await _db.Parties.AsNoTracking().ToListAsync(ct);
        var stock = await _db.StockItems.AsNoTracking().ToListAsync(ct);

        var partyMatches = pulled.Ledgers.Select(t => MatchParty(t, parties)).Where(x => x is not null).Cast<TallyMasterMatchDto>().ToList();
        var stockMatches = pulled.StockItems.Select(t => MatchStock(t, stock)).Where(x => x is not null).Cast<TallyMasterMatchDto>().ToList();
        return Ok(new TallyMastersPreview(pulled.Ledgers, pulled.StockItems, partyMatches, stockMatches, pulled.RawResponse));
    }

    [HttpPost("reconcile")]
    public async Task<IActionResult> Reconcile([FromBody] TallyPullRequest request, CancellationToken ct)
    {
        var (from, to) = Range(request);
        var pulled = await _tally.PullVouchersAsync(request.BaseUrl, request.CompanyName, from, to, ct);
        var sales = await _db.SalesInvoices.AsNoTracking().Where(x => x.Date >= from && x.Date <= to).ToListAsync(ct);
        var purchases = await _db.PurchaseInvoices.AsNoTracking().Where(x => x.Date >= from && x.Date <= to).ToListAsync(ct);

        var local = sales.Select(x => new LocalVoucher(x.InvoiceNumber, "Sales", x.Date, x.PartyName, x.GrandTotal))
            .Concat(purchases.Select(x => new LocalVoucher(x.InvoiceNumber, "Purchase", x.Date, x.SupplierName, x.GrandTotal))).ToList();
        var rows = Reconcile(local, pulled.Vouchers);
        return Ok(new TallyReconciliationPreview(rows.Count(x => x.Status == "Matched"), rows.Count(x => x.Status == "AmountMismatch"), rows.Count(x => x.Status == "MissingInTaxFlow"), rows.Count(x => x.Status == "MissingInTally"), rows, pulled.RawResponse));
    }

    private static (DateTime From, DateTime To) Range(TallyPullRequest request)
    {
        var from = (request.From ?? DateTime.UtcNow.Date.AddDays(-30)).Date;
        var to = (request.To ?? DateTime.UtcNow.Date).Date;
        if (from > to) throw new ArgumentException("From date cannot be after To date.");
        return (from, to);
    }

    private sealed record LocalVoucher(string Number, string Type, DateTime Date, string? Party, decimal Amount);

    private static List<TallyReconciliationDto> Reconcile(IReadOnlyCollection<LocalVoucher> local, IReadOnlyCollection<TallyVoucherDto> tally)
    {
        var rows = new List<TallyReconciliationDto>();
        var used = new HashSet<int>();
        foreach (var l in local)
        {
            var index = tally.Select((v, i) => (v, i)).Where(x => !used.Contains(x.i)).OrderBy(x => Score(l, x.v)).FirstOrDefault();
            if (index.v is null || Score(l, index.v) < 50)
            {
                rows.Add(new TallyReconciliationDto(Key(l.Type, l.Number), "MissingInTally", l.Number, null, l.Amount, null, null, l.Party, l.Type, l.Date));
                continue;
            }
            used.Add(index.i);
            var diff = Math.Round(l.Amount - index.v.Amount, 2);
            rows.Add(new TallyReconciliationDto(Key(l.Type, l.Number), diff == 0 ? "Matched" : "AmountMismatch", l.Number, index.v.VoucherNumber, l.Amount, index.v.Amount, diff, l.Party ?? index.v.PartyName, l.Type, l.Date));
        }
        foreach (var t in tally.Select((v, i) => (v, i)).Where(x => !used.Contains(x.i)))
            rows.Add(new TallyReconciliationDto(Key(t.v.VoucherType, t.v.VoucherNumber), "MissingInTaxFlow", null, t.v.VoucherNumber, null, t.v.Amount, null, t.v.PartyName, t.v.VoucherType, t.v.Date));
        return rows;
    }

    private static int Score(LocalVoucher l, TallyVoucherDto t)
    {
        var score = 0;
        if (string.Equals(l.Number, t.VoucherNumber, StringComparison.OrdinalIgnoreCase)) score += 70;
        if (Normalize(l.Type) == Normalize(t.VoucherType)) score += 15;
        if (l.Date.Date == t.Date?.Date) score += 10;
        if (!string.IsNullOrWhiteSpace(l.Party) && Normalize(l.Party) == Normalize(t.PartyName)) score += 5;
        return score;
    }

    private static string Key(string type, string number) => $"{Normalize(type)}|{Normalize(number)}";
    private static string Normalize(string? value) => new string((value ?? string.Empty).Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());

    private static TallyMasterMatchDto? MatchParty(TallyLedgerDto tally, IReadOnlyCollection<Party> parties)
    {
        var byGstin = !string.IsNullOrWhiteSpace(tally.Gstin) ? parties.FirstOrDefault(p => Normalize(p.Gstin) == Normalize(tally.Gstin)) : null;
        if (byGstin is not null) return new(byGstin.Name, tally.Name, "GSTIN", 100, tally.Gstin);
        var same = parties.Where(p => Normalize(p.Name) == Normalize(tally.Name)).ToList();
        return same.Count == 1 ? new(same[0].Name, tally.Name, "Name", 95, tally.Gstin) : same.Count > 1 ? new(same[0].Name, tally.Name, "AmbiguousName", 60, tally.Gstin) : null;
    }

    private static TallyMasterMatchDto? MatchStock(TallyStockItemDto tally, IReadOnlyCollection<StockItem> stock)
    {
        var sameName = stock.Where(s => Normalize(s.Name) == Normalize(tally.Name)).ToList();
        if (sameName.Count == 1) return new(sameName[0].Name, tally.Name, string.Equals(Normalize(sameName[0].Hsn), Normalize(tally.Hsn), StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(tally.Hsn) ? "Name+HSN" : "Name", string.IsNullOrWhiteSpace(tally.Hsn) ? 90 : Normalize(sameName[0].Hsn) == Normalize(tally.Hsn) ? 100 : 80);
        return null;
    }
}
