using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services
{
    public interface IGstService
    {
        bool IsIntraState(string buyerStateCode, string sellerStateCode = "24");
        InvoiceItem CalculateItemTax(string description, string hsn, decimal qty, decimal rate, decimal gstRate, string buyerStateCode, string sellerStateCode = "24");
        void CalculateInvoiceTotals(SalesInvoice invoice, string sellerStateCode = "24");
    }

    public class GstService : IGstService
    {
        public bool IsIntraState(string buyerStateCode, string sellerStateCode = "24")
        {
            return string.Equals(buyerStateCode?.Trim(), sellerStateCode?.Trim(), StringComparison.OrdinalIgnoreCase);
        }

        public InvoiceItem CalculateItemTax(string description, string hsn, decimal qty, decimal rate, decimal gstRate, string buyerStateCode, string sellerStateCode = "24")
        {
            decimal taxable = Math.Round(qty * rate, 2);
            bool intra = IsIntraState(buyerStateCode, sellerStateCode);

            decimal cgst = 0;
            decimal sgst = 0;
            decimal igst = 0;

            if (intra)
            {
                decimal halfRate = gstRate / 2.0m;
                cgst = Math.Round((taxable * halfRate) / 100.0m, 2);
                sgst = Math.Round((taxable * halfRate) / 100.0m, 2);
            }
            else
            {
                igst = Math.Round((taxable * gstRate) / 100.0m, 2);
            }

            decimal total = taxable + cgst + sgst + igst;

            return new InvoiceItem
            {
                Description = description,
                Hsn = hsn,
                Qty = qty,
                Rate = rate,
                GstRate = gstRate,
                TaxableValue = taxable,
                CgstAmount = cgst,
                SgstAmount = sgst,
                IgstAmount = igst,
                TotalAmount = total
            };
        }

        public void CalculateInvoiceTotals(SalesInvoice invoice, string sellerStateCode = "24")
        {
            decimal subtotal = 0;
            decimal cgstTotal = 0;
            decimal sgstTotal = 0;
            decimal igstTotal = 0;

            bool intra = IsIntraState(invoice.PartyStateCode, sellerStateCode);

            foreach (var item in invoice.Items)
            {
                item.TaxableValue = Math.Round(item.Qty * item.Rate, 2);
                if (intra)
                {
                    decimal halfRate = item.GstRate / 2.0m;
                    item.CgstAmount = Math.Round((item.TaxableValue * halfRate) / 100.0m, 2);
                    item.SgstAmount = Math.Round((item.TaxableValue * halfRate) / 100.0m, 2);
                    item.IgstAmount = 0;
                }
                else
                {
                    item.CgstAmount = 0;
                    item.SgstAmount = 0;
                    item.IgstAmount = Math.Round((item.TaxableValue * item.GstRate) / 100.0m, 2);
                }

                item.TotalAmount = item.TaxableValue + item.CgstAmount + item.SgstAmount + item.IgstAmount;

                subtotal += item.TaxableValue;
                cgstTotal += item.CgstAmount;
                sgstTotal += item.SgstAmount;
                igstTotal += item.IgstAmount;
            }

            invoice.Subtotal = subtotal;
            invoice.CgstTotal = cgstTotal;
            invoice.SgstTotal = sgstTotal;
            invoice.IgstTotal = igstTotal;
            invoice.GrandTotal = subtotal + cgstTotal + sgstTotal + igstTotal - invoice.DiscountTotal;

            // Auto trigger E-Way Bill requirement if grand total > 50,000 INR
            if (invoice.GrandTotal > 50000)
            {
                invoice.EwayBillRequired = true;
            }
        }
    }
}
