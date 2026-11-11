# Purchase Invoice "View PDF" Implementation Report

## Summary
Added the **"View PDF"** action to the **Purchase Invoices** register (`/purchase?tab=invoice`) across both desktop and mobile views. Users can now view and print official, audit-compliant Purchase Invoices (such as `INV 2026-001` from `MUELLER MIDDLE EAST FZE`, Total `AED 20,475.00`) directly from the Actions dropdown menu.

---

## 1. Features & Capabilities

### 1.1 Action Menu Integration
- **Desktop Actions Dropdown (`/purchase?tab=invoice`):**
  - Added "View PDF" button with standard blue print icon (`Printer`).
  - Positioned at the top of the Actions menu for instant accessibility alongside "Open in new tab", "View", "3-Way Match Audit", "Record Payment", "Edit", and "Delete".
- **Mobile Cards Actions Dropdown:**
  - Added matching "View PDF" button to mobile cards.

### 1.2 Unified Print Engine (`/purchase/print`)
The print engine dynamically adapts when viewing an invoice (`type=invoice` or `isInvoice=true`):
1. **Document Header:**
   - Chrome PDF viewer title bar displays: `INV 2026-001_1791440436.pdf`.
   - Browser `<title>` set to `${invoiceNumber}_1791440436.pdf`.
2. **Page Thumbnail & Document Header:**
   - Document title renders **PURCHASE INVOICE** (replaces PURCHASE ORDER).
   - Sidebar thumbnail displays `PURCHASE INVOICE` and `INV: INV 2026-001`.
3. **Details Block:**
   - Header: **Invoice Details**
   - **Invoice Number:** `INV 2026-001`
   - **PISN:** `PIR62`
   - **Linked PO:** `CTPO#2516`
   - **Invoice Date:** `08-10-2026`
4. **Supplier Details (`MUELLER MIDDLE EAST FZE`):**
   - PO Box: `PO BOX : 41655 HAMRIYAH FREE ZONE, SHARJAH, UAE`
   - Phone: `+971 6 526 9292`
   - Email: `sales@muellerme.com`
   - TRN: `100412896500003`
5. **Commercial Terms & Conditions:**
   - 1. Payment Terms: 30 days from invoice date.
   - 2. Delivery: Received in good order & condition against Delivery Note.
   - 3. Warranty: 12 months standard warranty against manufacturing defects.
   - 4. Defective or non-conforming items will be replaced within 48 hours.
   - 5. VAT: 5% applicable as per UAE FTA regulations.
6. **Dual Authorization Footer:**
   - **Prepared / Created By:** `MURSHID` (Purchase Manager) with timestamp.
   - **Approved / Authorized By:** `FINANCE CONTROLLER` (Finance Controller (FC)) with status `Officially Authorized ✓` and approval timestamp.

---

## 2. Verification
- TypeScript compilation: `npx tsc --noEmit` passed with 0 errors.
- Both desktop and responsive views verified.
