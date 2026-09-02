using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseInvoicesController : ControllerBase
    {
        private readonly TaxFlowDbContext _context;

        public PurchaseInvoicesController(TaxFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PurchaseInvoice>>> GetPurchases()
        {
            return await _context.PurchaseInvoices.Include(p => p.Items).OrderByDescending(p => p.Date).ToListAsync();
        }

        [HttpPost("post-to-ledger/{id}")]
        public async Task<IActionResult> PostToLedger(string id)
        {
            var purchase = await _context.PurchaseInvoices.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id);
            if (purchase == null) return NotFound();

            if (purchase.PostedToLedger) return BadRequest("Purchase bill already posted to ledger.");

            // Find or create supplier party
            var party = await _context.Parties.FirstOrDefaultAsync(p => p.Gstin == purchase.SupplierGstin || p.Name == purchase.SupplierName);
            if (party == null)
            {
                party = new Party
                {
                    Name = purchase.SupplierName,
                    Gstin = purchase.SupplierGstin,
                    StateCode = purchase.SupplierStateCode,
                    Type = PartyType.Vendor,
                    CurrentBalance = -purchase.GrandTotal
                };
                _context.Parties.Add(party);
            }
            else
            {
                party.CurrentBalance -= purchase.GrandTotal; // Credit supplier (Payable increases)
            }

            // Post Ledger Entry
            _context.LedgerEntries.Add(new LedgerEntry
            {
                PartyId = party.Id,
                PartyName = party.Name,
                VoucherType = "Purchase",
                VoucherNo = purchase.InvoiceNumber,
                Debit = 0,
                Credit = purchase.GrandTotal,
                Balance = party.CurrentBalance,
                Narration = $"AI Purchase OCR Bill #{purchase.InvoiceNumber} - Supplier: {purchase.SupplierName}"
            });

            // Update Stock Register (Inward movement)
            foreach (var item in purchase.Items)
            {
                var stockItem = await _context.StockItems.FirstOrDefaultAsync(s => s.Hsn == item.Hsn || s.Name.Contains(item.Description));
                if (stockItem != null)
                {
                    stockItem.CurrentStock += item.Qty;
                    stockItem.LastUpdated = DateTime.UtcNow;
                }
            }

            purchase.PostedToLedger = true;
            purchase.StockUpdated = true;
            purchase.OcrStatus = OcrStatus.Posted;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Successfully posted purchase bill to Supplier Ledger and updated Stock Register!", partyBalance = party.CurrentBalance });
        }
    }
}
