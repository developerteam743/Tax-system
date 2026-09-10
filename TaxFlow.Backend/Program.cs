using Microsoft.EntityFrameworkCore;
using TaxFlow.Backend.Data;
using TaxFlow.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite Database
builder.Services.AddDbContext<TaxFlowDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=taxflow.db"));

// Business ERP services
builder.Services.AddScoped<IGstService, GstService>();
builder.Services.AddScoped<ITallyExporterService, TallyExporterService>();
builder.Services.AddScoped<IGstr1ExporterService, Gstr1ExporterService>();
builder.Services.AddScoped<IBankMatcherService, BankMatcherService>();

// TallyPrime communicates through its local/network HTTP gateway (default commonly 9000).
builder.Services.AddHttpClient<ITallyIntegrationService, TallyIntegrationService>(client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Enable CORS for React Web & Mobile App
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Auto create and seed SQLite DB on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaxFlowDbContext>();
    db.Database.EnsureCreated();
}

// Swagger UI
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
