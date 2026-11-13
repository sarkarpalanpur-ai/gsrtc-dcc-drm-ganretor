import { GoogleGenAI } from '@google/genai';
import { createWorker, PSM } from 'tesseract.js';
import { DCCRecord } from '../src/types';
import { parseGSRTCDccOcrText, ParsedOCRResult } from '../src/utils/ocrParser';

function getImageDimensionsFromBuffer(buf: Buffer): { width: number; height: number } | null {
  try {
    // PNG: signature 89 50 4E 47, IHDR width@16 height@20 (big-endian uint32)
    if (buf.length >= 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    // JPEG: scan for SOF0..SOF3 / SOF5..SOF15 markers (skip DHT 0xC4, DAC 0xCC, JPG 0xC8)
    if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buf[offset + 1];
        if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
          offset += 2;
          continue;
        }
        const segLen = buf.readUInt16BE(offset + 2);
        const isSof =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);
        if (isSof && offset + 9 < buf.length) {
          const height = buf.readUInt16BE(offset + 5);
          const width = buf.readUInt16BE(offset + 7);
          return { width, height };
        }
        if (segLen < 2) break;
        offset += 2 + segLen;
      }
    }
  } catch {
    // Fallback to client dimensions or full-frame scan
  }
  return null;
}

function scoreOcrCandidate(res: ParsedOCRResult): number {
  const revSum = res.record.revenueItems.reduce((s, r) => s + r.amount, 0);
  const dedSum = res.record.deductionItems.reduce((s, d) => s + d.amount, 0);
  let score = res.matchedFieldsCount;
  if (res.printedTotalRevenue !== undefined && Math.abs(res.printedTotalRevenue - revSum) < 1) {
    score += 50;
  }
  if (res.printedTotalDeduction !== undefined && Math.abs(res.printedTotalDeduction - dedSum) < 1) {
    score += 50;
  }
  return score;
}

async function extractWithServerTesseract(
  base64Data: string,
  widthHint?: number,
  heightHint?: number
): Promise<{ record: Partial<DCCRecord>; matchedFieldsCount: number } | null> {
  const imageBuffer = Buffer.from(base64Data, 'base64');
  const dims =
    widthHint && heightHint
      ? { width: Math.round(widthHint), height: Math.round(heightHint) }
      : getImageDimensionsFromBuffer(imageBuffer);

  const worker = await createWorker('eng');
  try {
    const candidates: ParsedOCRResult[] = [];

    if (dims && dims.width >= dims.height * 1.1) {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_COLUMN });

      // Pass A: Official Omnificent 56/44 column layout (left 0..56.4%, right 55.8%..100%)
      const leftA = await worker.recognize(imageBuffer, {
        rectangle: {
          left: 0,
          top: 0,
          width: Math.round(dims.width * 0.564),
          height: dims.height,
        },
      });
      const rightStartA = Math.round(dims.width * 0.558);
      const rightA = await worker.recognize(imageBuffer, {
        rectangle: {
          left: rightStartA,
          top: 0,
          width: dims.width - rightStartA,
          height: dims.height,
        },
      });
      const passA = parseGSRTCDccOcrText(`${leftA.data.text}\n${rightA.data.text}`);
      candidates.push(passA);

      // Pass B: If Pass A did not already verify both totals against printed totals, try symmetric 50/50 split
      if (scoreOcrCandidate(passA) < 100) {
        const leftB = await worker.recognize(imageBuffer, {
          rectangle: {
            left: 0,
            top: 0,
            width: Math.round(dims.width * 0.505),
            height: dims.height,
          },
        });
        const rightStartB = Math.round(dims.width * 0.495);
        const rightB = await worker.recognize(imageBuffer, {
          rectangle: {
            left: rightStartB,
            top: 0,
            width: dims.width - rightStartB,
            height: dims.height,
          },
        });
        candidates.push(parseGSRTCDccOcrText(`${leftB.data.text}\n${rightB.data.text}`));
      }
    }

    const currentTopScore = candidates.reduce((max, c) => Math.max(max, scoreOcrCandidate(c)), -1);
    if (candidates.length === 0 || currentTopScore < 4) {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
      const fullRes = await worker.recognize(imageBuffer);
      candidates.push(parseGSRTCDccOcrText(fullRes.data.text));
    }

    let bestResult: ParsedOCRResult | null = null;
    let bestScore = -1;
    for (const cand of candidates) {
      const s = scoreOcrCandidate(cand);
      if (s > bestScore) {
        bestScore = s;
        bestResult = cand;
      }
    }

    if (!bestResult || bestResult.matchedFieldsCount < 3) {
      return null;
    }

    return {
      record: bestResult.record,
      matchedFieldsCount: bestResult.matchedFieldsCount,
    };
  } finally {
    await worker.terminate();
  }
}

export async function extractDCCFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  width?: number,
  height?: number
): Promise<{ data: Partial<DCCRecord>; matchedFieldsCount?: number; engine: 'gemini' | 'server-ocr' } | null> {
  let cleanData = imageBase64;
  if (cleanData.includes('base64,')) {
    cleanData = cleanData.split('base64,')[1];
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
You are an expert OCR, accounting, and auditing assistant for GSRTC (Gujarat State Road Transport Corporation / ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ).
Analyze this photo of the official GSRTC "DAILY CASH COLLECTION SUMMARY" (કમ્પ્યુટર પ્રિન્ટ ડી.સી.સી. સમરી) or cashier sheet.

FROM THIS SINGLE PHOTO OF THE DCC SUMMARY, EXTRACT EXACTLY WHAT IS PRINTED IN THIS IMAGE ONLY (use 0 if empty or absent):
- Collection For the Date (DD/MM/YYYY)
- Report Generated Time
- All 14 Revenue items
- All 13 Deduction items
- Advance Booking Amount
- State wise breakdown (Gujarat, Delhi, Maharashtra, Union Territory, Madhya Pradesh, Rajasthan)
- GST details
- Special Adjustments if present (CC Refund, CC Amount, Diwali Extra, Diwali Refund, G12 Amount, G12 Number)

Return ONLY valid JSON matching this structure:
{
  "date": "DD/MM/YYYY",
  "reportGeneratedTime": "",
  "division": "SURAT DIVISION",
  "depot": "SURAT CITY DEPOT",
  "depotCityNum": "SURAT CITY-2",
  "depotCode": "CODE O 72123 (FROM NO A508)",
  "ruralIncome": 0,
  "urbanIncome": 0,
  "advanceBookingAmount": 0,
  "ccRefund": 0,
  "ccAmount": 0,
  "diwaliExtra": 0,
  "diwaliRefund": 0,
  "g12Amount": 0,
  "g12Number": "",
  "revenueItems": [
    { "headNo": "101 A", "titleEn": "Passanger Amount Intra", "titleGu": "મુસાફર આવક (ઇન્ટ્રા)", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Passanger Income By Sleeper Charge(Coll+Uncoll)", "titleGu": "સ્લીપર ચાર્જ આવક", "amount": 0 },
    { "headNo": "110 D", "titleEn": "Inter State Amount", "titleGu": "ઇન્ટર સ્ટેટ આવક", "amount": 0 },
    { "headNo": "105", "titleEn": "Luggage Amount", "titleGu": "લગેજ આવક", "amount": 0 },
    { "headNo": "102 H", "titleEn": "Toll Amount Gujrat", "titleGu": "ટોલટેક્ષ આવક (ગુજરાત)", "amount": 0 },
    { "headNo": "102 H", "titleEn": "Toll Amount Other State", "titleGu": "ટોલટેક્ષ (અન્ય રાજ્ય)", "amount": 0 },
    { "headNo": "140", "titleEn": "Insurance Amount", "titleGu": "વીમા આવક", "amount": 0 },
    { "headNo": "140", "titleEn": "HR Surcharge Amount", "titleGu": "એચ.આર. સરચાર્જ", "amount": 0 },
    { "headNo": "140", "titleEn": "Excess Amount Received", "titleGu": "વધારે મળેલ રકમ", "amount": 0 },
    { "headNo": "140 K", "titleEn": "Dhabha Collection Amount", "titleGu": "ધાબા કલેક્શન", "amount": 0 },
    { "headNo": "140", "titleEn": "Misc Revenue Amount", "titleGu": "પરચુરણ આવક", "amount": 0 },
    { "headNo": "653", "titleEn": "Total GST Amt(Collected&Uncollected)", "titleGu": "કુલ જીએસટી રકમ", "amount": 0 },
    { "headNo": "140 A", "titleEn": "Inspector Luggage Penalty Amount", "titleGu": "ઇન્સ્પેક્ટર લગેજ પેનલ્ટી", "amount": 0 },
    { "headNo": "140 A", "titleEn": "Littering Penalty Collection", "titleGu": "ગંદકી દંડ કલેક્શન", "amount": 0 }
  ],
  "deductionItems": [
    { "headNo": "620", "titleEn": "Police Moter Warrent", "titleGu": "પોલીસ મોટર વોરંટ", "amount": 0 },
    { "headNo": "620 B", "titleEn": "Journalist", "titleGu": "પત્રકાર કુપન", "amount": 0 },
    { "headNo": "620 E", "titleEn": "Award Winner Teacher", "titleGu": "એવોર્ડ વિનિંગ ટીચર", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Employee Coupon", "titleGu": "કર્મચારી કુપન", "amount": 0 },
    { "headNo": "620 G", "titleEn": "Other Uncollected Concession", "titleGu": "દિવ્યાંગ / અન્ય કન્સેશન", "amount": 0 },
    { "headNo": "364 A", "titleEn": "Toll Gate", "titleGu": "ટોલ ગેટ ખર્ચ", "amount": 0 },
    { "headNo": "140", "titleEn": "Bus Stand Fee", "titleGu": "બસ સ્ટેન્ડ ફી", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Refund", "titleGu": "રીફંડ", "amount": 0 },
    { "headNo": "140", "titleEn": "Misc Expenses", "titleGu": "પરચુરણ ખર્ચ", "amount": 0 },
    { "headNo": "619", "titleEn": "Short Amount", "titleGu": "શોર્ટજ રકમ", "amount": 0 },
    { "headNo": "653", "titleEn": "Uncollected GST Amount", "titleGu": "બિન-વસૂલેલ જીએસટી", "amount": 0 },
    { "headNo": "107", "titleEn": "Digital transaction Amount", "titleGu": "ડીજીટલ ટ્રાન્ઝેક્શન કપાત", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Uncollected Sleeper Amount", "titleGu": "બિન-વસૂલેલ સ્લીપર રકમ", "amount": 0 }
  ],
  "stateWiseIncomes": [
    { "state": "GUJARAT", "amount": 0 },
    { "state": "DELHI", "amount": 0 },
    { "state": "MAHARASHTRA", "amount": 0 },
    { "state": "UNION TERRITORY", "amount": 0 },
    { "state": "MADHYA PRADESH", "amount": 0 },
    { "state": "RAJASTHAN", "amount": 0 }
  ],
  "gstDetails": {
    "collectedCash": 0,
    "uncollectedCash": 0,
    "collectedDigital": 0,
    "uncollectedDigital": 0
  },
  "drmSlip": {
    "pos": 0,
    "drm": 0,
    "g12": 0,
    "ccDeposit": 0,
    "diwaliExt": 0,
    "ccRefund": 0,
    "total": 0
  }
}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanData,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        return { data: JSON.parse(text), engine: 'gemini' };
      }
    } catch (err) {
      console.error('Gemini extraction error, falling back to server OCR:', err);
    }
  }

  // Server-side local Tesseract OCR (works without external CDN or GEMINI_API_KEY)
  try {
    const ocrRes = await extractWithServerTesseract(cleanData, width, height);
    if (ocrRes) {
      return {
        data: ocrRes.record,
        matchedFieldsCount: ocrRes.matchedFieldsCount,
        engine: 'server-ocr',
      };
    }
  } catch (ocrErr) {
    console.error('Server Tesseract OCR error:', ocrErr);
  }

  return null;
}
