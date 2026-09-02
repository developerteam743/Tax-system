import { SalesInvoice, InvoiceItem } from '../types/tax';
import * as XLSX from 'xlsx';

export const downloadGstr1Json = (invoices: SalesInvoice[], companyGstin = '24AAPCA1234F1ZV', period = '082026') => {
  const b2bInvoices = invoices.filter((i) => i.partyGstin && i.partyGstin.length === 15);

  const b2bGrouped: Record<string, any[]> = {};

  b2bInvoices.forEach((inv) => {
    if (!b2bGrouped[inv.partyGstin]) {
      b2bGrouped[inv.partyGstin] = [];
    }

    b2bGrouped[inv.partyGstin].push({
      inum: inv.invoiceNumber,
      idt: inv.date.split('-').reverse().join('-'),
      val: inv.grandTotal,
      pos: inv.partyStateCode,
      rchrg: 'N',
      inv_typ: 'R',
      itms: inv.items.map((item: InvoiceItem, idx: number) => ({
        num: idx + 1,
        itm_det: {
          txval: item.taxableValue,
          rt: item.gstRate,
          camt: item.cgstAmount,
          samt: item.sgstAmount,
          iamt: item.igstAmount,
          csamt: 0,
        },
      })),
    });
  });

  const b2bPayload = Object.keys(b2bGrouped).map((gstin) => ({
    ctin: gstin,
    inv: b2bGrouped[gstin],
  }));

  // HSN summary
  const hsnMap: Record<string, { hsn: string; desc: string; uqc: string; qty: number; val: number; txval: number; iamt: number; camt: number; samt: number }> = {};

  invoices.forEach((inv) => {
    inv.items.forEach((item: InvoiceItem) => {
      if (!hsnMap[item.hsn]) {
        hsnMap[item.hsn] = {
          hsn: item.hsn,
          desc: item.description,
          uqc: item.unit,
          qty: 0,
          val: 0,
          txval: 0,
          iamt: 0,
          camt: 0,
          samt: 0,
        };
      }

      hsnMap[item.hsn].qty += item.qty;
      hsnMap[item.hsn].txval += item.taxableValue;
      hsnMap[item.hsn].camt += item.cgstAmount;
      hsnMap[item.hsn].samt += item.sgstAmount;
      hsnMap[item.hsn].iamt += item.igstAmount;
      hsnMap[item.hsn].val += item.totalAmount;
    });
  });

  const hsnList = Object.values(hsnMap).map((h, idx) => ({
    num: idx + 1,
    hsn_sc: h.hsn,
    desc: h.desc,
    uqc: h.uqc,
    qty: h.qty,
    val: h.val,
    txval: h.txval,
    iamt: h.iamt,
    camt: h.camt,
    samt: h.samt,
    csamt: 0,
  }));

  const gstr1Payload = {
    gstin: companyGstin,
    fp: period,
    gt: invoices.reduce((acc, i) => acc + i.grandTotal, 0),
    cur_gt: invoices.reduce((acc, i) => acc + i.grandTotal, 0),
    b2b: b2bPayload,
    hsn: { data: hsnList },
    doc_issue: {
      doc_det: [
        {
          doc_num: 1,
          doc_typ: 'Invoices for outward supply',
          docs: [
            {
              num: 1,
              from: invoices[0]?.invoiceNumber || 'INV-001',
              to: invoices[invoices.length - 1]?.invoiceNumber || 'INV-001',
              totcnt: invoices.length,
              canc: 0,
              net_issue: invoices.length,
            },
          ],
        },
      ],
    },
  };

  const jsonStr = JSON.stringify(gstr1Payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GSTR1_Ready_Return_${period}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const downloadGstr1Excel = (invoices: SalesInvoice[]) => {
  const b2bRows = invoices.map((inv) => ({
    'GSTIN/UIN of Recipient': inv.partyGstin,
    'Receiver Name': inv.partyName,
    'Invoice Number': inv.invoiceNumber,
    'Invoice Date': inv.date,
    'Invoice Value': inv.grandTotal,
    'Place Of Supply': inv.placeOfSupply,
    'Reverse Charge': 'N',
    'Applicable % of Tax Rate': inv.items[0]?.gstRate || 18,
    'Invoice Type': 'Regular',
    'Taxable Value': inv.subtotal,
    'Central Tax Amount': inv.cgstTotal,
    'State Tax Amount': inv.sgstTotal,
    'Integrated Tax Amount': inv.igstTotal,
    'Cess Amount': 0,
  }));

  const wb = XLSX.utils.book_new();
  const wsB2B = XLSX.utils.json_to_sheet(b2bRows);
  XLSX.utils.book_append_sheet(wb, wsB2B, 'b2b');

  XLSX.writeFile(wb, `GSTR1_Excel_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
};
