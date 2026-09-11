using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<TaxFlowDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=taxflow.db"));

builder.Services.AddScoped<IGstService, GstService>();
builder.Services.AddScoped<ITallyExporterService, TallyExporterService>();
builder.Services.AddScoped<IGstr1ExporterService, Gstr1ExporterService>();
builder.Services.AddScoped<IBankMatcherService, BankMatcherService>();
builder.Services.AddScoped<ITallyApplyService, TallyApplyService>();
builder.Services.AddTransient<TallyRemoteIdHandler>();
builder.Services.AddHttpClient<ITallyIntegrationService, TallyIntegrationService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
}).AddHttpMessageHandler<TallyRemoteIdHandler>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaxFlowDbContext>();
    db.Database.EnsureCreated();
    // EnsureCreated does not evolve an already-created SQLite database. This keeps the
    // sync ledger deployable without forcing existing firms through a destructive reset.
    db.Database.ExecuteSqlRaw(@"
CREATE TABLE IF NOT EXISTS TallySyncRecords (
    Id TEXT NOT NULL PRIMARY KEY,
    CompanyName TEXT NOT NULL,
    Direction TEXT NOT NULL,
    EntityType TEXT NOT NULL,
    EntityId TEXT NOT NULL,
    RemoteKey TEXT NOT NULL,
    PayloadHash TEXT NOT NULL,
    Status TEXT NOT NULL,
    Attempts INTEGER NOT NULL DEFAULT 0,
    LastAttemptAtUtc TEXT NOT NULL,
    SucceededAtUtc TEXT NULL,
    ErrorMessage TEXT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS IX_TallySyncRecords_Company_Direction_Entity
ON TallySyncRecords (CompanyName, Direction, EntityType, EntityId);
");
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaxFlow AI ERP API v1");
    c.RoutePrefix = "swagger";
});
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));
app.Run();
