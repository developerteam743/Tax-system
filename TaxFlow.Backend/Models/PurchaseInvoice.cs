using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public enum OcrStatus
    {
        Scanned = 1,
        Posted = 2,
        NeedsVerification = 3
    }

    public class PurchaseInvoice
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(50)]
        public string InvoiceNumber { get; set; } = string.Empty;

        public DateTime Date { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(200)]
        public string SupplierName { get; set; } = string.Empty;

        [MaxLength(15)]
        public string SupplierGstin { get; set; } = string.Empty;

        [MaxLength(2)]
        public string SupplierStateCode { get; set; } = "24";

        public string? ImageUrl { get; set; }

        public decimal OcrConfidence { get; set; } = 95.5m; // % Confidence

        public OcrStatus OcrStatus { get; set; } = OcrStatus.Scanned;

        public List<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();

        public decimal TaxableValue { get; set; } = 0;

        public decimal CgstTotal { get; set; } = 0;

        public decimal SgstTotal { get; set; } = 0;

        public decimal IgstTotal { get; set; } = 0;

        public decimal GrandTotal { get; set; } = 0;

        public bool PostedToLedger { get; set; } = false;

        public bool StockUpdated { get; set; } = false;

        public string? Notes { get; set; }
    }
}
