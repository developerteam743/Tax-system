using System.Text;
using System.Xml.Linq;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services
{
    public interface ITallyExporterService
    {
        string GenerateSalesVouchersXml(List<SalesInvoice> invoices, string companyName = "Apex Electronics & Traders");
        string GeneratePurchaseVouchersXml(List<PurchaseInvoice> purchases, string companyName = "Apex Electronics & Traders");
    }

    public class TallyExporterService : ITallyExporterService
    {
        public string GenerateSalesVouchersXml(List<SalesInvoice> invoices, string companyName = "Apex Electronics & Traders")
        {
            XNamespace ns = "";
            var tallyMessageList = new List<XElement>();

            foreach (var inv in invoices)
            {
                var voucher = new XElement("VOUCHER",
                    new XAttribute("VTYPE", "Sales"),
                    new XAttribute("ACTION", "Create"),
                    new XElement("DATE", inv.Date.ToString("yyyyMMdd")),
                    new XElement("VOUCHERTYPENAME", "Sales"),
                    new XElement("VOUCHERNUMBER", inv.InvoiceNumber),
                    new XElement("PARTYLEDGERNAME", inv.PartyName),
                    new XElement("PERSISTEDVIEW", "Invoice View"),
                    
                    // Debiting Customer
                    new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", inv.PartyName),
                        new XElement("ISDEEMEDPOSITIVE", "YES"),
                        new XElement("AMOUNT", -inv.GrandTotal)
                    ),
                    
                    // Crediting Sales Account
                    new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Sales Accounts"),
                        new XElement("ISDEEMEDPOSITIVE", "NO"),
                        new XElement("AMOUNT", inv.Subtotal)
                    )
                );

                // Add Tax Ledgers
                if (inv.CgstTotal > 0)
                {
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Output CGST"),
                        new XElement("ISDEEMEDPOSITIVE", "NO"),
                        new XElement("AMOUNT", inv.CgstTotal)
                    ));
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Output SGST"),
                        new XElement("ISDEEMEDPOSITIVE", "NO"),
                        new XElement("AMOUNT", inv.SgstTotal)
                    ));
                }

                if (inv.IgstTotal > 0)
                {
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Output IGST"),
                        new XElement("ISDEEMEDPOSITIVE", "NO"),
                        new XElement("AMOUNT", inv.IgstTotal)
                    ));
                }

                tallyMessageList.Add(new XElement("TALLYMESSAGE", voucher));
            }

            var root = new XElement("ENVELOPE",
                new XElement("HEADER",
                    new XElement("TALLYREQUEST", "Import Data")
                ),
                new XElement("BODY",
                    new XElement("IMPORTDATA",
                        new XElement("REQUESTDESC",
                            new XElement("REPORTNAME", "Vouchers"),
                            new XElement("STATICVARIABLES",
                                new XElement("SVCURRENTCOMPANY", companyName)
                            )
                        ),
                        new XElement("REQUESTDATA", tallyMessageList)
                    )
                )
            );

            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + root.ToString();
        }

        public string GeneratePurchaseVouchersXml(List<PurchaseInvoice> purchases, string companyName = "Apex Electronics & Traders")
        {
            var tallyMessageList = new List<XElement>();

            foreach (var pur in purchases)
            {
                var voucher = new XElement("VOUCHER",
                    new XAttribute("VTYPE", "Purchase"),
                    new XAttribute("ACTION", "Create"),
                    new XElement("DATE", pur.Date.ToString("yyyyMMdd")),
                    new XElement("VOUCHERTYPENAME", "Purchase"),
                    new XElement("VOUCHERNUMBER", pur.InvoiceNumber),
                    new XElement("PARTYLEDGERNAME", pur.SupplierName),
                    
                    // Crediting Supplier
                    new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", pur.SupplierName),
                        new XElement("ISDEEMEDPOSITIVE", "NO"),
                        new XElement("AMOUNT", pur.GrandTotal)
                    ),
                    
                    // Debiting Purchase Account
                    new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Purchase Accounts"),
                        new XElement("ISDEEMEDPOSITIVE", "YES"),
                        new XElement("AMOUNT", -pur.TaxableValue)
                    )
                );

                if (pur.CgstTotal > 0)
                {
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Input CGST"),
                        new XElement("ISDEEMEDPOSITIVE", "YES"),
                        new XElement("AMOUNT", -pur.CgstTotal)
                    ));
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Input SGST"),
                        new XElement("ISDEEMEDPOSITIVE", "YES"),
                        new XElement("AMOUNT", -pur.SgstTotal)
                    ));
                }

                if (pur.IgstTotal > 0)
                {
                    voucher.Add(new XElement("ALLLEDGERENTRIES.LIST",
                        new XElement("LEDGERNAME", "Input IGST"),
                        new XElement("ISDEEMEDPOSITIVE", "YES"),
                        new XElement("AMOUNT", -pur.IgstTotal)
                    ));
                }

                tallyMessageList.Add(new XElement("TALLYMESSAGE", voucher));
            }

            var root = new XElement("ENVELOPE",
                new XElement("HEADER",
                    new XElement("TALLYREQUEST", "Import Data")
                ),
                new XElement("BODY",
                    new XElement("IMPORTDATA",
                        new XElement("REQUESTDESC",
                            new XElement("REPORTNAME", "Vouchers"),
                            new XElement("STATICVARIABLES",
                                new XElement("SVCURRENTCOMPANY", companyName)
                            )
                        ),
                        new XElement("REQUESTDATA", tallyMessageList)
                    )
                )
            );

            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" + root.ToString();
        }
    }
}
