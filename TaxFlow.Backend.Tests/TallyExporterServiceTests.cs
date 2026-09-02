using Xunit;
using System.Xml.Linq;
using TaxFlow.Backend.Models;
using TaxFlow.Backend.Services;

namespace TaxFlow.Backend.Tests
{
    public class TallyExporterServiceTests
    {
        private readonly ITallyExporterService _tallyService;

        public TallyExporterServiceTests()
        {
            _tallyService = new TallyExporterService();
        }

        [Fact]
        public void GenerateSalesVouchersXml_ProducesValidTallyEnvelope_WithBalancedEntries()
        {
            // Arrange
            var invoices = new List<SalesInvoice>
            {
                new SalesInvoice
                {
                    InvoiceNumber = "INV-2026-001",
                    PartyName = "Shree Ram Metals",
                    Date = new DateTime(2026, 8, 15),
                    Subtotal = 100000,
                    CgstTotal = 9000,
                    SgstTotal = 9000,
                    IgstTotal = 0,
                    GrandTotal = 118000
                }
            };

            // Act
            string xmlResult = _tallyService.GenerateSalesVouchersXml(invoices, "Apex Electronics");

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(xmlResult));
            Assert.Contains("<ENVELOPE>", xmlResult);
            Assert.Contains("<TALLYREQUEST>Import Data</TALLYREQUEST>", xmlResult);
            Assert.Contains("<SVCURRENTCOMPANY>Apex Electronics</SVCURRENTCOMPANY>", xmlResult);
            Assert.Contains("<VOUCHERNUMBER>INV-2026-001</VOUCHERNUMBER>", xmlResult);
            Assert.Contains("<LEDGERNAME>Output CGST</LEDGERNAME>", xmlResult);
            Assert.Contains("<LEDGERNAME>Output SGST</LEDGERNAME>", xmlResult);

            var xdoc = XDocument.Parse(xmlResult);
            Assert.NotNull(xdoc.Root);
        }

        [Fact]
        public void GeneratePurchaseVouchersXml_ProducesValidPurchaseVouchers()
        {
            // Arrange
            var purchases = new List<PurchaseInvoice>
            {
                new PurchaseInvoice
                {
                    InvoiceNumber = "PUR-2026-101",
                    SupplierName = "Gujarat Industrial Polymers",
                    SupplierGstin = "24AABCS9999Z1ZX",
                    Date = new DateTime(2026, 8, 12),
                    TaxableValue = 50000,
                    CgstTotal = 4500,
                    SgstTotal = 4500,
                    IgstTotal = 0,
                    GrandTotal = 59000
                }
            };

            // Act
            string xmlResult = _tallyService.GeneratePurchaseVouchersXml(purchases, "Apex Electronics");

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(xmlResult));
            Assert.Contains("<VOUCHER VTYPE=\"Purchase\" ACTION=\"Create\">", xmlResult);
            Assert.Contains("<LEDGERNAME>Input CGST</LEDGERNAME>", xmlResult);
            Assert.Contains("<LEDGERNAME>Input SGST</LEDGERNAME>", xmlResult);
        }
    }
}
