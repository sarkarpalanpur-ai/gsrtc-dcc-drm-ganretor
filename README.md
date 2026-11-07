# GSRTC DCC & DRM Generator (ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ)

A modern, full-featured web application for Gujarat State Road Transport Corporation (GSRTC) bus depots to generate, calculate, reconcile, and print **Daily Cash Collection (DCC)** summaries and **Daily Revenue Memos (DRM)** from photos and manual entries.

---

## 🌟 Key Features

1. **AI Photo Scanner (Gemini 3.8 Flash OCR)**:
   - Snap or upload photos of bus conductor waybills, daily cash summaries, or cashier tally sheets.
   - Automatically extracts Account Heads (101 A, 102 C, 102 H, 105, 110 D, 620, etc.) and amounts.
   - Instantly populates both English Computer DCC, Gujarati Traditional DCC, and DRM.

2. **DCC Summary (Computer Format)**:
   - 14 Revenue Heads (Passenger Intra, Sleeper, Inter-State, Luggage, Toll Gujarat, Dhabha, etc.)
   - 13 Deduction Heads (Police Motor Warrant, Journalist, Concession/Divyang, Digital Transfer, etc.)
   - State-wise Income Summary (Gujarat, Delhi, Maharashtra, UT, MP, Rajasthan) and GST Details.

3. **Special Adjustments (CC & Diwali)**:
   - Dedicated fields for **CC REFUND**, **CC AMOUNT (Deposit)**, **DIWALI EXTRA**, and **DIWALI REFUND**.
   - Automatically added/deducted in both DCC Gujarati sheet and DRM SBI Remittance calculation.

4. **ડી.સી.સી. સમરી (ગુજરાતી પરંપરાગત પત્રક)**:
   - Exact official GSRTC layout with Account Head numbers.
   - Automatic calculation of Total Gross (અ), Total Deductions (બ), Other Incomes (ક), and Net Bank Deposit (અ - બ + ક).
   - DRM Slip reconciliation box (P.O.S + DIWALI EXT - CC REFUND = TOTAL).

5. **Daily Revenue Memo (DRM - SBI Bank Remittance)**:
   - Official memorandum to Divisional Auditor for remittance to State Bank of India (SBI).
   - Automatic real-time conversion of amounts into Indian currency words (*e.g., "RS:- FORTY FOUR LAKH THIRTY SIX THOUSAND SEVEN HUNDRED FIFTY EIGHT RS. ONLY"*).

6. **Excel Export (.xlsx)**:
   - Multi-sheet Excel export including DCC Summary (English), DCC Summary (Gujarati), and DRM Memo.

7. **Print-Ready A4**:
   - Styled `@media print` rules for clean, border-perfect A4 printing suitable for physical filing.

8. **Cashier Denomination Counter**:
   - Currency notes counter (₹500, ₹200, ₹100, ₹50, ₹20, ₹10, coins) to ensure physical cash matches DCC Net Cash 100%.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# Enter the project directory
cd YOUR_REPOSITORY

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your Gemini API key in .env (GEMINI_API_KEY="your_api_key")

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

---

## 📄 License
Apache-2.0
