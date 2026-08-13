# ConstructX ERP — Enterprise Construction & Project Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-000000.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-6.12-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-336791.svg)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive, full-stack, enterprise-grade **Construction Resource Planning (ERP)** platform designed to streamline multi-site project oversight, real-time financial accounting, procurement, material indent tracking, multi-warehouse inventory management, tender management, site operations, and client transparency.

Built with **React 18 (TypeScript)**, **Node.js**, **Express**, **Prisma ORM**, **Neon Serverless PostgreSQL**, and **Tailwind CSS / Shadcn UI**, ConstructX bridges the gap between field site operations, engineering teams, procurement officers, accounts, executive leadership, and external clients in a unified, role-governed digital workspace.

---

## Table of Contents

- [Executive Overview](#executive-overview)
- [Key Persona Workspaces](#key-persona-workspaces)
- [Core System Modules](#core-system-modules)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Database Schema & ERD Overview](#database-schema--erd-overview)
- [API Architecture & Route Sitemap](#api-architecture--route-sitemap)
- [Key Engineering Highlights](#key-engineering-highlights)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Configuration](#environment-configuration)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Deployment](#deployment)
- [Author & License](#author--license)

---

## Executive Overview

Modern construction and civil engineering projects suffer from fragmented communication between physical job sites, central warehouses, accounting teams, and client representatives. **ConstructX ERP** resolves this by consolidating operational workflows into a single high-performance platform:

1. **End-to-End Operational Visibility:** Track project progress from initial tender acquisition down to daily site logs (DPR), bill of quantities (BOQ), and running account (RA) invoicing.
2. **Financial Precision:** Automate billing calculations, retainage holdings, GST/VAT tax compliance, non-billable site expenditures, and multi-tier payroll runs.
3. **Smart Supply Chain & Inventory:** Real-time stock level monitoring across central and site warehouses with atomic state-machine material transfers and gate pass generation.
4. **Multi-Role Security:** 10 granular role-based dashboard views ensuring each stakeholder sees only data relevant to their operational authority.

---

## Key Persona Workspaces

ConstructX features custom-tailored dashboards for **10 distinct user roles**:

| Workspace Role | Primary Responsibilities & Features |
| :--- | :--- |
| **MD / Executive (`md`)** | High-level portfolio analytics, real-time project profitability, financial burn rates, executive cashflow forecasts, milestone health. |
| **System Administrator (`admin`)** | User onboarding, encrypted invitation generation, system audit logging, security policy management, database monitoring. |
| **Site Manager (`site`)** | Work Breakdown Structure (WBS) tracking, Daily Progress Reports (DPR), site issue tracking, milestone reporting, site warehouse requisitions. |
| **Accounts Manager (`accounts`)** | Chart of accounts, general ledger, tax compliance (GST/VAT), non-billable expense logs, payroll approvals, client payment receipts. |
| **Billing Manager (`billing-manager`)** | Running Account (RA) bill creation, client invoice generation, retention money holding, invoice approval workflows. |
| **Store & Warehouse Manager (`store` / `warehouse`)** | Stock inward/outward (GRN), multi-location inventory transfers, gate pass issuance, reorder point alerts, vehicle & equipment maintenance schedules. |
| **Client Manager & Portal (`client-manager` / `client`)** | Client engagement, project update streams, architectural drawing delivery, transparent milestone & invoice client portal. |
| **Design Manager (`design`)** | Architectural design repository, CAD blueprint asset versioning, review & approval queue. |
| **HR & Payroll Manager (`hr`)** | Staff directory, attendance tracking, salary structure configuration, payslip generation, compliance documents. |
| **Tender & Bid Manager (`tender`)** | Tender opportunity pipeline, Earnest Money Deposit (EMD) tracking, BOQ cost-plus / item-rate bidding models. |

---

## Core System Modules

### 1. Project & Site Operations Management
- **Interactive Work Breakdown Structure (WBS):** Visual milestone timelines, task dependencies, and progress reporting.
- **Daily Progress Reports (DPR):** Site engineers log labor hours, equipment usage, weather impacts, and progress photos.
- **Site Issue Matrix:** Ticket escalation workflow for site incidents, design clarification requests (RFIs), and safety logs.

### 2. Financials, Invoicing & Tax Engine
- **Running Account (RA) Billing:** Dynamic multi-stage invoicing based on verified BOQ completion percentages.
- **Retainage & Deduction Management:** Automatic deduction tracking for retention money, mobile advances, and statutory taxes.
- **Taxation & Compliance:** Automated GST/VAT breakdown per line item with exportable compliance logs.
- **Non-Billable Expenses:** Petty cash management and unbilled site expenditures audit trail.

### 3. Procurement & Vendor Management
- **Material Indent Engine:** Multi-stage purchase requisitions originating from site requirements.
- **Comparative Vendor Bidding:** Vendor quotation matrix for side-by-side price, lead time, and rating evaluation.
- **Purchase Order (PO) Lifecycle:** PO generation, approval hierarchy, order fulfillment tracking, and status alerts.

### 4. Multi-Warehouse & Inventory Control
- **Real-Time Stock Auditing:** Inward (Goods Received Note - GRN) and Outward inventory tracking.
- **Atomic Material Transfers:** State-machine governed inter-warehouse and site material movement (Pending -> Approved -> In-Transit -> Received).
- **Automated Reorder Alerts:** Dynamic warnings when critical materials drop below safety thresholds.

### 5. Fleet & Equipment Maintenance
- **Vehicle Logbooks:** Mileage, fuel consumption, and operator assignment tracking.
- **Scheduled Maintenance Routines:** Preventive maintenance alerts for site heavy machinery and fleet vehicles.

### 6. Tender & BOQ Engine
- **Tender Lifecycle Management:** Track bids from release date, document prep, submission, EMD deposit, to award outcome.
- **BOQ Auto-Calculation:** Item-rate and Cost-plus pricing engines with customizable unit measurements and margin multipliers.

### 7. Design & Document Repository
- **Blueprint & Drawing Management:** Centralized asset management for civil, architectural, structural, and MEP drawings.
- **AWS S3 Integration:** Secure cloud storage with presigned URLs for media and document assets.

---

## System Architecture

ConstructX follows a modular full-stack architecture separating the client single-page application (SPA) from the RESTful backend API layer.

```
                     ┌──────────────────────────────────────────────┐
                     │               React 18 SPA                   │
                     │  (Vite + TypeScript + Tailwind + Shadcn UI)  │
                     └──────────────────────┬───────────────────────┘
                                            │ HTTP / REST / WebSockets
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │             Node.js / Express API            │
                     │      (TypeScript + JWT Auth + Winston)       │
                     └──────┬──────────────────────┬───────────┬────┘
                            │                      │           │
                            ▼                      ▼           ▼
┌───────────────────────────────┐   ┌──────────────────┐   ┌────────────────┐
│      Prisma ORM (v6)          │   │ AWS S3 / Storage │   │ WebSockets     │
│   (Neon PostgreSQL Serverless)│   │ (Presigned URLs) │   │ (Live Alerts)  │
└───────────────────────────────┘   └──────────────────┘   └────────────────┘
```

### Data Flow Example: Material Procurement to Site Inventory

```mermaid
sequenceDiagram
    autonumber
    actor Site as Site Manager
    actor Store as Store Manager
    actor Accounts as Accounts Manager
    participant API as Express API
    participant DB as Prisma / Neon DB

    Site->>API: Submit Material Indent (Requisition)
    API->>DB: Create MaterialRequest (Status: PENDING)
    Store->>API: Review & Generate Purchase Order (PO)
    API->>DB: Create PurchaseOrder & notify Vendor
    Vendor-->>Store: Deliver Goods to Warehouse
    Store->>API: Submit Goods Received Note (GRN)
    API->>DB: Increment Warehouse Inventory & Create GatePass
    Accounts->>API: Match PO with Vendor Invoice & Process Payment
    API->>DB: Update Ledger Account & Close PO
```

---

## Technology Stack

### Frontend Architecture
- **Core:** React 18.3, TypeScript 5.5, Vite 5.4
- **UI Framework & Styling:** Tailwind CSS 3.4, Shadcn UI (Radix UI primitives), Lucide React Icons
- **State & Data Fetching:** TanStack React Query v5, React Context API (`UserContext`, `UserFilterContext`)
- **Forms & Validation:** React Hook Form, Zod schema validation
- **Data Visualization & Analytics:** Recharts, TanStack React Table
- **Document Generators:** jsPDF, jsPDF-AutoTable, XLSX, Html2Canvas

### Backend Architecture
- **Runtime Environment:** Node.js (v18+)
- **Web Framework:** Express 5.1 (TypeScript)
- **Database & ORM:** PostgreSQL, Prisma ORM 6.12, `@prisma/adapter-neon` serverless driver
- **Authentication & Security:** JWT (JSON Web Tokens), Bcryptjs, Express Validator, CORS
- **Cloud Storage & File Uploads:** AWS SDK S3 v3 (`@aws-sdk/client-s3`), Presigned URLs, Multer
- **Logging & Monitoring:** Winston Logger
- **Real-Time Communication:** WebSockets (`ws`)

---

## Database Schema & ERD Overview

The PostgreSQL database powered by Prisma schema consists of **over 30 relational entities** designed with strict foreign key constraints and timestamptz audit logging:

```
+------------------+         +--------------------+         +-------------------+
|      User        |◄───────►|      Project       |◄───────►|      Client       |
+------------------+         +--------------------+         +-------------------+
| id (UUID)        |         | id (UUID)          |         | id (UUID)         |
| email (Unique)   |         | name               |         | name              |
| role (Enum)      |         | clientId (FK)      |         | email             |
| status           |         | managerId (FK)     |         | phone             |
+--------┬---------+         | budget             |         +-------------------+
         │                   +---------┬----------+
         │                             │
         │         ┌───────────────────┼───────────────────┐
         ▼         ▼                   ▼                   ▼
+--------------------+       +--------------------+      +-------------------+
|  DailyProgressReport|      |        Task        |      |      Tender       |
+--------------------+       +--------------------+      +-------------------+
| id (UUID)          |       | id (UUID)          |      | id (UUID)         |
| projectId (FK)     |       | projectId (FK)     |      | title, value      |
| status, notes      |       | status, notes      |      | status (Enum)     |
+--------------------+       +--------------------+      +-------------------+
         │                             │
         └───────────────────┬─────────┘
                             ▼
                    +--------------------+
                    |  MaterialRequest   |
                    +--------------------+
                    | id (UUID)          |
                    | projectId (FK)     |
                    | status, quantity   |
                    +---------┬----------+
                              ▼
                    +--------------------+
                    |   PurchaseOrder    |
                    +--------------------+
                    | id (UUID)          |
                    | vendorId (FK)      |
                    | status, totalAmount|
                    +--------------------+
```

### Core Database Entities:
- **`User` & `UserInvitation`**: Multi-role user identity and encrypted invite workflow.
- **`Project`, `Milestone`, `Task`**: Hierarchical work breakdown structure.
- **`Client`, `ClientBill`, `Invoice`**: Billing receivables and Running Account invoices.
- **`Tender`, `BOQ`, `Bid`**: Bidding, cost-plus estimations, and contract allocation.
- **`Material`, `Inventory`, `Warehouse`, `MaterialTransfer`**: Multi-warehouse stock tracking and atomic transfers.
- **`PurchaseOrder`, `Vendor`, `MaterialIndane`**: Procurement workflow entities.
- **`Employee`, `Salary`, `Attendance`**: HR management & payroll execution.
- **`Vehicle`, `ScheduleMaintenance`**: Fleet & heavy machinery asset management.
- **`Design`, `Document`**: Architectural assets & Cloud storage document index.

---

## API Architecture & Route Sitemap

The server exposes modular RESTful endpoints grouped into **33 dedicated route handlers**:

| Base Route Endpoint | Description & Functional Scope |
| :--- | :--- |
| `/api/auth` | User login, profile retrieval, password change, JWT refresh. |
| `/api/admin` | System health checks, admin management, monitoring logs. |
| `/api/users` | User management, role updates, user directory queries. |
| `/api/invitations` | Encrypted user invitation generation and token validation. |
| `/api/projects` | Project CRUD, WBS assignment, member allocation, progress updates. |
| `/api/tasks` | Task creation, status updates, task delegation. |
| `/api/billing` | Billing summaries, RA bill generation, invoice processing. |
| `/api/inventory` | Stock management, inward/outward records, low-stock alerts. |
| `/api/warehouse` | Multi-warehouse directory, capacity, and stock distribution. |
| `/api/tenders` | Tender pipeline, bidding documents, EMD management. |
| `/api/boqs` | Bill of Quantities generation and cost estimations. |
| `/api/purchase-orders` | Requisitions, PO generation, supplier approval workflows. |
| `/api/vendors` | Vendor directory, quote submissions, rating evaluations. |
| `/api/hr` & `/api/hr-salary` | Employee onboarding, attendance logs, salary calculation & payslips. |
| `/api/accounts` | Chart of Accounts, general ledger entries, cashflow summaries. |
| `/api/tax` | Tax configuration, GST/VAT auto-calculation engines. |
| `/api/client-bills` | Client invoice generation, payments received, pending balances. |
| `/api/site-ops` | Daily Progress Reports (DPR), site logs, site equipment tracking. |
| `/api/material` & `/api/material-indane` | Raw material catalog, material indents, and requisitions. |
| `/api/issue-reports` | Field incident reporting, safety audits, and resolution status. |
| `/api/vehicles` & `/api/schedule-maintenance` | Vehicle inventory, fuel consumption, scheduled maintenance. |
| `/api/designs` | CAD/Architectural drawing versions, reviews, AWS S3 URLs. |
| `/api/notifications` | User alerts, system activity events, live notifications. |

---

## Key Engineering Highlights

### 1. Dual-Storage Resilient Authentication Lifecycle
ConstructX implements a resilient client-side authentication mechanism. Session JWTs are cached in `sessionStorage` with a secondary `localStorage` backup fallback to maintain login state across tab resets. A background periodic profile heartbeat (every 5 mins) automatically validates token integrity with the backend `/api/auth/profile` endpoint without disrupting active user interactions.

### 2. Serverless Driver Adapter Pattern for Prisma
To ensure zero connection pooling bottlenecks when deployed on serverless environments (e.g., Vercel / Render), the backend utilizes Prisma 6 integrated with `@prisma/adapter-neon` and `@neondatabase/serverless`. This allows HTTP/WebSocket connection pooling directly to PostgreSQL.

### 3. Dynamic Financial & BOQ Calculation Engines
The platform includes built-in calculation utility engines for:
- Multi-tier GST/VAT tax breakdowns.
- Running Account (RA) Bills with retention money percentage holds.
- BOQ Cost-Plus and Item-Rate estimations with automatic unit conversion.

### 4. State-Machine Governed Material Transfers
Inter-warehouse and site stock transfers enforce strict atomic state transitions (`PENDING` -> `APPROVED` -> `IN_TRANSIT` -> `RECEIVED`). Stock balances are updated inside Prisma transactions (`$transaction`) to eliminate race conditions and prevent negative inventory counts.

### 5. Multi-Role Security & Route Protection
The client application uses `ProtectedRoute` higher-order components alongside role normalization (`normalizeRole`) to strictly isolate UI workspaces based on JWT payload roles, guaranteeing that unauthorized users cannot navigate to privileged executive or accounting dashboards.

---

## Project Directory Structure

```
finalERP-my repo/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components & Shadcn primitives
│   │   │   ├── ui/             # Radix-ui based buttons, dialogs, dropdowns
│   │   │   ├── app-sidebar.tsx # Dynamic role-aware sidebar navigation
│   │   │   └── ProtectedRoute.tsx # Auth & role guard wrapper
│   │   ├── contexts/           # React Context providers (UserContext, UserFilterContext)
│   │   ├── hooks/              # Custom React hooks (use-mobile, use-toast, etc.)
│   │   ├── lib/                # Client utility libraries & API helpers
│   │   ├── pages/              # 28+ Page views (MD, Admin, Accounts, Site, etc.)
│   │   │   ├── AccountsDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ClientPortal.tsx
│   │   │   ├── DesignDashboard.tsx
│   │   │   ├── HR.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── MDDashboard.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── SiteDashboard.tsx
│   │   │   ├── StoreDashboard.tsx
│   │   │   ├── TenderManagement.tsx
│   │   │   └── WarehouseDashboard.tsx
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Main App layout & React Router sitemap
│   │   └── main.tsx            # React entrypoint
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── prisma/
│   │   └── schema.prisma       # Prisma DB schema (30+ models)
│   ├── src/
│   │   ├── config/             # Supabase & S3 client configurations
│   │   ├── controllers/        # Express request controllers
│   │   ├── logger/             # Winston logger configuration
│   │   ├── middleware/         # Auth, validation, & logging middlewares
│   │   ├── routes/             # 33 Modular REST API route handlers
│   │   ├── services/           # Core business logic services
│   │   ├── types/              # Backend TypeScript definitions
│   │   ├── utils/              # Calculation & encryption utilities
│   │   └── index.ts            # Server entrypoint & route registration
│   ├── tests/                  # Integration & Unit test suites
│   ├── vercel.json             # Vercel deployment configuration
│   └── package.json
│
├── package.json                # Root workspace configuration
└── README.md                   # Project documentation
```

---

## Getting Started & Local Setup

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** database (or a free [Neon PostgreSQL](https://neon.tech/) instance)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Tennobis/ERP-System.git
cd ERP-System
```

### 2. Install Dependencies

Install root, client, and server dependencies:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

---

## Environment Configuration

### Client Environment Setup

Create a `.env` file in the `client/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### Server Environment Setup

Create a `.env` file in the `server/` directory:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Connection (Neon / PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/constructx?sslmode=require"

# JWT Authentication Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# AWS S3 Cloud Storage Configuration (Optional for file uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="constructx-erp-assets"
```

---

### 3. Database Setup & Prisma Migration

Initialize the PostgreSQL database schema using Prisma:

```bash
cd server

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

---

### 4. Running the Application

Launch both backend and frontend servers in separate terminal windows:

#### Terminal 1: Backend Server (Node.js / Express)
```bash
cd server
npm run dev
```
*Backend API will run at:* `http://localhost:5000`

#### Terminal 2: Frontend App (Vite / React)
```bash
cd client
npm run dev
```
*Frontend Application will run at:* `http://localhost:5173`

---

## Testing & Quality Assurance

The backend repository includes integration test suites built with **Jest** and **Supertest**:

```bash
cd server

# Run backend test suite
npm test
```

### Test Coverage Areas:
- `accounts.test.ts` — Account ledger & invoice test cases.
- `hr.test.ts` — HR employee & salary calculation checks.
- `inventory.test.ts` — Inventory inward/outward validation.
- `material-transfer.test.ts` — Multi-warehouse atomic transfer workflows.
- `tender.test.ts` — Tender creation and BOQ validation.
- `notification.test.ts` — Notification dispatch tests.

---

## Deployment

### Server Deployment (Vercel / Render)

The backend includes a pre-configured `vercel.json` for serverless deployment:

```bash
cd server
vercel --prod
```

Or deploy as a Web Service on **Render** / **Railway** / **AWS ECS** using `npm start`.

### Client Deployment (Vercel / Netlify)

Build the production bundle of the client application:

```bash
cd client
npm run build
```

Upload the generated `dist/` directory to Vercel, Netlify, or AWS S3 + CloudFront.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Author & Contact

**Developed by:** Engineering Team / Tennobis  
**GitHub Repository:** [https://github.com/Tennobis/ERP-System](https://github.com/Tennobis/ERP-System)  
**System Architecture & Lead Developer:** Full-Stack Enterprise Systems Architect

> *ConstructX ERP — Engineering Excellence in Construction & Infrastructure Management.*