using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public class LedgerEntry
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        public string PartyId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string PartyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string VoucherType { get; set; } = "Sales"; // Sales, Purchase, Receipt, Payment, Journal

        [Required]
        [MaxLength(50)]
        public string VoucherNo { get; set; } = string.Empty;

        public decimal Debit { get; set; } = 0;

        public decimal Credit { get; set; } = 0;

        public decimal Balance { get; set; } = 0;

        [MaxLength(500)]
        public string Narration { get; set; } = string.Empty;
    }
}
