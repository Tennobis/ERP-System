# TestBoard MySQL

A modern, full-stack construction and project management platform with billing, inventory, HR, procurement, and analytics modules. Built with React (TypeScript), Node.js, Express, and Prisma (PostgreSQL/MySQL compatible).

## Features

- **Project Management:** Gantt charts, milestones, progress tracking, and reporting.
- **Billing & Invoicing:** Invoice builder, payment tracking, reminders, and export utilities.
- **Inventory Management:** Stock tracking, transfers, warehouse management, and analytics.
- **HR & Payroll:** Employee directory, payroll, compliance, and attendance.
- **Procurement:** Purchase requests, vendor management, and order tracking.
- **Notifications:** Alerts, reminders, and document management.
- **Role-Based Access:** Admin, manager, client, store, accounts, and more.
- **Analytics & Dashboards:** Real-time KPIs, charts, and financial summaries.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Prisma ORM, compatible with MySQL)
- **ORM:** Prisma
- **State Management:** React Context, Hooks
- **Testing:** Jest, React Testing Library (backend: supertest)

## Folder Structure

```
testboard-mysql/
├── client/           # Frontend (React)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # App pages (dashboards, auth, etc.)
│   │   ├── lib/             # Utilities, dummy data
│   │   ├── types/           # Shared TypeScript types
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers
│   │   └── ...
│   ├── public/              # Static assets
│   └── ...
├── server/           # Backend (Node.js/Express)
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic/services
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Config (Prisma, Supabase, etc.)
│   │   ├── utils/           # Utility functions/constants
│   │   └── ...
│   ├── prisma/              # Prisma schema
│   └── ...
├── package.json      # Root dependencies
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL or MySQL database

### 1. Clone the repository
```bash
git clone https://github.com/your-org/testboard-mysql.git
cd testboard-mysql
```

### 2. Install dependencies
```bash
# Install root dependencies (if any)
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment Variables
- Copy `.env.example` to `.env` in both `client/` and `server/` folders and fill in the required values (API URLs, database connection, etc.).

### 4. Set up the Database
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the Development Servers
```bash
# In one terminal (client)
cd client
npm run dev

# In another terminal (server)
cd server
npm run dev
```

- Client: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run test` — Run tests
- `npm run lint` — Lint code

## Contribution Guidelines

1. Fork the repository and create your branch from `main` or `test`.
2. Write clear, descriptive commit messages.
3. Add/modify tests for your features or bug fixes.
4. Ensure code passes linting and tests before submitting a PR.
5. Open a pull request and describe your changes.

## License

This project is licensed under the MIT License.

---

**Contact:** For questions or support, open an issue or contact the maintainers. 