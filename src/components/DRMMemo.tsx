import React from 'react';
import { DCCRecord } from '../types';
import { formatIndianInteger, numberToIndianCurrencyWords } from '../utils/numberToWords';
import { GSRTC_LOGO_BASE64 } from '../utils/logoBase64';

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
  const holidayDrmAmount = Number(record.drmSlip?.drm) || 0;
  const g12Amt = Number(record.g12Amount) || 0;
  const todayCash = Number(record.ruralIncome) || 0;
  // USER RULE: junu (holiday DRM) ane navu (today's cash) banne drm plus thay + G-12
  const totalAmount = todayCash + holidayDrmAmount + (record.urbanIncome || 0) + g12Amt;
  const words = numberToIndianCurrencyWords(totalAmount);

  const handleRuralChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({ ...record, ruralIncome: clean });
  };

  const handleUrbanChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({ ...record, urbanIncome: clean });
  };

  const handleG12AmountChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({
      ...record,
      g12Amount: clean,
      drmSlip: {
        ...record.drmSlip,
        g12: clean,
        total: (record.drmSlip.pos || 0) + (record.drmSlip.drm || 0) + (record.drmSlip.diwaliExt || 0) - (record.drmSlip.ccRefund || 0) + clean + (record.drmSlip.ccDeposit || 0),
      },
    });
  };

  const handleG12NumberChange = (val: string) => {
    onChange({
      ...record,
      g12Number: val,
    });
  };

  const handleDateChange = (val: string) => {
    onChange({ ...record, date: val });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-300 print-card overflow-hidden max-w-4xl mx-auto my-4 text-black font-sans">
      {/* Container with official memo styling */}
      <div className="p-6 sm:p-10 print:p-4 space-y-5 print:space-y-3">
        {/* Header with dual emblems matching Photo 2 */}
        <div className="relative text-center pb-4 border-b border-black">
          <div className="flex items-center justify-between mb-2">
            {/* Left Emblem */}
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Left"
              className="w-16 h-16 print:w-14 print:h-14 rounded-full object-contain border border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />

            {/* Title */}
            <div className="flex-1 px-4">
              <h2 className="text-xl sm:text-2xl print:text-xl font-black tracking-wider uppercase">
                DAILY REVENUE MEMO
              </h2>
            </div>

            {/* Right Emblem */}
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Right"
              className="w-16 h-16 print:w-14 print:h-14 rounded-full object-contain border border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />
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
        <div className="text-xs sm:text-sm print:text-xs font-bold space-y-1.5 print:space-y-1 uppercase">
          <p className="text-right tracking-wide">{record.auditorTitle}</p>
          <p className="leading-relaxed">
            THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO {record.bankName} ON{' '}
            <span className="font-mono underline">{record.date}</span> NET CASH RECEIPTS ON
            PASSENGER BUS SERVICE, VIDE COL.
          </p>
        </div>

        {/* Income Table matching Photo 2 */}
        <div className="border-2 border-black flex-1">
          <table className="w-full text-xs sm:text-sm border-collapse">
            <tbody>
              {/* Rural Income Row */}
              <tr className="border-b-2 border-black">
                <td className="w-2/3 border-r-2 border-black p-3 print:py-2.5 print:px-3 font-bold uppercase text-slate-900 print:text-xs">
                  RURAL INCOME
                </td>
                <td className="w-1/3 p-3 print:py-2.5 print:px-3 text-right font-mono font-bold text-base sm:text-lg print:text-base tabular-nums">
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

              {/* Optional Previous Holiday DRM Row (જૂનું DRM / રજાનું બાકી DRM) */}
              {holidayDrmAmount > 0 && (
                <tr className="border-b-2 border-black bg-amber-50/40">
                  <td className="border-r-2 border-black p-3 print:py-2 print:px-3 font-bold uppercase text-slate-900 print:text-xs">
                    PREVIOUS HOLIDAY DRM / રજાનું બાકી DRM (CARRIED FORWARD)
                  </td>
                  <td className="p-3 print:py-2 print:px-3 text-right font-mono font-bold text-base sm:text-lg tabular-nums text-slate-900">
                    {formatIndianInteger(holidayDrmAmount)}/-
                  </td>
                </tr>
              )}

              {/* Optional Urban Income Row */}
              {record.urbanIncome > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 print:py-2 print:px-3 font-bold uppercase text-slate-900 print:text-xs">
                    URBAN / LOCAL INCOME
                  </td>
                  <td className="p-3 print:py-2 print:px-3 text-right font-mono font-bold text-base tabular-nums">
                    {formatIndianInteger(record.urbanIncome)}/-
                  </td>
                </tr>
              )}

              {/* G-12 REMITTANCE Row matching Photo 2 */}
              <tr className="border-b-2 border-black bg-blue-50/20">
                <td className="border-r-2 border-black p-3 print:py-2.5 print:px-3 font-bold uppercase text-slate-900 print:text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>G-12 REMITTANCE</span>
                    <span>(VIDE NO.</span>
                    {isPrintMode ? (
                      <span className="font-mono underline font-bold px-1">{record.g12Number || '____________'}</span>
                    ) : (
                      <input
                        type="text"
                        value={record.g12Number || ''}
                        placeholder="દા.ત. 1045"
                        onChange={(e) => handleG12NumberChange(e.target.value)}
                        className="w-28 border-b-2 border-blue-600 font-mono font-bold text-blue-900 bg-white/80 px-1 py-0.5 rounded text-xs focus:bg-amber-100 focus:outline-none"
                      />
                    )}
                    <span>)</span>
                  </div>
                </td>
                <td className="p-3 print:py-2.5 print:px-3 text-right font-mono font-bold text-base sm:text-lg print:text-base tabular-nums text-blue-950">
                  {isPrintMode ? (
                    record.g12Amount > 0 ? `${formatIndianInteger(record.g12Amount)}/-` : '          /-'
                  ) : (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        value={record.g12Amount === 0 ? '' : record.g12Amount}
                        placeholder="0"
                        onChange={(e) => handleG12AmountChange(parseFloat(e.target.value))}
                        className="w-40 text-right font-mono font-bold bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1 text-blue-900"
                      />
                      <span>/-</span>
                    </div>
                  )}
                </td>
              </tr>

              {/* Empty placeholder rows matching Photo 2 ledger format */}
              <tr className="border-b border-black h-10 print:h-8">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono text-slate-400 pr-3">/-</td>
              </tr>
              <tr className="border-b border-black h-10 print:h-8">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono text-slate-400 pr-3">/-</td>
              </tr>
              <tr className="border-b border-black h-10 print:h-8">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono text-slate-400 pr-3">/-</td>
              </tr>
              <tr className="border-b border-black h-10 print:h-8">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono text-slate-400 pr-3">/-</td>
              </tr>

              {/* TOTAL ROW */}
              <tr className="bg-slate-100 font-extrabold text-sm sm:text-base print:text-base border-t-2 border-black">
                <td className="border-r-2 border-black p-3 print:py-2.5 print:px-3 font-black text-center tracking-widest">
                  TOTAL
                </td>
                <td className="p-3 print:py-2.5 print:px-3 text-right font-mono font-black text-lg sm:text-xl print:text-lg text-red-700 tabular-nums">
                  {formatIndianInteger(totalAmount)}/-
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="p-3 print:p-2.5 bg-slate-50 border border-black rounded-lg">
          <p className="text-xs sm:text-sm print:text-xs font-extrabold tracking-wide uppercase leading-normal">
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
          <div className="grid grid-cols-3 divide-x divide-black h-16 print:h-12">
            <div className="flex items-end justify-center pb-2 print:pb-1.5 text-xs font-serif italic text-blue-900">
              {record.cashierName}
            </div>
            <div className="flex items-end justify-center pb-2 print:pb-1.5 text-xs font-serif italic text-blue-900">
              {record.trafficSupervisorName}
            </div>
            <div className="flex items-end justify-center pb-2 print:pb-1.5 text-xs font-serif italic text-blue-900">
              {record.seniorDepotManagerName}
            </div>
          </div>
        </div>

        {/* Signatures & Stamps */}
        <div className="pt-8 print:pt-5 flex items-center justify-between text-xs font-bold font-gujarati">
          <div className="text-center">
            <p className="text-blue-900 italic font-serif text-sm print:text-xs">એસ.ટી. કેશીયર</p>
            <p className="border-t border-black pt-1 print:pt-0.5 mt-6 print:mt-3">એસ.ટી. સુરત સીટી-ડેપો-૨</p>
          </div>

          <div className="text-center">
            <p className="text-blue-900 italic font-serif text-sm print:text-xs">સિનિ. ડેપો મેનેજર 'એ'</p>
            <p className="border-t border-black pt-1 print:pt-0.5 mt-6 print:mt-3">એસ.ટી. સુરત સીટી ડેપો-૨</p>
          </div>
        </div>
      </div>
    </div>
  );
};
