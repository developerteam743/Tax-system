using System.Text.Json;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services
{
    public interface IGstr1ExporterService
    {
        string GenerateGstr1Json(List<SalesInvoice> invoices, string sellerGstin = "24AAPCA1234F1ZV", string returnPeriod = "082026");
    }

    public class Gstr1ExporterService : IGstr1ExporterService
    {
        public string GenerateGstr1Json(List<SalesInvoice> invoices, string sellerGstin = "24AAPCA1234F1ZV", string returnPeriod = "082026")
        {
            var b2bList = new List<object>();
            var b2csList = new List<object>();
            var hsnList = new List<object>();

            // Group B2B invoices by Customer GSTIN
            var b2bGrouped = invoices.Where(i => !string.IsNullOrEmpty(i.PartyGstin)).GroupBy(i => i.PartyGstin);

            foreach (var group in b2bGrouped)
            {
                var invList = new List<object>();
                foreach (var inv in group)
                {
                    var itemsList = new List<object>();
                    int itemSeq = 1;
                    foreach (var item in inv.Items)
                    {
                        itemsList.Add(new
                        {
                            num = itemSeq++,
                            itm_det = new
                            {
                                txval = item.TaxableValue,
                                rt = item.GstRate,
                                camt = item.CgstAmount,
                                samt = item.SgstAmount,
                                iamt = item.IgstAmount,
                                csamt = 0
                            }
                        });
                    }

                    invList.Add(new
                    {
                        inum = inv.InvoiceNumber,
                        idt = inv.Date.ToString("dd-MM-yyyy"),
                        val = inv.GrandTotal,
                        pos = inv.PartyStateCode,
                        rchrg = "N",
                        inv_typ = "R",
                        itms = itemsList
                    });
                }

                b2bList.Add(new
                {
                    ctin = group.Key,
                    inv = invList
                });
            }

            // Group HSN summary (Table 12)
            var allItems = invoices.SelectMany(i => i.Items);
            var hsnGrouped = allItems.GroupBy(i => i.Hsn);
            int hsnNum = 1;

            foreach (var hsnGrp in hsnGrouped)
            {
                decimal totalTaxable = hsnGrp.Sum(x => x.TaxableValue);
                decimal totalQty = hsnGrp.Sum(x => x.Qty);
                decimal totalCgst = hsnGrp.Sum(x => x.CgstAmount);
                decimal totalSgst = hsnGrp.Sum(x => x.SgstAmount);
                decimal totalIgst = hsnGrp.Sum(x => x.IgstAmount);
                string desc = hsnGrp.First().Description;
                string uqc = hsnGrp.First().Unit;

                hsnList.Add(new
                {
                    num = hsnNum++,
                    hsn_sc = hsnGrp.Key,
                    desc = desc,
                    uqc = uqc,
                    qty = totalQty,
                    val = totalTaxable + totalCgst + totalSgst + totalIgst,
                    txval = totalTaxable,
                    iamt = totalIgst,
                    camt = totalCgst,
                    samt = totalSgst,
                    csamt = 0
                });
            }

            var gstr1Payload = new
            {
                gstin = sellerGstin,
                fp = returnPeriod, // e.g. "082026"
                gt = invoices.Sum(i => i.GrandTotal),
                cur_gt = invoices.Sum(i => i.GrandTotal),
                b2b = b2bList,
                hsn = new
                {
                    data = hsnList
                },
                doc_issue = new
                {
                    doc_det = new[]
                    {
                        new
                        {
                            doc_num = 1,
                            doc_typ = "Invoices for outward supply",
                            docs = new[]
                            {
                                new
                                {
                                    num = 1,
                                    from = invoices.OrderBy(i => i.InvoiceNumber).FirstOrDefault()?.InvoiceNumber ?? "INV-001",
                                    to = invoices.OrderByDescending(i => i.InvoiceNumber).FirstOrDefault()?.InvoiceNumber ?? "INV-001",
                                    totcnt = invoices.Count,
                                    canc = 0,
                                    net_issue = invoices.Count
                                }
                            }
                        }
                    }
                }
            };

            return JsonSerializer.Serialize(gstr1Payload, new JsonSerializerOptions { WriteIndented = true });
        }
    }
}
