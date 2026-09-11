namespace TaxFlow.Backend.Models;

public sealed class TallySyncRecord
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string CompanyName { get; set; } = string.Empty;
    public string Direction { get; set; } = "push";
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string RemoteKey { get; set; } = string.Empty;
    public string PayloadHash { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public int Attempts { get; set; }
    public DateTime LastAttemptAtUtc { get; set; }
    public DateTime? SucceededAtUtc { get; set; }
    public string? ErrorMessage { get; set; }
}
