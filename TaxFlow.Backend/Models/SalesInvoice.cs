using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public enum InvoiceStatus
    {
        Unpaid = 0,
        Partial = 1,
        Paid = 2
    }

    public class SalesInvoice
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public DateTime DueDate { get; set; } = DateTime.UtcNow.AddDays(30);

        [Required]
        public string PartyId { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string PartyName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string PartyGstin { get; set; } = string.Empty;

        [MaxLength(2)]
        public string PartyStateCode { get; set; } = "24";

        [MaxLength(100)]
        public string PlaceOfSupply { get; set; } = "24-Gujarat";

        public List<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();

        public decimal Subtotal { get; set; } = 0;

        public decimal CgstTotal { get; set; } = 0;

        public decimal SgstTotal { get; set; } = 0;

        public decimal IgstTotal { get; set; } = 0;

        public decimal DiscountTotal { get; set; } = 0;

        public decimal GrandTotal { get; set; } = 0;

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;

        public decimal AmountPaid { get; set; } = 0;

        // E-Way Bill Details (Auto-triggered when GrandTotal > 50,000)
        public bool EwayBillRequired { get; set; } = false;

        [MaxLength(50)]
        public string? EwayBillNumber { get; set; }

        public DateTime? EwayBillDate { get; set; }

        [MaxLength(50)]
        public string? TransporterId { get; set; }

        [MaxLength(150)]
        public string? TransporterName { get; set; }

        [MaxLength(20)]
        public string? VehicleNumber { get; set; }

        public int DistanceKm { get; set; } = 150;
    }
}
