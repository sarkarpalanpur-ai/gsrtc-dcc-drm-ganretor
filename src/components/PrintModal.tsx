import React from 'react';
import { X, Printer, ExternalLink, Download, FileSpreadsheet, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { DCCRecord } from '../types';
import { downloadPrintableHtml, PrintMode } from '../utils/printExport';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DCCRecord;
  activeTab: 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination';
  isAllPages?: boolean;
  onDirectPrint: () => void;
  onExportExcel: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  record,
  activeTab,
  isAllPages = false,
  onDirectPrint,
  onExportExcel,
}) => {
  if (!isOpen) return null;

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  // Create clean direct URL without iframe params for full window opening
  const directPrintUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?directPrint=1&tab=${activeTab}${isAllPages ? '&all=1' : ''}`
    : '';

  const getSheetTitle = () => {
    if (isAllPages) return 'DCC Computer, DCC Gujarati અને DRM Memo (તમામ ૩ પત્રક)';
    if (activeTab === 'dcc-en') return 'DCC Summary (કમ્પ્યુટર ફોર્મેટ)';
    if (activeTab === 'dcc-gu') return 'DCC Summary (ગુજરાતી પરંપરાગત પત્રક - ૧૦૧ A, ૬૨૦)';
    if (activeTab === 'drm') return 'Daily Revenue Memo (DRM - SBI)';
    return 'કેશિયર નોટ ગણતરી પત્રક (Denomination Tally)';
  };

  const handleDownloadA4Html = () => {
    const mode: PrintMode = isAllPages ? 'all' : activeTab;
    downloadPrintableHtml(record, mode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print font-gujarati">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-amber-300 shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">A4 પ્રિન્ટ અને ડાઉનલોડ (Print & Save A4)</h2>
              <p className="text-xs text-slate-300">
                તારીખ: <span className="font-mono font-bold text-amber-300">{record.date}</span> &bull; {record.division}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Selected Document Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
            <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900">{getSheetTitle()}</p>
              <p className="text-slate-600 text-xs mt-0.5">
                ૧૦૦% સચોટ A4 પોટ્રેટ માપ (210mm × 297mm) માં સેટ કરેલું છે.
              </p>
            </div>
          </div>

          {/* AI Studio Iframe Alert Notice */}
          {isIframe && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5 text-amber-950 space-y-1.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Google AI Studio પ્રિવ્યૂમાં પ્રિન્ટ કેમ બ્લૉક થાય છે?</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Google AI Studio નું ડેવલપમેન્ટ પ્રિવ્યૂ એક સુરક્ષિત <strong>iframe (વિન્ડોની અંદર વિન્ડો)</strong> માં ચાલે છે, જેમાં બ્રાઉઝર સીધું <code>Print Dialog</code> ખોલવાની મંજૂરી આપતું નથી. નીચેનામાંથી કોઈપણ વિકલ્પથી તમે તરત જ પ્રિન્ટ મેળવી શકો છો:
              </p>
            </div>
          )}

          {/* Actions List */}
          <div className="space-y-2.5 pt-1">
            {/* Action 1: Open in New Full Tab for Direct Native Print */}
            <a
              href={directPrintUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                try {
                  localStorage.setItem('gsrtc_current_record', JSON.stringify(record));
                } catch (e) {
                  console.error(e);
                }
              }}
              className="flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl shadow-md transition transform active:scale-98 cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-xs sm:text-sm">
                    🌐 નવી ટેબમાં લાઈવ ખોલી સીધી પ્રિન્ટ કરો (સૌથી સરળ)
                  </p>
                  <p className="text-[11px] text-blue-100 font-normal">
                    નવી વિન્ડોમાં ખોલશે અને ત્યાંથી A4 પ્રિન્ટ કે 'Save as PDF' તરત થશે
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg shrink-0">
                ખોલો &rarr;
              </span>
            </a>

            {/* Action 2: Download A4 Printable Document File (.html) */}
            <button
              type="button"
              onClick={() => {
                handleDownloadA4Html();
                onClose();
              }}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl shadow-md transition transform active:scale-98 cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm">
                    📄 તૈયાર A4 પત્રક ડાઉનલોડ કરો (Download A4 File)
                  </p>
                  <p className="text-[11px] text-emerald-100 font-normal">
                    મોબાઇલ કે કમ્પ્યુટરમાં ૧ ક્લિકથી ઑફલાઇન ખોલીને પ્રિન્ટ કરી શકાય તેવી ફાઇલ
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg shrink-0">
                ડાઉનલોડ
              </span>
            </button>

            {/* Action 3: Direct Browser Print (window.print) */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onDirectPrint();
              }}
              className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-300 flex items-center justify-center shrink-0 text-slate-700">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs">
                    🖨️ બ્રાઉઝર પ્રિન્ટ ડાયલોગ ટ્રાય કરો (Direct Browser Print)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    (GitHub Pages અથવા પૂર્ણ વિન્ડોમાં કામ કરે છે)
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium">ટ્રાય કરો</span>
            </button>

            {/* Action 4: Excel Download */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onExportExcel();
              }}
              className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200 rounded-xl transition cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-200 flex items-center justify-center shrink-0 text-emerald-800">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs">
                    📊 Excel ફાઇલ ડાઉનલોડ કરો (Multi-Sheet .xlsx)
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    કમ્પ્યુટર DCC, ગુજરાતી પત્રક અને DRM એક જ એક્સેલ ફાઇલમાં
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800">Excel</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition cursor-pointer"
          >
            બંધ કરો (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
