using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public class InvoiceItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? SalesInvoiceId { get; set; }

        public string? PurchaseInvoiceId { get; set; }

        public string? StockItemId { get; set; }

        [Required]
        [MaxLength(250)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Hsn { get; set; } = string.Empty;

        public decimal Qty { get; set; } = 1;

        [MaxLength(20)]
        public string Unit { get; set; } = "PCS";

        public decimal Rate { get; set; } = 0;

        public decimal GstRate { get; set; } = 18; // e.g. 18%

        public decimal TaxableValue { get; set; } = 0;

        public decimal CgstAmount { get; set; } = 0;

        public decimal SgstAmount { get; set; } = 0;

        public decimal IgstAmount { get; set; } = 0;

        public decimal TotalAmount { get; set; } = 0;
    }
}
