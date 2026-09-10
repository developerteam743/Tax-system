using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers;

[ApiController]
[Route("api/tally")]
public sealed class TallyVoucherPreviewController : ControllerBase
{
    private readonly ITallyIntegrationService _tally;
    private readonly TaxFlowDbContext _db;

    public TallyVoucherPreviewController(ITallyIntegrationService tally, TaxFlowDbContext db)
    {
        _tally = tally;
        _db = db;
    }

    public sealed record PreviewRequest(
        string BaseUrl = "http://localhost:9000",
        string CompanyName = "Apex Electronics & Traders",
        DateTime? From = null,
        DateTime? To = null);

    [HttpPost("vouchers-preview")]
    public async Task<IActionResult> Preview([FromBody] PreviewRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName))
            return BadRequest(new { message = "CompanyName is required." });

        var from = (request.From ?? DateTime.Today.AddDays(-30)).Date;
        var to = (request.To ?? DateTime.Today).Date;
        if (from > to)
            return BadRequest(new { message = "From date cannot be after To date." });

        try
        {
            var pulled = await _tally.PullVouchersAsync(request.BaseUrl, request.CompanyName, from, to, ct);
            var existingSales = await _db.SalesInvoices
                .AsNoTracking()
                .Select(x => x.InvoiceNumber)
                .ToListAsync(ct);
            var existingPurchases = await _db.PurchaseInvoices
                .AsNoTracking()
                .Select(x => x.InvoiceNumber)
                .ToListAsync(ct);

            var salesNumbers = existingSales.ToHashSet(StringComparer.OrdinalIgnoreCase);
            var purchaseNumbers = existingPurchases.ToHashSet(StringComparer.OrdinalIgnoreCase);
            var items = pulled.Vouchers.Select(v => BuildItem(v, salesNumbers, purchaseNumbers)).ToList();

            return Ok(new TallyVoucherApplyPreview(
                request.CompanyName,
                from,
                to,
                items.Count,
                items.Count(x => x.Action == "CandidateSales"),
                items.Count(x => x.Action == "CandidatePurchases"),
                items.Count(x => x.Action == "Unsupported"),
                items.Count(x => x.Action == "AlreadyImported"),
                items,
                pulled.RawResponse));
        }
        catch (HttpRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private static TallyVoucherApplyPreviewItem BuildItem(
        TallyVoucherDto voucher,
        HashSet<string> salesNumbers,
        HashSet<string> purchaseNumbers)
    {
        var type = voucher.VoucherType.Trim();
        var isSales = type.Equals("Sales", StringComparison.OrdinalIgnoreCase) || type.Contains("Sales", StringComparison.OrdinalIgnoreCase);
        var isPurchase = type.Equals("Purchase", StringComparison.OrdinalIgnoreCase) || type.Contains("Purchase", StringComparison.OrdinalIgnoreCase);
        var number = voucher.VoucherNumber.Trim();
        var alreadyImported = (isSales && salesNumbers.Contains(number)) || (isPurchase && purchaseNumbers.Contains(number));
        var warnings = new List<string>();

        if (alreadyImported)
        {
            warnings.Add("A TaxFlow invoice already uses this voucher number; preview will not create a duplicate.");
        }
        else if (isSales)
        {
            warnings.AddRange(CommonWarnings(voucher));
            if (voucher.InventoryLines.Count == 0) warnings.Add("No inventory lines were parsed; this may be an accounting-only sales voucher.");
        }
        else if (isPurchase)
        {
            warnings.AddRange(CommonWarnings(voucher));
            if (voucher.InventoryLines.Count == 0) warnings.Add("No inventory lines were parsed; this may be an accounting-only purchase voucher.");
        }
        else
        {
            warnings.Add("Voucher type is not mapped to TaxFlow's SalesInvoice or PurchaseInvoice model. No mutation is performed.");
            if (voucher.LedgerLines.Count == 0) warnings.Add("No ledger lines were parsed from this voucher.");
        }

        var action = alreadyImported
            ? "AlreadyImported"
            : isSales ? "CandidateSales"
            : isPurchase ? "CandidatePurchases"
            : "Unsupported";

        return new TallyVoucherApplyPreviewItem(
            voucher.VoucherType,
            voucher.VoucherNumber,
            voucher.Date,
            voucher.PartyName,
            action,
            Math.Abs(voucher.Amount),
            voucher.InventoryLines,
            voucher.LedgerLines,
            warnings);
    }

    private static IEnumerable<string> CommonWarnings(TallyVoucherDto voucher)
    {
        if (string.IsNullOrWhiteSpace(voucher.VoucherNumber)) yield return "Voucher number is blank; duplicate detection cannot rely on the number.";
        if (string.IsNullOrWhiteSpace(voucher.PartyName)) yield return "Party ledger is blank; a party must be resolved before import.";
        if (voucher.Date is null) yield return "Voucher date could not be parsed.";
        if (voucher.Amount == 0 && voucher.InventoryLines.Count == 0) yield return "Voucher has no parsed amount or inventory lines.";
        if (voucher.InventoryLines.Any(x => string.IsNullOrWhiteSpace(x.StockItemName))) yield return "At least one inventory line has no stock item name.";
        if (voucher.InventoryLines.Any(x => x.Quantity <= 0)) yield return "At least one inventory line has a non-positive quantity; import should be reviewed manually.";
    }
}
