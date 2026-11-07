import * as XLSX from 'xlsx';
import { DCCRecord } from '../types';
import { calculateEnglishTotals, calculateGujaratiTotals } from './defaultData';
import { numberToIndianCurrencyWords } from './numberToWords';

export function exportDCCAndDRMToExcel(record: DCCRecord) {
  const wb = XLSX.utils.book_new();

  const engTotals = calculateEnglishTotals(record);
  const gujTotals = calculateGujaratiTotals(record);

  // 1. Sheet: DCC_English (matches Photo 3)
  const dccEngRows: (string | number)[][] = [
    ['GUJARAT STATE ROAD TRANSPORT CORPORATION'],
    [`${record.division} | ${record.depot}`],
    ['DAILY CASH COLLECTION SUMMARY'],
    [`Collection For the Date: ${record.date}`, '', `Report Generated Time: ${record.reportGeneratedTime}`],
    [],
    ['REVENUE', 'AMOUNT (RS.)', '', 'DEDUCTIONS', 'AMOUNT (RS.)'],
  ];

  const maxRows = Math.max(record.revenueItems.length, record.deductionItems.length);
  for (let i = 0; i < maxRows; i++) {
    const rev = record.revenueItems[i];
    const ded = record.deductionItems[i];
    dccEngRows.push([
      rev ? `${i + 1}. ${rev.titleEn}` : '',
      rev ? rev.amount : '',
      '',
      ded ? `${i + 1}. ${ded.titleEn}` : '',
      ded ? ded.amount : '',
    ]);
  }

  dccEngRows.push(
    [],
    ['TOTAL REVENUE', engTotals.totalRevenue, '', 'TOTAL DEDUCTION', engTotals.totalDeductions],
    ['TOTAL CASH TO BE DEPOSITED (POS)', engTotals.totalCashDeposited, '', 'ADVANCE BOOKING AMOUNT', record.advanceBookingAmount],
    [],
    ['SPECIAL ADJUSTMENTS (વિશેષ એડજસ્ટમેન્ટ)', 'AMOUNT (RS.)', '', '', ''],
    ['CC AMOUNT (+)', record.ccAmount || 0, '', 'CC REFUND (-)', record.ccRefund || 0],
    ['DIWALI EXTRA (+)', record.diwaliExtra || 0, '', 'DIWALI REFUND (-)', record.diwaliRefund || 0],
    ['G-12 AMOUNT (+) (HEAD 140)', record.g12Amount || 0, '', 'G-12 NUMBER', record.g12Number || '-'],
    ['FINAL DRM REMITTANCE TO SBI', record.ruralIncome || 0, '', '', ''],
    [],
    ['STATE WISE INCOME SUMMARY', 'AMOUNT (RS.)', '', 'GST DETAILS', 'AMOUNT (RS.)'],
    ...record.stateWiseIncomes.map((item, idx) => [
      item.state,
      item.amount,
      '',
      idx === 0 ? '1) Collected Cash GST Amt' :
      idx === 1 ? '2) Uncollected Cash GST Amt' :
      idx === 2 ? '3) Collected Digital GST Amt' :
      idx === 3 ? '4) Uncollected Digital GST Amt' : '',
      idx === 0 ? record.gstDetails.collectedCash :
      idx === 1 ? record.gstDetails.uncollectedCash :
      idx === 2 ? record.gstDetails.collectedDigital :
      idx === 3 ? record.gstDetails.uncollectedDigital : '',
    ]),
    [],
    ['TRAFFIC SUPERVISOR', '', '', "SENIOR DEPOT MANAGER 'A'"],
    [`એસ.ટી. ${record.depot}`, '', '', `એસ.ટી. ${record.depot}`]
  );

  const wsDCCEng = XLSX.utils.aoa_to_sheet(dccEngRows);
  XLSX.utils.book_append_sheet(wb, wsDCCEng, 'DCC_Summary_English');

  // 2. Sheet: DRM_Memo (matches Photo 2)
  const words = numberToIndianCurrencyWords(record.ruralIncome || gujTotals.netBankRemittance);
  const drmRows: (string | number)[][] = [
    ['STATE TRANSPORT GUJARAT', '', record.division],
    ['DAILY REVENUE MEMO', '', record.depotCode],
    [record.depotCityNum, '', `DATE: ${record.date}`],
    [],
    ['TO: THE DIVISIONAL AUDITOR SURAT DIVISION'],
    [`THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO ${record.bankName} ON ${record.date} NET CASH RECEIPTS ON PASSENGER BUS SERVICE`],
    [],
    ['CATEGORY / PARTICULARS', 'AMOUNT (RS.)'],
    ['RURAL INCOME', record.ruralIncome || gujTotals.netBankRemittance],
    ['URBAN / LOCAL INCOME', record.urbanIncome || 0],
    ['TOTAL REMITTANCE', (record.ruralIncome || gujTotals.netBankRemittance) + (record.urbanIncome || 0)],
    [],
    ['IN WORDS:', words],
    [],
    ['AUTHORIZED SIGNATURES:'],
    ['CASHIER', 'TRAFFIC SUPERVISOR', "SENIOR DEPOT MANAGER 'A'"],
    ['એસ.ટી. સુરત સીટી-ડેપો-૨', 'એસ.ટી. સુરત સીટી-ડેપો-૨', 'એસ.ટી. સુરત સીટી ડેપો-૨'],
  ];

  const wsDRM = XLSX.utils.aoa_to_sheet(drmRows);
  XLSX.utils.book_append_sheet(wb, wsDRM, 'DRM_Daily_Revenue_Memo');

  // 3. Sheet: DCC_Gujarati (matches Photo 1)
  const gujMaxRows = Math.max(record.gujaratiIncomes.length, record.gujaratiDeductions.length);
  const dccGujRows: (string | number)[][] = [
    ['ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ'],
    ['ડી.સી.સી. સમરી સુરત સીટી'],
    [`તારીખ: ${record.date}`],
    [],
    ['ક્રમ', 'એકા. હેડ', 'આવક વિગત', 'રકમ રૂ.', '', 'ક્રમ', 'એકા. હેડ', 'કપાત વિગત', 'રકમ રૂ.'],
  ];

  for (let i = 0; i < gujMaxRows; i++) {
    const inc = record.gujaratiIncomes[i];
    const ded = record.gujaratiDeductions[i];
    dccGujRows.push([
      inc ? i + 1 : '',
      inc ? inc.headNo || '' : '',
      inc ? inc.titleGu : '',
      inc && inc.amount > 0 ? inc.amount : inc ? 0 : '',
      '',
      ded ? i + 1 : '',
      ded ? ded.headNo || '' : '',
      ded ? ded.titleGu : '',
      ded && ded.amount > 0 ? ded.amount : ded ? 0 : '',
    ]);
  }

  dccGujRows.push(
    [],
    ['અ', '', 'કુલ આવક (અ)', gujTotals.totalA, '', 'બ', '', 'કુલ કપાત (બ)', gujTotals.totalB],
    [],
    ['અન્ય આવક:', '', '', '', '', '', '', '', ''],
    ...record.gujaratiOtherIncomes.map((item, idx) => [
      idx + 1,
      item.headNo || '',
      item.titleGu,
      item.amount,
      '',
      '',
      '',
      '',
      '',
    ]),
    ['ક', '', 'કુલ અન્ય આવક (ક)', gujTotals.totalC, '', '', '', '', ''],
    [],
    ['બેંકમાં જમાં કરાવેલ ડી.સી.સી. તથા ડી.આર.એમ. ની આવક (અ - બ + ક)', '', '', gujTotals.netBankRemittance],
    [],
    ['DRM SLIP BREAKDOWN:', '', 'રકમ રૂ.'],
    ['P.O.S', '', record.drmSlip.pos],
    ['DRM', '', record.drmSlip.drm],
    ['G12', '', record.drmSlip.g12],
    ['CC DIPODIT', '', record.drmSlip.ccDeposit],
    ['DIWALI EXT', '', record.drmSlip.diwaliExt],
    ['CC REFUND', '', record.drmSlip.ccRefund],
    ['TOTAL', '', record.drmSlip.total]
  );

  const wsDCCGuj = XLSX.utils.aoa_to_sheet(dccGujRows);
  XLSX.utils.book_append_sheet(wb, wsDCCGuj, 'DCC_Summary_Gujarati');

  const safeDate = record.date.replace(/\//g, '-');
  XLSX.writeFile(wb, `GSRTC_DCC_DRM_${safeDate}.xlsx`);
}
