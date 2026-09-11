# TaxFlow AI ERP

TaxFlow is a React + TypeScript ERP front end backed by a .NET 8 API and EF Core/SQLite. It covers GST sales billing, purchases, stock, bank reconciliation, GSTR-1 export and TallyPrime integration.

## Architecture

```text
React / Vite
   |
   | HTTP JSON
   v
TaxFlow .NET 8 API
   |
   +--> EF Core + SQLite
   |
   +--> GST / GSTR-1 services
   |
   +--> TallyPrime HTTP/XML bridge
             |
             +--> TallyPrime company
```

## TallyPrime integration

The project now supports:

- Test connection to a TallyPrime HTTP endpoint.
- Discover loaded Tally companies.
- Push TaxFlow customer/vendor and stock masters.
- Push sales vouchers with inventory and GST ledger lines.
- Push purchase vouchers with inventory and input GST ledger lines.
- Pull the Tally Daybook XML for reconciliation/preview.
- Keep XML file and Excel exports as offline fallbacks.

TallyPrime's native integration supports XML over HTTP. Configure TallyPrime as an HTTP server and use the port configured for the company; 9000 is a common/default example in Tally documentation.

### Tally setup

1. Open the target company in TallyPrime.
2. Enable the TallyPrime HTTP server in the connectivity/advanced configuration area.
3. Confirm the port, commonly `9000`.
4. Make sure the company is loaded.
5. In TaxFlow, open **TallyPrime Advanced Integration Hub**.
6. Enter the Tally URL, for example `http://localhost:9000` when TaxFlow backend runs on the same machine.
7. Enter the exact Tally company name.
8. Click **Test Connection** or **Discover Company**.
9. Push **Masters** before transactions, then push Sales/Purchases.

For a Tally installation on another machine, use its reachable LAN address, for example `http://192.168.x.x:9000`, and ensure the firewall permits the configured port.

## API endpoints

- `POST /api/tally/test-connection`
- `POST /api/tally/companies`
- `POST /api/tally/sync` — push `masters`, `sales`, `purchases`, or `all`
- `POST /api/tally/pull` — read-only Daybook XML for a date range

The frontend API base URL can be configured with `VITE_API_BASE_URL`; it defaults to `http://localhost:5000/api` for local development.

## Development

Frontend:

```bash
npm install
npm run build
```

Backend:

```bash
dotnet restore TaxFlow.Backend/TaxFlow.Backend.csproj
dotnet run --project TaxFlow.Backend/TaxFlow.Backend.csproj
```

Swagger is available at `/swagger` while the backend is running.

## Production hardening roadmap

Before using the bridge for live accounting, add company/firm isolation, authentication and role-based authorization, encrypted credentials, Tally voucher sync IDs/idempotency, master matching instead of blind create, structured Daybook-to-ledger mapping, retries/backoff, audit logs, and EF Core migrations instead of `EnsureCreated`.
