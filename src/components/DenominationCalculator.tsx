import React, { useState, useEffect, useCallback } from 'react';
import { DCCRecord, CashDenominationState } from '../types';
import { formatIndianInteger } from '../utils/numberToWords';
import { calculateEnglishTotals } from '../utils/defaultData';
import { CheckCircle2, AlertTriangle, Calculator, RotateCcw, Sparkles } from 'lucide-react';

interface DenominationCalculatorProps {
  record: DCCRecord;
}

const DENOMINATIONS = [500, 200, 100, 50, 20, 10, 5, 2, 1];

export function computeOptimalDenominations(targetAmount: number): CashDenominationState {
  const safeAmount = Math.max(0, Math.round(Number(targetAmount) || 0));
  let remaining = safeAmount;
  const newCounts: Record<number, number> = {};

  for (const note of DENOMINATIONS) {
    const count = Math.floor(remaining / note);
    newCounts[note] = count;
    remaining -= count * note;
  }

  return {
    counts: newCounts,
    coins: remaining,
  };
}

export const DenominationCalculator: React.FC<DenominationCalculatorProps> = ({ record }) => {
  const totals = calculateEnglishTotals(record);
  const posTargetCash = Math.max(0, Math.round(totals.totalCashDeposited || 0));
  const drmTargetCash = Math.max(0, Math.round(Number(record.drmSlip?.total) || posTargetCash));
  const hasDrmDifference = drmTargetCash !== posTargetCash;

  const [targetMode, setTargetMode] = useState<'drm' | 'pos'>('drm');
  const targetCash = targetMode === 'drm' ? drmTargetCash : posTargetCash;

  const [isAutoCount, setIsAutoCount] = useState<boolean>(true);
  const [denominations, setDenominations] = useState<CashDenominationState>(() =>
    computeOptimalDenominations(targetCash)
  );

  // Automatically re-count denominations whenever the report's cash amount changes
  useEffect(() => {
    if (isAutoCount) {
      setDenominations(computeOptimalDenominations(targetCash));
    }
  }, [targetCash, isAutoCount]);

  const handleCountChange = (note: number, value: string) => {
    setIsAutoCount(false);
    const count = parseInt(value, 10);
    setDenominations((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [note]: isNaN(count) || count < 0 ? 0 : count,
      },
    }));
  };

  const handleCoinsChange = (value: string) => {
    setIsAutoCount(false);
    const coins = parseFloat(value);
    setDenominations((prev) => ({
      ...prev,
      coins: isNaN(coins) || coins < 0 ? 0 : coins,
    }));
  };

  const resetCounts = () => {
    setIsAutoCount(false);
    setDenominations({
      counts: {
        500: 0,
        200: 0,
        100: 0,
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        2: 0,
        1: 0,
      },
      coins: 0,
    });
  };

  const enableAutoCount = useCallback(() => {
    setIsAutoCount(true);
    setDenominations(computeOptimalDenominations(targetCash));
  }, [targetCash]);

  // Calculate total physical cash
  const notesTotal = DENOMINATIONS.reduce(
    (sum, note) => sum + note * (denominations.counts[note] || 0),
    0
  );
  const totalPhysicalCash = notesTotal + (denominations.coins || 0);
  const difference = totalPhysicalCash - targetCash;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-300 print-card max-w-3xl mx-auto my-4 overflow-hidden font-gujarati">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/90 flex items-center justify-center text-amber-300">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold">કેશિયર નોટ ગણતરી પત્રક (Auto-Count Tally)</h2>
            <p className="text-xs text-slate-300">
              {isAutoCount
                ? 'ઓટો-કાઉન્ટ ચાલુ છે: DCC/DRM રકમ મુજબ નોટ આપોઆપ ગણાશે'
                : 'મેન્યુઅલ મોડ: તમે જાતે નોટ સંખ્યા લખી શકો છો'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={enableAutoCount}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow transition cursor-pointer flex items-center gap-1.5 ${
              isAutoCount
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-purple-600 hover:bg-purple-500 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAutoCount ? 'ઓટો-કાઉન્ટ (Active)' : 'ઓટો-કાઉન્ટ ચાલુ કરો'}</span>
          </button>
          <button
            type="button"
            onClick={resetCounts}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer"
            title="નોટ સંખ્યા 0 કરો"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Target Mode Switcher when DRM Total differs from POS */}
      {hasDrmDifference && (
        <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
          <span className="font-bold text-indigo-950">કઈ રકમ મુજબ નોટ ઓટો-કાઉન્ટ કરવી?</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTargetMode('drm');
                setIsAutoCount(true);
              }}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition ${
                targetMode === 'drm'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-white text-indigo-800 border border-indigo-300'
              }`}
            >
              DRM કુલ બેંક જમા (₹{formatIndianInteger(drmTargetCash)})
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetMode('pos');
                setIsAutoCount(true);
              }}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition ${
                targetMode === 'pos'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-white text-indigo-800 border border-indigo-300'
              }`}
            >
              માત્ર P.O.S રોકડ (₹{formatIndianInteger(posTargetCash)})
            </button>
          </div>
        </div>
      )}

      {/* Target Comparison Bar */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">
            {targetMode === 'drm' && hasDrmDifference ? 'DRM કુલ બેંક જમા રકમ' : 'DCC મુજબ જમા રકમ'}
          </span>
          <span className="font-mono font-extrabold text-base sm:text-lg text-slate-800 tabular-nums">
            ₹ {formatIndianInteger(targetCash)}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">હાજર રોકડ ગણતરી</span>
          <span className="font-mono font-extrabold text-base sm:text-lg text-blue-700 tabular-nums">
            ₹ {formatIndianInteger(totalPhysicalCash)}
          </span>
        </div>

        <div
          className={`p-3 rounded-lg border shadow-xs flex flex-col justify-center items-center ${
            difference === 0
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          <span className="text-xs font-bold block">
            {difference === 0 ? 'તાળો મળે છે (100% Match)' : 'તફાવત (Difference)'}
          </span>
          <span className="font-mono font-extrabold text-base sm:text-lg tabular-nums flex items-center gap-1">
            {difference === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ₹ 0
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {difference > 0 ? `+ ₹${formatIndianInteger(difference)}` : `- ₹${formatIndianInteger(Math.abs(difference))}`}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Denomination Table */}
      <div className="p-4 sm:p-6 overflow-x-auto">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-100 font-bold text-slate-700">
              <th className="py-2 px-3 text-left">ચલણી નોટ (Rupees)</th>
              <th className="py-2 px-3 text-center">ગુણ્યા (×)</th>
              <th className="py-2 px-3 text-center w-32">નોટ સંખ્યા (Count)</th>
              <th className="py-2 px-3 text-right">કુલ રકમ (Amount)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-mono">
            {DENOMINATIONS.map((note) => {
              const count = denominations.counts[note] || 0;
              const subtotal = note * count;
              return (
                <tr key={note} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-bold text-slate-800">
                    ₹ {note}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-400">×</td>
                  <td className="py-1 px-3 text-center">
                    <input
                      type="number"
                      min="0"
                      value={count === 0 ? '' : count}
                      placeholder="0"
                      onChange={(e) => handleCountChange(note, e.target.value)}
                      className="w-24 text-center font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-500 rounded px-2 py-1 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3 text-right font-extrabold text-slate-900 tabular-nums">
                    ₹ {formatIndianInteger(subtotal)}
                  </td>
                </tr>
              );
            })}

            {/* Coins Row */}
            <tr className="hover:bg-slate-50 bg-amber-50/30">
              <td className="py-2 px-3 font-bold text-slate-800">
                સિક્કા / પરચુરણ (Coins)
              </td>
              <td className="py-2 px-3 text-center text-slate-400">-</td>
              <td className="py-1 px-3 text-center">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={denominations.coins === 0 ? '' : denominations.coins}
                  placeholder="0"
                  onChange={(e) => handleCoinsChange(e.target.value)}
                  className="w-24 text-center font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:border-purple-500 rounded px-2 py-1 focus:outline-none"
                />
              </td>
              <td className="py-2 px-3 text-right font-extrabold text-slate-900 tabular-nums">
                ₹ {formatIndianInteger(denominations.coins || 0)}
              </td>
            </tr>

            {/* Total Row */}
            <tr className="border-t-2 border-slate-800 bg-slate-100 font-extrabold text-sm sm:text-base">
              <td colSpan={3} className="py-3 px-3 font-bold text-slate-900 font-gujarati">
                કુલ ગણતરી થયેલ રોકડ (Grand Total)
              </td>
              <td className="py-3 px-3 text-right text-purple-900 font-black tabular-nums">
                ₹ {formatIndianInteger(totalPhysicalCash)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Official Signatures for Cash Tally Print */}
      <div className="p-4 pt-8 print:pt-4 grid grid-cols-2 text-center text-xs font-bold font-gujarati border-t border-black bg-white">
        <div>
          <div className="h-8 flex items-end justify-center pb-1">
            <span className="text-blue-900 italic font-serif">કેશીયર</span>
          </div>
          <p className="border-t border-dashed border-black pt-1 w-44 mx-auto">કેશીયર ની સહી</p>
        </div>
        <div>
          <div className="h-8 flex items-end justify-center pb-1">
            <span className="text-blue-900 italic font-serif">ટ્રાફિક સુપરવાઈઝર</span>
          </div>
          <p className="border-t border-dashed border-black pt-1 w-44 mx-auto">સુપરવાઈઝર ની સહી</p>
        </div>
      </div>
    </div>
  );
};
