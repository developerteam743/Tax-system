using Xunit;
using System.Text.Json;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Tests
{
    public class Gstr1ExporterServiceTests
    {
        private readonly IGstr1ExporterService _exporterService;

        public Gstr1ExporterServiceTests()
        {
            _exporterService = new Gstr1ExporterService();
        }

        [Fact]
        public void GenerateGstr1Json_ProducesValidJson_WithB2BAndHsnTables()
        {
            // Arrange
            var invoices = new List<SalesInvoice>
            {
                new SalesInvoice
                {
                    InvoiceNumber = "INV-2026-001",
                    PartyName = "Shree Ram Metals",
                    PartyGstin = "24AABCS1429B1ZX",
                    PartyStateCode = "24",
                    Date = new DateTime(2026, 8, 10),
                    Subtotal = 100000,
                    CgstTotal = 9000,
                    SgstTotal = 9000,
                    IgstTotal = 0,
                    GrandTotal = 118000,
                    Items = new List<InvoiceItem>
                    {
                        new InvoiceItem
                        {
                            Description = "Brass Rods",
                            Hsn = "7407",
                            Qty = 100,
                            Rate = 1000,
                            GstRate = 18,
                            TaxableValue = 100000,
                            CgstAmount = 9000,
                            SgstAmount = 9000,
                            IgstAmount = 0,
                            TotalAmount = 118000,
                            Unit = "KGS"
                        }
                    }
                }
            };

            // Act
            string jsonResult = _exporterService.GenerateGstr1Json(invoices, "24AAPCA1234F1ZV", "082026");

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(jsonResult));

            using var doc = JsonDocument.Parse(jsonResult);
            var root = doc.RootElement;

            Assert.Equal("24AAPCA1234F1ZV", root.GetProperty("gstin").GetString());
            Assert.Equal("082026", root.GetProperty("fp").GetString());
            Assert.Equal(118000m, root.GetProperty("gt").GetDecimal());

            // Assert B2B section
            var b2bArray = root.GetProperty("b2b");
            Assert.Equal(1, b2bArray.GetArrayLength());
            Assert.Equal("24AABCS1429B1ZX", b2bArray[0].GetProperty("ctin").GetString());

            // Assert HSN section
            var hsnData = root.GetProperty("hsn").GetProperty("data");
            Assert.Equal(1, hsnData.GetArrayLength());
            Assert.Equal("7407", hsnData[0].GetProperty("hsn_sc").GetString());
            Assert.Equal(100000m, hsnData[0].GetProperty("txval").GetDecimal());
        }
    }
}
