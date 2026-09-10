using System.Security.Cryptography;
using System.Text;
using System.Xml.Linq;

namespace TaxFlow.Backend.Services;

/// <summary>
/// Adds a stable REMOTEID to imported vouchers so repeated TaxFlow pushes can be
/// recognized by TallyPrime instead of becoming duplicate vouchers.
/// </summary>
public sealed class TallyRemoteIdHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        if (request.Content is not null && request.Content.Headers.ContentType?.MediaType?.Contains("xml", StringComparison.OrdinalIgnoreCase) == true)
        {
            var xml = await request.Content.ReadAsStringAsync(cancellationToken);
            if (IsImportData(xml))
            {
                xml = AddRemoteIds(xml);
                var content = new StringContent(xml, Encoding.UTF8, "text/xml");
                content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("text/xml") { CharSet = "UTF-8" };
                request.Content = content;
            }
        }

        return await base.SendAsync(request, cancellationToken);
    }

    private static bool IsImportData(string xml)
    {
        try
        {
            var doc = XDocument.Parse(xml);
            return string.Equals(doc.Descendants("TALLYREQUEST").FirstOrDefault()?.Value?.Trim(), "Import Data", StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    private static string AddRemoteIds(string xml)
    {
        var doc = XDocument.Parse(xml, LoadOptions.PreserveWhitespace);
        var company = doc.Descendants("SVCURRENTCOMPANY").FirstOrDefault()?.Value?.Trim() ?? string.Empty;

        foreach (var voucher in doc.Descendants("VOUCHER"))
        {
            if (voucher.Attribute("REMOTEID") is not null) continue;

            var type = voucher.Element("VOUCHERTYPENAME")?.Value?.Trim() ?? "Voucher";
            var number = voucher.Element("VOUCHERNUMBER")?.Value?.Trim() ?? string.Empty;
            var date = voucher.Element("DATE")?.Value?.Trim() ?? string.Empty;
            var source = $"TaxFlow|{company}|{type}|{number}|{date}";
            voucher.SetAttributeValue("REMOTEID", "TaxFlow-" + Sha256(source)[..32]);
        }

        return doc.ToString(SaveOptions.DisableFormatting);
    }

    private static string Sha256(string value)
        => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value))).ToLowerInvariant();
}
