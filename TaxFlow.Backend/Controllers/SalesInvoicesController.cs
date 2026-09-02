using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesInvoicesController : ControllerBase
    {
        private readonly TaxFlowDbContext _context;
        private readonly IGstService _gstService;

        public SalesInvoicesController(TaxFlowDbContext context, IGstService gstService)
        {
            _context = context;
            _gstService = gstService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SalesInvoice>>> GetInvoices()
        {
            return await _context.SalesInvoices.Include(i => i.Items).OrderByDescending(i => i.Date).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<SalesInvoice>> CreateInvoice(SalesInvoice invoice)
        {
            if (string.IsNullOrEmpty(invoice.Id)) invoice.Id = Guid.NewGuid().ToString();
            
            // Calculate GST and totals
            _gstService.CalculateInvoiceTotals(invoice, "24");

            _context.SalesInvoices.Add(invoice);

            // Update Party Ledger & Current Balance
            var party = await _context.Parties.FindAsync(invoice.PartyId);
            if (party != null)
            {
                party.CurrentBalance += invoice.GrandTotal; // Debit customer (Receivable increases)

                _context.LedgerEntries.Add(new LedgerEntry
                {
                    PartyId = party.Id,
                    PartyName = party.Name,
                    VoucherType = "Sales",
                    VoucherNo = invoice.InvoiceNumber,
                    Debit = invoice.GrandTotal,
                    Credit = 0,
                    Balance = party.CurrentBalance,
                    Narration = $"Sales Bill #{invoice.InvoiceNumber} - Taxable: ₹{invoice.Subtotal}, GST: ₹{invoice.CgstTotal + invoice.SgstTotal + invoice.IgstTotal}"
                });
            }

            // Deduct stock quantity in Stock Register
            foreach (var item in invoice.Items)
            {
                if (!string.IsNullOrEmpty(item.StockItemId))
                {
                    var stockItem = await _context.StockItems.FindAsync(item.StockItemId);
                    if (stockItem != null)
                    {
                        stockItem.CurrentStock -= item.Qty;
                        stockItem.LastUpdated = DateTime.UtcNow;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetInvoices), new { id = invoice.Id }, invoice);
        }
    }
}
