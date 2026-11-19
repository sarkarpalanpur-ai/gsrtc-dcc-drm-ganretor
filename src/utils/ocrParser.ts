import { DCCRecord } from '../types';
import { createBlankRecord, getYesterdayDateString } from './defaultData';
import { autoMapEnglishToGujaratiAndDRM } from './dccAutoMapper';

export interface ParsedOCRResult {
  record: DCCRecord;
  matchedFieldsCount: number;
  verifiedDigitFieldsCount?: number;
  printedTotalRevenue?: number;
  printedTotalDeduction?: number;
  printedPosCash?: number;
  rawText: string;
}

export interface WordBox {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

/**
 * Reconstructs clean single-column left and right table lines from Tesseract word bounding boxes.
 * Prevents multi-column row-number bleed and works on portrait/shifted screenshots.
 */
export function reconstructLinesFromWordBoxes(words: WordBox[]): string {
  if (!words || words.length === 0) return '';

  const valid = words.filter((w) => w.text && w.text.trim().length > 0 && w.bbox);
  if (valid.length === 0) return '';

  const minX = Math.min(...valid.map((w) => w.bbox.x0));
  const maxX = Math.max(...valid.map((w) => w.bbox.x1));
  const spanX = Math.max(1, maxX - minX);

  // Detect column divider between REVENUE (left) and DEDUCTIONS (right) if present
  // Look for right-column header words like "DEDUCTIONS" or "1." + "Police"
  let splitX = minX + spanX * 0.54;
  const dedHeader = valid.find((w) => /^deductions?$/i.test(w.text.trim()) && w.bbox.x0 > minX + spanX * 0.35);
  const policeWord = valid.find((w) => /^police$/i.test(w.text.trim()) && w.bbox.x0 > minX + spanX * 0.35);
  const rightAnchorX = dedHeader?.bbox.x0 ?? policeWord?.bbox.x0;
  if (rightAnchorX !== undefined) {
    // Include row number "1." just to the left of "Police"
    splitX = rightAnchorX - spanX * 0.045;
  }

  const groupRows = (subset: WordBox[]): string[] => {
    if (subset.length === 0) return [];
    const sorted = [...subset].sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
    const avgH =
      sorted.reduce((sum, w) => sum + Math.max(8, w.bbox.y1 - w.bbox.y0), 0) / sorted.length;
    const yTol = Math.max(6, avgH * 0.55);

    const rows: WordBox[][] = [];
    for (const w of sorted) {
      const cy = (w.bbox.y0 + w.bbox.y1) / 2;
      const lastRow = rows[rows.length - 1];
      if (lastRow) {
        const lastCy =
          lastRow.reduce((s, item) => s + (item.bbox.y0 + item.bbox.y1) / 2, 0) / lastRow.length;
        if (Math.abs(cy - lastCy) <= yTol) {
          lastRow.push(w);
          continue;
        }
      }
      rows.push([w]);
    }

    return rows.map((row) =>
      row
        .sort((a, b) => a.bbox.x0 - b.bbox.x0)
        .map((w) => w.text.trim())
        .join(' ')
    );
  };

  // Only split into two columns if words meaningfully occupy both sides
  const leftWords = valid.filter((w) => (w.bbox.x0 + w.bbox.x1) / 2 < splitX);
  const rightWords = valid.filter((w) => (w.bbox.x0 + w.bbox.x1) / 2 >= splitX);

  if (leftWords.length > 10 && rightWords.length > 10) {
    return [...groupRows(leftWords), ...groupRows(rightWords)].join('\n');
  }
  return groupRows(valid).join('\n');
}

/**
 * Scores a parsed OCR candidate, awarding +50 bonus each when extracted row sums
 * match the printed Total Revenue, printed Total Deduction, or printed Total Cash.
 */
export function scoreOcrCandidate(res: ParsedOCRResult): number {
  const revSum = res.record.revenueItems.reduce((s, r) => s + r.amount, 0);
  const dedSum = res.record.deductionItems.reduce((s, d) => s + d.amount, 0);
  const posCash = revSum - dedSum;
  const nonZeroCount =
    res.record.revenueItems.filter((r) => r.amount > 0).length +
    res.record.deductionItems.filter((d) => d.amount > 0).length;

  let score = (res.verifiedDigitFieldsCount ?? res.matchedFieldsCount) + nonZeroCount * 2;
  if (res.printedTotalRevenue !== undefined && res.printedTotalRevenue > 0 && Math.abs(res.printedTotalRevenue - revSum) < 1) {
    score += 50;
  }
  if (res.printedTotalDeduction !== undefined && res.printedTotalDeduction > 0 && Math.abs(res.printedTotalDeduction - dedSum) < 1) {
    score += 50;
  }
  if (res.printedPosCash !== undefined && res.printedPosCash > 0 && Math.abs(res.printedPosCash - posCash) < 1) {
    score += 25;
  }
  return score;
}

const RIGHT_COLUMN_BLEED_RE =
  /\b(?:police\s*mot|journalist|award\s*winner|employee\s*coupon|other\s*uncollected|toll\s*gate|bus\s*stand\s*fee|misc\s*expenses|short\s*amount|uncollected\s*gst|digital\s*transaction|uncollected\s*sleeper)\b/i;

/**
 * Extracts the numeric amount immediately following the matched row label,
 * ignoring cross-column bleed, row numbers (e.g. "6. Toll Gate"), and trailing border artifacts (e.g. "483.003").
 */
function extractAmountAfterLabel(
  rawLine: string,
  labelPattern: RegExp
): { value: number; hasDigits: boolean } | null {
  const norm = rawLine.replace(/[[\]{}()]/g, ' ');
  const match = norm.match(labelPattern);
  if (!match || match.index === undefined) return null;

  let afterLabel = rawLine.slice(match.index + match[0].length);
  // Strip parenthesized label suffixes such as "(Coll+Uncoll)" or "(Collected&Uncollected)"
  afterLabel = afterLabel.replace(/^\s*\([^)]*\)/, '');

  // Truncate before any right-column label bleed on the same line
  const bleedMatch = afterLabel.match(RIGHT_COLUMN_BLEED_RE);
  if (bleedMatch && bleedMatch.index !== undefined) {
    afterLabel = afterLabel.slice(0, bleedMatch.index);
  }

  // Also truncate before a second column's numbered item like "| 6. Toll..." or " 4. Employee..."
  const nextRowMatch = afterLabel.match(/\s+\d{1,2}\.\s*[A-Za-z]/);
  if (nextRowMatch && nextRowMatch.index !== undefined && nextRowMatch.index > 0) {
    afterLabel = afterLabel.slice(0, nextRowMatch.index);
  }

  // Ignore anything after a pipe border if a valid number preceded it
  const pipeIdx = afterLabel.indexOf('|');
  const beforePipe = pipeIdx >= 0 ? afterLabel.slice(0, pipeIdx) : afterLabel;
  const searchRegion = /\d/.test(beforePipe) ? beforePipe : afterLabel;

  // Find numeric token that is NOT a row index like "6." followed by letters
  const tokenRegex = /(\d[\d,]*\.?\d*)/g;
  let numToken: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = tokenRegex.exec(searchRegion)) !== null) {
    const token = m[1];
    const trailing = searchRegion.slice(m.index + token.length);
    if (/^\s*\.\s*[A-Za-z]/.test(trailing) || (/^\d{1,2}\.$/.test(token) && /^\s*[A-Za-z]/.test(trailing))) {
      continue;
    }
    numToken = token;
    break;
  }

  if (!numToken) return { value: 0, hasDigits: false };

  // Fix border-digit bleed after 2 decimal places (e.g., "483.003" -> "483.00")
  const cleanedToken = numToken.replace(/,/g, '').replace(/(\.\d{2})\d+$/, '$1');
  const parsed = parseFloat(cleanedToken);
  return { value: isNaN(parsed) ? 0 : parsed, hasDigits: true };
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
  const stateAmounts = new Map<string, number>();
  const matchedKeys = new Set<string>();
  const verifiedDigitKeys = new Set<string>();

  let advanceBooking = 0;
  let printedTotalRevenue: number | undefined;
  let printedTotalDeduction: number | undefined;
  let printedPosCash: number | undefined;

  const revMatchers: Array<{ idx: number; pattern: RegExp; skipIf?: RegExp }> = [
    { idx: 0, pattern: /pass[ae]nger\s*amount\s*[il1]ntra/i },
    { idx: 1, pattern: /pass[ae]nger\s*income\s*by\s*sleeper\s*charge|sleeper\s*charge/i },
    {
      idx: 2,
      pattern: /[il1]nt[ec]r[\s\-_.]*st[ae][tl][ec](?:\s*am[ou]+nt)?|(?:^|\s)3\.?\s*[il1]nt[ec]r\b/i,
      skipIf: /other\s*state/i,
    },
    { idx: 3, pattern: /luggage\b.*am[ou]+nt|luggage\s*am[ou]+nt/i, skipIf: /inspector|penalty/i },
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

  const stateMatchers: Array<{ state: string; pattern: RegExp }> = [
    { state: 'GUJARAT', pattern: /\bguj[ae]?rat\b/i },
    { state: 'DELHI', pattern: /\bdelhi\b/i },
    { state: 'MAHARASHTRA', pattern: /\bmaharashtra\b/i },
    { state: 'UNION TERRITORY', pattern: /\bunion\s*territory\b/i },
    { state: 'MADHYA PRADESH', pattern: /\bmadhya\s*pradesh\b/i },
    { state: 'RAJASTHAN', pattern: /\brajasthan\b/i },
  ];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';

    // Summary rows
    const revTot = extractAmountAfterLabel(rawLine, /total\s*revenue\b/i);
    if (revTot !== null && revTot.hasDigits) {
      printedTotalRevenue = revTot.value;
      matchedKeys.add('totalRev');
      verifiedDigitKeys.add('totalRev');
    }

    const dedTot = extractAmountAfterLabel(rawLine, /total\s*deduction/i);
    if (dedTot !== null && dedTot.hasDigits) {
      printedTotalDeduction = dedTot.value;
      matchedKeys.add('totalDed');
      verifiedDigitKeys.add('totalDed');
    }

    const cashTot = extractAmountAfterLabel(rawLine, /total\s*cash\s*(?:to\s*be\s*)?deposited/i);
    if (cashTot !== null && cashTot.hasDigits) {
      printedPosCash = cashTot.value;
      matchedKeys.add('totalCash');
      verifiedDigitKeys.add('totalCash');
    }

    const advVal = extractAmountAfterLabel(rawLine, /advance\s*booking\s*amount|advance\s*booking/i);
    if (advVal !== null && advVal.hasDigits) {
      advanceBooking = advVal.value;
      matchedKeys.add('advBooking');
      verifiedDigitKeys.add('advBooking');
    }

    for (const m of revMatchers) {
      if (m.skipIf && m.skipIf.test(rawLine)) continue;
      let res = extractAmountAfterLabel(rawLine, m.pattern);
      // If label matched but number wrapped to immediately following line (e.g. "2. ... Sleeper\nCharge(Coll+Uncoll) 3800.00")
      if (res !== null && !res.hasDigits && nextLine && /^\(?\s*coll|^[\d,]+\.\d{2}$/i.test(nextLine)) {
        const nextNum = nextLine.match(/(\d[\d,]*\.\d{2})/);
        if (nextNum) {
          res = { value: parseFloat(nextNum[1].replace(/,/g, '')) || 0, hasDigits: true };
        }
      }
      if (res !== null) {
        if (res.hasDigits || revAmounts[m.idx] === 0) {
          revAmounts[m.idx] = res.value;
        }
        matchedKeys.add(`rev-${m.idx}`);
        if (res.hasDigits) verifiedDigitKeys.add(`rev-${m.idx}`);
      }
    }

    for (const m of dedMatchers) {
      if (m.skipIf && m.skipIf.test(rawLine)) continue;
      const res = extractAmountAfterLabel(rawLine, m.pattern);
      if (res !== null) {
        if (res.hasDigits || dedAmounts[m.idx] === 0) {
          dedAmounts[m.idx] = res.value;
        }
        matchedKeys.add(`ded-${m.idx}`);
        if (res.hasDigits) verifiedDigitKeys.add(`ded-${m.idx}`);
      }
    }

    // Parse State Wise Income Summary rows (exclude "Toll Amount Gujrat" and "Toll Amount Other State")
    if (!/toll\s*amount/i.test(rawLine)) {
      for (const sm of stateMatchers) {
        const res = extractAmountAfterLabel(rawLine, sm.pattern);
        if (res !== null && res.hasDigits) {
          stateAmounts.set(sm.state, res.value);
        }
      }
    }
  }

  // Cross-verify Inter State Amount with State Wise Income Summary (non-Gujarat states)
  const nonGujaratStateTotal =
    (stateAmounts.get('DELHI') || 0) +
    (stateAmounts.get('MAHARASHTRA') || 0) +
    (stateAmounts.get('UNION TERRITORY') || 0) +
    (stateAmounts.get('MADHYA PRADESH') || 0) +
    (stateAmounts.get('RAJASTHAN') || 0);

  if (revAmounts[2] === 0 && nonGujaratStateTotal > 0) {
    const currentRevSum = revAmounts.reduce((s, v) => s + v, 0);
    if (
      printedTotalRevenue === undefined ||
      Math.abs(printedTotalRevenue - (currentRevSum + nonGujaratStateTotal)) <= 1
    ) {
      revAmounts[2] = nonGujaratStateTotal;
      matchedKeys.add('rev-2');
      verifiedDigitKeys.add('rev-2');
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

  const interStateVal = updatedRevenue[2]?.amount || 0;
  const parsedGujarat = stateAmounts.get('GUJARAT');
  const computedGujarat =
    parsedGujarat !== undefined
      ? parsedGujarat
      : Math.max(0, totalRev - Math.max(interStateVal, nonGujaratStateTotal) - (updatedRevenue[5]?.amount || 0));

  const updatedStates = blank.stateWiseIncomes.map((s) => {
    if (s.state === 'GUJARAT') return { ...s, amount: computedGujarat };
    const parsedVal = stateAmounts.get(s.state);
    return { ...s, amount: parsedVal !== undefined ? parsedVal : s.amount };
  });

  const assembled: DCCRecord = {
    ...blank,
    id: `dcc-${Date.now()}`,
    date: detectedDate,
    revenueItems: updatedRevenue,
    deductionItems: updatedDeductions,
    advanceBookingAmount: advanceBooking,
    stateWiseIncomes: updatedStates,
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
    verifiedDigitFieldsCount: verifiedDigitKeys.size,
    printedTotalRevenue,
    printedTotalDeduction,
    printedPosCash,
    rawText,
  };
}
