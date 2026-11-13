import { DCCRecord } from '../types';
import { createBlankRecord, getYesterdayDateString } from './defaultData';
import { autoMapEnglishToGujaratiAndDRM } from './dccAutoMapper';

export interface ParsedOCRResult {
  record: DCCRecord;
  matchedFieldsCount: number;
  printedTotalRevenue?: number;
  printedTotalDeduction?: number;
  printedPosCash?: number;
  rawText: string;
}

/**
 * Extracts the numeric amount immediately following the matched row label,
 * ignoring cross-column bleed or leading/trailing noise.
 */
function extractAmountAfterLabel(rawLine: string, labelPattern: RegExp): number | null {
  const norm = rawLine.replace(/[[\]{}()]/g, ' ');
  const match = norm.match(labelPattern);
  if (!match || match.index === undefined) return null;

  let afterLabel = rawLine.slice(match.index + match[0].length);
  // Strip parenthesized label suffixes such as "(Coll+Uncoll)" or "(Collected&Uncollected)"
  afterLabel = afterLabel.replace(/^\s*\([^)]*\)/, '');

  // Ignore anything after a pipe border if a valid number preceded it
  const pipeIdx = afterLabel.indexOf('|');
  const beforePipe = pipeIdx >= 0 ? afterLabel.slice(0, pipeIdx) : afterLabel;
  const searchRegion = /\d/.test(beforePipe) ? beforePipe : afterLabel;

  const numMatch = searchRegion.match(/(\d[\d,]*\.?\d*)/);
  if (!numMatch) return 0;

  const parsed = parseFloat(numMatch[1].replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parses raw OCR text from a GSRTC / Omnificent DCC Summary into a complete DCCRecord.
 */
export function parseGSRTCDccOcrText(
  rawText: string,
  fallbackDate?: string
): ParsedOCRResult {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Detect Collection Date (DD/MM/YYYY)
  let detectedDate = fallbackDate || getYesterdayDateString();
  for (const line of lines) {
    if (/collection\s*(?:for\s*(?:the)?\s*date)?|તારીખ/i.test(line)) {
      const m = line.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
      if (m) {
        detectedDate = `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
        break;
      }
    }
  }

  // Fallback: detect any DD/MM/YYYY date near the top if "Collection For the Date" wasn't matched
  if (detectedDate === (fallbackDate || getYesterdayDateString())) {
    for (const line of lines.slice(0, 12)) {
      if (/generated\s*time/i.test(line)) continue;
      const m = line.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
      if (m) {
        detectedDate = `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
        break;
      }
    }
  }

  // Detect Report Generated Time
  let detectedGenTime = '';
  for (const line of lines) {
    if (/report\s*generated\s*time/i.test(line)) {
      const m = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{4}\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (m) {
        detectedGenTime = m[1];
        break;
      }
    }
  }

  const blank = createBlankRecord(detectedDate);
  if (detectedGenTime) {
    blank.reportGeneratedTime = detectedGenTime;
  }

  const revAmounts = new Array<number>(blank.revenueItems.length).fill(0);
  const dedAmounts = new Array<number>(blank.deductionItems.length).fill(0);
  const matchedKeys = new Set<string>();

  let advanceBooking = 0;
  let printedTotalRevenue: number | undefined;
  let printedTotalDeduction: number | undefined;
  let printedPosCash: number | undefined;

  const revMatchers: Array<{ idx: number; pattern: RegExp; skipIf?: RegExp }> = [
    { idx: 0, pattern: /pass[ae]nger\s*amount\s*intra/i },
    { idx: 1, pattern: /pass[ae]nger\s*income\s*by\s*sleeper\s*charge|sleeper\s*charge/i },
    { idx: 2, pattern: /inter\s*state\s*amount|inter\s*state/i },
    { idx: 3, pattern: /luggage\s*amount/i, skipIf: /inspector|penalty/i },
    { idx: 4, pattern: /toll\s*amount\s*guj[ae]?rat/i },
    { idx: 5, pattern: /toll\s*amount\s*other\s*state|toll\s*amount\s*other/i },
    { idx: 6, pattern: /insurance\s*amount/i },
    { idx: 7, pattern: /hr\s*surcharge\s*amount|hr\s*surcharge/i },
    { idx: 8, pattern: /excess\s*amount\s*received|excess\s*amount/i },
    { idx: 9, pattern: /dhabh?a\s*collection\s*amount|dhabh?a\s*collection/i },
    { idx: 10, pattern: /misc\s*revenue\s*amount|misc\s*revenue/i },
    { idx: 11, pattern: /total\s*gst\s*amt/i },
    { idx: 12, pattern: /inspector\s*luggage\s*penalty\s*amount|luggage\s*penalty/i },
    { idx: 13, pattern: /littering\s*penalty\s*collection|littering\s*penalty/i },
  ];

  const dedMatchers: Array<{ idx: number; pattern: RegExp; skipIf?: RegExp }> = [
    { idx: 0, pattern: /police\s*mot[eo]r\s*warr?[ae]nt/i },
    { idx: 1, pattern: /journalist/i },
    { idx: 2, pattern: /award\s*winner\s*teacher/i },
    { idx: 3, pattern: /employee\s*coupon/i },
    { idx: 4, pattern: /other\s*uncollected\s*concession|uncollected\s*concession/i },
    { idx: 5, pattern: /toll\s*gate/i },
    { idx: 6, pattern: /bus\s*stand\s*fee/i },
    { idx: 7, pattern: /(?:^|\s)\d*\.?\s*refund\b/i, skipIf: /cc\s*refund|diwali/i },
    { idx: 8, pattern: /misc\s*expenses/i },
    { idx: 9, pattern: /short\s*amount/i },
    { idx: 10, pattern: /uncollected\s*gst\s*amount|uncollected\s*gst/i },
    { idx: 11, pattern: /digital\s*transaction\s*amount|digital\s*transaction/i },
    { idx: 12, pattern: /uncollected\s*sleeper\s*amount|uncollected\s*sleeper/i },
  ];

  for (const rawLine of lines) {
    // Summary rows
    const revTot = extractAmountAfterLabel(rawLine, /total\s*revenue\b/i);
    if (revTot !== null) {
      printedTotalRevenue = revTot;
      matchedKeys.add('totalRev');
    }

    const dedTot = extractAmountAfterLabel(rawLine, /total\s*deduction/i);
    if (dedTot !== null) {
      printedTotalDeduction = dedTot;
      matchedKeys.add('totalDed');
    }

    const cashTot = extractAmountAfterLabel(rawLine, /total\s*cash\s*(?:to\s*be\s*)?deposited/i);
    if (cashTot !== null) {
      printedPosCash = cashTot;
      matchedKeys.add('totalCash');
    }

    const advVal = extractAmountAfterLabel(rawLine, /advance\s*booking\s*amount|advance\s*booking/i);
    if (advVal !== null) {
      advanceBooking = advVal;
      matchedKeys.add('advBooking');
    }

    for (const m of revMatchers) {
      if (m.skipIf && m.skipIf.test(rawLine)) continue;
      const val = extractAmountAfterLabel(rawLine, m.pattern);
      if (val !== null) {
        revAmounts[m.idx] = val;
        matchedKeys.add(`rev-${m.idx}`);
      }
    }

    for (const m of dedMatchers) {
      if (m.skipIf && m.skipIf.test(rawLine)) continue;
      const val = extractAmountAfterLabel(rawLine, m.pattern);
      if (val !== null) {
        dedAmounts[m.idx] = val;
        matchedKeys.add(`ded-${m.idx}`);
      }
    }
  }

  const updatedRevenue = blank.revenueItems.map((item, idx) => ({
    ...item,
    amount: revAmounts[idx] || 0,
  }));

  const updatedDeductions = blank.deductionItems.map((item, idx) => ({
    ...item,
    amount: dedAmounts[idx] || 0,
  }));

  const totalRev = updatedRevenue.reduce((s, r) => s + r.amount, 0);
  const totalDed = updatedDeductions.reduce((s, d) => s + d.amount, 0);
  const netPos = totalRev - totalDed;

  const assembled: DCCRecord = {
    ...blank,
    id: `dcc-${Date.now()}`,
    date: detectedDate,
    revenueItems: updatedRevenue,
    deductionItems: updatedDeductions,
    advanceBookingAmount: advanceBooking,
    stateWiseIncomes: blank.stateWiseIncomes.map((s) =>
      s.state === 'GUJARAT' ? { ...s, amount: totalRev } : s
    ),
    ruralIncome: netPos,
    drmSlip: {
      ...blank.drmSlip,
      pos: netPos,
      total: netPos,
    },
  };

  return {
    record: autoMapEnglishToGujaratiAndDRM(assembled),
    matchedFieldsCount: matchedKeys.size,
    printedTotalRevenue,
    printedTotalDeduction,
    printedPosCash,
    rawText,
  };
}
