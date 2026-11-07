/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DCCRecord } from './types';
import { SAMPLE_RECORD_06_11_2026, createBlankRecord, calculateEnglishTotals, calculateGujaratiTotals } from './utils/defaultData';
import { exportDCCAndDRMToExcel } from './utils/excelExport';
import { autoMapEnglishToGujaratiAndDRM } from './utils/dccAutoMapper';
import { Header } from './components/Header';
import { DCCSummaryEnglish } from './components/DCCSummaryEnglish';
import { DCCSummaryGujarati } from './components/DCCSummaryGujarati';
import { DRMMemo } from './components/DRMMemo';
import { DenominationCalculator } from './components/DenominationCalculator';
import { PhotoUploaderModal } from './components/PhotoUploaderModal';
import { SourcePhotosViewerModal } from './components/SourcePhotosViewerModal';
import { formatIndianInteger } from './utils/numberToWords';
import { Camera, FileSpreadsheet, Printer, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [record, setRecord] = useState<DCCRecord>(() => {
    try {
      const saved = localStorage.getItem('gsrtc_current_record');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return SAMPLE_RECORD_06_11_2026;
  });

  const [activeTab, setActiveTab] = useState<'dcc-en' | 'dcc-gu' | 'drm' | 'denomination'>('dcc-en');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSourcePhotosOpen, setIsSourcePhotosOpen] = useState(false);
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
      const merged: DCCRecord = {
        ...prev,
        ...extracted,
        revenueItems: extracted.revenueItems || prev.revenueItems,
        deductionItems: extracted.deductionItems || prev.deductionItems,
        stateWiseIncomes: extracted.stateWiseIncomes || prev.stateWiseIncomes,
        gstDetails: extracted.gstDetails || prev.gstDetails,
        drmSlip: extracted.drmSlip || prev.drmSlip,
        ruralIncome: extracted.ruralIncome ?? prev.ruralIncome,
        urbanIncome: extracted.urbanIncome ?? prev.urbanIncome,
      };
      // Run automatic cross-mapping to ensure Gujarati heads and DRM are auto-filled!
      return autoMapEnglishToGujaratiAndDRM(merged);
    });
    showToast('ડેટા સફળતાપૂર્વક અપડેટ થયો (DCC & DRM auto-filled!)');
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

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    try {
      const historyKey = `gsrtc_history_${record.date.replace(/\//g, '_')}`;
      localStorage.setItem(historyKey, JSON.stringify(record));
      showToast(`${record.date} નો રેકોર્ડ સુરક્ષિત સેવ થયો!`);
    } catch (err) {
      showToast('સેવ કરતી વખતે ત્રુટિ આવી');
    }
  };

  const handleRecordChange = (updated: DCCRecord) => {
    // Automatically map English DCC changes to Gujarati Account heads and DRM
    const fullyMapped = autoMapEnglishToGujaratiAndDRM(updated);
    setRecord(fullyMapped);
  };

  const handleNewTodayReport = () => {
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const blank = createBlankRecord(dateStr);
    setRecord(blank);
    setIsScannerOpen(true);
    showToast(`આજનો નવો રિપોર્ટ (${dateStr}) શરૂ થયો! ફોટો સ્કેન કરો અથવા રકમ લખો.`);
  };

  const handleReset = () => {
    if (window.confirm('શું તમે 06/11/2026 ના મૂળ સેમ્પલ ડેટા પર પાછા જવા માંગો છો?')) {
      setRecord(SAMPLE_RECORD_06_11_2026);
      showToast('મૂળ સેમ્પલ ડેટા રીસેટ થયો');
    }
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
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
        onSave={handleSave}
        onNewTodayReport={handleNewTodayReport}
        onViewSourcePhotos={() => setIsSourcePhotosOpen(true)}
        onDateChange={handleDateChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {/* Floating summary info strip (only on screen) */}
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
                ₹{formatIndianInteger(record.ruralIncome || gujTotals.netBankRemittance)}
              </span>
            </div>
          </div>
        </div>

        {/* Tab 1: DCC Summary (English Computer Print) */}
        {activeTab === 'dcc-en' && (
          <div className="space-y-4">
            <div className="no-print bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>કમ્પ્યુટર પ્રિન્ટ ફોર્મેટ (Computer Print Format):</strong> તમામ સેલ એક્સેલની જેમ એડિટેબલ છે. રકમ બદલતા કુલ સરવાળો અને DRM આપોઆપ બદલાઈ જશે.
                </span>
              </div>
              <div className="flex items-center gap-2">
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

            <DCCSummaryEnglish record={record} onChange={handleRecordChange} />
          </div>
        )}

        {/* Tab 2: DCC Summary (Gujarati Traditional Sheet) */}
        {activeTab === 'dcc-gu' && (
          <div className="space-y-4">
            <div className="no-print bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between gap-2 font-gujarati">
              <div className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>પરંપરાગત ડી.સી.સી. સમરી (Gujarati Format):</strong> એકાઉન્ટ હેડ ૧૦૧ A, ૧૦૨ C, ૬૨૦ અને નીચે DRM સ્લિપ સાથેનું અધિકૃત પત્રક.
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                પ્રિન્ટ A4
              </button>
            </div>

            <DCCSummaryGujarati record={record} onChange={handleRecordChange} />
          </div>
        )}

        {/* Tab 3: Daily Revenue Memo (DRM) */}
        {activeTab === 'drm' && (
          <div className="space-y-4">
            <div className="no-print bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Daily Revenue Memo (DRM - SBI):</strong> એસબીઆઈ બેંકમાં નાણાં જમા કરાવવા માટેનું અધિકૃત ચલણ. રકમ મુજબ શબ્દોમાં રકમ (Words) આપોઆપ તૈયાર થાય છે.
                </span>
              </div>
              <button
                onClick={handlePrint}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                પ્રિન્ટ DRM
              </button>
            </div>

            <DRMMemo record={record} onChange={handleRecordChange} />
          </div>
        )}

        {/* Tab 4: Cash Denomination Calculator */}
        {activeTab === 'denomination' && (
          <div className="space-y-4">
            <DenominationCalculator record={record} />
          </div>
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
      />

      {/* Source Photos Inspection Modal */}
      <SourcePhotosViewerModal
        isOpen={isSourcePhotosOpen}
        onClose={() => setIsSourcePhotosOpen(false)}
      />
    </div>
  );
}
