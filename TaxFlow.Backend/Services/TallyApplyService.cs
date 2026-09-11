using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services;

public interface ITallyApplyService
{
    Task<TallyApplyPreview> PreviewMastersAsync(string companyName, IReadOnlyCollection<TallyLedgerDto> ledgers, IReadOnlyCollection<TallyStockItemDto> stockItems, CancellationToken ct = default);
    Task<TallyApplyResult> ApplyMastersAsync(string companyName, IReadOnlyCollection<TallyLedgerDto> ledgers, IReadOnlyCollection<TallyStockItemDto> stockItems, CancellationToken ct = default);
}

public sealed class TallyApplyService : ITallyApplyService
{
    private readonly TaxFlowDbContext _db;
    public TallyApplyService(TaxFlowDbContext db) => _db = db;

    public async Task<TallyApplyPreview> PreviewMastersAsync(string companyName, IReadOnlyCollection<TallyLedgerDto> ledgers, IReadOnlyCollection<TallyStockItemDto> stockItems, CancellationToken ct = default)
    {
        var parties = await _db.Parties.AsNoTracking().ToListAsync(ct);
        var stock = await _db.StockItems.AsNoTracking().ToListAsync(ct);
        var items = new List<TallyApplyItem>();
        foreach (var ledger in ledgers.Where(x => IsPartyLedger(x)))
        {
            var match = MatchParty(ledger, parties);
            items.Add(new("Party", ledger.Name, match is null ? "Create" : "Skip", match?.MatchType ?? "New", match?.Score ?? 0, ledger.Gstin));
        }
        foreach (var item in stockItems)
        {
            var match = MatchStock(item, stock);
            items.Add(new("StockItem", item.Name, match is null ? "Create" : "Skip", match?.MatchType ?? "New", match?.Score ?? 0));
        }
        return new(companyName, items.Count(x => x.EntityType == "Party" && x.Action == "Skip"), items.Count(x => x.EntityType == "Party" && x.Action == "Create"), items.Count(x => x.EntityType == "StockItem" && x.Action == "Skip"), items.Count(x => x.EntityType == "StockItem" && x.Action == "Create"), items);
    }

    public async Task<TallyApplyResult> ApplyMastersAsync(string companyName, IReadOnlyCollection<TallyLedgerDto> ledgers, IReadOnlyCollection<TallyStockItemDto> stockItems, CancellationToken ct = default)
    {
        var parties = await _db.Parties.ToListAsync(ct);
        var stock = await _db.StockItems.ToListAsync(ct);
        var errors = new List<string>();
        var createdParties = 0; var createdStock = 0; var skipped = 0;

        foreach (var ledger in ledgers.Where(IsPartyLedger))
        {
            if (MatchParty(ledger, parties) is not null) { skipped++; continue; }
            if (string.IsNullOrWhiteSpace(ledger.Name)) continue;
            var type = IsVendorLedger(ledger) ? PartyType.Vendor : PartyType.Customer;
            var party = new Party { Id = StableId("party", companyName, ledger.Name), Name = ledger.Name.Trim(), Gstin = ledger.Gstin?.Trim() ?? string.Empty, Type = type, OpeningBalance = ledger.ClosingBalance ?? 0, CurrentBalance = ledger.ClosingBalance ?? 0 };
            if (parties.Any(x => x.Id == party.Id)) { skipped++; continue; }
            _db.Parties.Add(party); parties.Add(party); createdParties++;
        }

        foreach (var item in stockItems)
        {
            if (MatchStock(item, stock) is not null) { skipped++; continue; }
            if (string.IsNullOrWhiteSpace(item.Name)) continue;
            var imported = new StockItem { Id = StableId("stock", companyName, item.Name), Name = item.Name.Trim(), Hsn = item.Hsn?.Trim() ?? string.Empty, Unit = string.IsNullOrWhiteSpace(item.BaseUnits) ? "PCS" : item.BaseUnits.Trim(), Category = "Tally Import", CurrentStock = item.ClosingBalance ?? 0, MinStockLevel = 0, PurchasePrice = 0, SellingPrice = 0, GstRate = 0, LastUpdated = DateTime.UtcNow };
            if (stock.Any(x => x.Id == imported.Id)) { skipped++; continue; }
            _db.StockItems.Add(imported); stock.Add(imported); createdStock++;
        }

        try { await _db.SaveChangesAsync(ct); }
        catch (Exception ex) { errors.Add(ex.Message); }
        return new(errors.Count == 0, companyName, createdParties, createdStock, skipped, errors);
    }

    private static bool IsPartyLedger(TallyLedgerDto x) => !string.Equals(x.Parent, "Primary", StringComparison.OrdinalIgnoreCase) && (Contains(x.Parent, "Sundry Debtors") || Contains(x.Parent, "Sundry Creditors") || !string.IsNullOrWhiteSpace(x.Gstin));
    private static bool IsVendorLedger(TallyLedgerDto x) => Contains(x.Parent, "Sundry Creditors");
    private static bool Contains(string? value, string term) => value?.Contains(term, StringComparison.OrdinalIgnoreCase) == true;
    private static (string MatchType, decimal Score)? MatchParty(TallyLedgerDto tally, IReadOnlyCollection<Party> parties)
    {
        if (!string.IsNullOrWhiteSpace(tally.Gstin)) { var gst = parties.FirstOrDefault(x => Normalize(x.Gstin) == Normalize(tally.Gstin)); if (gst is not null) return ("GSTIN", 100); }
        var same = parties.Where(x => Normalize(x.Name) == Normalize(tally.Name)).ToList();
        return same.Count == 1 ? ("Name", 95) : null;
    }
    private static (string MatchType, decimal Score)? MatchStock(TallyStockItemDto tally, IReadOnlyCollection<StockItem> stock)
    {
        var same = stock.Where(x => Normalize(x.Name) == Normalize(tally.Name)).ToList();
        if (same.Count == 0) return null;
        return same.Any(x => !string.IsNullOrWhiteSpace(tally.Hsn) && Normalize(x.Hsn) == Normalize(tally.Hsn)) ? ("Name+HSN", 100) : ("Name", 90);
    }
    private static string Normalize(string? value) => new string((value ?? string.Empty).Trim().ToUpperInvariant().Where(char.IsLetterOrDigit).ToArray());
    private static string StableId(string kind, string company, string name) => $"tally-{kind}-{Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(company + "|" + name))).ToLowerInvariant()[..24]}";
}
