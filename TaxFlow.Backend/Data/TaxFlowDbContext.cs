using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Data
{
    public class TaxFlowDbContext : DbContext
    {
        public TaxFlowDbContext(DbContextOptions<TaxFlowDbContext> options) : base(options) { }

        public DbSet<Party> Parties { get; set; } = null!;
        public DbSet<SalesInvoice> SalesInvoices { get; set; } = null!;
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; } = null!;
        public DbSet<InvoiceItem> InvoiceItems { get; set; } = null!;
        public DbSet<StockItem> StockItems { get; set; } = null!;
        public DbSet<BankTransaction> BankTransactions { get; set; } = null!;
        public DbSet<LedgerEntry> LedgerEntries { get; set; } = null!;
        public DbSet<TallySyncRecord> TallySyncRecords { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<TallySyncRecord>().HasIndex(x => new { x.CompanyName, x.Direction, x.EntityType, x.EntityId }).IsUnique();

            // Gujarat default seed data
            modelBuilder.Entity<Party>().HasData(
                new Party { Id = "p-101", Name = "Patel Electronics & Mobiles", Gstin = "24AAPCP1234E1ZV", Phone = "+91 98250 11223", Email = "sales@patelelectronics.com", Address = "102 Ring Road Market", City = "Ahmedabad", State = "Gujarat", StateCode = "24", Type = PartyType.Customer, OpeningBalance = 45000, CurrentBalance = 128500 },
                new Party { Id = "p-102", Name = "Sharma Traders Pvt Ltd", Gstin = "24AAACS9876F1ZP", Phone = "+91 98795 44332", Email = "info@sharmatraders.in", Address = "GIDC Electronics Zone, Sector 25", City = "Gandhinagar", State = "Gujarat", StateCode = "24", Type = PartyType.Vendor, OpeningBalance = -62000, CurrentBalance = -94000 },
                new Party { Id = "p-103", Name = "Mumbai Tech Distributors", Gstin = "27AAACM4433K1Z9", Phone = "+91 98200 99887", Email = "orders@mumbaitech.com", Address = "Lamington Road Market", City = "Mumbai", State = "Maharashtra", StateCode = "27", Type = PartyType.Vendor, OpeningBalance = -115000, CurrentBalance = -115000 }
            );

            modelBuilder.Entity<StockItem>().HasData(
                new StockItem { Id = "st-1", Name = "Wireless Gaming Mouse RGB", Hsn = "84716060", Category = "Computer Peripherals", Unit = "PCS", CurrentStock = 145, MinStockLevel = 20, PurchasePrice = 850, SellingPrice = 1450, GstRate = 18, LastUpdated = DateTime.UtcNow },
                new StockItem { Id = "st-2", Name = "Mechanical Keyboard Blue Switch", Hsn = "84716060", Category = "Computer Peripherals", Unit = "PCS", CurrentStock = 82, MinStockLevel = 15, PurchasePrice = 1900, SellingPrice = 3200, GstRate = 18, LastUpdated = DateTime.UtcNow },
                new StockItem { Id = "st-3", Name = "27 Inch 4K IPS Monitor", Hsn = "85285200", Category = "Displays", Unit = "PCS", CurrentStock = 18, MinStockLevel = 5, PurchasePrice = 18500, SellingPrice = 24900, GstRate = 18, LastUpdated = DateTime.UtcNow }
            );
        }
    }
}
