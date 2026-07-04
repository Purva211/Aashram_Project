# Tally-Style Accounting & Financial Reporting Module

This document outlines the architecture, database schema, API design, and frontend integration for a professional, Tally-style double-entry accounting system integrated into the Ashram Management System.

## User Review Required

> [!IMPORTANT]
> This is a massive module that will act as the financial backbone of the system. Please review the proposed schemas and double-entry logic carefully to ensure it aligns with your operational expectations for the 365+ branches.

## Open Questions

> [!WARNING]
> - **Legacy Data:** Should we migrate existing `Donation` and `Annadaan` records into the new `TransactionMaster` and `JournalEntry` collections, or just start recording new transactions moving forward?
> - **Maker-Checker:** Do we need a maker-checker workflow (i.e., an Accountant creates a manual journal voucher, and a Trustee approves it)?
> - **Webhooks:** Do you want to expose webhook endpoints for Razorpay/PhonePe to automatically record settlements and gateway charges, or will this be uploaded via settlement CSVs?

## Proposed Architecture

### 1. Database Schema Design (MongoDB)

#### [NEW] `backend/models/ChartOfAccount.js`
Defines the primary accounting groups (Assets, Liabilities, Equity, Revenue, Expenses).
- `name` (String)
- `type` (Enum: Asset, Liability, Equity, Revenue, Expense)
- `code` (String, e.g., '1000' for Assets)
- `description` (String)

#### [NEW] `backend/models/Ledger.js`
Specific accounts under the COA, branch-wise.
- `name` (String, e.g., 'Cash in Hand - Branch A', 'SBI Bank Account')
- `coaId` (ObjectId ref ChartOfAccount)
- `branchId` (ObjectId ref Branch, null if Head Office)
- `openingBalance` (Number)
- `currentBalance` (Number)
- `balanceType` (Enum: Debit, Credit)

#### [NEW] `backend/models/TransactionMaster.js`
The central transaction log as requested.
- `transactionId` (String, unique)
- `branchId` & `branchName`
- `financialYear` (String)
- `date` (Date)
- `type` (Enum: Donation, Event, Book Purchase, Membership, Expense, etc.)
- `source` (Enum: Website, QR, Office, Bank, Cheque)
- `method` (Enum: UPI, Card, NetBanking, Cash, Cheque)
- `gatewayName` (String, optional)
- `grossAmount`, `gatewayCharges`, `netAmount` (Number)
- `receiptNumber`, `referenceNumber` (String)
- `status` (Enum: SUCCESS, PENDING, FAILED, REFUNDED)
- `settlementStatus`, `bankDepositStatus` (Boolean/Enum)
- `createdBy`, `verifiedBy` (ObjectId)

#### [NEW] `backend/models/JournalEntry.js`
Double-entry voucher records.
- `voucherNumber` (String, unique, auto-generated)
- `date` (Date)
- `branchId` (ObjectId ref Branch)
- `transactionMasterId` (ObjectId ref TransactionMaster, optional)
- `description` (String)
- `entries`: Array of:
  - `ledgerId` (ObjectId ref Ledger)
  - `debit` (Number)
  - `credit` (Number)
- `totalDebit`, `totalCredit` (Number, must be equal)
- `status` (Enum: Draft, Posted, Cancelled)

#### [NEW] `backend/models/DailyClosing.js`
Branch-wise daily closing records.
- `branchId` (ObjectId ref Branch)
- `date` (Date)
- `openingBalance` (Number)
- `collections`: { website, qr, cash, cheque, bankTransfer, total }
- `expenses` (Number)
- `cashDeposited` (Number)
- `closingBalance` (Number)
- `status` (Enum: Pending, Verified)

### 2. Backend Logic & Folder Structure

#### Controllers
- **[NEW] `backend/controllers/accountingController.js`**: Handles Journal Entries, Ledger creation, Trial Balance, P&L, and Balance Sheet generation.
- **[NEW] `backend/controllers/transactionController.js`**: Handles Central Transactions, Bank Reconciliation algorithms, and Daily Closing logic.
- **[NEW] `backend/controllers/reportController.js`**: Specialized aggregation pipelines for collection reports, export logic (CSV, PDF).

#### Services (Reconciliation & Aggregation)
- **[NEW] `backend/services/reconciliationService.js`**:
  - Algorithm to match `TransactionMaster` records against uploaded Bank Statement CSVs based on Amount, Date, and UTR/Reference number.
- **[NEW] `backend/services/financialReportsService.js`**:
  - Aggregation pipelines to calculate Trial Balance, Income & Expenditure, and Cash Flows on the fly from `JournalEntry` collections.

### 3. Frontend UI Implementation

#### Pages
- **[NEW] `frontend/src/pages/accounting/Dashboard.jsx`**: High-level charts (Collection today vs month, Cash vs Online, Branch comparisons, Gateway charges).
- **[NEW] `frontend/src/pages/accounting/Transactions.jsx`**: A powerful data table to view the Central Transaction Ledger with advanced multi-select filtering.
- **[NEW] `frontend/src/pages/accounting/JournalVouchers.jsx`**: Interface for manual entry of double-entry records.
- **[NEW] `frontend/src/pages/accounting/Ledgers.jsx`**: View all ledgers and their running balances.
- **[NEW] `frontend/src/pages/accounting/Reconciliation.jsx`**: Interface to upload bank statements and view matched/unmatched transactions side-by-side.
- **[NEW] `frontend/src/pages/accounting/Reports.jsx`**: A centralized report center for generating Trial Balances, P&L, Cash Books, and exporting to PDF/Excel/Tally XML.

#### Components
- **[NEW] `frontend/src/components/accounting/VoucherEntryForm.jsx`**: Complex form ensuring debits equal credits before submission.
- **[NEW] `frontend/src/components/accounting/FinancialChart.jsx`**: Reusable Recharts/Chart.js components for financial trends.

## Verification Plan

### Automated Testing
- Will write backend tests to ensure `JournalEntry` creation strictly enforces the accounting equation (`Debit == Credit`).
- Will verify that aggregating `JournalEntry` records correctly matches the `currentBalance` in `Ledger`.

### Manual Verification
- Create a mock donation, verify it creates a `TransactionMaster` record and the corresponding `JournalEntry` (Debit Bank/Cash, Credit Donation Revenue).
- Run the Bank Reconciliation logic with a mock CSV.
- View the Balance Sheet and Trial Balance to ensure everything balances.
