using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public enum PartyType
    {
        Customer = 1,
        Vendor = 2,
        Both = 3
    }

    public class Party
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(15)]
        public string Gstin { get; set; } = string.Empty;

        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;

        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [MaxLength(100)]
        public string State { get; set; } = "Gujarat";

        [MaxLength(2)]
        public string StateCode { get; set; } = "24"; // Default Gujarat = 24

        public PartyType Type { get; set; } = PartyType.Customer;

        public decimal OpeningBalance { get; set; } = 0;

        public decimal CurrentBalance { get; set; } = 0; // Positive = Receivable, Negative = Payable

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
