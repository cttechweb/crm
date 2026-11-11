# Procurement Approval Governance & Notification Engine Report

**Project:** Cool Technologies CRM  
**Module:** Purchase & Procurement (`/purchase` & `/purchase/print`)  
**Commit:** `122d048`  
**Date:** November 11, 2026  

---

## 1. Approval Governance Policy

### Multi-Tier Threshold Matrix
| Total PO Landed Value | Required Approval Tier | Notification Recipients | Authorized Signatory |
| :--- | :--- | :--- | :--- |
| **Below AED 100,000** | **Finance Controller (FC)** | Finance Controller (`finance_controller`) | Finance Controller (`Hamdan` / FC role) or Super Admin |
| **AED 100,000 and Above** | **Chief Operating Officer (COO)** | **Both** COO (`coo`) **and** Finance Controller (`finance_controller`) | Chief Operating Officer (`Shemin` / COO role) or Super Admin |

---

## 2. Notification Dispatch Engine

1. **When PO Created Below AED 100,000:**
   - Urgent in-app notification sent to the **Finance Controller**.
   - Direct link to PO review: `/purchase?tab=po&poId=...`.
2. **When PO Created at AED 100,000 or Above:**
   - **Urgent alert to Chief Operating Officer (COO):** Mandating executive sign-off.
   - **Escalation alert to Finance Controller (FC):** Notifying that the high-value PO has been routed to COO.
3. **When Decision Recorded (Approved or Rejected):**
   - Instant confirmation notification returned to **Murshid (Purchase Manager)**:
     - Includes approver's name, role, total amount, and official release for procurement / GRN.

---

## 3. Strict Authority Enforcement in Sign-off Modal

- In `src/components/purchase/PurchaseApprovalModal.tsx`:
  - Automatically assesses `isCooTier` from the evaluated order value.
  - If a user who is not a COO attempts to approve an order $\ge \text{AED } 100,000$, the system strictly blocks the authorization and displays a warning banner:
    *"Strict Governance: Expenditures ≥ AED 100,000 mandate Chief Operating Officer (COO) sign-off."*
  - The "Authorize" button is disabled and protected.

---

## 4. Printed Purchase Order Audit Trail Layout

In `src/app/purchase/print/page.tsx`:
1. **Dynamic Watermark:** `WAITING FOR APPROVAL` is displayed only while the PO is pending. Once approved, the watermark is cleared.
2. **Dual-Column Authorization Footer:**
   - **Left Box (Prepared / Created By):**
     - Name: `MURSHID`
     - Role: `Purchase Manager`
     - Contact details (Phone & Email)
     - **Created Date & Time:** Formatted timestamp
   - **Right Box (Approved / Authorized By):**
     - Name: Approver Name (`Finance Controller` or `Chief Operating Officer`)
     - Designation: Approver Role
     - Status: `Status: Officially Authorized ✓`
     - **Approved Date & Time:** Formatted approval timestamp

