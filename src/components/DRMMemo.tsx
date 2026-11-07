import React from 'react';
import { DCCRecord } from '../types';
import { formatIndianInteger, numberToIndianCurrencyWords } from '../utils/numberToWords';

interface DRMMemoProps {
  record: DCCRecord;
  onChange: (updated: DCCRecord) => void;
  isPrintMode?: boolean;
}

export const DRMMemo: React.FC<DRMMemoProps> = ({
  record,
  onChange,
  isPrintMode = false,
}) => {
  const totalAmount = (record.ruralIncome || 0) + (record.urbanIncome || 0);
  const words = numberToIndianCurrencyWords(totalAmount);

  const handleRuralChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({ ...record, ruralIncome: clean });
  };

  const handleUrbanChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({ ...record, urbanIncome: clean });
  };

  const handleDateChange = (val: string) => {
    onChange({ ...record, date: val });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-300 print-card overflow-hidden max-w-4xl mx-auto my-4 text-black font-sans">
      {/* Container with official memo styling */}
      <div className="p-6 sm:p-10 space-y-6">
        {/* Header with dual emblems matching Photo 2 */}
        <div className="relative text-center pb-4 border-b border-black">
          <div className="flex items-center justify-between mb-2">
            {/* Left Emblem */}
            <div className="w-16 h-16 rounded-full border-2 border-black flex flex-col items-center justify-center p-1 text-[9px] font-bold">
              <span>GSRTC</span>
              <span>એસ.ટી.</span>
            </div>

            {/* Title */}
            <div className="flex-1 px-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase">
                DAILY REVENUE MEMO
              </h2>
            </div>

            {/* Right Emblem */}
            <div className="w-16 h-16 rounded-full border-2 border-black flex flex-col items-center justify-center p-1 text-[9px] font-bold">
              <span>GSRTC</span>
              <span>એસ.ટી.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 text-xs font-bold pt-2 uppercase">
            <div className="text-left space-y-0.5">
              <p>STATE TRANSPORT GUJARAT</p>
              <p className="font-extrabold">{record.division}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p>{record.depotCode}</p>
            </div>
          </div>
        </div>

        {/* Depot & Date Bar */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="uppercase">{record.depotCityNum}</span>
            <span className="w-32 border-b border-black inline-block"></span>
          </div>

          <div className="flex items-center gap-2">
            <span>DATE-</span>
            {isPrintMode ? (
              <span className="font-mono underline">{record.date}</span>
            ) : (
              <input
                type="text"
                value={record.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="font-mono font-bold border-b border-black w-28 text-center bg-transparent focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Addressed To Section */}
        <div className="text-xs sm:text-sm font-bold space-y-1.5 uppercase">
          <p className="text-right tracking-wide">{record.auditorTitle}</p>
          <p className="leading-relaxed">
            THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO {record.bankName} ON{' '}
            <span className="font-mono underline">{record.date}</span> NET CASH RECEIPTS ON
            PASSENGER BUS SERVICE, VIDE COL.
          </p>
        </div>

        {/* Income Table matching Photo 2 */}
        <div className="border-2 border-black">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <tbody>
              {/* Rural Income Row */}
              <tr className="border-b-2 border-black">
                <td className="w-2/3 border-r-2 border-black p-3 font-bold uppercase text-slate-900">
                  RURAL INCOME
                </td>
                <td className="w-1/3 p-3 text-right font-mono font-bold text-base sm:text-lg tabular-nums">
                  {isPrintMode ? (
                    `${formatIndianInteger(record.ruralIncome)}/-`
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={record.ruralIncome}
                        onChange={(e) => handleRuralChange(parseFloat(e.target.value))}
                        className="w-40 text-right font-mono font-bold bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1"
                      />
                      <span>/-</span>
                    </div>
                  )}
                </td>
              </tr>

              {/* Optional Urban Income Row */}
              {record.urbanIncome > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 font-bold uppercase text-slate-900">
                    URBAN / LOCAL INCOME
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-base tabular-nums">
                    {formatIndianInteger(record.urbanIncome)}/-
                  </td>
                </tr>
              )}

              {/* Optional G-12 Remittance Row */}
              {Number(record.g12Amount) > 0 && (
                <tr className="border-b border-black bg-blue-50/30">
                  <td className="border-r-2 border-black p-3 font-bold uppercase text-slate-900">
                    G-12 REMITTANCE {record.g12Number ? `(VIDE NO. ${record.g12Number})` : ''}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-base tabular-nums text-blue-900">
                    {formatIndianInteger(record.g12Amount)}/-
                  </td>
                </tr>
              )}

              {/* Empty placeholder rows matching printed ledger format */}
              <tr className="border-b border-slate-400 h-9">
                <td className="border-r-2 border-black"></td>
                <td></td>
              </tr>
              <tr className="border-b border-slate-400 h-9">
                <td className="border-r-2 border-black"></td>
                <td></td>
              </tr>
              <tr className="border-b border-slate-400 h-9">
                <td className="border-r-2 border-black"></td>
                <td></td>
              </tr>

              {/* TOTAL ROW */}
              <tr className="bg-slate-100 font-extrabold text-sm sm:text-base border-t-2 border-black">
                <td className="border-r-2 border-black p-3 font-black text-center tracking-widest">
                  TOTAL
                </td>
                <td className="p-3 text-right font-mono font-black text-lg sm:text-xl text-red-700 tabular-nums">
                  {formatIndianInteger(totalAmount)}/-
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="p-3 bg-slate-50 border border-black rounded-lg">
          <p className="text-xs sm:text-sm font-extrabold tracking-wide uppercase leading-normal">
            {words}
          </p>
        </div>

        {/* Additional verification grid matching Photo 2 */}
        <div className="border border-black">
          <div className="grid grid-cols-3 divide-x divide-black border-b border-black text-center font-bold text-[11px] py-1 bg-slate-100">
            <div>CASHIER</div>
            <div>TRAFFIC CONTROLLER</div>
            <div>DEPOT MANAGER</div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-black h-16">
            <div className="flex items-end justify-center pb-2 text-xs font-serif italic text-blue-900">
              {record.cashierName}
            </div>
            <div className="flex items-end justify-center pb-2 text-xs font-serif italic text-blue-900">
              {record.trafficSupervisorName}
            </div>
            <div className="flex items-end justify-center pb-2 text-xs font-serif italic text-blue-900">
              {record.seniorDepotManagerName}
            </div>
          </div>
        </div>

        {/* Signatures & Stamps */}
        <div className="pt-8 flex items-center justify-between text-xs font-bold font-gujarati">
          <div className="text-center">
            <p className="text-blue-900 italic font-serif text-sm">એસ.ટી. કેશીયર</p>
            <p className="border-t border-black pt-1 mt-6">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>

          <div className="text-center">
            <p className="text-blue-900 italic font-serif text-sm">સિનિ. ડેપો મેનેજર 'એ'</p>
            <p className="border-t border-black pt-1 mt-6">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>
    </div>
  );
};
