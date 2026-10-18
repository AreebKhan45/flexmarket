# FlexMarket

Executable product for coordinating earlier payment of approved business invoices. Buyers pay sellers through existing channels. FlexMarket records terms, checks constraints, and reconciles receipts.

## Run locally

```bash
cd ~/flexmarket
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (password `Pilot2026!`)

| Role | Email |
| --- | --- |
| Seller | maya@northline.demo |
| Buyer | jordan@harborwell.demo |
| Buyer | priya@lumen.demo |
| Admin | ops@flexmarket.local |

## What is in this build

- Marketing site: positioning, workflow, $149 / $299 pricing, pilot request, terms, privacy
- Seller workspace: CSV import, offer posting, buyer invites, reconciliation, value report
- Buyer workspace: side-by-side review, accept/decline, cash-limit checks
- Admin: organizations, leads, audit log
- Integer constraint engine for cash targets and cash limits
- SQLite so the app runs without Docker or a hosted database

Do not use the demo passwords or this development `AUTH_SECRET` with real customer data.
