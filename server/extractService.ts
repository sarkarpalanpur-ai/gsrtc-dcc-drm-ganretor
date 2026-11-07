import { GoogleGenAI } from '@google/genai';
import { DCCRecord } from '../src/types';
import { SAMPLE_RECORD_06_11_2026 } from '../src/utils/defaultData';

export async function extractDCCFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<Partial<DCCRecord>> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Returning template/sample record.');
    return {
      ...SAMPLE_RECORD_06_11_2026,
      id: `dcc-${Date.now()}`,
    };
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `
You are an expert OCR and auditing assistant for GSRTC (Gujarat State Road Transport Corporation / ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ).
Analyze this photo of an official GSRTC document. It can be:
1. "DAILY CASH COLLECTION SUMMARY" (Computer printed English sheet with REVENUE, DEDUCTIONS, STATE WISE, GST DETAILS)
2. "ડી.સી.સી. સમરી સુરત સીટી" (Handwritten or printed Gujarati DCC summary sheet with Account Heads 101 A, 102 C, 620, etc.)
3. "DAILY REVENUE MEMO" (DRM slip or memo addressed to Divisional Auditor remitted to SBI)
4. A cashier slip or conductor collection summary

Please extract all details accurately into JSON. Look carefully at:
- Date (DD/MM/YYYY)
- Division (e.g. SURAT DIVISION)
- Depot (e.g. SURAT CITY DEPOT / SURAT CITY-2)
- Revenue items (Passanger Amount Intra, Sleeper, Inter State, Luggage, Toll Gujarat, Toll Other, Insurance, HR Surcharge, Excess, Dhabha Collection, Misc, GST, Penalties)
- Deduction items (Police Motor Warrant, Journalist, Award Winner Teacher, Employee Coupon, Other Uncollected Concession / Divyang, Toll Gate, Bus Stand Fee, Refund, Misc Expenses, Short Amount, Uncollected GST, Digital transaction Amount, Uncollected Sleeper)
- Total Revenue, Total Deduction, Total Cash To Be Deposited
- Advance Booking Amount
- State wise breakdown (Gujarat, Delhi, Maharashtra, Union Territory, Madhya Pradesh, Rajasthan)
- GST details (Collected Cash, Uncollected Cash, Collected Digital, Uncollected Digital)
- Traditional Gujarati heads if visible:
  101 A મુસાફર આવક, ડીજીટલ ટ્રાન્સફર, દીવાલી એક્સ્ટ્રા, લગેજ, દિવ્યાંગ, ઇન્ટર સ્ટેટ, ધાબા કલેક્શન, ટોલટેક્ષ
  કપાત: પોલીસ મોટર વોરંટ, પત્રકાર કુપન, પેસેન્જર એડવાન્સ બુકીંગ રીફંડ, ડીજીટલ ટ્રાન્સફર, દિવ્યાંગ
  DRM Slip breakdown: P.O.S, DRM, G12, CC DIPODIT, DIWALI EXT, CC REFUND, TOTAL
- DRM Memo values: Rural Income, Urban Income, Bank Name (SBI), Net Cash remitted

Return ONLY valid JSON matching this structure:
{
  "date": "06/11/2026",
  "division": "SURAT DIVISION",
  "depot": "SURAT CITY DEPOT",
  "depotCityNum": "SURAT CITY-2",
  "depotCode": "CODE O 72123 (FROM NO A508)",
  "ruralIncome": 4436758,
  "urbanIncome": 0,
  "advanceBookingAmount": 327851,
  "revenueItems": [
    { "headNo": "101 A", "titleEn": "Passanger Amount Intra", "titleGu": "મુસાફર આવક (ઇન્ટ્રા)", "amount": 4798749 },
    { "headNo": "101 A", "titleEn": "Passanger Income By Sleeper Charge(Coll+Uncoll)", "titleGu": "સ્લીપર ચાર્જ આવક", "amount": 3800 },
    { "headNo": "110 D", "titleEn": "Inter State Amount", "titleGu": "ઇન્ટર સ્ટેટ આવક", "amount": 483 },
    { "headNo": "105", "titleEn": "Luggage Amount", "titleGu": "લગેજ આવક", "amount": 987 },
    { "headNo": "102 H", "titleEn": "Toll Amount Gujrat", "titleGu": "ટોલટેક્ષ આવક (ગુજરાત)", "amount": 133365 },
    { "headNo": "102 H", "titleEn": "Toll Amount Other State", "titleGu": "ટોલટેક્ષ (અન્ય રાજ્ય)", "amount": 0 },
    { "headNo": "140", "titleEn": "Insurance Amount", "titleGu": "વીમા આવક", "amount": 0 },
    { "headNo": "140", "titleEn": "HR Surcharge Amount", "titleGu": "એચ.આર. સરચાર્જ", "amount": 0 },
    { "headNo": "140", "titleEn": "Excess Amount Received", "titleGu": "વધારે મળેલ રકમ", "amount": 0 },
    { "headNo": "140 K", "titleEn": "Dhabha Collection Amount", "titleGu": "ધાબા કલેક્શન", "amount": 4495 },
    { "headNo": "140", "titleEn": "Misc Revenue Amount", "titleGu": "પરચુરણ આવક", "amount": 5 },
    { "headNo": "653", "titleEn": "Total GST Amt(Collected&Uncollected)", "titleGu": "કુલ જીએસટી રકમ", "amount": 0 },
    { "headNo": "140 A", "titleEn": "Inspector Luggage Penalty Amount", "titleGu": "ઇન્સ્પેક્ટર લગેજ પેનલ્ટી", "amount": 0 },
    { "headNo": "140 A", "titleEn": "Littering Penalty Collection", "titleGu": "ગંદકી દંડ કલેક્શન", "amount": 0 }
  ],
  "deductionItems": [
    { "headNo": "620", "titleEn": "Police Moter Warrent", "titleGu": "પોલીસ મોટર વોરંટ", "amount": 265 },
    { "headNo": "620 B", "titleEn": "Journalist", "titleGu": "પત્રકાર કુપન", "amount": 0 },
    { "headNo": "620 E", "titleEn": "Award Winner Teacher", "titleGu": "એવોર્ડ વિનિંગ ટીચર", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Employee Coupon", "titleGu": "કર્મચારી કુપન", "amount": 0 },
    { "headNo": "620 G", "titleEn": "Other Uncollected Concession", "titleGu": "દિવ્યાંગ / અન્ય કન્સેશન", "amount": 20347 },
    { "headNo": "364 A", "titleEn": "Toll Gate", "titleGu": "ટોલ ગેટ ખર્ચ", "amount": 0 },
    { "headNo": "140", "titleEn": "Bus Stand Fee", "titleGu": "બસ સ્ટેન્ડ ફી", "amount": 0 },
    { "headNo": "101 A", "titleEn": "Refund", "titleGu": "રીફંડ", "amount": 0 },
    { "headNo": "140", "titleEn": "Misc Expenses", "titleGu": "પરચુરણ ખર્ચ", "amount": 0 },
    { "headNo": "619", "titleEn": "Short Amount", "titleGu": "શોર્ટજ રકમ", "amount": 0 },
    { "headNo": "653", "titleEn": "Uncollected GST Amount", "titleGu": "બિન-વસૂલેલ જીએસટી", "amount": 0 },
    { "headNo": "107", "titleEn": "Digital transaction Amount", "titleGu": "ડીજીટલ ટ્રાન્ઝેક્શન કપાત", "amount": 497787 },
    { "headNo": "101 A", "titleEn": "Uncollected Sleeper Amount", "titleGu": "બિન-વસૂલેલ સ્લીપર રકમ", "amount": 1235 }
  ],
  "stateWiseIncomes": [
    { "state": "GUJARAT", "amount": 4778137 },
    { "state": "DELHI", "amount": 0 },
    { "state": "MAHARASHTRA", "amount": 0 },
    { "state": "UNION TERRITORY", "amount": 483 },
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
    "pos": 4422250,
    "drm": 0,
    "g12": 0,
    "ccDeposit": 0,
    "diwaliExt": 35100,
    "ccRefund": 20592,
    "total": 4436758
  }
}
`;

  // Clean base64 string
  let cleanData = imageBase64;
  if (cleanData.includes('base64,')) {
    cleanData = cleanData.split('base64,')[1];
  }

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
        {
          text: prompt,
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    console.error('Error extracting with Gemini:', err);
    throw err;
  }
}
