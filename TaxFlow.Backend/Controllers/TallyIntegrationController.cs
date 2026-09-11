using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;
using System.Security.Cryptography;
using System.Text;

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

    [HttpGet("sync-history")]
    public async Task<IActionResult> SyncHistory([FromQuery] string? companyName, [FromQuery] string? status, [FromQuery] int take = 100, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 500);
        var query = _db.TallySyncRecords.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(companyName)) query = query.Where(x => x.CompanyName == companyName);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(x => x.Status == status);
        var rows = await query.OrderByDescending(x => x.LastAttemptAtUtc).Take(take).ToListAsync(ct);
        return Ok(rows);
    }

    [HttpGet("sync-summary")]
    public async Task<IActionResult> SyncSummary([FromQuery] string companyName, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(companyName)) return BadRequest(new { message = "companyName is required." });
        var rows = await _db.TallySyncRecords.AsNoTracking().Where(x => x.CompanyName == companyName).ToListAsync(ct);
        return Ok(new
        {
            companyName,
            total = rows.Count,
            succeeded = rows.Count(x => x.Status == "Succeeded"),
            failed = rows.Count(x => x.Status == "Failed"),
            pending = rows.Count(x => x.Status == "Pending"),
            lastSyncUtc = rows.Where(x => x.SucceededAtUtc.HasValue).Select(x => x.SucceededAtUtc).Max()
        });
    }

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
            var freshParties = await FilterUnsynced(parties, request.CompanyName, "Party", ct);
            var freshStock = await FilterUnsynced(stock, request.CompanyName, "StockItem", ct);
            var result = await _tally.PushMastersAsync(request.BaseUrl, request.CompanyName, freshParties, freshStock, ct);
            results.Add(result);
            await RecordResult(request.CompanyName, "Party", freshParties.Select(x => (x.Id, x.Name)), result, ct);
            await RecordResult(request.CompanyName, "StockItem", freshStock.Select(x => (x.Id, x.Name)), result, ct);
        }

        if (data is "all" or "sales")
        {
            var sales = await _db.SalesInvoices.Include(x => x.Items).AsNoTracking().OrderBy(x => x.Date).ToListAsync(ct);
            var fresh = await FilterUnsynced(sales, request.CompanyName, "SalesInvoice", ct);
            var result = await _tally.PushSalesAsync(request.BaseUrl, request.CompanyName, fresh, ct);
            results.Add(result);
            await RecordResult(request.CompanyName, "SalesInvoice", fresh.Select(x => (x.Id, x.InvoiceNumber)), result, ct);
        }

        if (data is "all" or "purchases")
        {
            var purchases = await _db.PurchaseInvoices.Include(x => x.Items).AsNoTracking().OrderBy(x => x.Date).ToListAsync(ct);
            var fresh = await FilterUnsynced(purchases, request.CompanyName, "PurchaseInvoice", ct);
            var result = await _tally.PushPurchasesAsync(request.BaseUrl, request.CompanyName, fresh, ct);
            results.Add(result);
            await RecordResult(request.CompanyName, "PurchaseInvoice", fresh.Select(x => (x.Id, x.InvoiceNumber)), result, ct);
        }

        return Ok(new { success = results.All(x => x.Success), results, timestampUtc = DateTime.UtcNow });
    }

    [HttpPost("pull")]
    public async Task<IActionResult> Pull([FromBody] TallyPullRequest request, CancellationToken ct)
    {
        if (!TryRange(request, out var from, out var to, out var error)) return BadRequest(new { message = error });
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
        if (!TryRange(request, out var from, out var to, out var error)) return BadRequest(new { message = error });
        var pulled = await _tally.PullVouchersAsync(request.BaseUrl, request.CompanyName, from, to, ct);
        var sales = await _db.SalesInvoices.AsNoTracking().Where(x => x.Date >= from && x.Date <= to).ToListAsync(ct);
        var purchases = await _db.PurchaseInvoices.AsNoTracking().Where(x => x.Date >= from && x.Date <= to).ToListAsync(ct);
        var local = sales.Select(x => new LocalVoucher(x.InvoiceNumber, "Sales", x.Date, x.PartyName, x.GrandTotal))
            .Concat(purchases.Select(x => new LocalVoucher(x.InvoiceNumber, "Purchase", x.Date, x.SupplierName, x.GrandTotal))).ToList();
        var rows = Reconcile(local, pulled.Vouchers);
        return Ok(new TallyReconciliationPreview(rows.Count(x => x.Status == "Matched"), rows.Count(x => x.Status == "AmountMismatch"), rows.Count(x => x.Status == "MissingInTaxFlow"), rows.Count(x => x.Status == "MissingInTally"), rows, pulled.RawResponse));
    }

    private async Task<List<T>> FilterUnsynced<T>(IReadOnlyCollection<T> source, string company, string type, CancellationToken ct) where T : class
    {
        var ids = source.Select(x => EntityId(x)).ToList();
        var done = await _db.TallySyncRecords.AsNoTracking().Where(x => x.CompanyName == company && x.Direction == "push" && x.EntityType == type && x.Status == "Succeeded" && ids.Contains(x.EntityId)).Select(x => x.EntityId).ToListAsync(ct);
        return source.Where(x => !done.Contains(EntityId(x))).ToList();
    }

    private async Task RecordResult(string company, string type, IEnumerable<(string Id, string RemoteKey)> entities, TallySyncResult result, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        foreach (var (id, remoteKey) in entities)
        {
            var row = await _db.TallySyncRecords.FirstOrDefaultAsync(x => x.CompanyName == company && x.Direction == "push" && x.EntityType == type && x.EntityId == id, ct);
            if (row is null)
            {
                row = new TallySyncRecord { CompanyName = company, Direction = "push", EntityType = type, EntityId = id };
                _db.TallySyncRecords.Add(row);
            }
            row.RemoteKey = remoteKey;
            row.PayloadHash = Sha256($"{company}|{type}|{id}|{remoteKey}");
            row.Status = result.Success ? "Succeeded" : "Failed";
            row.Attempts++;
            row.LastAttemptAtUtc = now;
            row.SucceededAtUtc = result.Success ? now : row.SucceededAtUtc;
            row.ErrorMessage = result.Success ? null : result.Message;
        }
        await _db.SaveChangesAsync(ct);
    }

    private static string EntityId<T>(T entity) => entity switch
    {
        Party x => x.Id,
        StockItem x => x.Id,
        SalesInvoice x => x.Id,
        PurchaseInvoice x => x.Id,
        _ => throw new InvalidOperationException($"Unsupported Tally sync entity: {typeof(T).Name}")
    };

    private static string Sha256(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static bool TryRange(TallyPullRequest request, out DateTime from, out DateTime to, out string? error)
    {
        from = (request.From ?? DateTime.UtcNow.Date.AddDays(-30)).Date;
        to = (request.To ?? DateTime.UtcNow.Date).Date;
        if (from > to)
        {
            error = "From date cannot be after To date.";
            return false;
        }
        error = null;
        return true;
    }

    private sealed record LocalVoucher(string Number, string Type, DateTime Date, string? Party, decimal Amount);
    private static List<TallyReconciliationDto> Reconcile(IReadOnlyCollection<LocalVoucher> local, IReadOnlyCollection<TallyVoucherDto> tally)
    {
        var rows = new List<TallyReconciliationDto>();
        var used = new HashSet<int>();
        foreach (var l in local)
        {
            var index = tally.Select((v, i) => (v, i)).Where(x => !used.Contains(x.i)).OrderByDescending(x => Score(l, x.v)).FirstOrDefault();
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
        if (sameName.Count != 1) return null;
        var hsnMatches = !string.IsNullOrWhiteSpace(tally.Hsn) && Normalize(sameName[0].Hsn) == Normalize(tally.Hsn);
        return new(sameName[0].Name, tally.Name, hsnMatches ? "Name+HSN" : "Name", string.IsNullOrWhiteSpace(tally.Hsn) ? 90 : hsnMatches ? 100 : 80);
    }
}
