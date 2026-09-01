using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TallyExportController : ControllerBase
    {
        private readonly TaxFlowDbContext _context;
        private readonly ITallyExporterService _tallyExporter;

        public TallyExportController(TaxFlowDbContext context, ITallyExporterService tallyExporter)
        {
            _context = context;
            _tallyExporter = tallyExporter;
        }

        [HttpGet("sales-xml")]
        public async Task<IActionResult> ExportSalesXml()
        {
            var sales = await _context.SalesInvoices.Include(s => s.Items).ToListAsync();
            string xml = _tallyExporter.GenerateSalesVouchersXml(sales);

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(xml);
            return File(bytes, "application/xml", "Tally_Sales_Vouchers.xml");
        }

        [HttpGet("purchase-xml")]
        public async Task<IActionResult> ExportPurchaseXml()
        {
            var purchases = await _context.PurchaseInvoices.Include(p => p.Items).ToListAsync();
            string xml = _tallyExporter.GeneratePurchaseVouchersXml(purchases);

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(xml);
            return File(bytes, "application/xml", "Tally_Purchase_Vouchers.xml");
        }
    }
}
