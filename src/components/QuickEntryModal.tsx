import React, { useState } from 'react';
import { X, Calculator, CheckCircle2, ArrowRight } from 'lucide-react';
import { DCCRecord } from '../types';
import { formatIndianInteger } from '../utils/numberToWords';
import { getYesterdayDateString, getTodayDateString } from '../utils/defaultData';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRecord: DCCRecord;
  onApply: (updated: DCCRecord) => void;
  uploadedImage?: string | null;
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  currentRecord,
  onApply,
  uploadedImage,
}) => {
  const [date, setDate] = useState(currentRecord.date);
  
  // Key Revenue items
  const [passangerIntra, setPassangerIntra] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Passanger Amount Intra'))?.amount || 0
  );
  const [sleeperCharge, setSleeperCharge] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Sleeper Charge'))?.amount || 0
  );
  const [interState, setInterState] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Inter State'))?.amount || 0
  );
  const [tollTax, setTollTax] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Toll Amount Gujrat'))?.amount || 0
  );
  const [dhabha, setDhabha] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Dhabha Collection'))?.amount || 0
  );
  const [luggage, setLuggage] = useState(
    currentRecord.revenueItems.find(r => r.titleEn.includes('Luggage'))?.amount || 0
  );

  // Key Deduction items
  const [digitalTransfer, setDigitalTransfer] = useState(
    currentRecord.deductionItems.find(d => d.titleEn.includes('Digital transaction'))?.amount || 0
  );
  const [divyangConcession, setDivyangConcession] = useState(
    currentRecord.deductionItems.find(d => d.titleEn.includes('Other Uncollected Concession'))?.amount || 0
  );
  const [uncollectedSleeper, setUncollectedSleeper] = useState(
    currentRecord.deductionItems.find(d => d.titleEn.includes('Uncollected Sleeper'))?.amount || 0
  );
  const [policeWarrant, setPoliceWarrant] = useState(
    currentRecord.deductionItems.find(d => d.titleEn.includes('Police Moter Warrent'))?.amount || 0
  );

  // Holiday DRM & Adjustments
  const [holidayDrm, setHolidayDrm] = useState(Number(currentRecord.drmSlip.drm) || 0);
  const [diwaliExtra, setDiwaliExtra] = useState(Number(currentRecord.diwaliExtra) || 0);
  const [ccRefund, setCcRefund] = useState(Number(currentRecord.ccRefund) || 0);
  const [g12Amount, setG12Amount] = useState(Number(currentRecord.g12Amount) || 0);

  if (!isOpen) return null;

  // Live Calculations according to GSRTC rules
  const grossTotalRev = passangerIntra + sleeperCharge + interState + tollTax + dhabha + luggage;
  const grossTotalDed = digitalTransfer + divyangConcession + uncollectedSleeper + policeWarrant;
  const netPosCash = grossTotalRev - grossTotalDed;

  // Head 101 A: (1 + 2 + 3) - 12 - 5 - 13
  const head101A = (passangerIntra + sleeperCharge + interState) - digitalTransfer - divyangConcession - uncollectedSleeper;
  // Head 102 G & 620 G: 5 + 13
  const head102G = divyangConcession + uncollectedSleeper;
  // Total Bank DRM Deposit
  const finalDeposit = netPosCash + holidayDrm + diwaliExtra - ccRefund + g12Amount;

  const handleSave = () => {
    // Clone and update record
    const updatedRevenue = currentRecord.revenueItems.map(item => {
      if (item.titleEn.includes('Passanger Amount Intra')) return { ...item, amount: passangerIntra };
      if (item.titleEn.includes('Sleeper Charge')) return { ...item, amount: sleeperCharge };
      if (item.titleEn.includes('Inter State')) return { ...item, amount: interState };
      if (item.titleEn.includes('Toll Amount Gujrat')) return { ...item, amount: tollTax };
      if (item.titleEn.includes('Dhabha Collection')) return { ...item, amount: dhabha };
      if (item.titleEn.includes('Luggage')) return { ...item, amount: luggage };
      return item;
    });

    const updatedDeductions = currentRecord.deductionItems.map(item => {
      if (item.titleEn.includes('Digital transaction')) return { ...item, amount: digitalTransfer };
      if (item.titleEn.includes('Other Uncollected Concession')) return { ...item, amount: divyangConcession };
      if (item.titleEn.includes('Uncollected Sleeper')) return { ...item, amount: uncollectedSleeper };
      if (item.titleEn.includes('Police Moter Warrent')) return { ...item, amount: policeWarrant };
      return item;
    });

    const updatedRecord: DCCRecord = {
      ...currentRecord,
      date,
      revenueItems: updatedRevenue,
      deductionItems: updatedDeductions,
      diwaliExtra,
      ccRefund,
      g12Amount,
      drmSlip: {
        ...currentRecord.drmSlip,
        pos: netPosCash,
        drm: holidayDrm,
        diwaliExt: diwaliExtra,
        ccRefund,
        g12: g12Amount,
        total: finalDeposit,
      },
      ruralIncome: netPosCash,
    };

    onApply(updatedRecord);
    onClose();
  };

  const handleSetToday = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    setDate(`${d}/${m}/${y}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col font-gujarati">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">ઝડપી ડેટા એન્ટ્રી (Quick Entry Sheet)</h2>
              <p className="text-xs text-slate-300">
                નવી તારીખ અને તમારા વાઉચર/DCC ના મુખ્ય આંકડા દાખલ કરો
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Uploaded Photo Preview if provided */}
          {uploadedImage && (
            <div className="bg-slate-100 rounded-xl p-3 border border-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  📸 તમારો અપલોડ કરેલો ફોટો (આમાંથી આંકડા જોઈને નીચે લખો):
                </span>
                <span className="text-[11px] text-slate-500 font-sans">
                  {uploadedImage.startsWith('/') ? uploadedImage.split('/').pop() : 'Custom Photo'}
                </span>
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-300 bg-white p-1 flex justify-center shadow-inner">
                <img
                  src={uploadedImage}
                  alt="Waybill / DCC Photo"
                  className="max-h-52 object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Date Selector Row */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-950">📅 કલેક્શન તારીખ:</span>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-white border border-indigo-300 px-2.5 py-1 rounded-md font-mono font-bold w-28 text-center text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setDate(getYesterdayDateString())}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer"
                title={`DCC ગઈકાલના કલેક્શનની હોય છે (${getYesterdayDateString()})`}
              >
                ગઈકાલ કલેક્શન ({getYesterdayDateString()})
              </button>
              <button
                type="button"
                onClick={() => setDate(getTodayDateString())}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-2.5 py-1 rounded-md font-bold text-xs transition cursor-pointer"
              >
                આજ ({getTodayDateString()})
              </button>
            </div>
          </div>

          {/* Revenue Items */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <h3 className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
              <span>૧. આવકની મુખ્ય રકમ (Revenue Heads)</span>
              <span className="text-[11px] text-slate-500 font-sans">કમ્પ્યુટર DCC મુજબ</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૧. મુસાફર આવક (Passanger Intra - 101 A)
                </label>
                <input
                  type="number"
                  value={passangerIntra || ''}
                  onChange={(e) => setPassangerIntra(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૨. સ્લીપર ચાર્જ આવક (Sleeper Charge)
                </label>
                <input
                  type="number"
                  value={sleeperCharge || ''}
                  onChange={(e) => setSleeperCharge(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૩. ઇન્ટર સ્ટેટ આવક (Inter State)
                </label>
                <input
                  type="number"
                  value={interState || ''}
                  onChange={(e) => setInterState(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૫. ટોલટેક્ષ આવક ગુજરાત (102 H)
                </label>
                <input
                  type="number"
                  value={tollTax || ''}
                  onChange={(e) => setTollTax(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૧૦. ધાબા કલેક્શન (140 K)
                </label>
                <input
                  type="number"
                  value={dhabha || ''}
                  onChange={(e) => setDhabha(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૪. લગેજ આવક (105)
                </label>
                <input
                  type="number"
                  value={luggage || ''}
                  onChange={(e) => setLuggage(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Deduction Items */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <h3 className="font-bold text-slate-900 border-b pb-1.5 flex items-center justify-between">
              <span>૨. કપાતની મુખ્ય રકમ (Deduction Heads)</span>
              <span className="text-[11px] text-slate-500 font-sans">કમ્પ્યુટર DCC મુજબ</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૧૨. ડીજીટલ ટ્રાન્ઝેક્શન (107 Digital Transfer)
                </label>
                <input
                  type="number"
                  value={digitalTransfer || ''}
                  onChange={(e) => setDigitalTransfer(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૫. દિવ્યાંગ / કન્સેશન (620 G & 102 G)
                </label>
                <input
                  type="number"
                  value={divyangConcession || ''}
                  onChange={(e) => setDivyangConcession(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૧૩. બિન-વસૂલેલ સ્લીપર (Uncollected Sleeper)
                </label>
                <input
                  type="number"
                  value={uncollectedSleeper || ''}
                  onChange={(e) => setUncollectedSleeper(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  ૧. પોલીસ મોટર વોરંટ (620 Police Warrant)
                </label>
                <input
                  type="number"
                  value={policeWarrant || ''}
                  onChange={(e) => setPoliceWarrant(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Adjustments: Holiday DRM */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
            <h3 className="font-bold text-amber-950 border-b border-amber-200 pb-1.5 flex items-center justify-between">
              <span>૩. રજાનું બાકી DRM અને ખાસ વિગતો (Holiday Carry Forward)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-amber-900 font-medium mb-1">
                  રજાનું બાકી DRM (જો બેંક રજાનું બાકી હોય તો જ)
                </label>
                <input
                  type="number"
                  value={holidayDrm || ''}
                  onChange={(e) => setHolidayDrm(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-amber-950"
                  placeholder="0 (સામાન્ય દિવસોમાં ખાલી)"
                />
              </div>

              <div>
                <label className="block text-[11px] text-amber-900 font-medium mb-1">
                  દીવાલી એક્સ્ટ્રા (જો હોય તો)
                </label>
                <input
                  type="number"
                  value={diwaliExtra || ''}
                  onChange={(e) => setDiwaliExtra(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-amber-950"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Live Automatic Calculation Summary Box */}
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3.5 space-y-2">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>આપોઆપ ગણતરી (Auto Calculated Results):</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="bg-white p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-gujarati block">હેડ ૧૦૧ A (કંડક્ટર નેટ):</span>
                <span className="font-bold text-emerald-900 text-sm">₹{formatIndianInteger(head101A)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-slate-500 font-gujarati block">૧૦૨ G & ૬૨૦ G (દિવ્યાંગ):</span>
                <span className="font-bold text-emerald-900 text-sm">₹{formatIndianInteger(head102G)}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-gujarati block">કુલ બેંક ડિપોઝિટ (DRM):</span>
                <span className="font-bold text-red-700 text-sm">₹{formatIndianInteger(finalDeposit)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            રદ કરો
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <span>ગણતરી કરી પત્રકો તૈયાર કરો</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
