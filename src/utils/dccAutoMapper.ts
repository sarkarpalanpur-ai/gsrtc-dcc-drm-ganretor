import { DCCRecord } from '../types';
import { calculateEnglishTotals } from './defaultData';

/**
 * Automatically maps values from English DCC Summary to Gujarati DCC Summary & DRM
 * This ensures that when the user enters:
 * - CC REFUND
 * - CC AMOUNT
 * - DIWALI EXTRA
 * - DIWALI REFUND
 * along with the DCC Summary, all the appropriate Gujarati Account Heads (એકાઉન્ટ હેડ)
 * and the DRM Memo are automatically calculated and updated!
 */
export function autoMapEnglishToGujaratiAndDRM(record: DCCRecord): DCCRecord {
  const engTotals = calculateEnglishTotals(record);

  // Extract key English items by index or head
  const passengerIntra = record.revenueItems[0]?.amount || 0;
  const sleeperCharge = record.revenueItems[1]?.amount || 0;
  const interState = record.revenueItems[2]?.amount || 0;
  const luggage = record.revenueItems[3]?.amount || 0;
  const tollGujarat = record.revenueItems[4]?.amount || 0;
  const tollOtherState = record.revenueItems[5]?.amount || 0;
  const dhabhaCollection = record.revenueItems[9]?.amount || 0;
  const miscRevenue = record.revenueItems[10]?.amount || 0;
  const luggagePenalty = record.revenueItems[12]?.amount || 0;
  const litteringPenalty = record.revenueItems[13]?.amount || 0;

  // Deductions from English
  const policeWarrant = record.deductionItems[0]?.amount || 0;
  const journalist = record.deductionItems[1]?.amount || 0;
  const awardTeacher = record.deductionItems[2]?.amount || 0;
  const employeeCoupon = record.deductionItems[3]?.amount || 0;
  const concessionDivyang = record.deductionItems[4]?.amount || 0;
  const tollGate = record.deductionItems[5]?.amount || 0;
  const busStandFee = record.deductionItems[6]?.amount || 0;
  const refund = record.deductionItems[7]?.amount || 0;
  const miscExpenses = record.deductionItems[8]?.amount || 0;
  const shortAmount = record.deductionItems[9]?.amount || 0;
  const digitalTransaction = record.deductionItems[11]?.amount || 0;
  const uncollectedSleeper = record.deductionItems[12]?.amount || 0;

  // The 4 Special Adjustment Fields (user-requested):
  const ccRefund = Number(record.ccRefund) || 0;
  const ccAmount = Number(record.ccAmount) || 0;
  const diwaliExtra = Number(record.diwaliExtra) || 0;
  const diwaliRefund = Number(record.diwaliRefund) || 0;

  // 1. Auto-Map Gujarati Incomes (આવક એકાઉન્ટ હેડ):
  const updatedGujaratiIncomes = record.gujaratiIncomes.map((item) => {
    // 101 A મુસાફર આવક: In traditional GSRTC sheet, Gross Passenger = Intra minus Digital Transfer
    if (item.headNo === '101 A' && item.titleGu === 'મુસાફર આવક') {
      const netCashPass = passengerIntra > digitalTransaction ? passengerIntra - digitalTransaction : passengerIntra;
      return { ...item, amount: netCashPass };
    }
    // 101 A ડીજીટલ ટ્રાન્સફર
    if (item.headNo === '101 A' && item.titleGu === 'ડીજીટલ ટ્રાન્સફર') {
      return { ...item, amount: digitalTransaction };
    }
    // 101 A દીવાલી એક્સ્ટ્રા (Diwali Extra)
    if (item.headNo === '101 A' && item.titleGu === 'દીવાલી એક્સ્ટ્રા') {
      return { ...item, amount: diwaliExtra };
    }
    // 659 A સી.સી. ડિપોઝીટ / CC Amount
    if (item.headNo === '659 A' && item.titleGu === 'સી.સી. ડિપોઝીટ') {
      return { ...item, amount: ccAmount };
    }
    // 105 લગેજ
    if (item.headNo === '105' && item.titleGu === 'લગેજ') {
      return { ...item, amount: luggage };
    }
    // 102 G દિવ્યાંગ
    if (item.headNo === '102 G' && item.titleGu === 'દિવ્યાંગ') {
      return { ...item, amount: concessionDivyang };
    }
    // 110 D ઇન્ટર સ્ટેટ (સંધપ્રદેશ)
    if (item.headNo === '110 D') {
      return { ...item, amount: interState };
    }
    // 140 K ધાબા કલેક્શન
    if (item.headNo === '140 K' && item.titleGu === 'ધાબા કલેક્શન') {
      return { ...item, amount: dhabhaCollection };
    }
    // 102 H ટોલટેક્ષ ની આવક
    if (item.headNo === '102 H' && item.titleGu === 'ટોલટેક્ષ ની આવક') {
      return { ...item, amount: tollGujarat + tollOtherState };
    }
    // 140 A મુસાફર દંડ આવક
    if (item.headNo === '140 A') {
      return { ...item, amount: luggagePenalty + litteringPenalty };
    }
    return item;
  });

  // 2. Auto-Map Gujarati Deductions (કપાત એકાઉન્ટ હેડ):
  const updatedGujaratiDeductions = record.gujaratiDeductions.map((item) => {
    // 364 A ટોલટેક્ષ (ખર્ચ)
    if (item.headNo === '364 A') {
      return { ...item, amount: tollGate };
    }
    // 620 પોલીસ મોટર વોરંટ
    if (item.headNo === '620' && item.titleGu === 'પોલીસ મોટર વોરંટ') {
      return { ...item, amount: policeWarrant };
    }
    // 620 B પત્રકાર કુપન
    if (item.headNo === '620 B') {
      return { ...item, amount: journalist };
    }
    // 620 E એવોર્ડ વિનીગ ટીચર
    if (item.headNo === '620 E') {
      return { ...item, amount: awardTeacher };
    }
    // 101 A પેસેન્જર એડવાન્સ બુકીંગ રીફંડ / દીવાલી રીફંડ
    if (item.headNo === '101 A' && item.titleGu === 'પેસેન્જર એડવાન્સ બુકીંગ રીફંડ') {
      const finalRefund = diwaliRefund > 0 ? diwaliRefund : refund;
      return { ...item, amount: finalRefund };
    }
    // 101 A એમપ્લોય કુપન
    if (item.headNo === '101 A' && item.titleGu === 'એમપ્લોય કુપન') {
      return { ...item, amount: employeeCoupon };
    }
    // 107 ડીજીટલ ટ્રાન્સફર
    if (item.headNo === '107') {
      return { ...item, amount: digitalTransaction };
    }
    // 659 A સી.સી. રીફંડ (CC Refund)
    if (item.headNo === '659 A' && item.titleGu === 'સી.સી. રીફંડ') {
      return { ...item, amount: ccRefund };
    }
    // 620 G દિવ્યાંગ
    if (item.headNo === '620 G') {
      return { ...item, amount: concessionDivyang };
    }
    return item;
  });

  // 3. Auto-Map Gujarati Other Incomes (અન્ય આવક - એકાઉન્ટ હેડ ૧૪૦):
  // User Rule: "g-12 ni je amount ave te any avak ma add thay 140 ma"
  const g12Amount = Number(record.g12Amount) || 0;
  const g12Number = record.g12Number ? String(record.g12Number).trim() : '';

  const updatedGujaratiOtherIncomes = record.gujaratiOtherIncomes.map((item) => {
    if (item.headNo === '140') {
      const g12Note = g12Number ? ` (G-12 નં. ${g12Number})` : ' (G-12)';
      return {
        ...item,
        amount: g12Amount,
        titleGu: g12Amount > 0 ? `અન્ય આવક${g12Note}` : 'અન્ય આવક',
      };
    }
    return item;
  });

  // 4. Auto-Map DRM Slip values:
  // P.O.S matches Total Cash To Be Deposited from English DCC
  const posAmount = engTotals.totalCashDeposited;
  const drm = record.drmSlip.drm || 0;

  // Total CC refund to deduct
  const totalRefundDeduction = ccRefund + (diwaliRefund > 0 ? diwaliRefund : refund);

  // Total Net Cash for DRM:
  // Formula: POS + CC Amount + Diwali Extra - CC Refund - Diwali Refund + DRM + G12
  const finalRemittance = posAmount + ccAmount + diwaliExtra - totalRefundDeduction + drm + g12Amount;

  const updatedDrmSlip = {
    ...record.drmSlip,
    pos: posAmount,
    ccDeposit: ccAmount,
    diwaliExt: diwaliExtra,
    ccRefund: totalRefundDeduction,
    drm: drm,
    g12: g12Amount,
    total: finalRemittance,
  };

  return {
    ...record,
    gujaratiIncomes: updatedGujaratiIncomes,
    gujaratiDeductions: updatedGujaratiDeductions,
    gujaratiOtherIncomes: updatedGujaratiOtherIncomes,
    drmSlip: updatedDrmSlip,
    g12Amount: g12Amount,
    g12Number: g12Number,
    ruralIncome: finalRemittance,
  };
}
