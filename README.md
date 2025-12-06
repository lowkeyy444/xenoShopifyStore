<h1>Xeno Shopify Analytics — Full Stack Assignment</h1>

A complete Shopify ingestion + analytics dashboard built with:
	•	Next.js 14 
	•	Node.js + Express
	•	PostgreSQL (Railway)
	•	Prisma ORM
	•	Recharts
	•	Shopify Admin REST API

This project demonstrates ingestion, transformation, storage, and visualization of Shopify store data across multiple tenants.

⸻

🚀 Features Implemented

1. Shopify Ingestion

✔ Add a Shopify store by providing:
	•	Store domain
	•	Admin API Access Token

✔ Ingests:
	•	Customers
	•	Orders
	•	Order totals

✔ Includes “Sync Now” button to refresh store data.

⸻

2. Multi-Tenant Support

✔ Each connected store = Tenant
✔ User can log in using email (simple session)
✔ Tenant list page allows selecting a store
✔ Dashboard loads metrics per tenant

⸻

3. Insights Dashboard

✔ Summary metrics:
	•	Total customers
	•	Total orders
	•	Total revenue

✔ Charts:
	•	Orders by Date (bar chart)
	•	Revenue Trend (line chart)
	•	Top 5 Customers table

✔ Date-range filtering

✔ Shopify-inspired clean UI (green palette)


🏗 Architecture Overview
```mermaid
graph LR
    %% Node Styles
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:2px,color:#000;
    classDef db fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000;

    %% Nodes
    FE[**Frontend**<br/>Next.js 14<br/><hr/>Pages:<br/>• /login<br/>• /tenants<br/>• /dashboard]:::component
    BE[**Backend**<br/>Express + Prisma + PG<br/><hr/>Endpoints:<br/>• /api/tenant<br/>• /api/sync<br/>• /api/metrics]:::component
    DB[(**PostgreSQL DB**<br/><br/>Entities:<br/>Tenants, Orders,<br/>Customers, Products)]:::db

    %% Relationships
    FE <-->|HTTP/JSON| BE
    BE -->|SQL/Query| DB
```

⚙️ Setup Instructions

Follow these steps to run the project locally.

⸻

1. Clone the Repositor
```
git clone https://github.com/your-repo/xeno-shopify-insights.git
cd xeno-shopify-insights
```
🖥️ Backend Setup (Node.js + Express + Prisma)

2. Enter backend folder

```
cd server
```
3. Install dependencies

```
npm install
```
4. Create .env inside /server

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
SHOPIFY_API_VERSION="2024-07"
```
5. Run Prisma migrations
```
npx prisma migrate deploy
```
6. Start backend
```
npm run dev
```
Backend runs at:
```
http://localhost:3000
```
🖥️ Frontend Setup (Next.js 14)

7. Navigate to frontend
```
cd ../frontend
```
8. Install dependencies
```
npm install
```
9. Create .env.local
```
NEXT_PUBLIC_API_URL="http://localhost:3000"
```
10. Run frontend
```
npm run dev
```
Frontend runs at:
```
[npm run dev](http://localhost:3001  (or 3000 if no conflict))
```

 🛒 Adding a Shopify Store
 
	1.	Login using any email
	2.	Go to Your Stores → Add Store
	3.	Provide:
	  •	Store Name
	  •	Shopify Domain (yourstore.myshopify.com)
	  •	Admin API Token
	4.	Submit → Store is stored as a Tenant

⸻

🔄 Syncing Shopify Data

Use the Sync Now button on the dashboard.

Hits:
```
POST /api/sync/full/:tenantId
```
Syncs:
	•	Customers
	•	Products
	•	Orders
	•	Revenue

This refreshes all visual analytics.

⸻

📊 Dashboard Features

✔ Summary Metrics
	•	Total Customers
	•	Total Orders
	•	Total Revenue

✔ Orders by Date Chart
	•	Date-range filter
	•	Bar chart visualization

✔ Revenue Trend (Line Chart)

✔ Top Customers Table

Shows:
	•	Name
	•	Email
	•	Total Spent
	•	Order Count

🗄️ Database Schema (Prisma)
```
model Tenant {
  id            String   @id @default(uuid())
  shopifyDomain String   @unique
  accessToken   String?
  createdAt     DateTime @default(now())
  Customers     Customer[]
  Products      Product[]
  Orders        Order[]
}

model Customer {
  id         BigInt   @id
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  email      String?
  firstName  String?
  lastName   String?
  totalSpent Decimal @default(0)
  createdAt  DateTime?
  updatedAt  DateTime?
}

model Product {
  id        BigInt   @id
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  title     String?
  sku       String?
  price     Decimal?
  createdAt DateTime?
  updatedAt DateTime?
}

model Order {
  id         BigInt   @id
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  customerId BigInt?
  totalPrice Decimal?
  currency   String?
  createdAt  DateTime?
  updatedAt  DateTime?
}
```
📡 API Endpoints
Tenant API:

	•	POST /api/tenant/register  -> Register a new Shopify store
	•	GET /api/tenant/all        -> List all connected stores

Sync API:

	•	POST /api/sync/full/:tenantId  -> Run full data sync for a store

Metrics API:

	•	GET /api/metrics/summary/:tenantId           -> Summary metrics (customers, orders, revenue)
	•	GET /api/metrics/orders-by-date/:tenantId    -> Orders and revenue grouped by date
	•	GET /api/metrics/revenue-trend/:tenantId     -> Revenue trend data for charts
	•	GET /api/metrics/top-customers/:tenantId     -> Top customers ranked by total spend



⚠️ Known Limitations

	•	Email login is mock authentication (no password/real auth).
	•	Shopify API rate limits may affect sync speed.
	•	Tenant switching is handled using localStorage (simple, not secure).
	•	Shopify Admin API token must be manually entered.

⸻

🙋‍♂️ Author & Notes

Developed as part of the Xeno Full-Stack Assignment.
Built with a strong focus on:
	•	clean architecture
	•	clarity
	•	working ingestion
	•	chart-driven insights



