/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DCCRecord } from './types';
import { createBlankRecord, calculateEnglishTotals, calculateGujaratiTotals, getYesterdayDateString } from './utils/defaultData';
import { exportDCCAndDRMToExcel } from './utils/excelExport';
import { autoMapEnglishToGujaratiAndDRM } from './utils/dccAutoMapper';
import { Header } from './components/Header';
import { DCCSummaryEnglish } from './components/DCCSummaryEnglish';
import { DCCSummaryGujarati } from './components/DCCSummaryGujarati';
import { DRMMemo } from './components/DRMMemo';
import { DenominationCalculator } from './components/DenominationCalculator';
import { PhotoUploaderModal } from './components/PhotoUploaderModal';
import { SourcePhotosViewerModal } from './components/SourcePhotosViewerModal';
import { QuickEntryModal } from './components/QuickEntryModal';
import { PrintModal } from './components/PrintModal';
import { formatIndianInteger } from './utils/numberToWords';
import { Camera, FileSpreadsheet, Printer, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [record, setRecord] = useState<DCCRecord>(() => {
    const defaultCollDate = getYesterdayDateString();
    const STORAGE_VER = '2026-11-13-v2';

    try {
      if (localStorage.getItem('gsrtc_storage_ver') !== STORAGE_VER) {
        localStorage.removeItem('gsrtc_current_record');
        localStorage.setItem('gsrtc_storage_ver', STORAGE_VER);
        return createBlankRecord(defaultCollDate);
      }

      const saved = localStorage.getItem('gsrtc_current_record');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Remove any old hardcoded template/sample records so fresh reports calculate strictly from user input
        const isStaleTemplate =
          !parsed?.id ||
          String(parsed.id).startsWith('dcc-surat') ||
          parsed.id === 'dcc-2026-11-06-surat' ||
          Number(parsed.ruralIncome) > 1000000 ||
          Number(parsed.ruralIncome) === 184693 ||
          Number(parsed.drmSlip?.pos) === 184693 ||
          Number(parsed.drmSlip?.total) === 426266;

        if (isStaleTemplate) {
          localStorage.removeItem('gsrtc_current_record');
          return createBlankRecord(defaultCollDate);
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    // Start clean with 0 values until user uploads/scans or enters today's report
    return createBlankRecord(defaultCollDate);
  });

  const [activeTab, setActiveTab] = useState<'dcc-en' | 'dcc-gu' | 'drm' | 'denomination'>('dcc-en');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSourcePhotosOpen, setIsSourcePhotosOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryImage, setQuickEntryImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('gsrtc_current_record', JSON.stringify(record));
    } catch (e) {
      console.error(e);
    }
  }, [record]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDataExtracted = (extracted: Partial<DCCRecord>) => {
    setRecord((prev) => {
      const finalDate = extracted.date || prev.date;
      const merged: DCCRecord = {
        ...prev,
        ...extracted,
        date: finalDate,
        revenueItems: extracted.revenueItems || prev.revenueItems,
        deductionItems: extracted.deductionItems || prev.deductionItems,
        stateWiseIncomes: extracted.stateWiseIncomes || prev.stateWiseIncomes,
        gstDetails: extracted.gstDetails || prev.gstDetails,
        drmSlip: extracted.drmSlip || prev.drmSlip,
        ccRefund: extracted.ccRefund !== undefined ? Number(extracted.ccRefund) : (extracted.drmSlip?.ccRefund ?? prev.ccRefund),
        ccAmount: extracted.ccAmount !== undefined ? Number(extracted.ccAmount) : (extracted.drmSlip?.ccDeposit ?? prev.ccAmount),
        diwaliExtra: extracted.diwaliExtra !== undefined ? Number(extracted.diwaliExtra) : (extracted.drmSlip?.diwaliExt ?? prev.diwaliExtra),
        diwaliRefund: extracted.diwaliRefund !== undefined ? Number(extracted.diwaliRefund) : prev.diwaliRefund,
        g12Amount: extracted.g12Amount !== undefined ? Number(extracted.g12Amount) : (extracted.drmSlip?.g12 ?? prev.g12Amount),
        g12Number: extracted.g12Number !== undefined ? String(extracted.g12Number) : prev.g12Number,
        ruralIncome: extracted.ruralIncome ?? prev.ruralIncome,
        urbanIncome: extracted.urbanIncome ?? prev.urbanIncome,
      };
      // Run automatic cross-mapping to ensure Gujarati heads and DRM are auto-filled!
      return autoMapEnglishToGujaratiAndDRM(merged);
    });
    showToast('માત્ર ૧ ફોટોથી DCC Summary, ગુજરાતી પત્રક અને DRM મેમો સંપૂર્ણ ઓટો-ફિલ થઈ ગયા!');
  };

  const handleExportExcel = () => {
    try {
      exportDCCAndDRMToExcel(record);
      showToast('Excel ફાઇલ સફળતાપૂર્વક ડાઉનલોડ થઈ! (Excel downloaded)');
    } catch (err: any) {
      console.error('Excel Export Error:', err);
      showToast('Excel એક્સપોર્ટમાં ત્રુટિ');
    }
  };

  const [isPrintingAll, setIsPrintingAll] = useState(false);
  const [isSinglePrinting, setIsSinglePrinting] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrintModalAll, setIsPrintModalAll] = useState(false);

  const executeDirectPrint = (allPages: boolean) => {
    if (allPages) {
      setIsPrintingAll(true);
      setIsSinglePrinting(false);
      showToast('DCC English, DCC Gujarati અને DRM Memo ત્રણેય પત્રક ૩ પેજમાં પ્રિન્ટ થઈ રહ્યા છે...');
    } else {
      setIsPrintingAll(false);
      setIsSinglePrinting(true);
      showToast('A4 પ્રિન્ટ તૈયાર થઈ રહી છે...');
    }

    const cleanup = () => {
      setIsSinglePrinting(false);
      setIsPrintingAll(false);
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    setTimeout(() => {
      window.focus();
      try {
        window.print();
      } catch (e) {
        console.error('Print failed:', e);
        showToast('પ્રિન્ટ કરવા માટે કીબોર્ડ પર Ctrl + P દબાવો');
        cleanup();
      }
      setTimeout(cleanup, 12000);
    }, 300);
  };

  const handlePrint = () => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isIframe) {
      setIsPrintModalAll(false);
      setIsPrintModalOpen(true);
    } else {
      executeDirectPrint(false);
    }
  };

  const handlePrintAll = () => {
    const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isIframe) {
      setIsPrintModalAll(true);
      setIsPrintModalOpen(true);
    } else {
      executeDirectPrint(true);
    }
  };

  // Check URL query parameters on load (e.g. when opened in a new tab from Google AI Studio)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const directPrint = params.get('directPrint');
    const tabParam = params.get('tab') as 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination' | null;
    const allParam = params.get('all');

    if (tabParam && ['dcc-en', 'dcc-gu', 'drm', 'denomination'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (directPrint === '1') {
      setTimeout(() => {
        executeDirectPrint(allParam === '1');
      }, 700);
    }
  }, []);

  const handleSave = () => {
    try {
      const historyKey = `gsrtc_history_${record.date.replace(/\//g, '_')}`;
      localStorage.setItem(historyKey, JSON.stringify(record));
      showToast(`${record.date} નો રેકોર્ડ સુરક્ષિત સેવ થયો!`);
    } catch (err) {
      showToast('સેવ કરતી વખતે ત્રુટિ આવી');
    }
  };

  // Edits from English DCC Summary / Quick Entry -> auto-calculate Gujarati heads & DRM
  const handleEnglishRecordChange = (updated: DCCRecord) => {
    const fullyMapped = autoMapEnglishToGujaratiAndDRM(updated);
    setRecord(fullyMapped);
  };

  // Edits directly inside Gujarati DCC Summary -> recalculate Gujarati totals & DRM without overwriting user's Gujarati edits
  const handleGujaratiRecordChange = (updated: DCCRecord) => {
    setRecord((prev) => {
      const slipEditedDirectly =
        updated.drmSlip !== prev.drmSlip &&
        updated.gujaratiIncomes === prev.gujaratiIncomes &&
        updated.gujaratiDeductions === prev.gujaratiDeductions &&
        updated.gujaratiOtherIncomes === prev.gujaratiOtherIncomes;

      if (slipEditedDirectly) {
        const g12Val = Number(updated.drmSlip.g12) || 0;
        const syncedOther = updated.gujaratiOtherIncomes.map((item) =>
          item.headNo === '140'
            ? {
                ...item,
                amount: g12Val,
                titleGu: g12Val > 0 ? `અન્ય આવક${updated.g12Number ? ` (G-12 નં. ${updated.g12Number})` : ' (G-12)'}` : 'અન્ય આવક',
              }
            : item
        );
        return {
          ...updated,
          g12Amount: g12Val,
          ccAmount: Number(updated.drmSlip.ccDeposit) || 0,
          diwaliExtra: Number(updated.drmSlip.diwaliExt) || 0,
          ruralIncome: Number(updated.drmSlip.pos) || 0,
          gujaratiOtherIncomes: syncedOther,
        };
      }

      const gujTotals = calculateGujaratiTotals(updated);
      const holidayDrm = Number(updated.drmSlip.drm) || 0;
      const g12FromOther = updated.gujaratiOtherIncomes.find((o) => o.headNo === '140')?.amount ?? updated.g12Amount;
      const netPosOnly = gujTotals.totalA - gujTotals.totalB;
      const updatedDrmSlip = {
        ...updated.drmSlip,
        pos: netPosOnly,
        g12: Number(g12FromOther) || 0,
        total: gujTotals.netBankRemittance + holidayDrm,
      };
      return {
        ...updated,
        g12Amount: Number(g12FromOther) || 0,
        drmSlip: updatedDrmSlip,
        ruralIncome: netPosOnly,
      };
    });
  };

  // Edits directly inside DRM Memo -> preserve manual rural/urban/G-12 inputs and update totals & words
  const handleDRMRecordChange = (updated: DCCRecord) => {
    setRecord((prev) => {
      const holidayDrm = Number(updated.drmSlip?.drm) || 0;
      const g12Val = Number(updated.g12Amount) || 0;
      const ruralVal = Number(updated.ruralIncome) || 0;
      const ccDep = Number(updated.drmSlip?.ccDeposit ?? updated.ccAmount) || 0;
      const diwaliExt = Number(updated.drmSlip?.diwaliExt ?? updated.diwaliExtra) || 0;
      const ccRef = Number(updated.drmSlip?.ccRefund) || 0;

      const syncedOther =
        g12Val !== prev.g12Amount
          ? updated.gujaratiOtherIncomes.map((item) =>
              item.headNo === '140'
                ? {
                    ...item,
                    amount: g12Val,
                    titleGu: g12Val > 0 ? `અન્ય આવક${updated.g12Number ? ` (G-12 નં. ${updated.g12Number})` : ' (G-12)'}` : 'અન્ય આવક',
                  }
                : item
            )
          : updated.gujaratiOtherIncomes;

      return {
        ...updated,
        gujaratiOtherIncomes: syncedOther,
        drmSlip: {
          ...updated.drmSlip,
          pos: ruralVal,
          g12: g12Val,
          total: ruralVal + holidayDrm + ccDep + diwaliExt - ccRef + g12Val,
        },
      };
    });
  };

  const handleNewTodayReport = () => {
    setIsScannerOpen(true);
  };

  const handleReset = () => {
    const collDate = getYesterdayDateString();
    localStorage.removeItem('gsrtc_current_record');
    setRecord(createBlankRecord(collDate));
    showToast(`જૂનો હિસાબ સાફ! કલેક્શન તારીખ ${collDate} નો નવો 0 કોરો રિપોર્ટ તૈયાર છે.`);
  };

  const handleDateChange = (newDate: string) => {
    setRecord((prev) => ({ ...prev, date: newDate }));
  };

  const engTotals = calculateEnglishTotals(record);
  const gujTotals = calculateGujaratiTotals(record);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation & GSRTC Header */}
      <Header
        record={record}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenQuickEntry={() => {
          setQuickEntryImage(null);
          setIsQuickEntryOpen(true);
        }}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onPrintAll={handlePrintAll}
        onSave={handleSave}
        onNewTodayReport={handleNewTodayReport}
        onReset={handleReset}
        onViewSourcePhotos={() => setIsSourcePhotosOpen(true)}
        onDateChange={handleDateChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {/* Quick Action Helper Banner */}
        {!isPrintingAll && (
          <div className="mb-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3 sm:p-3.5 shadow-md flex flex-wrap items-center justify-between gap-3 no-print font-gujarati">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {record.division} • {record.depotCityNum} • તારીખ: <span className="font-mono text-amber-300 font-bold underline">{record.date}</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  નવા ફોટામાંથી ઓટો-ફિલ કરવા '📷 ફોટો સ્કેન (AI)' દબાવો, અથવા નીચે સીધા આંકડા લખો.
                </p>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1.5"
                title="ફોટો સ્કેન કરી આપોઆપ ખાના ભરો"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>📷 ફોટો સ્કેન (Auto-Fill)</span>
              </button>
              <button
                onClick={() => setIsQuickEntryOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1.5"
              >
                <span>⚡ ઝડપી એન્ટ્રી</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition active:scale-95 flex items-center gap-1"
                title="જૂનો તમામ હિસાબ સાફ કરી ૦ કરો"
              >
                <span>🗑️ જૂનો હિસાબ સાફ (0 કરો)</span>
              </button>
            </div>
          </div>
        )}

        {/* Prominent Upload Prompt when sheet is currently empty (0) */}
        {!isPrintingAll && engTotals.totalRevenue === 0 && gujTotals.totalA === 0 && record.ruralIncome === 0 && (
          <div className="mb-4 bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 border-2 border-dashed border-blue-400 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print font-gujarati">
            <div>
              <p className="text-sm sm:text-base font-extrabold text-slate-900">
                📄 નવો રિપોર્ટ અપલોડ કરવા તૈયાર (હાલ બધા ખાના 0 છે)
              </p>
              <p className="text-xs text-slate-700 mt-0.5">
                કોઈ જૂનો ફિક્સ હિસાબ લોડ કરેલ નથી — આજનો DCC રિપોર્ટ ફોટો મૂકતા જ DCC English, ગુજરાતી પત્રક, DRM અને નોટ ગણતરી આપોઆપ ભરાઈ જશે!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer transition active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-4 h-4 text-amber-300" />
                <span>📷 આજનો રિપોર્ટ ફોટો અપલોડ કરો</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating summary info strip (only on screen) */}
        {!isPrintingAll && (
          <div className="mb-4 bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                {record.division} • {record.depot} • તારીખ: <span className="font-mono font-bold text-red-700">{record.date}</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 mr-1.5">કુલ આવક (Gross):</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  ₹{formatIndianInteger(engTotals.totalRevenue)}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-slate-500 mr-1.5">કપાત (Deductions):</span>
                <span className="font-mono font-bold text-slate-700 tabular-nums">
                  ₹{formatIndianInteger(engTotals.totalDeductions)}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-3">
                <span className="text-slate-500 mr-1.5">બેંક જમા (DRM Cash):</span>
                <span className="font-mono font-extrabold text-red-700 tabular-nums">
                  ₹{formatIndianInteger(record.drmSlip.total || record.ruralIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3-Page Batch Print Mode (when printing all 3 documents sequentially on A4) */}
        {isPrintingAll ? (
          <div className="space-y-6">
            <div className="print-page-break">
              <DCCSummaryEnglish record={record} onChange={handleEnglishRecordChange} isPrintMode={true} />
            </div>
            <div className="print-page-break">
              <DCCSummaryGujarati record={record} onChange={handleGujaratiRecordChange} isPrintMode={true} />
            </div>
            <div>
              <DRMMemo record={record} onChange={handleDRMRecordChange} isPrintMode={true} />
            </div>
          </div>
        ) : (
          <>
            {/* Tab 1: DCC Summary (English Computer Print) */}
            {activeTab === 'dcc-en' && (
              <div className="space-y-4">
                <div className="no-print bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>કમ્પ્યુટર પ્રિન્ટ ફોર્મેટ (Computer Print Format):</strong> તમામ સેલ એક્સેલની જેમ એડિટેબલ છે. રકમ બદલતા કુલ સરવાળો અને DRM આપોઆપ બદલાઈ જશે.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="આ ૧ પેજ A4 સાઈઝમાં પ્રિન્ટ કરો"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      A4 પ્રિન્ટ
                    </button>
                    <button
                      onClick={handlePrintAll}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="ત્રણેય પત્રક ૩ પેજમાં એકસાથે પ્રિન્ટ કરો"
                    >
                      <span>📑 ૩ પેજ પ્રિન્ટ</span>
                    </button>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      સ્કેન ફોટો
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Excel
                    </button>
                  </div>
                </div>

                <DCCSummaryEnglish record={record} onChange={handleEnglishRecordChange} isPrintMode={isSinglePrinting} />
              </div>
            )}

            {/* Tab 2: DCC Summary (Gujarati Traditional Sheet) */}
            {activeTab === 'dcc-gu' && (
              <div className="space-y-4">
                <div className="no-print bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 font-gujarati">
                  <div className="flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>પરંપરાગત ડી.સી.સી. સમરી (Gujarati Format):</strong> એકાઉન્ટ હેડ ૧૦૧ A, ૧૦૨ C, ૬૨૦ અને નીચે DRM સ્લિપ સાથેનું અધિકૃત પત્રક.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="આ ૧ પેજ A4 સાઈઝમાં પ્રિન્ટ કરો"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      A4 પ્રિન્ટ
                    </button>
                    <button
                      onClick={handlePrintAll}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="ત્રણેય પત્રક ૩ પેજમાં એકસાથે પ્રિન્ટ કરો"
                    >
                      <span>📑 ૩ પેજ પ્રિન્ટ</span>
                    </button>
                  </div>
                </div>

                <DCCSummaryGujarati record={record} onChange={handleGujaratiRecordChange} isPrintMode={isSinglePrinting} />
              </div>
            )}

            {/* Tab 3: Daily Revenue Memo (DRM) */}
            {activeTab === 'drm' && (
              <div className="space-y-4">
                <div className="no-print bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Daily Revenue Memo (DRM - SBI):</strong> એસબીઆઈ બેંકમાં નાણાં જમા કરાવવા માટેનું અધિકૃત ચલણ. રકમ મુજબ શબ્દોમાં રકમ (Words) આપોઆપ તૈયાર થાય છે.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="આ ૧ પેજ A4 સાઈઝમાં પ્રિન્ટ કરો"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      A4 પ્રિન્ટ
                    </button>
                    <button
                      onClick={handlePrintAll}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="ત્રણેય પત્રક ૩ પેજમાં એકસાથે પ્રિન્ટ કરો"
                    >
                      <span>📑 ૩ પેજ પ્રિન્ટ</span>
                    </button>
                  </div>
                </div>

                <DRMMemo record={record} onChange={handleDRMRecordChange} isPrintMode={isSinglePrinting} />
              </div>
            )}

            {/* Tab 4: Cash Denomination Calculator */}
            {activeTab === 'denomination' && (
              <div className="space-y-4">
                <div className="no-print bg-purple-50 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-900 flex flex-wrap items-center justify-between gap-2 font-gujarati">
                  <div className="flex items-center gap-2 font-medium">
                    <Info className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>
                      <strong>કેશિયર નોટ ગણતરી પત્રક (Denomination Tally):</strong> રોકડ જમા અને DCC તાળો મેળવવા માટેનું અધિકૃત પત્રક.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="bg-purple-700 hover:bg-purple-800 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm"
                      title="આ ૧ પેજ A4 સાઈઝમાં પ્રિન્ટ કરો"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      A4 પ્રિન્ટ
                    </button>
                  </div>
                </div>

                <DenominationCalculator record={record} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-medium border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Photo Scanner Modal */}
      <PhotoUploaderModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onDataExtracted={handleDataExtracted}
        currentDate={record.date}
        onOpenQuickEntry={(img) => {
          setQuickEntryImage(img || null);
          setIsQuickEntryOpen(true);
        }}
      />

      {/* Quick Data Entry Wizard Modal */}
      <QuickEntryModal
        isOpen={isQuickEntryOpen}
        onClose={() => setIsQuickEntryOpen(false)}
        currentRecord={record}
        uploadedImage={quickEntryImage}
        onApply={(updated) => {
          handleEnglishRecordChange(updated);
          showToast(`તારીખ ${updated.date} નો રિપોર્ટ સફળતાપૂર્વક તૈયાર થઈ ગયો!`);
        }}
      />

      {/* Source Photos Inspection Modal */}
      <SourcePhotosViewerModal
        isOpen={isSourcePhotosOpen}
        onClose={() => setIsSourcePhotosOpen(false)}
      />

      {/* A4 Print and Export Options Modal (Handles Google AI Studio iframe & Direct Downloads) */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        record={record}
        activeTab={activeTab}
        isAllPages={isPrintModalAll}
        onDirectPrint={() => executeDirectPrint(isPrintModalAll)}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
}
