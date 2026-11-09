import React from 'react';
import { Camera, FileSpreadsheet, Printer, Save, RefreshCw, Calendar, Eye, Download } from 'lucide-react';
import { DCCRecord } from '../types';

interface HeaderProps {
  record: DCCRecord;
  activeTab: 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination';
  setActiveTab: (tab: 'dcc-en' | 'dcc-gu' | 'drm' | 'denomination') => void;
  onOpenScanner: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
  onPrintAll?: () => void;
  onSave: () => void;
  onNewTodayReport: () => void;
  onReset?: () => void;
  onViewSourcePhotos: () => void;
  onDateChange: (newDate: string) => void;
  onOpenQuickEntry?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  record,
  activeTab,
  setActiveTab,
  onOpenScanner,
  onExportExcel,
  onPrint,
  onPrintAll,
  onSave,
  onNewTodayReport,
  onReset,
  onViewSourcePhotos,
  onDateChange,
  onOpenQuickEntry,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg border-b border-slate-800 no-print">
      {/* Top Bar with GSRTC Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/images_09942867.jpeg"
            alt="ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ લોગો"
            className="w-13 h-13 rounded-full object-contain bg-white shadow-md border-2 border-amber-400 p-0.5 shrink-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = './gsrtc-logo.jpeg';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-gujarati">
                ગુજરાત રાજ્ય માર્ગ વાહન વ્યવહાર નિગમ
              </h1>
              <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                સુરત વિભાગ
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              Daily Cash Collection (DCC) & Daily Revenue Memo (DRM) System
            </p>
          </div>
        </div>

        {/* Date & Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">તારીખ:</span>
            <input
              type="text"
              value={record.date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-white font-mono font-bold w-24 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1 text-center"
              placeholder="DD/MM/YYYY"
            />
            <input
              type="date"
              className="w-4 h-4 bg-transparent opacity-80 hover:opacity-100 cursor-pointer text-white"
              title="કેલેન્ડરમાંથી તારીખ પસંદ કરો"
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-');
                  onDateChange(`${d}/${m}/${y}`);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const d = String(now.getDate()).padStart(2, '0');
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const y = now.getFullYear();
                onDateChange(`${d}/${m}/${y}`);
              }}
              className="text-[10px] bg-slate-700 hover:bg-slate-600 text-amber-300 px-1.5 py-0.5 rounded cursor-pointer font-gujarati font-bold"
              title="આજની તારીખ સેટ કરો"
            >
              આજ
            </button>
          </div>

          {/* New Today Report Button */}
          <button
            onClick={onNewTodayReport}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer font-gujarati"
            title="Create fresh report for today (આજનો નવો રિપોર્ટ)"
          >
            <span>➕ આજનો નવો રિપોર્ટ</span>
          </button>

          {/* Quick Entry Button */}
          {onOpenQuickEntry && (
            <button
              onClick={onOpenQuickEntry}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition transform active:scale-95 cursor-pointer font-gujarati"
              title="નવી તારીખ અને મુખ્ય રકમ ઝડપથી દાખલ કરો"
            >
              <span>⚡ ઝડપી એન્ટ્રી</span>
            </button>
          )}

          {/* AI Scanner Button */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition transform active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-300" />
            <span>ફોટો સ્કેન (AI)</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={onExportExcel}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow transition cursor-pointer"
            title="Download multi-sheet Excel file (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Excel ડાઉનલોડ</span>
          </button>

          {/* Print Current Sheet */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition cursor-pointer"
            title="હાલનું પત્રક A4 સાઈઝમાં પ્રિન્ટ કરો"
          >
            <Printer className="w-4 h-4 text-blue-200" />
            <span>A4 પ્રિન્ટ</span>
          </button>

          {/* Print All 3 Sheets Together */}
          {onPrintAll && (
            <button
              onClick={onPrintAll}
              className="flex items-center gap-1.5 bg-indigo-700 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition cursor-pointer"
              title="DCC Computer, DCC Gujarati અને DRM Memo ત્રણેય પત્રક ૩ પેજમાં એકસાથે પ્રિન્ટ કરો"
            >
              <span>📑 ૩ પેજ પ્રિન્ટ (All 3 A4)</span>
            </button>
          )}

          {/* Source Photos preview button */}
          <button
            onClick={onViewSourcePhotos}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="View uploaded photos of DCC & DRM"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>મૂળ ફોટા (3)</span>
          </button>

          {/* Download updated project ZIP for GitHub */}
          <a
            href="./gsrtc-latest-code.zip"
            download="gsrtc-latest-code.zip"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="Download full updated project ZIP to upload on GitHub"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GitHub ZIP</span>
          </a>

          {/* Save Record */}
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
            title="Save to local browser history"
          >
            <Save className="w-3.5 h-3.5" />
            <span>સેવ</span>
          </button>

          {/* Reset / Clear Button */}
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-rose-950 text-rose-300 border border-rose-900/60 px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer font-gujarati"
              title="તમામ આંકડા સાફ કરી કોરો રિપોર્ટ બનાવો"
            >
              <span>🗑️ સાફ કરો</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-t border-slate-700/60 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dcc-en')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'dcc-en'
                ? 'bg-white text-slate-900 font-bold border-t-2 border-red-600 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            1. DCC Summary (Computer Print)
          </button>

          <button
            onClick={() => setActiveTab('dcc-gu')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap cursor-pointer font-gujarati ${
              activeTab === 'dcc-gu'
                ? 'bg-white text-slate-900 font-bold border-t-2 border-red-600 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            2. ડી.સી.સી. સમરી (ગુજરાતી પરંપરાગત)
          </button>

          <button
            onClick={() => setActiveTab('drm')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'drm'
                ? 'bg-white text-slate-900 font-bold border-t-2 border-red-600 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            3. Daily Revenue Memo (DRM - SBI)
          </button>

          <button
            onClick={() => setActiveTab('denomination')}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition flex items-center gap-2 whitespace-nowrap cursor-pointer font-gujarati ${
              activeTab === 'denomination'
                ? 'bg-white text-slate-900 font-bold border-t-2 border-red-600 shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            4. કેશ ટેલી / નોટ ગણતરી (Denominations)
          </button>
        </div>
      </div>
    </header>
  );
};
