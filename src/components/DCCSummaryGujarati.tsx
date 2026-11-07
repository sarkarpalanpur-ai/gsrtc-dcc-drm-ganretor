import React from 'react';
import { DCCRecord } from '../types';
import { calculateGujaratiTotals, calculateDRMSlip } from '../utils/defaultData';
import { formatIndianInteger } from '../utils/numberToWords';

interface DCCSummaryGujaratiProps {
  record: DCCRecord;
  onChange: (updated: DCCRecord) => void;
  isPrintMode?: boolean;
}

export const DCCSummaryGujarati: React.FC<DCCSummaryGujaratiProps> = ({
  record,
  onChange,
  isPrintMode = false,
}) => {
  const totals = calculateGujaratiTotals(record);
  const drmSlipValues = calculateDRMSlip(record);

  const handleIncomeChange = (index: number, newAmount: number) => {
    const updated = [...record.gujaratiIncomes];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, gujaratiIncomes: updated });
  };

  const handleDeductionChange = (index: number, newAmount: number) => {
    const updated = [...record.gujaratiDeductions];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, gujaratiDeductions: updated });
  };

  const handleOtherIncomeChange = (index: number, newAmount: number) => {
    const updated = [...record.gujaratiOtherIncomes];
    updated[index] = { ...updated[index], amount: isNaN(newAmount) ? 0 : newAmount };
    onChange({ ...record, gujaratiOtherIncomes: updated });
  };

  const handleDRMSlipChange = (field: keyof DCCRecord['drmSlip'], newAmount: number) => {
    const updatedSlip = {
      ...record.drmSlip,
      [field]: isNaN(newAmount) ? 0 : newAmount,
    };
    const newTotal =
      (updatedSlip.pos || 0) +
      (updatedSlip.diwaliExt || 0) -
      (updatedSlip.ccRefund || 0) +
      (updatedSlip.drm || 0) +
      (updatedSlip.g12 || 0) +
      (updatedSlip.ccDeposit || 0);

    updatedSlip.total = newTotal;
    onChange({ ...record, drmSlip: updatedSlip, ruralIncome: newTotal });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-300 print-card overflow-hidden max-w-5xl mx-auto my-4 text-black font-gujarati">
      {/* Official Header matching Photo 1 */}
      <div className="border-b-2 border-black p-3 text-center bg-white">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-bold text-xs p-1">
            <span className="text-[10px] text-center font-bold">નિગમ<br/>GSRTC</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-wide text-black">
              ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ, સુરત વિભાગ
            </h2>
            <h3 className="text-base font-bold text-slate-800 mt-0.5">
              ડી.સી.સી. સમરી સુરત સીટી
            </h3>
          </div>
        </div>

        <div className="flex justify-end text-xs font-bold mt-1 pr-2">
          <span>તારીખ: <span className="font-mono">{record.date}</span></span>
        </div>
      </div>

      {/* Main 2-column table */}
      <div className="border-b-2 border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-black">
          {/* LEFT: આવક (Revenue / Incomes) */}
          <div>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-slate-100 font-bold">
                  <th className="w-8 border-r border-black py-1 px-1 text-center">ક્રમ</th>
                  <th className="w-16 border-r border-black py-1 px-1 text-center">એકા. હેડ નં.</th>
                  <th className="border-r border-black py-1 px-2 text-left">વિગત</th>
                  <th className="w-24 py-1 px-2 text-right">રકમ રૂ.</th>
                </tr>
              </thead>
              <tbody>
                {record.gujaratiIncomes.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-slate-300 hover:bg-amber-50/50">
                    <td className="border-r border-black py-1 px-1 text-center font-mono text-[11px] text-slate-600">
                      {idx + 1}
                    </td>
                    <td className="border-r border-black py-1 px-1 text-center font-mono font-semibold text-xs">
                      {item.headNo || '-'}
                    </td>
                    <td className="border-r border-black py-1 px-2 text-xs font-medium text-slate-900">
                      {item.titleGu}
                    </td>
                    <td className="py-0 px-1 text-right">
                      {isPrintMode ? (
                        <span className="font-mono font-bold text-xs tabular-nums">
                          {item.amount > 0 ? formatIndianInteger(item.amount) : ''}
                        </span>
                      ) : (
                        <input
                          type="number"
                          value={item.amount === 0 ? '' : item.amount}
                          onChange={(e) => handleIncomeChange(idx, parseFloat(e.target.value))}
                          placeholder="-"
                          className="w-full text-right font-mono font-bold text-xs bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1 py-0.5 focus:outline-none tabular-nums"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Gross Income: અ. કુલ આવક (અ) */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-200 border-t-2 border-black font-extrabold text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs">
                  અ
                </span>
                <span>કુલ આવક (અ)</span>
              </div>
              <span className="font-mono text-sm sm:text-base font-extrabold text-blue-950 tabular-nums">
                {formatIndianInteger(totals.totalA)}
              </span>
            </div>
          </div>

          {/* RIGHT: કપાત & અન્ય આવક & DRM સ્લિપ */}
          <div className="flex flex-col justify-between">
            <div>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-black bg-slate-100 font-bold">
                    <th className="w-8 border-r border-black py-1 px-1 text-center">ક્રમ</th>
                    <th className="w-16 border-r border-black py-1 px-1 text-center">એકા. હેડ નં.</th>
                    <th className="border-r border-black py-1 px-2 text-left">વિગત</th>
                    <th className="w-24 py-1 px-2 text-right">રકમ રૂ.</th>
                  </tr>
                </thead>
                <tbody>
                  {record.gujaratiDeductions.map((item, idx) => (
                    <tr key={item.id || idx} className="border-b border-slate-300 hover:bg-amber-50/50">
                      <td className="border-r border-black py-1 px-1 text-center font-mono text-[11px] text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="border-r border-black py-1 px-1 text-center font-mono font-semibold text-xs">
                        {item.headNo || '-'}
                      </td>
                      <td className="border-r border-black py-1 px-2 text-xs font-medium text-slate-900">
                        {item.titleGu}
                      </td>
                      <td className="py-0 px-1 text-right">
                        {isPrintMode ? (
                          <span className="font-mono font-bold text-xs tabular-nums">
                            {item.amount > 0 ? formatIndianInteger(item.amount) : '0'}
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={item.amount === 0 ? '0' : item.amount}
                            onChange={(e) => handleDeductionChange(idx, parseFloat(e.target.value))}
                            className="w-full text-right font-mono font-bold text-xs bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1 py-0.5 focus:outline-none tabular-nums"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Deductions: બ. કુલ કપાત (બ) */}
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b-2 border-t border-black font-bold text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs">
                    બ
                  </span>
                  <span>કુલ કપાત (બ)</span>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                  {formatIndianInteger(totals.totalB)}
                </span>
              </div>

              {/* અન્ય આવક (Other Income Section) */}
              <div className="border-b-2 border-black">
                <div className="bg-slate-50 font-bold px-3 py-1 border-b border-black text-xs">
                  અન્ય આવક (Other Income)
                </div>
                <table className="w-full text-xs">
                  <tbody>
                    {record.gujaratiOtherIncomes.map((item, idx) => (
                      <tr key={item.id || idx} className="border-b border-slate-200">
                        <td className="w-8 border-r border-black py-1 px-1 text-center font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="w-16 border-r border-black py-1 px-1 text-center font-mono text-xs">
                          {item.headNo || '-'}
                        </td>
                        <td className="border-r border-black py-1 px-2 text-xs text-slate-800">
                          {item.titleGu}
                        </td>
                        <td className="w-24 py-0 px-1 text-right">
                          {isPrintMode ? (
                            <span className="font-mono text-xs">{item.amount || '0'}</span>
                          ) : (
                            <input
                              type="number"
                              value={item.amount === 0 ? '0' : item.amount}
                              onChange={(e) => handleOtherIncomeChange(idx, parseFloat(e.target.value))}
                              className="w-full text-right font-mono font-bold text-xs bg-transparent hover:bg-white focus:bg-amber-100 rounded px-1 py-0.5 focus:outline-none"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-3 py-1 bg-slate-100 font-bold text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px]">
                      ક
                    </span>
                    <span>કુલ અન્ય આવક (ક)</span>
                  </div>
                  <span className="font-mono font-bold">{formatIndianInteger(totals.totalC)}</span>
                </div>
              </div>

              {/* Net Bank Remittance: બેંકમાં જમાં કરાવેલ ડી.સી.સી. તથા ડી.આર.એમ. ની આવક (અ - બ + ક) */}
              <div className="p-3 bg-amber-50 border-b-2 border-black">
                <div className="text-xs font-bold text-slate-800 mb-1">
                  બેંકમાં જમાં કરાવેલ ડી.સી.સી. તથા ડી.આર.એમ. ની આવક (અ - બ + ક)
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-lg sm:text-xl text-red-700 tabular-nums">
                    ₹ {formatIndianInteger(totals.netBankRemittance)}
                  </span>
                </div>
              </div>
            </div>

            {/* DRM Slip Breakdown Table (Exact match to Photo 1 bottom right sticker) */}
            <div className="p-3 bg-white">
              <div className="border-2 border-black rounded-lg p-2 max-w-xs ml-auto bg-slate-50 shadow-xs">
                <div className="text-center font-bold border-b border-black pb-1 mb-1 text-xs">
                  ડી.આર.એમ. સ્લિપ તાળો (DRM Slip)
                </div>
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">P.O.S</span>
                    {isPrintMode ? (
                      <span className="font-bold">{formatIndianInteger(drmSlipValues.pos)}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.pos}
                        onChange={(e) => handleDRMSlipChange('pos', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">DRM</span>
                    {isPrintMode ? (
                      <span className="font-bold">{drmSlipValues.drm}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.drm}
                        onChange={(e) => handleDRMSlipChange('drm', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">G12</span>
                    {isPrintMode ? (
                      <span className="font-bold">{drmSlipValues.g12}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.g12}
                        onChange={(e) => handleDRMSlipChange('g12', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">CC DIPODIT</span>
                    {isPrintMode ? (
                      <span className="font-bold">{drmSlipValues.ccDeposit}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.ccDeposit}
                        onChange={(e) => handleDRMSlipChange('ccDeposit', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">DIWALI EXT</span>
                    {isPrintMode ? (
                      <span className="font-bold">{formatIndianInteger(drmSlipValues.diwaliExt)}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.diwaliExt}
                        onChange={(e) => handleDRMSlipChange('diwaliExt', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-black font-sans">CC REFUND</span>
                    {isPrintMode ? (
                      <span className="font-bold">{formatIndianInteger(drmSlipValues.ccRefund)}</span>
                    ) : (
                      <input
                        type="number"
                        value={record.drmSlip.ccRefund}
                        onChange={(e) => handleDRMSlipChange('ccRefund', parseFloat(e.target.value))}
                        className="w-24 text-right font-bold bg-white border border-slate-300 rounded px-1"
                      />
                    )}
                  </div>
                  <div className="flex justify-between items-center border-t-2 border-black pt-1 text-sm font-extrabold text-red-700">
                    <span className="font-sans">TOTAL</span>
                    <span>{formatIndianInteger(drmSlipValues.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Signatures Bar matching Photo 1 */}
      <div className="p-4 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs font-bold border-t border-black bg-white">
        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center">
            <span className="text-blue-950 font-serif italic text-sm">કેશીયર</span>
          </div>
          <div className="border-t border-dashed border-black pt-1">
            <p>કેશીયર</p>
            <p className="text-[11px] text-slate-700">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center">
            <span className="text-blue-950 font-serif italic text-sm">ટ્રાફિક સુપરવાઈઝર</span>
          </div>
          <div className="border-t border-dashed border-black pt-1">
            <p>ટ્રાફિક સુપરવાઈઝર</p>
            <p className="text-[11px] text-slate-700">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-10 flex items-end justify-center">
            <span className="text-blue-950 font-serif italic text-sm">સિનિ. ડેપો મેનેજર 'એ'</span>
          </div>
          <div className="border-t border-dashed border-black pt-1">
            <p>સિનિ. ડેપો મેનેજર 'એ'</p>
            <p className="text-[11px] text-slate-700">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>
    </div>
  );
};
