using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public enum BankTxnType
    {
        Credit = 1, // Money In (Receivable settlement)
        Debit = 2   // Money Out (Payable settlement)
    }

    public enum ReconStatus
    {
        Pending = 0,
        Reconciled = 1,
        Ignored = 2
    }

    public class BankTransaction
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string ReferenceNo { get; set; } = string.Empty;

        public BankTxnType Type { get; set; } = BankTxnType.Credit;

        public decimal Amount { get; set; } = 0;

        public string? MatchedPartyId { get; set; }

        [MaxLength(200)]
        public string? MatchedPartyName { get; set; }

        public decimal MatchConfidence { get; set; } = 0; // % Fuzzy match score

        public ReconStatus Status { get; set; } = ReconStatus.Pending;

        public string? PostedLedgerId { get; set; }
    }
}
