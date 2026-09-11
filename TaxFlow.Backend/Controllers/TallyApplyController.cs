using Microsoft.AspNetCore.Mvc;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Controllers;

[ApiController]
[Route("api/tally")]
public sealed class TallyApplyController : ControllerBase
{
    private readonly ITallyIntegrationService _tally;
    private readonly ITallyApplyService _apply;

    public TallyApplyController(ITallyIntegrationService tally, ITallyApplyService apply)
    {
        _tally = tally;
        _apply = apply;
    }

    public sealed record ApplyRequest(string BaseUrl = "http://localhost:9000", string CompanyName = "Apex Electronics & Traders", bool Confirm = false);

    [HttpPost("apply-masters")]
    public async Task<IActionResult> ApplyMasters([FromBody] ApplyRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName)) return BadRequest(new { message = "CompanyName is required." });
        try
        {
            var pulled = await _tally.PullMastersAsync(request.BaseUrl, request.CompanyName, ct);
            if (!request.Confirm)
                return Ok(new { mode = "preview", preview = await _apply.PreviewMastersAsync(request.CompanyName, pulled.Ledgers, pulled.StockItems, ct), note = "Set Confirm=true to apply only new, confidently unmatched masters." });
            return Ok(await _apply.ApplyMastersAsync(request.CompanyName, pulled.Ledgers, pulled.StockItems, ct));
        }
        catch (HttpRequestException ex) { return BadRequest(new { message = ex.Message }); }
    }
}
