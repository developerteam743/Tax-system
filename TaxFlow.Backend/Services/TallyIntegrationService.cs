using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Xml.Linq;
using TaxFlow.Backend.Models;

namespace TaxFlow.Backend.Services;

public record TallyConnectionResult(bool Connected, string Message, string? CompanyName = null, string? RawResponse = null);
public record TallySyncResult(bool Success, string Message, int Requested, int Imported = 0, string? RawResponse = null);

public interface ITallyIntegrationService
{
    Task<TallyConnectionResult> TestConnectionAsync(string baseUrl, string? companyName = null, CancellationToken cancellationToken = default);
    Task<TallySyncResult> PushSalesAsync(string baseUrl, string companyName, IReadOnlyCollection<SalesInvoice> invoices, CancellationToken cancellationToken = default);
    Task<TallySyncResult> PushPurchasesAsync(string baseUrl, string companyName, IReadOnlyCollection<PurchaseInvoice> invoices, CancellationToken cancellationToken = default);
    Task<TallySyncResult> PushMastersAsync(string baseUrl, string companyName, IReadOnlyCollection<Party> parties, IReadOnlyCollection<StockItem> stock, CancellationToken cancellationToken = default);
    Task<TallyConnectionResult> PullCompaniesAsync(string baseUrl, CancellationToken cancellationToken = default);
    Task<TallyConnectionResult> PullDaybookAsync(string baseUrl, string companyName, DateTime from, DateTime to, CancellationToken cancellationToken = default);
    Task<(IReadOnlyCollection<TallyLedgerDto> Ledgers, IReadOnlyCollection<TallyStockItemDto> StockItems, string RawResponse)> PullMastersAsync(string baseUrl, string companyName, CancellationToken cancellationToken = default);
    Task<(IReadOnlyCollection<TallyVoucherDto> Vouchers, string RawResponse)> PullVouchersAsync(string baseUrl, string companyName, DateTime from, DateTime to, CancellationToken cancellationToken = default);
}

public sealed class TallyIntegrationService : ITallyIntegrationService
{
    private readonly HttpClient _http;
    public TallyIntegrationService(HttpClient http) => _http = http;

    public async Task<TallyConnectionResult> TestConnectionAsync(string baseUrl, string? companyName = null, CancellationToken cancellationToken = default)
    {
        var url = NormalizeUrl(baseUrl);
        var xml = companyName is null ? BuildListCompaniesRequest() : BuildPingRequest(companyName);
        try
        {
            var response = await PostXmlAsync(url, xml, cancellationToken);
            var names = ExtractCompanyNames(response);
            var connected = !string.IsNullOrWhiteSpace(response) && !response.Contains("Could not connect", StringComparison.OrdinalIgnoreCase);
            return new TallyConnectionResult(connected, connected ? "TallyPrime HTTP endpoint is reachable." : "TallyPrime returned an error.", names.FirstOrDefault(), response);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        { return new TallyConnectionResult(false, $"Unable to reach TallyPrime at {url}. {ex.Message}"); }
    }

    public async Task<TallySyncResult> PushSalesAsync(string baseUrl, string companyName, IReadOnlyCollection<SalesInvoice> invoices, CancellationToken cancellationToken = default)
        => invoices.Count == 0 ? new(true, "No sales invoices to push.", 0) : await PushAsync(baseUrl, BuildSalesImport(companyName, invoices), invoices.Count, cancellationToken);

    public async Task<TallySyncResult> PushPurchasesAsync(string baseUrl, string companyName, IReadOnlyCollection<PurchaseInvoice> invoices, CancellationToken cancellationToken = default)
        => invoices.Count == 0 ? new(true, "No purchase invoices to push.", 0) : await PushAsync(baseUrl, BuildPurchaseImport(companyName, invoices), invoices.Count, cancellationToken);

    public async Task<TallySyncResult> PushMastersAsync(string baseUrl, string companyName, IReadOnlyCollection<Party> parties, IReadOnlyCollection<StockItem> stock, CancellationToken cancellationToken = default)
        => await PushAsync(baseUrl, BuildMasterImport(companyName, parties, stock), parties.Count + stock.Count, cancellationToken);

    public async Task<TallyConnectionResult> PullCompaniesAsync(string baseUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await PostXmlAsync(NormalizeUrl(baseUrl), BuildListCompaniesRequest(), cancellationToken);
            var names = ExtractCompanyNames(response);
            return new TallyConnectionResult(true, $"Received {names.Count} company name(s) from TallyPrime.", names.FirstOrDefault(), response);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        { return new TallyConnectionResult(false, ex.Message); }
    }

    public async Task<TallyConnectionResult> PullDaybookAsync(string baseUrl, string companyName, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await PostXmlAsync(NormalizeUrl(baseUrl), BuildDaybookRequest(companyName, from, to), cancellationToken);
            return new TallyConnectionResult(true, "Daybook response received from TallyPrime.", companyName, response);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        { return new TallyConnectionResult(false, ex.Message, companyName); }
    }

    public async Task<(IReadOnlyCollection<TallyLedgerDto> Ledgers, IReadOnlyCollection<TallyStockItemDto> StockItems, string RawResponse)> PullMastersAsync(string baseUrl, string companyName, CancellationToken cancellationToken = default)
    {
        var ledgerXml = await PostXmlAsync(NormalizeUrl(baseUrl), BuildLedgerCollectionRequest(companyName), cancellationToken);
        var stockXml = await PostXmlAsync(NormalizeUrl(baseUrl), BuildStockCollectionRequest(companyName), cancellationToken);
        return (ParseLedgers(ledgerXml), ParseStockItems(stockXml), ledgerXml + "\n\n<!-- STOCK ITEMS -->\n" + stockXml);
    }

    public async Task<(IReadOnlyCollection<TallyVoucherDto> Vouchers, string RawResponse)> PullVouchersAsync(string baseUrl, string companyName, DateTime from, DateTime to, CancellationToken cancellationToken = default)
    {
        var xml = await PostXmlAsync(NormalizeUrl(baseUrl), BuildDaybookRequest(companyName, from, to), cancellationToken);
        return (ParseVouchers(xml), xml);
    }

    private async Task<TallySyncResult> PushAsync(string baseUrl, string xml, int requested, CancellationToken cancellationToken)
    {
        try
        {
            var response = await PostXmlAsync(NormalizeUrl(baseUrl), xml, cancellationToken);
            var errors = ExtractNumber(response, "ERRORS");
            var created = ExtractNumber(response, "CREATED");
            var imported = created > 0 ? created : Math.Max(0, requested - errors);
            return errors == 0 ? new(true, $"TallyPrime accepted the import. {imported} object(s) processed.", requested, imported, response) : new(false, $"TallyPrime reported {errors} error(s). Review the raw response.", requested, imported, response);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        { return new(false, ex.Message, requested); }
    }

    private async Task<string> PostXmlAsync(string url, string xml, CancellationToken cancellationToken)
    {
        using var content = new StringContent(xml, Encoding.UTF8, "text/xml");
        content.Headers.ContentType = new MediaTypeHeaderValue("text/xml") { CharSet = "UTF-8" };
        using var response = await _http.PostAsync(url, content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        response.EnsureSuccessStatusCode();
        return body;
    }

    private static string NormalizeUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) throw new ArgumentException("Tally URL is required.");
        return url.Trim().TrimEnd('/');
    }

    private static string BuildListCompaniesRequest() => "<?xml version=\"1.0\" encoding=\"UTF-8\"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>List of Companies</ID></HEADER><BODY><DESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>";
    private static string BuildPingRequest(string companyName) => $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>List of Companies</ID></HEADER><BODY><DESC><STATICVARIABLES><SVCURRENTCOMPANY>{Escape(companyName)}</SVCURRENTCOMPANY><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>";
    private static string BuildLedgerCollectionRequest(string companyName) => $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Collection</TYPE><ID>List of Ledgers</ID></HEADER><BODY><DESC><STATICVARIABLES><SVCURRENTCOMPANY>{Escape(companyName)}</SVCURRENTCOMPANY><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>";
    private static string BuildStockCollectionRequest(string companyName) => $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>List of Accounts</ID></HEADER><BODY><DESC><STATICVARIABLES><SVCURRENTCOMPANY>{Escape(companyName)}</SVCURRENTCOMPANY><AccountType>Stock Items</AccountType><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>";

    private static string BuildSalesImport(string companyName, IEnumerable<SalesInvoice> invoices)
    {
        var messages = invoices.Select(inv =>
        {
            var voucher = new XElement("VOUCHER", new XAttribute("ACTION", "Create"), new XElement("DATE", inv.Date.ToString("yyyyMMdd")), new XElement("VOUCHERTYPENAME", "Sales"), new XElement("VOUCHERNUMBER", inv.InvoiceNumber), new XElement("PARTYLEDGERNAME", inv.PartyName), new XElement("PERSISTEDVIEW", "Invoice View"), new XElement("REFERENCE", inv.InvoiceNumber), Ledger(inv.PartyName, true, -inv.GrandTotal));
            foreach (var item in inv.Items) voucher.Add(new XElement("ALLINVENTORYENTRIES.LIST", new XElement("STOCKITEMNAME", item.Description), new XElement("ISDEEMEDPOSITIVE", "NO"), new XElement("RATE", item.Rate), new XElement("ACTUALQTY", $"{item.Qty} {item.Unit}"), new XElement("BILLEDQTY", $"{item.Qty} {item.Unit}"), new XElement("AMOUNT", -item.TaxableValue)));
            voucher.Add(Ledger("Sales Accounts", false, inv.Subtotal));
            if (inv.CgstTotal > 0) { voucher.Add(Ledger("Output CGST", false, inv.CgstTotal)); voucher.Add(Ledger("Output SGST", false, inv.SgstTotal)); }
            if (inv.IgstTotal > 0) voucher.Add(Ledger("Output IGST", false, inv.IgstTotal));
            return new XElement("TALLYMESSAGE", voucher);
        });
        return Envelope(companyName, messages);
    }

    private static string BuildPurchaseImport(string companyName, IEnumerable<PurchaseInvoice> invoices)
    {
        var messages = invoices.Select(inv =>
        {
            var voucher = new XElement("VOUCHER", new XAttribute("ACTION", "Create"), new XElement("DATE", inv.Date.ToString("yyyyMMdd")), new XElement("VOUCHERTYPENAME", "Purchase"), new XElement("VOUCHERNUMBER", inv.InvoiceNumber), new XElement("PARTYLEDGERNAME", inv.SupplierName), new XElement("REFERENCE", inv.InvoiceNumber), Ledger(inv.SupplierName, false, inv.GrandTotal));
            foreach (var item in inv.Items) voucher.Add(new XElement("ALLINVENTORYENTRIES.LIST", new XElement("STOCKITEMNAME", item.Description), new XElement("ISDEEMEDPOSITIVE", "YES"), new XElement("RATE", item.Rate), new XElement("ACTUALQTY", $"{item.Qty} {item.Unit}"), new XElement("BILLEDQTY", $"{item.Qty} {item.Unit}"), new XElement("AMOUNT", -item.TaxableValue)));
            voucher.Add(Ledger("Purchase Accounts", true, -inv.TaxableValue));
            if (inv.CgstTotal > 0) { voucher.Add(Ledger("Input CGST", true, -inv.CgstTotal)); voucher.Add(Ledger("Input SGST", true, -inv.SgstTotal)); }
            if (inv.IgstTotal > 0) voucher.Add(Ledger("Input IGST", true, -inv.IgstTotal));
            return new XElement("TALLYMESSAGE", voucher);
        });
        return Envelope(companyName, messages);
    }

    private static string BuildMasterImport(string companyName, IEnumerable<Party> parties, IEnumerable<StockItem> stock)
    {
        var messages = new List<XElement>();
        foreach (var p in parties) messages.Add(new XElement("TALLYMESSAGE", new XElement("LEDGER", new XAttribute("NAME", p.Name), new XAttribute("ACTION", "Create"), new XElement("NAME", p.Name), new XElement("PARENT", p.Type == PartyType.Vendor ? "Sundry Creditors" : "Sundry Debtors"), new XElement("ISBILLWISEON", "Yes"), new XElement("PARTYGSTIN", p.Gstin))));
        foreach (var s in stock)
        {
            messages.Add(new XElement("TALLYMESSAGE", new XElement("STOCKITEM", new XAttribute("NAME", s.Name), new XAttribute("ACTION", "Create"), new XElement("NAME", s.Name), new XElement("PARENT", "Primary"), new XElement("BASEUNITS", s.Unit), new XElement("GSTAPPLICABLE", "Applicable"), new XElement("GSTTYPEOFSUPPLY", "Goods"), new XElement("GSTDETAILS.LIST", new XElement("APPLICABLEFROM", DateTime.Today.ToString("yyyyMMdd")), new XElement("STATEWISEDETAILS.LIST", new XElement("STATENAME", "Any"), new XElement("RATEDETAILS.LIST", new XElement("GSTRATE", s.GstRate))))));
        }
        return Envelope(companyName, messages);
    }

    private static string BuildDaybookRequest(string companyName, DateTime from, DateTime to) => $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><ENVELOPE><HEADER><VERSION>1</VERSION><TALLYREQUEST>Export</TALLYREQUEST><TYPE>Data</TYPE><ID>Daybook</ID></HEADER><BODY><DESC><STATICVARIABLES><SVCURRENTCOMPANY>{Escape(companyName)}</SVCURRENTCOMPANY><SVFROMDATE>{from:yyyyMMdd}</SVFROMDATE><SVTODATE>{to:yyyyMMdd}</SVTODATE><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></DESC></BODY></ENVELOPE>";
    private static XElement Ledger(string name, bool positive, decimal amount) => new("ALLLEDGERENTRIES.LIST", new XElement("LEDGERNAME", name), new XElement("ISDEEMEDPOSITIVE", positive ? "YES" : "NO"), new XElement("AMOUNT", amount));
    private static string Envelope(string companyName, IEnumerable<XElement> messages) => new XDocument(new XElement("ENVELOPE", new XElement("HEADER", new XElement("TALLYREQUEST", "Import Data")), new XElement("BODY", new XElement("IMPORTDATA", new XElement("REQUESTDESC", new XElement("REPORTNAME", "Vouchers"), new XElement("STATICVARIABLES", new XElement("SVCURRENTCOMPANY", companyName))), new XElement("REQUESTDATA", messages))))).ToString();

    private static List<string> ExtractCompanyNames(string xml) { try { return XDocument.Parse(xml).Descendants("COMPANY").Select(x => (string?)x.Attribute("NAME") ?? x.Value).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase).ToList(); } catch { return new(); } }
    private static int ExtractNumber(string xml, string element) { try { return int.TryParse(XDocument.Parse(xml).Descendants(element).FirstOrDefault()?.Value, out var n) ? n : 0; } catch { return 0; } }

    private static List<TallyLedgerDto> ParseLedgers(string xml)
    {
        try { return XDocument.Parse(xml).Descendants("LEDGER").Select(x => new TallyLedgerDto(Text(x, "NAME"), Text(x, "PARENT"), Text(x, "PARTYGSTIN") ?? Text(x, "GSTIN"), Decimal(x, "CLOSINGBALANCE"))).Where(x => !string.IsNullOrWhiteSpace(x.Name)).GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase).Select(g => g.First()).ToList(); } catch { return new(); }
    }

    private static List<TallyStockItemDto> ParseStockItems(string xml)
    {
        try { return XDocument.Parse(xml).Descendants("STOCKITEM").Select(x => new TallyStockItemDto(Text(x, "NAME"), Text(x, "HSNDETAILS") ?? Text(x, "HSN"), Text(x, "BASEUNITS"), ParseQuantity(Text(x, "CLOSINGBALANCE")))).Where(x => !string.IsNullOrWhiteSpace(x.Name)).GroupBy(x => x.Name, StringComparer.OrdinalIgnoreCase).Select(g => g.First()).ToList(); } catch { return new(); }
    }

    private static List<TallyVoucherDto> ParseVouchers(string xml)
    {
        try
        {
            return XDocument.Parse(xml).Descendants("VOUCHER").Select(x =>
            {
                var inventory = x.Descendants("ALLINVENTORYENTRIES.LIST").Select(e => new TallyVoucherLineDto(Text(e, "STOCKITEMNAME"), ParseQuantity(Text(e, "BILLEDQTY") ?? Text(e, "ACTUALQTY")), ExtractUnit(Text(e, "BILLEDQTY") ?? Text(e, "ACTUALQTY")), Math.Abs(Decimal(e, "RATE") ?? 0), Math.Abs(Decimal(e, "AMOUNT") ?? 0), ExtractGstRate(e))).ToList();
                var ledgers = x.Descendants("LEDGERENTRIES.LIST").Select(e => new TallyLedgerLineDto(Text(e, "LEDGERNAME") ?? "", Math.Abs(Decimal(e, "AMOUNT") ?? 0), string.Equals(Text(e, "ISDEEMEDPOSITIVE"), "YES", StringComparison.OrdinalIgnoreCase))).Where(e => !string.IsNullOrWhiteSpace(e.LedgerName)).ToList();
                return new TallyVoucherDto(Text(x, "VOUCHERTYPENAME") ?? "Unknown", Text(x, "VOUCHERNUMBER") ?? "", ParseDate(Text(x, "DATE")), Text(x, "PARTYLEDGERNAME") ?? Text(x, "PARTYNAME"), Text(x, "REFERENCE"), Math.Abs(Decimal(x, "AMOUNT") ?? SumLedgerAmounts(x)), inventory, ledgers);
            }).Where(x => !string.IsNullOrWhiteSpace(x.VoucherNumber)).ToList();
        }
        catch { return new(); }
    }

    private static decimal SumLedgerAmounts(XElement x) => x.Descendants("LEDGERENTRIES.LIST").Select(e => Math.Abs(Decimal(e, "AMOUNT") ?? 0)).Sum();
    private static decimal ParseQuantity(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return 0;
        var token = value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault();
        return System.Decimal.TryParse(token, NumberStyles.Any, CultureInfo.InvariantCulture, out var number) ? Math.Abs(number) : 0;
    }
    private static string? ExtractUnit(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        var parts = value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : null;
    }
    private static decimal ExtractGstRate(XElement e)
    {
        var candidates = e.Descendants().Where(x => x.Name.LocalName.Contains("GST", StringComparison.OrdinalIgnoreCase) && x.Name.LocalName.Contains("RATE", StringComparison.OrdinalIgnoreCase)).Select(x => x.Value.Trim());
        return candidates.Select(v => System.Decimal.TryParse(v, NumberStyles.Any, CultureInfo.InvariantCulture, out var n) ? n : 0).FirstOrDefault();
    }
    private static string? Text(XElement e, string name) => e.Descendants(name).Select(x => x.Value.Trim()).FirstOrDefault(v => v.Length > 0);
    private static decimal? Decimal(XElement e, string name) => System.Decimal.TryParse(Text(e, name), NumberStyles.Any, CultureInfo.InvariantCulture, out var value) ? value : null;
    private static DateTime? ParseDate(string? value) => DateTime.TryParseExact(value, "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d) ? d : null;
    private static string Escape(string value) => System.Security.SecurityElement.Escape(value) ?? string.Empty;
}