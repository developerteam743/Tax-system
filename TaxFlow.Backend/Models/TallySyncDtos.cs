namespace TaxFlow.Backend.Models;

public sealed record TallyLedgerDto(string Name, string? Parent, string? Gstin, decimal? ClosingBalance);
public sealed record TallyStockItemDto(string Name, string? Hsn, string? BaseUnits, decimal? ClosingBalance);
public sealed record TallyVoucherDto(string VoucherType, string VoucherNumber, DateTime? Date, string? PartyName, string? Reference, decimal Amount);
public sealed record TallyMasterMatchDto(string TaxFlowName, string TallyName, string MatchType, decimal Score, string? Gstin = null);
public sealed record TallyReconciliationDto(string Key, string Status, string? TaxFlowNumber, string? TallyNumber, decimal? TaxFlowAmount, decimal? TallyAmount, decimal? Difference, string? PartyName, string VoucherType, DateTime? Date);

public sealed record TallyMastersPreview(
    IReadOnlyCollection<TallyLedgerDto> Ledgers,
    IReadOnlyCollection<TallyStockItemDto> StockItems,
    IReadOnlyCollection<TallyMasterMatchDto> PartyMatches,
    IReadOnlyCollection<TallyMasterMatchDto> StockMatches,
    string RawResponse);

public sealed record TallyReconciliationPreview(
    int Matched,
    int AmountMismatch,
    int MissingInTaxFlow,
    int MissingInTally,
    IReadOnlyCollection<TallyReconciliationDto> Rows,
    string RawResponse);
