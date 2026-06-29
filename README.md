# WholeCRM — Real Estate Wholesaler CRM

A full-stack CRM built for real estate wholesalers. Track motivated sellers, manage your deal pipeline, broadcast to cash buyers, run marketing campaigns, and generate contracts — all in one dark-themed web app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Prisma 7 |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Validation | Zod |
| Charts | Custom (recharts removed for bundle size) |

## Quick Start

### 1. Install & configure

```bash
npm install
cp .env.example .env
# Edit .env — set your PostgreSQL connection string
```

### 2. Create the database

```bash
npx prisma db push
```

### 3. Seed demo data

```bash
npm run db:seed
```

This populates:
- 8 motivated sellers across Texas
- 5 cash buyers with preferences
- 8 properties (pre-foreclosure, short sale, REO, standard)
- 8 deals across all pipeline stages
- 7 follow-up tasks
- 1 direct mail campaign (draft)
- 2 document templates

### 4. Run the dev server

```bash
npm run dev
# → http://localhost:3000
```

## Architecture

```
src/
├── app/
│   ├── api/                    # 12 REST endpoints
│   │   ├── contacts/           # GET (list+search), POST (validated)
│   │   ├── properties/         # GET, POST, /import (bulk CSV/JSON)
│   │   ├── deals/              # GET, POST, /broadcast (buyer matching)
│   │   ├── buyers/             # GET, /preferences (CRUD)
│   │   ├── campaigns/          # GET, POST, /:id/execute
│   │   ├── dashboard/          # GET (aggregated stats)
│   │   ├── documents/          # GET, POST (template generation)
│   │   └── data-sources/       # GET, POST
│   │
│   ├── page.tsx                # Dashboard
│   ├── contacts/               # Contact list + search
│   ├── properties/             # Property card grid
│   ├── pipeline/               # Kanban board (7 stages)
│   ├── buyers/                 # Buyer list + preferences
│   ├── campaigns/              # Campaign dashboard
│   ├── data-pipeline/          # CSV/API import config
│   ├── documents/              # Contract generation + templates
│   ├── reports/                # Pipeline funnel + metrics
│   └── settings/               # Org + DB config
│
├── components/
│   ├── Sidebar.tsx             # 10-section navigation
│   └── LoadingSkeleton.tsx     # Reusable loading + empty states
│
├── lib/
│   ├── db.ts                   # Lazy Prisma client (proxy)
│   ├── hooks.ts                # useApi<T> + useDebounce
│   ├── utils.ts                # formatCurrency, parsePagination, cn()
│   ├── constants.ts            # Shared stage/status/color maps
│   ├── schemas.ts              # Zod validation schemas
│   ├── validate.ts             # Request body validator
│   └── cache.ts                # Cache-Control header helper
│
└── types/
    └── index.ts                # TypeScript types for all domain models

prisma/
├── schema.prisma               # 17 models, 8 composite indexes
├── seed.ts                     # Demo data seeder
└── prisma.config.ts            # Prisma 7 connection config
```

## Database Schema (17 models)

| Model | Purpose |
|-------|---------|
| Organization | Multi-tenant org |
| User / OrganizationUser | Auth + role-based access |
| Contact | Sellers, buyers, agents, title companies |
| Property | Address, ARV, MAO, foreclosure status |
| Deal | Pipeline deals with financials |
| Pipeline / Stage | Configurable deal stages |
| Task | Follow-ups, inspections, closing tasks |
| Activity | Deal activity log |
| Campaign / CampaignRecipient | Marketing campaigns |
| Document / DocumentTemplate | Contract generation |
| DataSource / PropertyImportLog | Lead import pipeline |
| BuyerPreference | Cash buyer criteria |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts?orgId=&search=&type=&status=` | List contacts |
| POST | `/api/contacts` | Create contact (validated) |
| GET | `/api/properties?orgId=&search=&status=` | List properties |
| POST | `/api/properties` | Create property (validated) |
| POST | `/api/properties/import` | Bulk CSV/JSON import with dedup |
| GET | `/api/deals?orgId=&pipelineId=&status=` | List deals |
| POST | `/api/deals` | Create deal (validated) |
| POST | `/api/deals/broadcast` | Match deal to eligible buyers |
| GET | `/api/buyers?orgId=` | List cash buyers with preferences |
| POST | `/api/buyers/preferences` | Upsert buyer criteria |
| GET | `/api/campaigns?orgId=` | List campaigns |
| POST | `/api/campaigns` | Create campaign |
| POST | `/api/campaigns/:id/execute` | Execute campaign (batch recipients) |
| GET | `/api/dashboard?orgId=` | Aggregated stats |
| GET | `/api/documents?orgId=&dealId=` | List documents |
| POST | `/api/documents` | Generate from template |
| GET | `/api/data-sources?orgId=` | List data sources |
| POST | `/api/data-sources` | Create data source |

## Key Features

### Deal Broadcast Engine
Matches deals to eligible cash buyers using multi-factor scoring:
- State/city/ZIP code matching
- Beds, baths, sqft range
- ARV and price band
- Property type preference
- Max repair cost tolerance

### Bulk Property Import
`POST /api/properties/import` accepts a JSON array of properties. Auto-deduplicates by street+zip. Auto-computes MAO (70% ARV – repair cost).

### Document Generation
Template variables: `{{dealTitle}}`, `{{propertyAddress}}`, `{{sellerName}}`, `{{buyerName}}`, `{{offerPrice}}`, `{{contractPrice}}`, `{{assignmentFee}}`, `{{arv}}`, `{{repairCost}}`, `{{closingDate}}`

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Push schema to PostgreSQL
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio
```

## Design Decisions

- **`useApi<T>` hook**: All pages share a single data-fetching hook with abort-controller cleanup and typed generics.
- **`useDebounce`**: Search inputs debounced at 300ms to avoid API call storms.
- **Lazy Prisma client**: Proxy-based singleton — no DB connection at build time.
- **`??` for numerics**: Zero is valid for beds, baths, price. `||` would wipe zeros; `??` preserves them.
- **Batch operations**: Campaign execution uses `createMany(skipDuplicates)` instead of sequential inserts.
- **No external UI library**: shadcn/ui pattern (own the components), Tailwind v4 design tokens.
