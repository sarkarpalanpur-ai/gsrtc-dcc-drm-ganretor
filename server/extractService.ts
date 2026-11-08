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
You are an expert OCR, accounting, and auditing assistant for GSRTC (Gujarat State Road Transport Corporation / ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ).
Analyze this photo of the official GSRTC "DAILY CASH COLLECTION SUMMARY" (કમ્પ્યુટર પ્રિન્ટ ડી.સી.સી. સમરી) or cashier sheet.

FROM THIS SINGLE PHOTO OF THE DCC SUMMARY, YOU MUST EXTRACT AND COMPUTE ALL DETAILS NEEDED TO AUTO-FILL:
1. The English DCC Summary (14 Revenue heads, 13 Deduction heads, State-wise summary, GST, POS Cash)
2. The Traditional Gujarati DCC Summary (Account heads 101 A, 102 C, 105, 110 D, 140 K, 102 H, 620, etc.)
3. The DRM (Daily Revenue Memo - SBI Bank Remittance Memo with Net Cash and Words)

Look carefully at the photo for:
- Date (DD/MM/YYYY)
- Division: SURAT DIVISION
- Depot: SURAT CITY DEPOT / SURAT CITY-2
- Depot Code: CODE O 72123 (FROM NO A508)
- Revenue items (Passanger Amount Intra, Sleeper, Inter State, Luggage, Toll Gujarat, Toll Other, Insurance, HR Surcharge, Excess, Dhabha Collection, Misc, GST, Penalties)
- Deduction items (Police Motor Warrant, Journalist, Award Winner Teacher, Employee Coupon, Other Uncollected Concession / Divyang, Toll Gate, Bus Stand Fee, Refund, Misc Expenses, Short Amount, Uncollected GST, Digital transaction Amount, Uncollected Sleeper)
- Total Revenue, Total Deduction, Total Cash To Be Deposited (P.O.S)
- Advance Booking Amount
- State wise breakdown (Gujarat, Delhi, Maharashtra, Union Territory, Madhya Pradesh, Rajasthan)
- GST details (Collected Cash, Uncollected Cash, Collected Digital, Uncollected Digital)
- Special Adjustments (either printed or handwritten at bottom / notes):
  * CC REFUND / સી.સી. રીફંડ (e.g. 20,592)
  * CC AMOUNT / સી.સી. ડિપોઝીટ / CC DIPODIT (e.g. 0)
  * DIWALI EXTRA / દીવાલી એક્સ્ટ્રા / DIWALI EXT (e.g. 35,100)
  * DIWALI REFUND / દીવાલી રીફંડ (e.g. 0)
  * DRM / G12 amounts (if any)
- Net SBI Remittance Formula:
  DRM matches Total Cash To Be Deposited (P.O.S):
  Total Revenue - Total Deductions = Total Cash To Be Deposited = DRM (e.g. 4422250)

Return ONLY valid JSON matching this structure:
{
  "date": "06/11/2026",
  "division": "SURAT DIVISION",
  "depot": "SURAT CITY DEPOT",
  "depotCityNum": "SURAT CITY-2",
  "depotCode": "CODE O 72123 (FROM NO A508)",
  "ruralIncome": 4422250,
  "urbanIncome": 0,
  "advanceBookingAmount": 327851,
  "ccRefund": 0,
  "ccAmount": 0,
  "diwaliExtra": 0,
  "diwaliRefund": 0,
  "g12Amount": 0,
  "g12Number": "",
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
