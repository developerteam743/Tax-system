namespace TaxFlow.Backend.Models;

public sealed record TallyApplyPreview(
    string CompanyName,
    int ExistingParties,
    int NewParties,
    int ExistingStockItems,
    int NewStockItems,
    IReadOnlyCollection<TallyApplyItem> Items);

public sealed record TallyApplyItem(string EntityType, string TallyName, string Action, string MatchType, decimal Score, string? Gstin = null);

public sealed record TallyApplyResult(
    bool Success,
    string CompanyName,
    int PartiesCreated,
    int StockItemsCreated,
    int Skipped,
    IReadOnlyCollection<string> Errors);
