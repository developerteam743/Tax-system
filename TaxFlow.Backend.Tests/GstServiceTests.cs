using Xunit;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Tests
{
    public class GstServiceTests
    {
        private readonly IGstService _gstService;

        public GstServiceTests()
        {
            _gstService = new GstService();
        }

        [Fact]
        public void IsIntraState_WhenBothAreGujarat_ReturnsTrue()
        {
            // Act
            bool result = _gstService.IsIntraState("24", "24");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void IsIntraState_WhenInterstate_ReturnsFalse()
        {
            // Act
            bool result = _gstService.IsIntraState("27", "24"); // Maharashtra to Gujarat

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void CalculateItemTax_GujaratIntraState_SplitsCgstAndSgstEqually()
        {
            // Arrange
            decimal qty = 10;
            decimal rate = 1000; // Taxable = 10,000
            decimal gstRate = 18;

            // Act
            var item = _gstService.CalculateItemTax("Industrial Brass Valve", "8481", qty, rate, gstRate, "24", "24");

            // Assert
            Assert.Equal(10000m, item.TaxableValue);
            Assert.Equal(900m, item.CgstAmount); // 9%
            Assert.Equal(900m, item.SgstAmount); // 9%
            Assert.Equal(0m, item.IgstAmount);
            Assert.Equal(11800m, item.TotalAmount);
        }

        [Fact]
        public void CalculateItemTax_Interstate_AppliesFullIgst()
        {
            // Arrange
            decimal qty = 5;
            decimal rate = 2000; // Taxable = 10,000
            decimal gstRate = 18;

            // Act
            var item = _gstService.CalculateItemTax("CNC Milling Tool", "8207", qty, rate, gstRate, "27", "24");

            // Assert
            Assert.Equal(10000m, item.TaxableValue);
            Assert.Equal(0m, item.CgstAmount);
            Assert.Equal(0m, item.SgstAmount);
            Assert.Equal(1800m, item.IgstAmount); // 18%
            Assert.Equal(11800m, item.TotalAmount);
        }

        [Fact]
        public void CalculateInvoiceTotals_WhenGrandTotalExceeds50000_TriggersEwayBill()
        {
            // Arrange
            var invoice = new SalesInvoice
            {
                InvoiceNumber = "INV-TEST-001",
                PartyName = "Shree Ram Metals",
                PartyStateCode = "24",
                Items = new List<InvoiceItem>
                {
                    new InvoiceItem { Description = "Copper Rods", Hsn = "7407", Qty = 100, Rate = 600, GstRate = 18 } // 60,000 + 18% = 70,800
                }
            };

            // Act
            _gstService.CalculateInvoiceTotals(invoice, "24");

            // Assert
            Assert.Equal(60000m, invoice.Subtotal);
            Assert.Equal(5400m, invoice.CgstTotal);
            Assert.Equal(5400m, invoice.SgstTotal);
            Assert.Equal(70800m, invoice.GrandTotal);
            Assert.True(invoice.EwayBillRequired, "Eway Bill must be required for Grand Total > 50,000 INR");
        }

        [Fact]
        public void CalculateInvoiceTotals_WhenGrandTotalUnder50000_DoesNotRequireEwayBill()
        {
            // Arrange
            var invoice = new SalesInvoice
            {
                InvoiceNumber = "INV-TEST-002",
                PartyName = "Local Retailer",
                PartyStateCode = "24",
                Items = new List<InvoiceItem>
                {
                    new InvoiceItem { Description = "Small Nut Bolts", Hsn = "7318", Qty = 10, Rate = 500, GstRate = 18 } // 5,000 + 18% = 5,900
                }
            };

            // Act
            _gstService.CalculateInvoiceTotals(invoice, "24");

            // Assert
            Assert.Equal(5900m, invoice.GrandTotal);
            Assert.False(invoice.EwayBillRequired);
        }
    }
}
