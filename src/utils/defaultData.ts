import { DCCRecord } from '../types';

export const SAMPLE_RECORD_06_11_2026: DCCRecord = {
  id: 'dcc-surat-default',
  date: '11/11/2026',
  reportGeneratedTime: '11/12/2026 12:12:16 pm',
  corporation: 'Gujarat State Road Transport Corporation',
  division: 'SURAT DIVISION',
  depot: 'SURAT CITY DEPOT',
  depotCode: 'CODE O 72123 (FROM NO A508)',
  depotCityNum: 'SURAT CITY-2',

  // English Layout Revenue Items (Photo from Omnificent 11/11/2026)
  revenueItems: [
    { id: 'rev-1', headNo: '101 A', titleEn: 'Passanger Amount Intra', titleGu: 'મુસાફર આવક (ઇન્ટ્રા)', amount: 145383.00 },
    { id: 'rev-2', headNo: '101 A', titleEn: 'Passanger Income By Sleeper Charge(Coll+Uncoll)', titleGu: 'સ્લીપર ચાર્જ આવક', amount: 1520.00 },
    { id: 'rev-3', headNo: '110 D', titleEn: 'Inter State Amount', titleGu: 'ઇન્ટર સ્ટેટ આવક', amount: 0.00 },
    { id: 'rev-4', headNo: '105', titleEn: 'Luggage Amount', titleGu: 'લગેજ આવક', amount: 12.00 },
    { id: 'rev-5', headNo: '102 H', titleEn: 'Toll Amount Gujrat', titleGu: 'ટોલટેક્ષ આવક (ગુજરાત)', amount: 4891.00 },
    { id: 'rev-6', headNo: '102 H', titleEn: 'Toll Amount Other State', titleGu: 'ટોલટેક્ષ (અન્ય રાજ્ય)', amount: 0.00 },
    { id: 'rev-7', headNo: '140', titleEn: 'Insurance Amount', titleGu: 'વીમા આવક', amount: 0.00 },
    { id: 'rev-8', headNo: '140', titleEn: 'HR Surcharge Amount', titleGu: 'એચ.આર. સરચાર્જ', amount: 0.00 },
    { id: 'rev-9', headNo: '140', titleEn: 'Excess Amount Received', titleGu: 'વધારે મળેલ રકમ', amount: 0.00 },
    { id: 'rev-10', headNo: '140 K', titleEn: 'Dhabha Collection Amount', titleGu: 'ધાબા કલેક્શન', amount: 3740.00 },
    { id: 'rev-11', headNo: '140', titleEn: 'Misc Revenue Amount', titleGu: 'પરચુરણ આવક', amount: 0.00 },
    { id: 'rev-12', headNo: '653', titleEn: 'Total GST Amt(Collected&Uncollected)', titleGu: 'કુલ જીએસટી રકમ', amount: 0.00 },
    { id: 'rev-13', headNo: '140 A', titleEn: 'Inspector Luggage Penalty Amount', titleGu: 'ઇન્સ્પેક્ટર લગેજ પેનલ્ટી', amount: 0.00 },
    { id: 'rev-14', headNo: '140 A', titleEn: 'Littering Penalty Collection', titleGu: 'ગંદકી દંડ કલેક્શન', amount: 0.00 },
  ],

  // English Layout Deduction Items
  deductionItems: [
    { id: 'ded-1', headNo: '620', titleEn: 'Police Moter Warrent', titleGu: 'પોલીસ મોટર વોરંટ', amount: 0.00 },
    { id: 'ded-2', headNo: '620 B', titleEn: 'Journalist', titleGu: 'પત્રકાર કુપન', amount: 0.00 },
    { id: 'ded-3', headNo: '620 E', titleEn: 'Award Winner Teacher', titleGu: 'એવોર્ડ વિનિંગ ટીચર', amount: 147.00 },
    { id: 'ded-4', headNo: '101 A', titleEn: 'Employee Coupon', titleGu: 'કર્મચારી કુપન', amount: 0.00 },
    { id: 'ded-5', headNo: '620 G', titleEn: 'Other Uncollected Concession', titleGu: 'દિવ્યાંગ / અન્ય કન્સેશન', amount: 5855.00 },
    { id: 'ded-6', headNo: '364 A', titleEn: 'Toll Gate', titleGu: 'ટોલ ગેટ ખર્ચ', amount: 0.00 },
    { id: 'ded-7', headNo: '140', titleEn: 'Bus Stand Fee', titleGu: 'બસ સ્ટેન્ડ ફી', amount: 0.00 },
    { id: 'ded-8', headNo: '101 A', titleEn: 'Refund', titleGu: 'રીફંડ', amount: 0.00 },
    { id: 'ded-9', headNo: '140', titleEn: 'Misc Expenses', titleGu: 'પરચુરણ ખર્ચ', amount: 0.00 },
    { id: 'ded-10', headNo: '619', titleEn: 'Short Amount', titleGu: 'શોર્ટજ રકમ', amount: 0.00 },
    { id: 'ded-11', headNo: '653', titleEn: 'Uncollected GST Amount', titleGu: 'બિન-વસૂલેલ જીએસટી', amount: 0.00 },
    { id: 'ded-12', headNo: '107', titleEn: 'Digital transaction Amount', titleGu: 'ડીજીટલ ટ્રાન્ઝેક્શન કપાત', amount: 26320.00 },
    { id: 'ded-13', headNo: '101 A', titleEn: 'Uncollected Sleeper Amount', titleGu: 'બિન-વસૂલેલ સ્લીપર રકમ', amount: 475.00 },
  ],

  advanceBookingAmount: 273854.00,

  stateWiseIncomes: [
    { state: 'GUJARAT', amount: 155546.00 },
    { state: 'DELHI', amount: 0.00 },
    { state: 'MAHARASHTRA', amount: 0.00 },
    { state: 'UNION TERRITORY', amount: 0.00 },
    { state: 'MADHYA PRADESH', amount: 0.00 },
    { state: 'RAJASTHAN', amount: 0.00 },
  ],

  gstDetails: {
    collectedCash: 0.00,
    uncollectedCash: 0.00,
    collectedDigital: 0.00,
    uncollectedDigital: 0.00,
  },

  // Gujarati Traditional Layout Items
  gujaratiIncomes: [
    { id: 'g-rev-1', headNo: '101 A', titleEn: 'Passenger Income', titleGu: 'મુસાફર આવક', amount: 114253 },
    { id: 'g-rev-2', headNo: '101 A', titleEn: 'Digital Transfer', titleGu: 'ડીજીટલ ટ્રાન્સફર', amount: 26320 },
    { id: 'g-rev-3', headNo: '102 C', titleEn: 'Student Pass (Monthly) Local', titleGu: 'વિદ્યાર્થી પાસ (માસીક) લોકલ', amount: 0 },
    { id: 'g-rev-4', headNo: '102 C', titleEn: 'Student Pass (Monthly) Express', titleGu: 'વિદ્યાર્થી પાસ (માસીક) એક્સપ્રેસ', amount: 0 },
    { id: 'g-rev-5', headNo: '102 D', titleEn: 'Student Pass (Quarterly) Local', titleGu: 'વિદ્યાર્થી પાસ (ત્રિમાસીક) લોકલ', amount: 0 },
    { id: 'g-rev-6', headNo: '102 D', titleEn: 'Student Pass (Quarterly) Express', titleGu: 'વિદ્યાર્થી પાસ (ત્રિમાસીક) એક્સપ્રેસ', amount: 0 },
    { id: 'g-rev-7', headNo: '659', titleEn: 'Student Pass Deposit', titleGu: 'વિદ્યાર્થી પાસ ડિપોઝીટ', amount: 0 },
    { id: 'g-rev-8', headNo: '101 A', titleEn: 'Diwali Extra', titleGu: 'દીવાલી એક્સ્ટ્રા', amount: 0 },
    { id: 'g-rev-9', headNo: '103', titleEn: 'Reservation Income', titleGu: 'રીઝર્વેશન આવક', amount: 0 },
    { id: 'g-rev-10', headNo: '105', titleEn: 'Luggage', titleGu: 'લગેજ', amount: 12 },
    { id: 'g-rev-11', headNo: '101 E', titleEn: 'Passenger Pass Local', titleGu: 'મુસાફર પાસ (માસીક) લોકલ', amount: 0 },
    { id: 'g-rev-12', headNo: '101 E', titleEn: 'Passenger Pass Express', titleGu: 'મુસાફર પાસ (માસીક) એક્સપ્રેસ', amount: 0 },
    { id: 'g-rev-13', headNo: '101 E', titleEn: 'Passenger Pass Gurjar Nagari', titleGu: 'મુસાફર પાસ (માસીક) ગુર્જર નગરી', amount: 0 },
    { id: 'g-rev-14', headNo: '101 F', titleEn: 'Passenger Pass Luxury', titleGu: 'મુસાફર પાસ (માસીક) લક્ઝરી', amount: 0 },
    { id: 'g-rev-15', headNo: '101 G', titleEn: 'Anywhere Pass', titleGu: 'મન ફાવે ત્યાં ફરો પાસ', amount: 0 },
    { id: 'g-rev-16', headNo: '102 G', titleEn: 'Divyang', titleGu: 'દિવ્યાંગ', amount: 6330 },
    { id: 'g-rev-17', headNo: '110 D', titleEn: 'Inter State UT', titleGu: 'ઇન્ટર સ્ટેટ (સંધપ્રદેશ)', amount: 0 },
    { id: 'g-rev-18', headNo: '110 A', titleEn: 'Inter State Maharashtra', titleGu: 'ઇન્ટર સ્ટેટ (મહારાષ્ટ્ર)', amount: 0 },
    { id: 'g-rev-19', headNo: '140', titleEn: 'ID Card Income', titleGu: 'આઈકાર્ડ આવક (વિદ્યાર્થી + મુસાફર)', amount: 0 },
    { id: 'g-rev-20', headNo: '129', titleEn: 'Express Income Extra', titleGu: 'એક્સપ્રેસ આવક (વધારાની)', amount: 0 },
    { id: 'g-rev-21', headNo: '140 K', titleEn: 'Dhabha Collection', titleGu: 'ધાબા કલેક્શન', amount: 3740 },
    { id: 'g-rev-22', headNo: '659 A', titleEn: 'CC Deposit', titleGu: 'સી.સી. ડિપોઝીટ', amount: 0 },
    { id: 'g-rev-23', headNo: '102 H', titleEn: 'Toll Tax Income', titleGu: 'ટોલટેક્ષ ની આવક', amount: 4891 },
    { id: 'g-rev-24', headNo: '619 A', titleEn: 'CC Recovery', titleGu: 'સી.સી. રીકવરી', amount: 0 },
    { id: 'g-rev-25', headNo: '619', titleEn: 'Recovery Shortage', titleGu: 'રીકવરી (શોર્ટજ)', amount: 0 },
    { id: 'g-rev-26', headNo: '140 A', titleEn: 'Passenger Penalty', titleGu: 'મુસાફર દંડ આવક', amount: 0 },
    { id: 'g-rev-27', headNo: '655', titleEn: 'Unpaid Salary / Allowances', titleGu: 'અનપેઇડ સેલેરી / એલાઉન્સીસ', amount: 0 },
  ],

  gujaratiDeductions: [
    { id: 'g-ded-1', headNo: '364 A', titleEn: 'Toll Tax', titleGu: 'ટોલટેક્ષ', amount: 0 },
    { id: 'g-ded-2', headNo: '620', titleEn: 'Police Motor Warrant', titleGu: 'પોલીસ મોટર વોરંટ', amount: 0 },
    { id: 'g-ded-3', headNo: '620 B', titleEn: 'Press Coupon', titleGu: 'પત્રકાર કુપન', amount: 0 },
    { id: 'g-ded-4', headNo: '620 E', titleEn: 'Award Winning Teacher', titleGu: 'એવોર્ડ વિનીગ ટીચર', amount: 147 },
    { id: 'g-ded-5', headNo: '101 A', titleEn: 'Passenger Adv Booking Refund', titleGu: 'પેસેન્જર એડવાન્સ બુકીંગ રીફંડ', amount: 0 },
    { id: 'g-ded-6', headNo: '101 A', titleEn: 'Employee Coupon', titleGu: 'એમપ્લોય કુપન', amount: 0 },
    { id: 'g-ded-7', headNo: '107', titleEn: 'Digital Transfer', titleGu: 'ડીજીટલ ટ્રાન્સફર', amount: 26320 },
    { id: 'g-ded-8', headNo: '659 A', titleEn: 'CC Refund', titleGu: 'સી.સી. રીફંડ', amount: 0 },
    { id: 'g-ded-9', headNo: '620 G', titleEn: 'Divyang', titleGu: 'દિવ્યાંગ', amount: 6330 },
  ],

  gujaratiOtherIncomes: [
    { id: 'g-oth-1', headNo: '140', titleEn: 'Other Income', titleGu: 'અન્ય આવક', amount: 0 },
    { id: 'g-oth-2', headNo: '131', titleEn: 'Licensee Income', titleGu: 'પરવાનેદારની આવક', amount: 0 },
    { id: 'g-oth-3', headNo: '131 A', titleEn: 'Licensee Municipal Tax', titleGu: 'પરવાનેદારની મ્યુ. ટેક્ષ વસુલાત', amount: 0 },
    { id: 'g-oth-4', headNo: '653 R', titleEn: 'Service Tax', titleGu: 'સર્વિસ ટેક્ષ (પરવાનેદાર)', amount: 0 },
  ],

  // Special Adjustments (CC & Diwali & G-12)
  ccRefund: 0,
  ccAmount: 0,
  diwaliExtra: 0,
  diwaliRefund: 0,
  g12Amount: 0,
  g12Number: '',

  drmSlip: {
    pos: 122749,
    drm: 0,
    g12: 0,
    ccDeposit: 0,
    diwaliExt: 0,
    ccRefund: 0,
    total: 122749,
  },

  ruralIncome: 122749,
  urbanIncome: 0,
  bankName: 'SBI',
  auditorTitle: 'THE DIVISIONAL AUDITOR SURAT DIVISION',

  cashierName: 'કેશીયર',
  trafficSupervisorName: 'ટ્રાફિક સુપરવાઈઝર',
  seniorDepotManagerName: "સિનિ. ડેપો મેનેજર 'એ'",
};

export function calculateEnglishTotals(record: DCCRecord) {
  const totalRevenue = record.revenueItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalDeductions = record.deductionItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalCashDeposited = totalRevenue - totalDeductions;
  return {
    totalRevenue,
    totalDeductions,
    totalCashDeposited,
  };
}

export function calculateGujaratiTotals(record: DCCRecord) {
  const totalA = record.gujaratiIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalB = record.gujaratiDeductions.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalC = record.gujaratiOtherIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netBankRemittance = totalA - totalB + totalC;
  return {
    totalA,
    totalB,
    totalC,
    netBankRemittance,
  };
}

export function calculateDRMSlip(record: DCCRecord, posAmount?: number) {
  const pos = posAmount ?? record.drmSlip.pos;
  const diwaliExt = record.drmSlip.diwaliExt || 0;
  const ccRefund = record.drmSlip.ccRefund || 0;
  const drm = Number(record.drmSlip.drm) || 0;
  const g12 = record.drmSlip.g12 || 0;
  const ccDeposit = record.drmSlip.ccDeposit || 0;
  // If user enters a holiday DRM (જૂનું DRM), it adds to today's cash (નવું DRM)
  const total = pos + drm + diwaliExt - ccRefund + g12 + ccDeposit;
  return {
    pos,
    diwaliExt,
    ccRefund,
    drm,
    g12,
    ccDeposit,
    total,
  };
}

/**
 * GSRTC DCC Operational Rule:
 * When DCC is generated today on the 11th, the Cash Collection is for the PREVIOUS DAY (10th).
 * "date 11 dcc nakhiye ale date 10 ni avi joiye"
 */
export function getYesterdayDateString(refDate?: Date): string {
  const target = refDate ? new Date(refDate) : new Date();
  target.setDate(target.getDate() - 1);
  const d = String(target.getDate()).padStart(2, '0');
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const y = target.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getTodayDateString(refDate?: Date): string {
  const target = refDate ? new Date(refDate) : new Date();
  const d = String(target.getDate()).padStart(2, '0');
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const y = target.getFullYear();
  return `${d}/${m}/${y}`;
}

export function createBlankRecord(dateStr?: string): DCCRecord {
  const now = new Date();
  // By default in GSRTC, today's DCC report is for yesterday's collection (e.g. 11th -> 10th)
  const collectionDate = dateStr || getYesterdayDateString(now);
  const reportGenTime = `${getTodayDateString(now)} ${now.toLocaleTimeString()}`;
  
  return {
    ...SAMPLE_RECORD_06_11_2026,
    id: `dcc-${Date.now()}`,
    date: collectionDate,
    reportGeneratedTime: reportGenTime,
    revenueItems: SAMPLE_RECORD_06_11_2026.revenueItems.map(item => ({ ...item, amount: 0 })),
    deductionItems: SAMPLE_RECORD_06_11_2026.deductionItems.map(item => ({ ...item, amount: 0 })),
    advanceBookingAmount: 0,
    stateWiseIncomes: SAMPLE_RECORD_06_11_2026.stateWiseIncomes.map(item => ({ ...item, amount: 0 })),
    gujaratiIncomes: SAMPLE_RECORD_06_11_2026.gujaratiIncomes.map(item => ({ ...item, amount: 0 })),
    gujaratiDeductions: SAMPLE_RECORD_06_11_2026.gujaratiDeductions.map(item => ({ ...item, amount: 0 })),
    gujaratiOtherIncomes: SAMPLE_RECORD_06_11_2026.gujaratiOtherIncomes.map(item => ({ ...item, amount: 0 })),
    ccRefund: 0,
    ccAmount: 0,
    diwaliExtra: 0,
    diwaliRefund: 0,
    g12Amount: 0,
    g12Number: '',
    drmSlip: { pos: 0, drm: 0, g12: 0, ccDeposit: 0, diwaliExt: 0, ccRefund: 0, total: 0 },
    ruralIncome: 0,
    urbanIncome: 0,
  };
}

export function createSuratCityRecord(dateStr?: string): DCCRecord {
  const collDate = dateStr || '11/11/2026';
  const now = new Date();
  const reportGenTime = '11/12/2026 12:12:16 pm';

  return {
    id: `dcc-surat-${Date.now()}`,
    date: collDate,
    reportGeneratedTime: reportGenTime,
    corporation: 'Gujarat State Road Transport Corporation',
    division: 'SURAT DIVISION',
    depot: 'SURAT CITY DEPOT',
    depotCode: 'CODE O 72123 (FROM NO A508)',
    depotCityNum: 'SURAT CITY-2',

    revenueItems: [
      { id: 'rev-1', headNo: '101 A', titleEn: 'Passanger Amount Intra', titleGu: 'મુસાફર આવક (ઇન્ટ્રા)', amount: 145383.00 },
      { id: 'rev-2', headNo: '101 A', titleEn: 'Passanger Income By Sleeper Charge(Coll+Uncoll)', titleGu: 'સ્લીપર ચાર્જ આવક', amount: 1520.00 },
      { id: 'rev-3', headNo: '110 D', titleEn: 'Inter State Amount', titleGu: 'ઇન્ટર સ્ટેટ આવક', amount: 0.00 },
      { id: 'rev-4', headNo: '105', titleEn: 'Luggage Amount', titleGu: 'લગેજ આવક', amount: 12.00 },
      { id: 'rev-5', headNo: '102 H', titleEn: 'Toll Amount Gujrat', titleGu: 'ટોલટેક્ષ આવક (ગુજરાત)', amount: 4891.00 },
      { id: 'rev-6', headNo: '102 H', titleEn: 'Toll Amount Other State', titleGu: 'ટોલટેક્ષ (અન્ય રાજ્ય)', amount: 0.00 },
      { id: 'rev-7', headNo: '140', titleEn: 'Insurance Amount', titleGu: 'વીમા આવક', amount: 0.00 },
      { id: 'rev-8', headNo: '140', titleEn: 'HR Surcharge Amount', titleGu: 'એચ.આર. સરચાર્જ', amount: 0.00 },
      { id: 'rev-9', headNo: '140', titleEn: 'Excess Amount Received', titleGu: 'વધારે મળેલ રકમ', amount: 0.00 },
      { id: 'rev-10', headNo: '140 K', titleEn: 'Dhabha Collection Amount', titleGu: 'ધાબા કલેક્શન', amount: 3740.00 },
      { id: 'rev-11', headNo: '140', titleEn: 'Misc Revenue Amount', titleGu: 'પરચુરણ આવક', amount: 0.00 },
      { id: 'rev-12', headNo: '653', titleEn: 'Total GST Amt(Collected&Uncollected)', titleGu: 'કુલ જીએસટી રકમ', amount: 0.00 },
      { id: 'rev-13', headNo: '140 A', titleEn: 'Inspector Luggage Penalty Amount', titleGu: 'ઇન્સ્પેક્ટર લગેજ પેનલ્ટી', amount: 0.00 },
      { id: 'rev-14', headNo: '140 A', titleEn: 'Littering Penalty Collection', titleGu: 'ગંદકી દંડ કલેક્શન', amount: 0.00 },
    ],

    deductionItems: [
      { id: 'ded-1', headNo: '620', titleEn: 'Police Moter Warrent', titleGu: 'પોલીસ મોટર વોરંટ', amount: 0.00 },
      { id: 'ded-2', headNo: '620 B', titleEn: 'Journalist', titleGu: 'પત્રકાર કુપન', amount: 0.00 },
      { id: 'ded-3', headNo: '620 E', titleEn: 'Award Winner Teacher', titleGu: 'એવોર્ડ વિનિંગ ટીચર', amount: 147.00 },
      { id: 'ded-4', headNo: '101 A', titleEn: 'Employee Coupon', titleGu: 'કર્મચારી કુપન', amount: 0.00 },
      { id: 'ded-5', headNo: '620 G', titleEn: 'Other Uncollected Concession', titleGu: 'દિવ્યાંગ / અન્ય કન્સેશન', amount: 5855.00 },
      { id: 'ded-6', headNo: '364 A', titleEn: 'Toll Gate', titleGu: 'ટોલ ગેટ ખર્ચ', amount: 0.00 },
      { id: 'ded-7', headNo: '140', titleEn: 'Bus Stand Fee', titleGu: 'બસ સ્ટેન્ડ ફી', amount: 0.00 },
      { id: 'ded-8', headNo: '101 A', titleEn: 'Refund', titleGu: 'રીફંડ', amount: 0.00 },
      { id: 'ded-9', headNo: '140', titleEn: 'Misc Expenses', titleGu: 'પરચુરણ ખર્ચ', amount: 0.00 },
      { id: 'ded-10', headNo: '619', titleEn: 'Short Amount', titleGu: 'શોર્ટજ રકમ', amount: 0.00 },
      { id: 'ded-11', headNo: '653', titleEn: 'Uncollected GST Amount', titleGu: 'બિન-વસૂલેલ જીએસટી', amount: 0.00 },
      { id: 'ded-12', headNo: '107', titleEn: 'Digital transaction Amount', titleGu: 'ડીજીટલ ટ્રાન્ઝેક્શન કપાત', amount: 26320.00 },
      { id: 'ded-13', headNo: '101 A', titleEn: 'Uncollected Sleeper Amount', titleGu: 'બિન-વસૂલેલ સ્લીપર રકમ', amount: 475.00 },
    ],

    advanceBookingAmount: 273854.00,

    stateWiseIncomes: [
      { state: 'GUJARAT', amount: 155546.00 },
      { state: 'DELHI', amount: 0.00 },
      { state: 'MAHARASHTRA', amount: 0.00 },
      { state: 'UNION TERRITORY', amount: 0.00 },
      { state: 'MADHYA PRADESH', amount: 0.00 },
      { state: 'RAJASTHAN', amount: 0.00 },
    ],

    gstDetails: {
      collectedCash: 0.00,
      uncollectedCash: 0.00,
      collectedDigital: 0.00,
      uncollectedDigital: 0.00,
    },

    gujaratiIncomes: [
      { id: 'g-rev-1', headNo: '101 A', titleEn: 'Passenger Income', titleGu: 'મુસાફર આવક', amount: 114253 },
      { id: 'g-rev-2', headNo: '101 A', titleEn: 'Digital Transfer', titleGu: 'ડીજીટલ ટ્રાન્સફર', amount: 26320 },
      { id: 'g-rev-3', headNo: '102 C', titleEn: 'Student Pass (Monthly) Local', titleGu: 'વિદ્યાર્થી પાસ (માસીક) લોકલ', amount: 0 },
      { id: 'g-rev-4', headNo: '102 C', titleEn: 'Student Pass (Monthly) Express', titleGu: 'વિદ્યાર્થી પાસ (માસીક) એક્સપ્રેસ', amount: 0 },
      { id: 'g-rev-5', headNo: '102 D', titleEn: 'Student Pass (Quarterly) Local', titleGu: 'વિદ્યાર્થી પાસ (ત્રિમાસીક) લોકલ', amount: 0 },
      { id: 'g-rev-6', headNo: '102 D', titleEn: 'Student Pass (Quarterly) Express', titleGu: 'વિદ્યાર્થી પાસ (ત્રિમાસીક) એક્સપ્રેસ', amount: 0 },
      { id: 'g-rev-7', headNo: '659', titleEn: 'Student Pass Deposit', titleGu: 'વિદ્યાર્થી પાસ ડિપોઝીટ', amount: 0 },
      { id: 'g-rev-8', headNo: '101 A', titleEn: 'Diwali Extra', titleGu: 'દીવાલી એક્સ્ટ્રા', amount: 0 },
      { id: 'g-rev-9', headNo: '103', titleEn: 'Reservation Income', titleGu: 'રીઝર્વેશન આવક', amount: 0 },
      { id: 'g-rev-10', headNo: '105', titleEn: 'Luggage', titleGu: 'લગેજ', amount: 12 },
      { id: 'g-rev-11', headNo: '101 E', titleEn: 'Passenger Pass Local', titleGu: 'મુસાફર પાસ (માસીક) લોકલ', amount: 0 },
      { id: 'g-rev-12', headNo: '101 E', titleEn: 'Passenger Pass Express', titleGu: 'મુસાફર પાસ (માસીક) એક્સપ્રેસ', amount: 0 },
      { id: 'g-rev-13', headNo: '101 E', titleEn: 'Passenger Pass Gurjar Nagari', titleGu: 'મુસાફર પાસ (માસીક) ગુર્જર નગરી', amount: 0 },
      { id: 'g-rev-14', headNo: '101 F', titleEn: 'Passenger Pass Luxury', titleGu: 'મુસાફર પાસ (માસીક) લક્ઝરી', amount: 0 },
      { id: 'g-rev-15', headNo: '101 G', titleEn: 'Anywhere Pass', titleGu: 'મન ફાવે ત્યાં ફરો પાસ', amount: 0 },
      { id: 'g-rev-16', headNo: '102 G', titleEn: 'Divyang', titleGu: 'દિવ્યાંગ', amount: 6330 },
      { id: 'g-rev-17', headNo: '110 D', titleEn: 'Inter State UT', titleGu: 'ઇન્ટર સ્ટેટ (સંધપ્રદેશ)', amount: 0 },
      { id: 'g-rev-18', headNo: '110 A', titleEn: 'Inter State Maharashtra', titleGu: 'ઇન્ટર સ્ટેટ (મહારાષ્ટ્ર)', amount: 0 },
      { id: 'g-rev-19', headNo: '140', titleEn: 'ID Card Income', titleGu: 'આઈકાર્ડ આવક (વિદ્યાર્થી + મુસાફર)', amount: 0 },
      { id: 'g-rev-20', headNo: '129', titleEn: 'Express Income Extra', titleGu: 'એક્સપ્રેસ આવક (વધારાની)', amount: 0 },
      { id: 'g-rev-21', headNo: '140 K', titleEn: 'Dhabha Collection', titleGu: 'ધાબા કલેક્શન', amount: 3740 },
      { id: 'g-rev-22', headNo: '659 A', titleEn: 'CC Deposit', titleGu: 'સી.સી. ડિપોઝીટ', amount: 0 },
      { id: 'g-rev-23', headNo: '102 H', titleEn: 'Toll Tax Income', titleGu: 'ટોલટેક્ષ ની આવક', amount: 4891 },
      { id: 'g-rev-24', headNo: '619 A', titleEn: 'CC Recovery', titleGu: 'સી.સી. રીકવરી', amount: 0 },
      { id: 'g-rev-25', headNo: '619', titleEn: 'Recovery Shortage', titleGu: 'રીકવરી (શોર્ટજ)', amount: 0 },
      { id: 'g-rev-26', headNo: '140 A', titleEn: 'Passenger Penalty', titleGu: 'મુસાફર દંડ આવક', amount: 0 },
      { id: 'g-rev-27', headNo: '655', titleEn: 'Unpaid Salary / Allowances', titleGu: 'અનપેઇડ સેલેરી / એલાઉન્સીસ', amount: 0 },
    ],

    gujaratiDeductions: [
      { id: 'g-ded-1', headNo: '364 A', titleEn: 'Toll Tax', titleGu: 'ટોલટેક્ષ', amount: 0 },
      { id: 'g-ded-2', headNo: '620', titleEn: 'Police Motor Warrant', titleGu: 'પોલીસ મોટર વોરંટ', amount: 0 },
      { id: 'g-ded-3', headNo: '620 B', titleEn: 'Press Coupon', titleGu: 'પત્રકાર કુપન', amount: 0 },
      { id: 'g-ded-4', headNo: '620 E', titleEn: 'Award Winning Teacher', titleGu: 'એવોર્ડ વિનીગ ટીચર', amount: 147 },
      { id: 'g-ded-5', headNo: '101 A', titleEn: 'Passenger Adv Booking Refund', titleGu: 'પેસેન્જર એડવાન્સ બુકીંગ રીફંડ', amount: 0 },
      { id: 'g-ded-6', headNo: '101 A', titleEn: 'Employee Coupon', titleGu: 'એમપ્લોય કુપન', amount: 0 },
      { id: 'g-ded-7', headNo: '107', titleEn: 'Digital Transfer', titleGu: 'ડીજીટલ ટ્રાન્સફર', amount: 26320 },
      { id: 'g-ded-8', headNo: '659 A', titleEn: 'CC Refund', titleGu: 'સી.સી. રીફંડ', amount: 0 },
      { id: 'g-ded-9', headNo: '620 G', titleEn: 'Divyang', titleGu: 'દિવ્યાંગ', amount: 6330 },
    ],

    gujaratiOtherIncomes: [
      { id: 'g-oth-1', headNo: '140', titleEn: 'Other Income', titleGu: 'અન્ય આવક', amount: 0 },
      { id: 'g-oth-2', headNo: '131', titleEn: 'Licensee Income', titleGu: 'પરવાનેદારની આવક', amount: 0 },
      { id: 'g-oth-3', headNo: '131 A', titleEn: 'Licensee Municipal Tax', titleGu: 'પરવાનેદારની મ્યુ. ટેક્ષ વસુલાત', amount: 0 },
      { id: 'g-oth-4', headNo: '653 R', titleEn: 'Service Tax', titleGu: 'સર્વિસ ટેક્ષ (પરવાનેદાર)', amount: 0 },
    ],

    ccRefund: 0,
    ccAmount: 0,
    diwaliExtra: 0,
    diwaliRefund: 0,
    g12Amount: 0,
    g12Number: '',

    drmSlip: {
      pos: 122749,
      drm: 0,
      g12: 0,
      ccDeposit: 0,
      diwaliExt: 0,
      ccRefund: 0,
      total: 122749,
    },

    ruralIncome: 122749,
    urbanIncome: 0,
    bankName: 'SBI',
    auditorTitle: 'THE DIVISIONAL AUDITOR SURAT DIVISION',

    cashierName: 'કેશીયર',
    trafficSupervisorName: 'ટ્રાફિક સુપરવાઈઝર',
    seniorDepotManagerName: "સિનિ. ડેપો મેનેજર 'એ'",
  };
}
