import { SalesInvoice, PurchaseInvoice } from '../types/tax';
import * as XLSX from 'xlsx';

export const downloadTallySalesXml = (invoices: SalesInvoice[], companyName = 'Apex Electronics & Traders') => {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>${companyName}</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>`;

  invoices.forEach((inv) => {
    xml += `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VTYPE="Sales" ACTION="Create">
            <DATE>${inv.date.replace(/-/g, '')}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${inv.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${inv.partyName}</PARTYLEDGERNAME>
            <PERSISTEDVIEW>Invoice View</PERSISTEDVIEW>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${inv.partyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>YES</ISDEEMEDPOSITIVE>
              <AMOUNT>-${inv.grandTotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Accounts</LEDGERNAME>
              <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.subtotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;

    if (inv.cgstTotal > 0) {
      xml += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.cgstTotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.sgstTotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
    }

    if (inv.igstTotal > 0) {
      xml += `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output IGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>NO</ISDEEMEDPOSITIVE>
              <AMOUNT>${inv.igstTotal}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>`;
    }

    xml += `
          </VOUCHER>
        </TALLYMESSAGE>`;
  });

  xml += `
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Tally_Prime_Sales_Vouchers_${new Date().toISOString().split('T')[0]}.xml`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadTallyExcelTemplate = (sales: SalesInvoice[], purchases: PurchaseInvoice[]) => {
  const salesRows = sales.map((inv) => ({
    'Date': inv.date,
    'Voucher Type': 'Sales',
    'Voucher No': inv.invoiceNumber,
    'Party Name': inv.partyName,
    'GSTIN': inv.partyGstin,
    'Sales Account': 'Sales Accounts',
    'Taxable Amount': inv.subtotal,
    'CGST': inv.cgstTotal,
    'SGST': inv.sgstTotal,
    'IGST': inv.igstTotal,
    'Total Voucher Amount': inv.grandTotal,
  }));

  const purchaseRows = purchases.map((pur) => ({
    'Date': pur.date,
    'Voucher Type': 'Purchase',
    'Voucher No': pur.invoiceNumber,
    'Supplier Name': pur.supplierName,
    'GSTIN': pur.supplierGstin,
    'Purchase Account': 'Purchase Accounts',
    'Taxable Amount': pur.taxableValue,
    'CGST': pur.cgstTotal,
    'SGST': pur.sgstTotal,
    'IGST': pur.igstTotal,
    'Total Voucher Amount': pur.grandTotal,
  }));

  const wb = XLSX.utils.book_new();
  const wsSales = XLSX.utils.json_to_sheet(salesRows);
  const wsPurchase = XLSX.utils.json_to_sheet(purchaseRows);

  XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Vouchers');
  XLSX.utils.book_append_sheet(wb, wsPurchase, 'Purchase Vouchers');

  XLSX.writeFile(wb, `Tally_Excel_Import_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
};
