# Cool Technologies CRM - Enterprise Cooling & HVAC Management Platform

An enterprise-grade Customer Relationship Management (CRM) and Operations Orchestration Platform engineered for specialized commercial cooling, HVAC maintenance, Annual Maintenance Contracts (AMC), industrial refrigeration, and mechanical engineering enterprises.

---

## 📖 Complete Master Documentation

For the complete architectural blueprint, workflow diagrams, RBAC hierarchies, module specifications, and codebase breakdown, please refer to:

👉 **[PROJECT_DOCUMENTATION.md](file:///c:/Users/User/OneDrive/Documents/CRM/PROJECT_DOCUMENTATION.md)**

---

## 🚀 Key Modules & Architecture

1. **Multi-Channel Marketing & Outreach** (`/marketing` & `/manager/marketing`):
   - Campaigns Execution Register & Full-Page Campaign Builder.
   - Facebook Leads Import & Meta Pixel Ads OAuth Integration.
   - Email Blasts, WhatsApp Business Broadcasts & SMS Gateway.
   - Customer Segments Cohorts & Dynamic Message Templates.
   - Return on Investment (ROI) Master Analytics.

2. **Operations & Task Management** (`/tasks` & `/manager/tasks`):
   - Interactive Kanban Boards, List View, and Calendar Scheduling.
   - Priority SLA tracking, technician assignment, and activity audit logs.

3. **Commercial Pipeline & Sales** (`/sales`, `/leads` & `/manager/sales`):
   - Hot/Warm/Cold Lead Qualification & Follow-up Scheduler.
   - Opportunities, Quotations, Proforma Invoices, Delivery Notes, and Tax Invoices.

4. **Customer Master & AMC Management** (`/customers` & `/manager/customers`):
   - Commercial facility management, equipment inventories, and contract renewals.

5. **Enterprise Settings & RBAC** (`/settings`):
   - User Directory, Target Allocations, and User Role Profiles (`Employee`, `Manager`, `Worker`).

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript compiler check
npx tsc --noEmit
```

The application runs on `http://localhost:3000`.
