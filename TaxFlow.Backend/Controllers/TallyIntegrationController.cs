using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
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

        return Ok(new
        {
            success = results.All(x => x.Success),
            results,
            timestampUtc = DateTime.UtcNow
        });
    }

    [HttpPost("pull")]
    public async Task<IActionResult> Pull([FromBody] TallyPullRequest request, CancellationToken ct)
    {
        var from = request.From ?? DateTime.UtcNow.Date.AddDays(-30);
        var to = request.To ?? DateTime.UtcNow.Date;
        if (from > to) return BadRequest(new { message = "From date cannot be after To date." });

        var result = await _tally.PullDaybookAsync(request.BaseUrl, request.CompanyName, from, to, ct);
        return Ok(new { result, from, to, note = "Pull is read-only in this first phase; raw Tally XML is returned for mapping/preview." });
    }
}
