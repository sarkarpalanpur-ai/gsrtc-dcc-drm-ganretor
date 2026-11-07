export interface LineItem {
  id: string;
  headNo?: string;        // Account Head Number, e.g., "101 A", "620", "102 H"
  titleEn: string;        // English name
  titleGu: string;        // Gujarati name
  amount: number;         // Amount in Rupees
  code?: string;
  isCustom?: boolean;
}

export interface StateIncomeItem {
  state: string;
  amount: number;
}

export interface GSTSummary {
  collectedCash: number;
  uncollectedCash: number;
  collectedDigital: number;
  uncollectedDigital: number;
}

export interface DRMSlipDetails {
  pos: number;
  drm: number;
  g12: number;
  ccDeposit: number;
  diwaliExt: number;
  ccRefund: number;
  total: number;
}

export interface DCCRecord {
  id: string;
  date: string;               // DD/MM/YYYY e.g., "06/11/2026"
  reportGeneratedTime: string;// e.g., "11/07/2026 01:44:42 am"
  corporation: string;        // "Gujarat State Road Transport Corporation" / "ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ"
  division: string;           // "SURAT DIVISION" / "સુરત વિભાગ"
  depot: string;              // "SURAT CITY DEPOT" / "એસ.ટી. સુરત સીટી ડેપો-૨"
  depotCode: string;          // "CODE O 72123 (FROM NO A508)"
  depotCityNum: string;       // "SURAT CITY-2"
  
  // English layout revenues (Photo 3)
  revenueItems: LineItem[];
  // English layout deductions (Photo 3)
  deductionItems: LineItem[];
  
  // Advance booking amount
  advanceBookingAmount: number;
  
  // State-wise breakdown
  stateWiseIncomes: StateIncomeItem[];
  
  // GST Details
  gstDetails: GSTSummary;

  // Gujarati Traditional Layout extra items (Photo 1)
  gujaratiIncomes: LineItem[];
  gujaratiDeductions: LineItem[];
  gujaratiOtherIncomes: LineItem[];
  
  // Special adjustments: CC & Diwali & G-12
  ccRefund: number;
  ccAmount: number;
  diwaliExtra: number;
  diwaliRefund: number;
  g12Amount: number;
  g12Number: string;

  // DRM slip values at bottom of Gujarati sheet
  drmSlip: DRMSlipDetails;

  // DRM Memo specific
  ruralIncome: number;
  urbanIncome: number;
  bankName: string;           // "SBI"
  auditorTitle: string;       // "THE DIVISIONAL AUDITOR SURAT DIVISION"

  // Signatures / Personnel
  cashierName: string;
  trafficSupervisorName: string;
  seniorDepotManagerName: string;

  // Metadata
  lastModified?: string;
  sourceImage?: string;
}

export interface DenominationRow {
  note: number;
  count: number;
}

export interface CashDenominationState {
  counts: Record<number, number>;
  coins: number;
}
