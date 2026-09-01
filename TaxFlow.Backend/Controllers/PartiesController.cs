using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartiesController : ControllerBase
    {
        private readonly TaxFlowDbContext _context;

        public PartiesController(TaxFlowDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Party>>> GetParties()
        {
            return await _context.Parties.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Party>> GetParty(string id)
        {
            var party = await _context.Parties.FindAsync(id);
            if (party == null) return NotFound();
            return party;
        }

        [HttpPost]
        public async Task<ActionResult<Party>> CreateParty(Party party)
        {
            if (string.IsNullOrEmpty(party.Id)) party.Id = Guid.NewGuid().ToString();
            if (string.IsNullOrEmpty(party.StateCode)) party.StateCode = "24"; // Gujarat default
            party.CurrentBalance = party.OpeningBalance;

            _context.Parties.Add(party);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetParty), new { id = party.Id }, party);
        }

        [HttpGet("{id}/ledger")]
        public async Task<ActionResult<IEnumerable<LedgerEntry>>> GetPartyLedger(string id)
        {
            return await _context.LedgerEntries
                .Where(l => l.PartyId == id)
                .OrderByDescending(l => l.Date)
                .ToListAsync();
        }
    }
}
