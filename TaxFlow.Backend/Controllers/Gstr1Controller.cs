using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class Gstr1Controller : ControllerBase
    {
        private readonly TaxFlowDbContext _context;
        private readonly IGstr1ExporterService _gstr1Exporter;

        public Gstr1Controller(TaxFlowDbContext context, IGstr1ExporterService gstr1Exporter)
        {
            _context = context;
            _gstr1Exporter = gstr1Exporter;
        }

        [HttpGet("export-json")]
        public async Task<IActionResult> ExportGstr1Json([FromQuery] string returnPeriod = "082026")
        {
            var sales = await _context.SalesInvoices.Include(s => s.Items).ToListAsync();
            string json = _gstr1Exporter.GenerateGstr1Json(sales, "24AAPCA1234F1ZV", returnPeriod);

            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(json);
            return File(bytes, "application/json", $"GSTR1_Return_{returnPeriod}.json");
        }
    }
}
