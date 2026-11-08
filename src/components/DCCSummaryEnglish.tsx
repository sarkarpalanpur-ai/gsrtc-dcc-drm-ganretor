import React from 'react';
import { DCCRecord } from '../types';
import { calculateEnglishTotals } from '../utils/defaultData';
import { formatIndianNumber } from '../utils/numberToWords';

interface DCCSummaryEnglishProps {
  record: DCCRecord;
  onChange: (updated: DCCRecord) => void;
  isPrintMode?: boolean;
}

export const DCCSummaryEnglish: React.FC<DCCSummaryEnglishProps> = ({
  record,
  onChange,
  isPrintMode = false,
}) => {
  const totals = calculateEnglishTotals(record);

  const handleRevenueChange = (index: number, newAmount: number) => {
    const updated = [...record.revenueItems];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, revenueItems: updated });
  };

  const handleDeductionChange = (index: number, newAmount: number) => {
    const updated = [...record.deductionItems];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, deductionItems: updated });
  };

  const handleAdvanceBookingChange = (newAmount: number) => {
    onChange({ ...record, advanceBookingAmount: isNaN(newAmount) ? 0 : newAmount });
  };

  const handleStateAmountChange = (index: number, newAmount: number) => {
    const updated = [...record.stateWiseIncomes];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, stateWiseIncomes: updated });
  };

  const handleGSTChange = (field: keyof DCCRecord['gstDetails'], newAmount: number) => {
    onChange({
      ...record,
      gstDetails: {
        ...record.gstDetails,
        [field]: isNaN(newAmount) ? 0 : newAmount,
      },
    });
  };

  const handleSpecialAdjustmentChange = (
    field: 'ccRefund' | 'ccAmount' | 'diwaliExtra' | 'diwaliRefund' | 'g12Amount',
    newAmount: number
  ) => {
    const clean = isNaN(newAmount) ? 0 : newAmount;
    onChange({
      ...record,
      [field]: clean,
    });
  };

  const handleG12NumberChange = (val: string) => {
    onChange({
      ...record,
      g12Number: val,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-300 print-card overflow-hidden max-w-5xl mx-auto my-4 text-black font-sans">
      {/* Official Corporation Header matching Photo 3 */}
      <div className="border-b-2 border-black p-3 text-center bg-white">
        <div className="flex items-center justify-center gap-3">
          <img
            src="/assets/aistudio/images_09942867.jpeg"
            alt="GSRTC Logo"
            className="w-12 h-12 object-contain rounded-full border border-black p-0.5 bg-white shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
            }}
          />
          <h2 className="text-base sm:text-lg font-bold tracking-wide uppercase text-black">
            Gujarat State Road Transport Corporation
          </h2>
        </div>
        <div className="grid grid-cols-2 text-xs font-bold uppercase mt-1 border-t border-black pt-1">
          <div className="text-center">{record.division}</div>
          <div className="text-center">{record.depot}</div>
        </div>
      </div>

      {/* Document Subheader */}
      <div className="border-b-2 border-black bg-slate-100 py-1.5 px-3 text-center">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-black">
          DAILY CASH COLLECTION SUMMARY
        </h3>
      </div>

      {/* Collection Date & Generation Time Bar */}
      <div className="border-b-2 border-black grid grid-cols-1 sm:grid-cols-2 text-xs font-bold px-3 py-1 bg-white">
        <div>Collection For the Date : {record.date}</div>
        <div className="sm:text-right">Report Generated Time : {record.reportGeneratedTime}</div>
      </div>

      {/* Two Column Layout: REVENUE and DEDUCTIONS */}
      <div className="border-b-2 border-black">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-black bg-slate-200">
              <th className="border-r-2 border-black px-2 py-1.5 text-left font-bold uppercase w-1/2">
                REVENUE
              </th>
              <th className="px-2 py-1.5 text-left font-bold uppercase w-1/2">
                DEDUCTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(record.revenueItems.length, record.deductionItems.length) }).map(
              (_, idx) => {
                const rev = record.revenueItems[idx];
                const ded = record.deductionItems[idx];
                return (
                  <tr key={idx} className="border-b border-black hover:bg-amber-50/40">
                    {/* Revenue Column */}
                    <td className="border-r-2 border-black p-0 align-top">
                      {rev ? (
                        <div className="flex items-center justify-between px-2 py-1 gap-2">
                          <span className="font-medium text-slate-800">
                            {idx + 1}. {rev.titleEn}
                          </span>
                          {isPrintMode ? (
                            <span className="font-mono font-bold tabular-nums">
                              {formatIndianNumber(rev.amount)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              step="any"
                              value={rev.amount === 0 ? '0' : rev.amount}
                              onChange={(e) => handleRevenueChange(idx, parseFloat(e.target.value))}
                              className="w-28 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 focus:outline-none px-1 rounded border border-transparent focus:border-amber-400 tabular-nums"
                            />
                          )}
                        </div>
                      ) : null}
                    </td>

                    {/* Deduction Column */}
                    <td className="p-0 align-top">
                      {ded ? (
                        <div className="flex items-center justify-between px-2 py-1 gap-2">
                          <span className="font-medium text-slate-800">
                            {idx + 1}. {ded.titleEn}
                          </span>
                          {isPrintMode ? (
                            <span className="font-mono font-bold tabular-nums">
                              {formatIndianNumber(ded.amount)}
                            </span>
                          ) : (
                            <input
                              type="number"
                              step="any"
                              value={ded.amount === 0 ? '0' : ded.amount}
                              onChange={(e) => handleDeductionChange(idx, parseFloat(e.target.value))}
                              className="w-28 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 focus:outline-none px-1 rounded border border-transparent focus:border-amber-400 tabular-nums"
                            />
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Box (Total Revenue, Total Deduction, Total Cash Deposited, Advance Booking) */}
      <div className="border-b-2 border-black grid grid-cols-2 text-xs">
        <div className="border-r-2 border-black">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-black font-bold bg-slate-100">
            <span>Total Revenue</span>
            <span className="font-mono font-extrabold text-sm tabular-nums">
              {formatIndianNumber(totals.totalRevenue)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-black font-bold">
            <span>Total Deduction</span>
            <span className="font-mono font-bold tabular-nums">
              {formatIndianNumber(totals.totalDeductions)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 font-bold bg-amber-50">
            <span className="font-extrabold text-black">Total Cash To Be Deposited</span>
            <span className="font-mono font-extrabold text-base text-red-700 tabular-nums">
              {formatIndianNumber(totals.totalCashDeposited)}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-black font-bold bg-slate-100">
            <span>Total Deduction</span>
            <span className="font-mono font-bold tabular-nums">
              {formatIndianNumber(totals.totalDeductions)}
            </span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 font-bold bg-slate-50">
            <span>Advance Booking Amount</span>
            {isPrintMode ? (
              <span className="font-mono font-bold tabular-nums">
                {formatIndianNumber(record.advanceBookingAmount)}
              </span>
            ) : (
              <input
                type="number"
                step="any"
                value={record.advanceBookingAmount}
                onChange={(e) => handleAdvanceBookingChange(parseFloat(e.target.value))}
                className="w-28 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 focus:outline-none px-1 rounded border border-transparent focus:border-amber-400 tabular-nums"
              />
            )}
          </div>
        </div>
      </div>

      {/* Special Adjustments: CC REFUND, CC AMOUNT, DIWALI EXTRA, DIWALI REFUND */}
      <div className="border-b-2 border-black bg-slate-50 p-3 sm:p-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span className="font-bold text-xs uppercase tracking-wide text-slate-900">
              વિશેષ એડજસ્ટમેન્ટ (Special Adjustments: CC &amp; Diwali)
            </span>
          </div>
          <span className="text-[11px] text-slate-600 font-gujarati">
            (આ રકમ સીધી DCC ગુજરાતી અને DRM માં ઉમેરાશે / બાદ થશે)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* 1. CC REFUND */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-2 hover:border-red-500 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
              <span>CC REFUND</span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded font-normal">કપાત (-)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-gujarati mb-1">સી.સી. રીફંડ</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums">
                {formatIndianNumber(record.ccRefund || 0)}
              </p>
            ) : (
              <input
                type="number"
                step="any"
                value={record.ccRefund === 0 ? '' : record.ccRefund}
                placeholder="0"
                onChange={(e) => handleSpecialAdjustmentChange('ccRefund', parseFloat(e.target.value))}
                className="w-full text-right font-mono font-extrabold text-xs bg-slate-50 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-slate-200 focus:border-red-500 tabular-nums"
              />
            )}
          </div>

          {/* 2. CC AMOUNT */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-2 hover:border-emerald-500 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
              <span>CC AMOUNT</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-normal">આવક (+)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-gujarati mb-1">સી.સી. રકમ / ડિપોઝીટ</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums">
                {formatIndianNumber(record.ccAmount || 0)}
              </p>
            ) : (
              <input
                type="number"
                step="any"
                value={record.ccAmount === 0 ? '' : record.ccAmount}
                placeholder="0"
                onChange={(e) => handleSpecialAdjustmentChange('ccAmount', parseFloat(e.target.value))}
                className="w-full text-right font-mono font-extrabold text-xs bg-slate-50 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-slate-200 focus:border-emerald-500 tabular-nums"
              />
            )}
          </div>

          {/* 3. DIWALI EXTRA */}
          <div className="bg-white border-2 border-amber-300 rounded-lg p-2 hover:border-amber-500 transition bg-amber-50/20">
            <div className="flex justify-between items-center text-[11px] font-bold text-amber-900">
              <span>DIWALI EXTRA</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-normal">આવક (+)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-gujarati mb-1">દીવાલી એક્સ્ટ્રા</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums text-amber-900">
                {formatIndianNumber(record.diwaliExtra || 0)}
              </p>
            ) : (
              <input
                type="number"
                step="any"
                value={record.diwaliExtra === 0 ? '' : record.diwaliExtra}
                placeholder="0"
                onChange={(e) => handleSpecialAdjustmentChange('diwaliExtra', parseFloat(e.target.value))}
                className="w-full text-right font-mono font-extrabold text-xs bg-amber-50/50 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-amber-300 focus:border-amber-500 tabular-nums"
              />
            )}
          </div>

          {/* 4. DIWALI REFUND */}
          <div className="bg-white border-2 border-slate-300 rounded-lg p-2 hover:border-rose-500 transition">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
              <span>DIWALI REFUND</span>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-1 rounded font-normal">કપાત (-)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-gujarati mb-1">દીવાલી / એડવાન્સ રીફંડ</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums">
                {formatIndianNumber(record.diwaliRefund || 0)}
              </p>
            ) : (
              <input
                type="number"
                step="any"
                value={record.diwaliRefund === 0 ? '' : record.diwaliRefund}
                placeholder="0"
                onChange={(e) => handleSpecialAdjustmentChange('diwaliRefund', parseFloat(e.target.value))}
                className="w-full text-right font-mono font-extrabold text-xs bg-slate-50 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-slate-200 focus:border-rose-500 tabular-nums"
              />
            )}
          </div>

          {/* 5. G-12 AMOUNT (અન્ય આવક ૧૪૦) */}
          <div className="bg-white border-2 border-blue-400 rounded-lg p-2 hover:border-blue-600 transition bg-blue-50/30">
            <div className="flex justify-between items-center text-[11px] font-bold text-blue-900">
              <span>G-12 AMOUNT</span>
              <span className="text-[10px] text-blue-700 bg-blue-100 px-1 rounded font-normal">હેડ ૧૪૦ (+)</span>
            </div>
            <p className="text-[10px] text-blue-800 font-gujarati mb-1">G-12 ની રકમ (અન્ય આવક)</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums text-blue-900">
                {formatIndianNumber(record.g12Amount || 0)}
              </p>
            ) : (
              <input
                type="number"
                step="any"
                value={record.g12Amount === 0 ? '' : record.g12Amount}
                placeholder="0"
                onChange={(e) => handleSpecialAdjustmentChange('g12Amount', parseFloat(e.target.value))}
                className="w-full text-right font-mono font-extrabold text-xs bg-blue-50/50 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-blue-300 focus:border-blue-600 tabular-nums"
              />
            )}
          </div>

          {/* 6. G-12 NUMBER (G-12 નંબર) */}
          <div className="bg-white border-2 border-indigo-300 rounded-lg p-2 hover:border-indigo-500 transition bg-indigo-50/20">
            <div className="flex justify-between items-center text-[11px] font-bold text-indigo-900">
              <span>G-12 NUMBER</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100 px-1 rounded font-normal">નંબર</span>
            </div>
            <p className="text-[10px] text-indigo-800 font-gujarati mb-1">G-12 મેમો / ચલણ નં.</p>
            {isPrintMode ? (
              <p className="text-right font-mono font-bold text-xs tabular-nums text-indigo-900">
                {record.g12Number || '-'}
              </p>
            ) : (
              <input
                type="text"
                value={record.g12Number || ''}
                placeholder="દા.ત. 1045"
                onChange={(e) => handleG12NumberChange(e.target.value)}
                className="w-full text-right font-mono font-bold text-xs bg-indigo-50/40 focus:bg-amber-100 rounded px-1.5 py-1 focus:outline-none border border-indigo-300 focus:border-indigo-500"
              />
            )}
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="text-[11px] text-slate-600 font-sans flex items-center gap-1.5 flex-wrap">
            <span>ગણતરી:</span>
            <span className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">
              POS ₹{formatIndianNumber(totals.totalCashDeposited)}
            </span>
            <span>+</span>
            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
              CC ₹{formatIndianNumber(record.ccAmount || 0)}
            </span>
            <span>+</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
              દીવાલી ₹{formatIndianNumber(record.diwaliExtra || 0)}
            </span>
            <span>+</span>
            <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
              G-12 ₹{formatIndianNumber(record.g12Amount || 0)}
            </span>
            <span>-</span>
            <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono">
              રીફંડ ₹{formatIndianNumber((record.ccRefund || 0) + (record.diwaliRefund || 0))}
            </span>
          </div>
          <div className="text-right font-bold text-slate-900">
            <span className="text-slate-500 font-sans mr-1">DRM ફાઇનલ બેંક જમા:</span>
            <span className="text-red-700 font-extrabold text-sm">
              ₹ {formatIndianNumber(record.ruralIncome || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* State Wise Income Summary and GST Details */}
      <div className="border-b-2 border-black grid grid-cols-1 sm:grid-cols-2 text-xs">
        {/* State Wise Income Table */}
        <div className="border-r-2 border-black">
          <div className="bg-slate-200 font-bold px-3 py-1 border-b border-black text-center uppercase">
            STATE WISE INCOME SUMMARY
          </div>
          <div className="grid grid-cols-2 font-bold border-b border-black px-3 py-1 bg-slate-50">
            <span>STATE NAME</span>
            <span className="text-right">STATE AMOUNT</span>
          </div>
          <div>
            {record.stateWiseIncomes.map((stateItem, idx) => (
              <div
                key={stateItem.state}
                className="grid grid-cols-2 px-3 py-1 border-b border-slate-300 last:border-b-0 items-center hover:bg-slate-50"
              >
                <span className="font-medium text-slate-800">{stateItem.state}</span>
                {isPrintMode ? (
                  <span className="text-right font-mono font-bold tabular-nums">
                    {formatIndianNumber(stateItem.amount)}
                  </span>
                ) : (
                  <input
                    type="number"
                    step="any"
                    value={stateItem.amount === 0 ? '0' : stateItem.amount}
                    onChange={(e) => handleStateAmountChange(idx, parseFloat(e.target.value))}
                    className="text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 focus:outline-none px-1 rounded border border-transparent focus:border-amber-400 tabular-nums"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* GST Details Table */}
        <div>
          <div className="bg-slate-200 font-bold px-3 py-1 border-b border-black text-center uppercase">
            GST Details
          </div>
          <div className="divide-y divide-slate-300">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>1) Collected Cash GST Amt</span>
              {isPrintMode ? (
                <span className="font-mono font-bold">{formatIndianNumber(record.gstDetails.collectedCash)}</span>
              ) : (
                <input
                  type="number"
                  step="any"
                  value={record.gstDetails.collectedCash}
                  onChange={(e) => handleGSTChange('collectedCash', parseFloat(e.target.value))}
                  className="w-24 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1"
                />
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>2) Uncollected Cash GST Amt</span>
              {isPrintMode ? (
                <span className="font-mono font-bold">{formatIndianNumber(record.gstDetails.uncollectedCash)}</span>
              ) : (
                <input
                  type="number"
                  step="any"
                  value={record.gstDetails.uncollectedCash}
                  onChange={(e) => handleGSTChange('uncollectedCash', parseFloat(e.target.value))}
                  className="w-24 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1"
                />
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>3) Collected Digital GST Amt</span>
              {isPrintMode ? (
                <span className="font-mono font-bold">{formatIndianNumber(record.gstDetails.collectedDigital)}</span>
              ) : (
                <input
                  type="number"
                  step="any"
                  value={record.gstDetails.collectedDigital}
                  onChange={(e) => handleGSTChange('collectedDigital', parseFloat(e.target.value))}
                  className="w-24 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1"
                />
              )}
            </div>
            <div className="flex items-center justify-between px-3 py-1.5">
              <span>4) Uncollected Digital GST Amt</span>
              {isPrintMode ? (
                <span className="font-mono font-bold">{formatIndianNumber(record.gstDetails.uncollectedDigital)}</span>
              ) : (
                <input
                  type="number"
                  step="any"
                  value={record.gstDetails.uncollectedDigital}
                  onChange={(e) => handleGSTChange('uncollectedDigital', parseFloat(e.target.value))}
                  className="w-24 text-right font-mono font-bold bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Signatures Bar matching Photo 3 */}
      <div className="p-4 pt-8 grid grid-cols-2 gap-4 text-center text-xs font-bold font-gujarati border-b border-black">
        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center">
            <span className="text-blue-900 italic font-serif text-sm tracking-widest font-normal">
              ટ્રાફિક સુપરવાઈઝર
            </span>
          </div>
          <div className="border-t border-dashed border-black pt-1">
            <p>ટ્રાફિક સુપરવાઈઝર</p>
            <p className="text-[11px] text-slate-700">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center">
            <span className="text-blue-900 italic font-serif text-sm tracking-widest font-normal">
              સિનિ. ડેપો મેનેજર 'એ'
            </span>
          </div>
          <div className="border-t border-dashed border-black pt-1">
            <p>સિનિ. ડેપો મેનેજર 'એ'</p>
            <p className="text-[11px] text-slate-700">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>

      {/* Footer Copyright matching Photo 3 */}
      <div className="px-3 py-1.5 bg-slate-50 text-[10px] text-slate-500 flex justify-between items-center">
        <span>© 2023 All Rights Reserved. OMNIFICENT TECHNOLOGIES PVT. LTD.</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
};
