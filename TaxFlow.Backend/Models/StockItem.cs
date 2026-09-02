using System.ComponentModel.DataAnnotations;

namespace TaxFlow.Backend.Models
{
    public class StockItem
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(10)]
        public string Hsn { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = "Electronics";

        [MaxLength(20)]
        public string Unit { get; set; } = "PCS";

        public decimal CurrentStock { get; set; } = 0;

        public decimal MinStockLevel { get; set; } = 10;

        public decimal PurchasePrice { get; set; } = 0;

        public decimal SellingPrice { get; set; } = 0;

        public decimal GstRate { get; set; } = 18;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
