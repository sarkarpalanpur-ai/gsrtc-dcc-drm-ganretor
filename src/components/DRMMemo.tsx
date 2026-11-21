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
  const urbanAmt = Number(record.urbanIncome) || 0;

  // USER RULE: junu (holiday DRM) ane navu (today's cash) banne drm plus thay + G-12 + adjustments
  const totalAmount =
    todayCash + holidayDrmAmount + urbanAmt + g12Amt + ccDepAmt + diwaliExtAmt - ccRefAmt;
  const rawWords = numberToIndianCurrencyWords(totalAmount);
  const words = rawWords.startsWith('RS:-') ? rawWords : `RS:- ${rawWords}`;

  const handleRuralChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({ ...record, ruralIncome: clean });
  };

  const handleG12AmountChange = (val: number) => {
    const clean = isNaN(val) ? 0 : val;
    onChange({
      ...record,
      g12Amount: clean,
      drmSlip: {
        ...record.drmSlip,
        g12: clean,
        total:
          (record.drmSlip.pos || 0) +
          (record.drmSlip.drm || 0) +
          (record.drmSlip.diwaliExt || 0) -
          (record.drmSlip.ccRefund || 0) +
          clean +
          (record.drmSlip.ccDeposit || 0),
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

  // Extra non-zero rows placed inside the 3-column upper ledger section
  interface ExtraLedgerRow {
    key: string;
    label: string;
    amountText: string;
    isNegative?: boolean;
  }

  const extraUpperRows: ExtraLedgerRow[] = [];
  if (holidayDrmAmount > 0) {
    extraUpperRows.push({
      key: 'holiday-drm',
      label: 'PREVIOUS HOLIDAY DRM',
      amountText: `${formatIndianInteger(holidayDrmAmount)}/-`,
    });
  }
  if (urbanAmt > 0) {
    extraUpperRows.push({
      key: 'urban',
      label: 'URBAN / LOCAL INCOME',
      amountText: `${formatIndianInteger(urbanAmt)}/-`,
    });
  }
  if (ccDepAmt > 0) {
    extraUpperRows.push({
      key: 'cc-dep',
      label: 'CC DEPOSIT (+)',
      amountText: `${formatIndianInteger(ccDepAmt)}/-`,
    });
  }
  if (diwaliExtAmt > 0) {
    extraUpperRows.push({
      key: 'diwali-ext',
      label: 'DIWALI EXTRA (+)',
      amountText: `${formatIndianInteger(diwaliExtAmt)}/-`,
    });
  }
  if (ccRefAmt > 0) {
    extraUpperRows.push({
      key: 'cc-ref',
      label: 'LESS: CC / DIWALI REFUND (-)',
      amountText: `- ${formatIndianInteger(ccRefAmt)}/-`,
      isNegative: true,
    });
  }

  const showG12InPrint = g12Amt > 0 || Boolean(record.g12Number?.trim());
  const usedRowsCount =
    1 + extraUpperRows.length + (!isPrintMode || showG12InPrint ? 1 : 0);
  const blankThreeColCount = Math.max(0, 4 - usedRowsCount);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 print-card drm-sheet-clean overflow-hidden max-w-4xl mx-auto my-4 text-black font-sans">
      <div className="p-6 sm:p-10 print:p-5 print:pt-4 print:pb-4 flex flex-col justify-between min-h-[1040px] print:min-h-[97vh] print:h-full">
        <div>
          {/* Top Logo - DAILY REVENUE MEMO - Logo Header */}
          <div className="flex items-center justify-between gap-4 pb-2.5 mb-3 border-b-2 border-black">
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Left"
              className="w-16 h-16 print:w-14 print:h-14 rounded-full object-contain border-2 border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />
            <div className="flex-1 text-center px-2">
              <h2 className="text-xl sm:text-2xl print:text-[22px] font-black tracking-wider uppercase text-black">
                DAILY REVENUE MEMO
              </h2>
            </div>
            <img
              src={GSRTC_LOGO_BASE64}
              alt="GSRTC Logo Right"
              className="w-16 h-16 print:w-14 print:h-14 rounded-full object-contain border-2 border-black p-0.5 bg-white shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
              }}
            />
          </div>

          {/* Top Official Header matching Word Form A508 */}
          <div className="space-y-1 text-sm sm:text-base print:text-[13.5px] font-black uppercase tracking-wide">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p>STATE TRANSPORT GUJARAT</p>
                <p className="pl-6 sm:pl-10 print:pl-8">{record.division}</p>
              </div>
              <div className="text-right">{record.depotCode}</div>
            </div>

            {/* Depot + Rectangular Box + DATE- */}
            <div className="flex items-center justify-between gap-4 pt-3 print:pt-2.5">
              <div className="flex items-center gap-4 sm:gap-6">
                <span className="pl-2 sm:pl-4 print:pl-3">{record.depotCityNum}</span>
                <div className="w-36 sm:w-44 print:w-44 h-8 print:h-7 border-[1.5px] border-black bg-white"></div>
              </div>

              <div className="flex items-center gap-2 pr-2 sm:pr-8 print:pr-6">
                <span>DATE-</span>
                {isPrintMode ? (
                  <span className="font-mono text-base sm:text-lg print:text-[16px] font-black">
                    {record.date}
                  </span>
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
          </div>

          {/* Addressed To & Remittance Line */}
          <div className="mt-4 print:mt-3.5 text-xs sm:text-sm print:text-[12.5px] font-black uppercase">
            <p className="text-right pr-2 sm:pr-10 print:pr-8 mb-1.5">
              {record.auditorTitle}
            </p>
            <p className="pl-8 sm:pl-16 print:pl-14 leading-relaxed">
              THE UNDERNOTED ARE PARTICULARS OF THE REVENUE REMITTED TO {record.bankName} ON{' '}
              <span className="font-mono text-sm sm:text-base print:text-[14.5px] font-black underline">
                {getNextDayDateString(record.date)}
              </span>{' '}
              <span className="underline">NET CASH RECEIPTS ON PASSENGER BUS SERVICE.</span>{' '}
              VIDE COL.
            </p>
          </div>

          {/* Table 1: Upper Income & Total Table (matching exact 3-col + 2-col Word structure) */}
          <div className="mt-4 print:mt-3.5 w-full sm:w-[88%] print:w-[86%]">
            <table className="w-full table-fixed border-collapse border-[1.5px] border-black text-black">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[40%]" />
                <col className="w-[36%]" />
              </colgroup>
              <tbody>
                {/* Row 1: RURAL INCOME */}
                <tr className="border-b border-black h-9 print:h-8">
                  <td className="border-r border-black px-2 py-1.5"></td>
                  <td className="border-r border-black px-3 py-1.5 font-black uppercase text-sm sm:text-[15px] print:text-[14px]">
                    RURAL INCOME
                  </td>
                  <td className="px-3 py-1.5 text-center font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums">
                    {isPrintMode ? (
                      `${formatIndianInteger(record.ruralIncome)}/-`
                    ) : (
                      <div className="flex items-center justify-center gap-1 min-w-0">
                        <input
                          type="number"
                          value={record.ruralIncome}
                          onChange={(e) => handleRuralChange(parseFloat(e.target.value))}
                          className="w-28 sm:w-32 max-w-full min-w-0 text-right font-mono font-black text-[15px] sm:text-base bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1 text-black"
                        />
                        <span className="shrink-0 font-black">/-</span>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Dynamic non-zero adjustment rows */}
                {extraUpperRows.map((row) => (
                  <tr key={row.key} className="border-b border-black h-9 print:h-8">
                    <td className="border-r border-black px-2 py-1.5"></td>
                    <td
                      className={`border-r border-black px-3 py-1.5 font-black uppercase text-xs sm:text-[13.5px] print:text-[13px] ${
                        row.isNegative ? 'text-rose-800' : 'text-black'
                      }`}
                    >
                      {row.label}
                    </td>
                    <td
                      className={`px-3 py-1.5 text-center font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums ${
                        row.isNegative ? 'text-rose-800' : 'text-black'
                      }`}
                    >
                      {row.amountText}
                    </td>
                  </tr>
                ))}

                {/* G-12 REMITTANCE (Interactive on screen; shown in print only when filled) */}
                {(!isPrintMode || showG12InPrint) && (
                  <tr className="border-b border-black h-9 print:h-8">
                    <td className="border-r border-black px-2 py-1.5"></td>
                    <td className="border-r border-black px-3 py-1.5 font-extrabold uppercase text-xs sm:text-[13px] print:text-[12.5px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>G-12</span>
                        {isPrintMode ? (
                          record.g12Number ? (
                            <span className="font-mono underline font-bold">
                              ({record.g12Number})
                            </span>
                          ) : null
                        ) : (
                          <input
                            type="text"
                            value={record.g12Number || ''}
                            placeholder="No."
                            onChange={(e) => handleG12NumberChange(e.target.value)}
                            className="w-20 border-b border-blue-600 font-mono font-bold text-blue-900 bg-blue-50/40 px-1 py-0.5 rounded text-xs focus:bg-amber-100 focus:outline-none"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-1.5 text-center font-mono font-black text-[15px] sm:text-base print:text-[15px] tabular-nums text-blue-950">
                      {isPrintMode ? (
                        record.g12Amount > 0 ? `${formatIndianInteger(record.g12Amount)}/-` : ''
                      ) : (
                        <div className="flex items-center justify-center gap-1 min-w-0">
                          <input
                            type="number"
                            value={record.g12Amount === 0 ? '' : record.g12Amount}
                            placeholder="0"
                            onChange={(e) => handleG12AmountChange(parseFloat(e.target.value))}
                            className="w-24 sm:w-28 max-w-full min-w-0 text-right font-mono font-black text-[15px] sm:text-base bg-transparent hover:bg-slate-100 focus:bg-amber-100 rounded px-1 text-blue-900"
                          />
                          <span className="shrink-0 font-black">/-</span>
                        </div>
                      )}
                    </td>
                  </tr>
                )}

                {/* Pad 3-column portion to at least 4 rows */}
                {Array.from({ length: blankThreeColCount }).map((_, idx) => (
                  <tr key={`blank3-${idx}`} className="border-b border-black h-8 print:h-7">
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}

                {/* 3 merged 2-column blank ledger rows matching Word Form */}
                <tr className="border-b border-black h-9 print:h-8">
                  <td colSpan={2} className="border-r border-black"></td>
                  <td></td>
                </tr>
                <tr className="border-b border-black h-8 print:h-7">
                  <td colSpan={2} className="border-r border-black"></td>
                  <td></td>
                </tr>
                <tr className="border-b border-black h-8 print:h-7">
                  <td colSpan={2} className="border-r border-black"></td>
                  <td></td>
                </tr>

                {/* TOTAL ROW */}
                <tr className="border-t-[1.5px] border-black h-10 print:h-9">
                  <td
                    colSpan={2}
                    className="border-r border-black px-3 py-1.5 text-center font-black tracking-widest text-base sm:text-lg print:text-[16px]"
                  >
                    TOTAL
                  </td>
                  <td className="px-3 py-1.5 text-center font-mono font-black text-base sm:text-lg print:text-[16px] tabular-nums text-black">
                    {formatIndianInteger(totalAmount)}/-
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* RS:- Amount in Words Box */}
          <div className="border-[1.5px] border-black -mt-[1.5px] px-3 py-1.5 print:py-1.5 font-black uppercase text-xs sm:text-[13px] print:text-[12px] tracking-wide">
            {words}
          </div>

          {/* Middle 2-cell stub + 6-row x 3-column blank grid matching Word Form */}
          <table className="w-full table-fixed border-collapse text-black">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[34%]" />
              <col className="w-[18%]" />
              <col className="w-[24%]" />
            </colgroup>
            <tbody>
              {/* Upper 2-cell stub row (open on right just like Word form) */}
              <tr className="h-9 print:h-8">
                <td colSpan={2} className="border-l-[1.5px] border-r border-b border-black"></td>
                <td className="border-r border-b border-black"></td>
                <td className="border-b border-black"></td>
              </tr>

              {/* 6 blank rows x 3 columns */}
              {[0, 1, 2, 3, 4, 5].map((rIdx) => (
                <tr key={`mid-${rIdx}`} className="h-8 print:h-7 border-b border-black">
                  <td className="border-l-[1.5px] border-r border-black"></td>
                  <td colSpan={2} className="border-r border-black"></td>
                  <td className="border-r-[1.5px] border-black"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Large Bordered Box with Signatures at the very bottom ("last ma sahi") */}
        <div className="border-[1.5px] border-t-0 border-black flex-1 min-h-[145px] print:min-h-[115px] flex flex-col justify-end px-6 sm:px-10 print:px-8 pb-3.5 pt-10">
          <div className="grid grid-cols-3 text-center font-gujarati font-extrabold text-sm sm:text-[15px] print:text-[13.5px] gap-4">
            <div>
              <p>{record.cashierName || 'કેશીયર'}</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">એસ.ટી. સુરત સીટી-૨</p>
            </div>
            <div>
              <p>{record.trafficSupervisorName || 'ટ્રાફિક સુપરવાઈઝર'}</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">એસ.ટી. સુરત સીટી-૨</p>
            </div>
            <div>
              <p>{record.seniorDepotManagerName || "સિનિ. ડેપો મેનેજર 'એ'"}</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">એસ.ટી. સુરત સીટી-૨</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
