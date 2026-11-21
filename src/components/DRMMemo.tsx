import React from 'react';
import { DCCRecord } from '../types';
import { formatIndianInteger, numberToIndianCurrencyWords } from '../utils/numberToWords';
import { getNextDayDateString } from '../utils/defaultData';
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
  const ccDepAmt = Number(record.drmSlip?.ccDeposit ?? record.ccAmount) || 0;
  const diwaliExtAmt = Number(record.drmSlip?.diwaliExt ?? record.diwaliExtra) || 0;
  const ccRefAmt = Number(record.drmSlip?.ccRefund) || 0;
  // USER RULE: junu (holiday DRM) ane navu (today's cash) banne drm plus thay + G-12 + adjustments
  const totalAmount = todayCash + holidayDrmAmount + (record.urbanIncome || 0) + g12Amt + ccDepAmt + diwaliExtAmt - ccRefAmt;
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
    <div className="bg-white rounded-xl shadow-lg border-2 border-black print-card overflow-hidden max-w-4xl mx-auto my-4 text-black font-sans">
      {/* Container with official memo styling */}
      <div className="p-5 pr-6 sm:p-10 sm:pr-12 print:p-5 print:pr-7 space-y-5 print:space-y-0 print:flex-1 print:flex print:flex-col print:justify-between">
        <div className="space-y-5 print:space-y-4">
        {/* Header with dual emblems matching Photo 2 */}
        <div className="relative text-center pb-4 border-b-2 border-black">
          <div className="flex items-center justify-between mb-2.5">
            {/* Left Emblem */}
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Left"
              className="w-20 h-20 print:w-16 print:h-16 rounded-full object-contain border-2 border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />

            {/* Title */}
            <div className="flex-1 px-4">
              <h2 className="text-2xl sm:text-3xl print:text-2xl font-black tracking-wider uppercase text-black">
                DAILY REVENUE MEMO
              </h2>
            </div>

            {/* Right Emblem */}
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Right"
              className="w-20 h-20 print:w-16 print:h-16 rounded-full object-contain border-2 border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />
          </div>

          <div className="grid grid-cols-2 text-sm sm:text-base print:text-sm font-extrabold pt-2 uppercase">
            <div className="text-left space-y-0.5">
              <p>STATE TRANSPORT GUJARAT</p>
              <p className="font-black">{record.division}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p>{record.depotCode}</p>
            </div>
          </div>
        </div>

        {/* Depot & Date Bar */}
        <div className="flex items-center justify-between text-sm sm:text-base print:text-[15px] font-extrabold">
          <div className="flex items-center gap-2">
            <span className="uppercase">{record.depotCityNum}</span>
            <span className="w-32 border-b-2 border-black inline-block"></span>
          </div>

          <div className="flex items-center gap-2">
            <span>DATE-</span>
            {isPrintMode ? (
              <span className="font-mono text-base sm:text-lg print:text-lg font-black underline">{record.date}</span>
            ) : (
              <input
                type="text"
                value={record.date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="font-mono text-base sm:text-lg font-black border-b-2 border-black w-32 text-center bg-transparent focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Addressed To Section */}
        <div className="text-sm sm:text-base print:text-[13.5px] font-bold space-y-2 print:space-y-1.5 uppercase">
          <p className="text-right tracking-wide">{record.auditorTitle}</p>
          <p className="leading-relaxed">
            THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO {record.bankName} ON{' '}
            <span className="font-mono text-base sm:text-lg print:text-[16px] font-black underline">{getNextDayDateString(record.date)}</span> NET CASH RECEIPTS ON
            PASSENGER BUS SERVICE, VIDE COL.
          </p>
        </div>

        {/* Income Table matching Photo 2 */}
        <div className="border-2 border-black flex-1">
          <table className="w-full table-fixed text-sm sm:text-base border-collapse">
            <tbody>
              {/* Rural Income Row */}
              <tr className="border-b-2 border-black">
                <td className="w-2/3 border-r-2 border-black p-3 sm:p-3.5 print:py-3 print:px-4 font-black uppercase text-black text-sm sm:text-[15px] print:text-[14px]">
                  RURAL INCOME
                </td>
                <td className="w-1/3 p-3 sm:p-3.5 pr-4 print:py-3 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-black">
                  {isPrintMode ? (
                    `${formatIndianInteger(record.ruralIncome)}/-`
                  ) : (
                    <div className="flex items-center justify-end gap-1 min-w-0">
                      <input
                        type="number"
                        value={record.ruralIncome}
                        onChange={(e) => handleRuralChange(parseFloat(e.target.value))}
                        className="w-28 sm:w-40 max-w-full min-w-0 text-right font-mono font-black text-[15px] sm:text-base bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1 text-black"
                      />
                      <span className="shrink-0 font-black">/-</span>
                    </div>
                  )}
                </td>
              </tr>

              {/* Optional Previous Holiday DRM Row (જૂનું DRM / રજાનું બાકી DRM) */}
              {holidayDrmAmount > 0 && (
                <tr className="border-b-2 border-black bg-amber-50/40">
                  <td className="border-r-2 border-black p-3 print:py-2.5 print:px-4 font-extrabold uppercase text-black text-sm print:text-[13.5px]">
                    PREVIOUS HOLIDAY DRM / રજાનું બાકી DRM (CARRIED FORWARD)
                  </td>
                  <td className="p-3 print:py-2.5 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-black">
                    {formatIndianInteger(holidayDrmAmount)}/-
                  </td>
                </tr>
              )}

              {/* Optional Urban Income Row */}
              {record.urbanIncome > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 print:py-2.5 print:px-4 font-extrabold uppercase text-black text-sm print:text-[13.5px]">
                    URBAN / LOCAL INCOME
                  </td>
                  <td className="p-3 print:py-2.5 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-black">
                    {formatIndianInteger(record.urbanIncome)}/-
                  </td>
                </tr>
              )}

              {/* Optional Adjustment Rows when non-zero */}
              {ccDepAmt > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 print:py-2.5 print:px-4 font-black uppercase text-black text-sm sm:text-[15px] print:text-[14px]">
                    CC DEPOSIT (+)
                  </td>
                  <td className="p-3 print:py-2.5 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-black">
                    {formatIndianInteger(ccDepAmt)}/-
                  </td>
                </tr>
              )}
              {diwaliExtAmt > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 print:py-2.5 print:px-4 font-extrabold uppercase text-black text-sm print:text-[13.5px]">
                    DIWALI EXTRA (+)
                  </td>
                  <td className="p-3 print:py-2.5 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-black">
                    {formatIndianInteger(diwaliExtAmt)}/-
                  </td>
                </tr>
              )}
              {ccRefAmt > 0 && (
                <tr className="border-b-2 border-black">
                  <td className="border-r-2 border-black p-3 print:py-2.5 print:px-4 font-black uppercase text-rose-800 text-sm sm:text-[15px] print:text-[14px]">
                    LESS: CC / DIWALI REFUND (-)
                  </td>
                  <td className="p-3 print:py-2.5 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-rose-800">
                    - {formatIndianInteger(ccRefAmt)}/-
                  </td>
                </tr>
              )}

              {/* G-12 REMITTANCE Row matching Photo 2 */}
              <tr className="border-b-2 border-black bg-blue-50/20">
                <td className="border-r-2 border-black p-3 sm:p-3.5 print:py-3 print:px-4 font-extrabold uppercase text-black text-sm print:text-[14px]">
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
                <td className="p-3 sm:p-3.5 pr-4 print:py-3 print:px-4 text-right font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-blue-950">
                  {isPrintMode ? (
                    record.g12Amount > 0 ? `${formatIndianInteger(record.g12Amount)}/-` : '          /-'
                  ) : (
                    <div className="flex items-center justify-end gap-1 min-w-0">
                      <input
                        type="number"
                        value={record.g12Amount === 0 ? '' : record.g12Amount}
                        placeholder="0"
                        onChange={(e) => handleG12AmountChange(parseFloat(e.target.value))}
                        className="w-28 sm:w-40 max-w-full min-w-0 text-right font-mono font-black text-[15px] sm:text-base bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1 text-blue-900"
                      />
                      <span className="shrink-0 font-black">/-</span>
                    </div>
                  )}
                </td>
              </tr>

              {/* Empty placeholder rows matching Photo 2 ledger format */}
              <tr className="border-b-2 border-black h-11 print:h-12">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono font-bold text-slate-600 pr-4">/-</td>
              </tr>
              <tr className="border-b-2 border-black h-11 print:h-12">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono font-bold text-slate-600 pr-4">/-</td>
              </tr>
              <tr className="border-b-2 border-black h-11 print:h-12">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono font-bold text-slate-600 pr-4">/-</td>
              </tr>
              <tr className="border-b-2 border-black h-11 print:h-12">
                <td className="border-r-2 border-black"></td>
                <td className="text-right font-mono font-bold text-slate-600 pr-4">/-</td>
              </tr>

              {/* TOTAL ROW */}
              <tr className="bg-slate-100 font-extrabold text-sm sm:text-base print:text-[15px] border-t-2 border-black">
                <td className="border-r-2 border-black p-3 sm:p-3.5 print:py-3 print:px-4 font-black text-center tracking-widest">
                  TOTAL
                </td>
                <td className="p-3 sm:p-3.5 pr-4 print:py-3 print:px-4 text-right font-mono font-black text-base sm:text-lg print:text-base text-red-700 tabular-nums">
                  {formatIndianInteger(totalAmount)}/-
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Amount in Words */}
        <div className="p-3.5 print:p-3.5 bg-slate-50 border-2 border-black rounded-lg">
          <p className="text-sm sm:text-base print:text-[13.5px] font-extrabold tracking-wide uppercase leading-normal">
            {words}
          </p>
        </div>
        </div>

        <div className="pt-2 print:pt-2">
        {/* Additional verification grid matching Photo 2 */}
        <div className="border-2 border-black">
          <div className="grid grid-cols-3 divide-x-2 divide-black border-b-2 border-black text-center font-extrabold text-xs py-1.5 bg-slate-100">
            <div>CASHIER</div>
            <div>TRAFFIC CONTROLLER</div>
            <div>DEPOT MANAGER</div>
          </div>
          <div className="grid grid-cols-3 divide-x-2 divide-black h-18 print:h-20">
            <div className="flex items-end justify-center pb-2 print:pb-2 text-sm font-serif italic text-blue-900">
              {record.cashierName}
            </div>
            <div className="flex items-end justify-center pb-2 print:pb-2 text-sm font-serif italic text-blue-900">
              {record.trafficSupervisorName}
            </div>
            <div className="flex items-end justify-center pb-2 print:pb-2 text-sm font-serif italic text-blue-900">
              {record.seniorDepotManagerName}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
