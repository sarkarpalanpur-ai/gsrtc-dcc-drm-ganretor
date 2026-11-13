import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  Calculator,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DCCRecord, LineItem } from '../types';
import { createBlankRecord, getYesterdayDateString } from '../utils/defaultData';
import { autoMapEnglishToGujaratiAndDRM } from '../utils/dccAutoMapper';
import { extractDCCWithClientOCR } from '../utils/clientOcrExtractor';
import { formatIndianInteger } from '../utils/numberToWords';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: Partial<DCCRecord>) => void;
  currentDate?: string;
  onOpenQuickEntry?: (image?: string | null) => void;
}

const SAMPLE_PHOTOS = [
  {
    id: 'photo-today-11',
    title: 'Sample: 11/11/2026 Report',
    titleGu: 'નમૂનો ૧: ૧૧/૧૧/૨૦૨૬ રિપોર્ટ (P.O.S ₹1,22,749)',
    path: './assets/aistudio/Screenshot__8__12406596.png',
  },
  {
    id: 'photo-6',
    title: 'Sample: 10/11/2026 Gujarati',
    titleGu: 'નમૂનો ૨: ૧૦/૧૧/૨૦૨૬ પ્રિન્ટ શીટ',
    path: './assets/aistudio/Screenshot__6__7967456f.png',
  },
  {
    id: 'photo-3',
    title: 'Sample: 06/11/2026 Computer Photo',
    titleGu: 'નમૂનો ૩: ૦૬/૧૧/૨૦૨૬ કેમેરા ફોટો',
    path: './assets/aistudio/20261107_201715_4b88928c.jpg',
  },
];

async function normalizeImageForApi(src: string): Promise<{ dataUrl: string; mimeType: string; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Failed to load image'));
    el.src = src;
  });

  const maxW = 2200;
  const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1;
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: src, mimeType: 'image/png', width: img.naturalWidth, height: img.naturalHeight };
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    mimeType: 'image/png',
    width: w,
    height: h,
  };
}

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  onDataExtracted,
  currentDate,
}) => {
  const getInitialBlank = () => createBlankRecord(currentDate || getYesterdayDateString());

  const [activeTab, setActiveTab] = useState<'upload' | 'calculate'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoDate, setPhotoDate] = useState<string>(currentDate || getYesterdayDateString());
  const [reportGeneratedTime, setReportGeneratedTime] = useState<string>('');
  const [revenueItems, setRevenueItems] = useState<LineItem[]>(() => getInitialBlank().revenueItems);
  const [deductionItems, setDeductionItems] = useState<LineItem[]>(() => getInitialBlank().deductionItems);
  const [advanceBooking, setAdvanceBooking] = useState<number>(0);
  const [holidayDrm, setHolidayDrm] = useState<number>(0);
  const [ccRefund, setCcRefund] = useState<number>(0);
  const [ccAmount, setCcAmount] = useState<number>(0);
  const [diwaliExtra, setDiwaliExtra] = useState<number>(0);
  const [diwaliRefund, setDiwaliRefund] = useState<number>(0);
  const [g12Amount, setG12Amount] = useState<number>(0);
  const [g12Number, setG12Number] = useState<string>('');
  const [showAllHeads, setShowAllHeads] = useState<boolean>(false);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Reset modal cleanly every time it opens so NO stale report numbers appear
  useEffect(() => {
    if (isOpen) {
      const fresh = createBlankRecord(currentDate || getYesterdayDateString());
      setActiveTab('upload');
      setSelectedImage(null);
      setPhotoDate(fresh.date);
      setReportGeneratedTime('');
      setRevenueItems(fresh.revenueItems);
      setDeductionItems(fresh.deductionItems);
      setAdvanceBooking(0);
      setHolidayDrm(0);
      setCcRefund(0);
      setCcAmount(0);
      setDiwaliExtra(0);
      setDiwaliRefund(0);
      setG12Amount(0);
      setG12Number('');
      setShowAllHeads(false);
      setZoomLevel(1);
      setIsScanning(false);
      setStatusMessage('');
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [isOpen, currentDate]);

  if (!isOpen) return null;

  // Dynamic live calculations from current state only
  const totalRevenue = revenueItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalDeduction = deductionItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netPosCash = totalRevenue - totalDeduction;
  const totalDrmToSbi = netPosCash + holidayDrm + ccAmount + diwaliExtra - ccRefund - diwaliRefund + g12Amount;

  const resetAllFieldsToZero = (keepImage = true) => {
    const fresh = createBlankRecord(currentDate || getYesterdayDateString());
    if (!keepImage) setSelectedImage(null);
    setPhotoDate(fresh.date);
    setReportGeneratedTime('');
    setRevenueItems(fresh.revenueItems);
    setDeductionItems(fresh.deductionItems);
    setAdvanceBooking(0);
    setHolidayDrm(0);
    setCcRefund(0);
    setCcAmount(0);
    setDiwaliExtra(0);
    setDiwaliRefund(0);
    setG12Amount(0);
    setG12Number('');
    setErrorMessage('');
  };

  const buildMappedRecordFromExtracted = (extracted: Partial<DCCRecord>): DCCRecord => {
    const fresh = createBlankRecord(extracted.date || photoDate);
    const rev = fresh.revenueItems.map((base, idx) => ({
      ...base,
      amount: Number(extracted.revenueItems?.[idx]?.amount) || 0,
    }));
    const ded = fresh.deductionItems.map((base, idx) => ({
      ...base,
      amount: Number(extracted.deductionItems?.[idx]?.amount) || 0,
    }));
    const revTot = rev.reduce((s, r) => s + r.amount, 0);
    const dedTot = ded.reduce((s, d) => s + d.amount, 0);
    const posCash = revTot - dedTot;

    const ccRef = Number(extracted.ccRefund ?? extracted.drmSlip?.ccRefund) || 0;
    const ccAmt = Number(extracted.ccAmount ?? extracted.drmSlip?.ccDeposit) || 0;
    const diwExt = Number(extracted.diwaliExtra ?? extracted.drmSlip?.diwaliExt) || 0;
    const diwRef = Number(extracted.diwaliRefund) || 0;
    const g12Amt = Number(extracted.g12Amount ?? extracted.drmSlip?.g12) || 0;
    const drmHol = Number(extracted.drmSlip?.drm) || 0;

    return autoMapEnglishToGujaratiAndDRM({
      ...fresh,
      id: `dcc-${Date.now()}`,
      date: extracted.date || fresh.date,
      reportGeneratedTime: extracted.reportGeneratedTime || fresh.reportGeneratedTime,
      revenueItems: rev,
      deductionItems: ded,
      advanceBookingAmount: Number(extracted.advanceBookingAmount) || 0,
      stateWiseIncomes: fresh.stateWiseIncomes.map((s) =>
        s.state === 'GUJARAT' ? { ...s, amount: revTot } : s
      ),
      ccRefund: ccRef,
      ccAmount: ccAmt,
      diwaliExtra: diwExt,
      diwaliRefund: diwRef,
      g12Amount: g12Amt,
      g12Number: extracted.g12Number ? String(extracted.g12Number) : '',
      ruralIncome: posCash,
      drmSlip: {
        pos: posCash,
        drm: drmHol,
        g12: g12Amt,
        ccDeposit: ccAmt,
        diwaliExt: diwExt,
        ccRefund: ccRef + diwRef,
        total: posCash + drmHol + ccAmt + diwExt - ccRef - diwRef + g12Amt,
      },
    });
  };

  const populateFromPartialRecord = (extracted: Partial<DCCRecord>) => {
    const mapped = buildMappedRecordFromExtracted(extracted);
    setPhotoDate(mapped.date);
    setReportGeneratedTime(mapped.reportGeneratedTime);
    setRevenueItems(mapped.revenueItems);
    setDeductionItems(mapped.deductionItems);
    setAdvanceBooking(mapped.advanceBookingAmount);
    setHolidayDrm(mapped.drmSlip.drm);
    setCcRefund(mapped.ccRefund);
    setCcAmount(mapped.ccAmount);
    setDiwaliExtra(mapped.diwaliExtra);
    setDiwaliRefund(mapped.diwaliRefund);
    setG12Amount(mapped.g12Amount);
    setG12Number(mapped.g12Number);
    return mapped;
  };

  const runAutoExtract = async (imageSrc: string) => {
    setIsScanning(true);
    setErrorMessage('');
    setSuccessMessage('');
    setStatusMessage('ફોટો વાંચીને ઓટોમેટિક ગણતરી ચાલુ છે...');

    try {
      // Normalize orientation & dimensions on canvas before calling /api/extract
      const norm = await normalizeImageForApi(imageSrc);

      // 1. Try server-side extraction (/api/extract: uses Gemini AI if key exists, else server Tesseract OCR)
      try {
        const response = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: norm.dataUrl,
            mimeType: norm.mimeType,
            width: norm.width,
            height: norm.height,
          }),
        });
        if (response.ok) {
          const json = await response.json();
          if (json.success && json.data && !json.needClientOcr) {
            const finalized = populateFromPartialRecord(json.data);
            // Automatically update main DCC & DRM sheets immediately!
            onDataExtracted(finalized);
            const revSum = finalized.revenueItems.reduce((s, r) => s + r.amount, 0);
            const dedSum = finalized.deductionItems.reduce((s, d) => s + d.amount, 0);
            setStatusMessage('');
            setSuccessMessage(
              `✅ ફોટોમાંથી હિસાબ ઓટોમેટિક ગણાઈ ગયો અને DCC & DRM તૈયાર છે! આવક: ₹${formatIndianInteger(revSum)}, કપાત: ₹${formatIndianInteger(dedSum)}, P.O.S: ₹${formatIndianInteger(revSum - dedSum)}`
            );
            return;
          }
        }
      } catch {
        // Static deploy or offline: fall back cleanly to local browser OCR
      }

      // 2. Fallback: local client-side Tesseract OCR (also handles rotated 90°/270° camera photos)
      const ocrResult = await extractDCCWithClientOCR(norm.dataUrl, (msg) => setStatusMessage(msg));
      const finalized = populateFromPartialRecord(ocrResult.record);
      setStatusMessage('');

      if (ocrResult.matchedFieldsCount >= 3) {
        onDataExtracted(finalized);
        const revSum = finalized.revenueItems.reduce((s, r) => s + r.amount, 0);
        const dedSum = finalized.deductionItems.reduce((s, d) => s + d.amount, 0);
        setSuccessMessage(
          `✅ ફોટો સ્કેન થઈ ગયો (${ocrResult.matchedFieldsCount} વિગતો)! આવક: ₹${formatIndianInteger(revSum)}, કપાત: ₹${formatIndianInteger(dedSum)}, P.O.S: ₹${formatIndianInteger(revSum - dedSum)}`
        );
      } else {
        setErrorMessage(
          'ફોટો ઝાંખો છે અથવા ટેબલ આડું-અવળું હોવાથી આંકડા વંચાયા નથી. કૃપા કરીને સ્પષ્ટ સ્ક્રીનશોટ મૂકો અથવા બાજુમાં જોઈને આંકડા લખો.'
        );
      }
    } catch (err: any) {
      console.error('Auto extract error:', err);
      setStatusMessage('');
      setErrorMessage('ફોટો સ્કેન કરવામાં અડચણ આવી — તમે બાજુમાં ફોટો જોઈને સીધા આંકડા લખી શકો છો.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Allow re-selecting same file again later
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // CRITICAL: Clear all previous figures to 0 before scanning new report
      resetAllFieldsToZero(false);
      setSelectedImage(dataUrl);
      setActiveTab('calculate');
      void runAutoExtract(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: (typeof SAMPLE_PHOTOS)[0]) => {
    resetAllFieldsToZero(false);
    setSelectedImage(sample.path);
    setActiveTab('calculate');
    void runAutoExtract(sample.path);
  };

  const updateRevenueAmount = (index: number, val: number) => {
    const clean = isNaN(val) ? 0 : val;
    setRevenueItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, amount: clean } : item)));
  };

  const updateDeductionAmount = (index: number, val: number) => {
    const clean = isNaN(val) ? 0 : val;
    setDeductionItems((prev) => prev.map((item, idx) => (idx === index ? { ...item, amount: clean } : item)));
  };

  const handleApplyThisReport = () => {
    const blank = createBlankRecord(photoDate);

    const assembled: DCCRecord = {
      ...blank,
      id: `dcc-${Date.now()}`,
      date: photoDate,
      reportGeneratedTime: reportGeneratedTime || blank.reportGeneratedTime,
      revenueItems,
      deductionItems,
      advanceBookingAmount: advanceBooking,
      stateWiseIncomes: blank.stateWiseIncomes.map((s) =>
        s.state === 'GUJARAT' ? { ...s, amount: totalRevenue } : s
      ),
      ccRefund,
      ccAmount,
      diwaliExtra,
      diwaliRefund,
      g12Amount,
      g12Number,
      ruralIncome: netPosCash,
      drmSlip: {
        pos: netPosCash,
        drm: holidayDrm,
        g12: g12Amount,
        ccDeposit: ccAmount,
        diwaliExt: diwaliExtra,
        ccRefund: ccRefund + diwaliRefund,
        total: totalDrmToSbi,
      },
    };

    const finalized = autoMapEnglishToGujaratiAndDRM(assembled);
    onDataExtracted(finalized);
    onClose();
  };

  // Indices of the most commonly used GSRTC items shown cleanly by default
  const primaryRevIndices = [0, 1, 2, 3, 4, 9];
  const primaryDedIndices = [0, 2, 4, 11, 12];
  const visibleRevIndices = showAllHeads ? revenueItems.map((_, i) => i) : primaryRevIndices;
  const visibleDedIndices = showAllHeads ? deductionItems.map((_, i) => i) : primaryDedIndices;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print font-gujarati">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[96vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-3.5 sm:p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-amber-300 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                ઓટોમેટિક ફોટો સ્કેન અને DCC & DRM કેલ્ક્યુલેટર
              </h2>
              <p className="text-xs text-slate-300">
                જે રિપોર્ટ અપલોડ કરો તેને આપોઆપ વાંચીને સંપૂર્ણ ગણતરી (ફિક્સ જૂના આંકડા વગર)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>૧. નવો રિપોર્ટ ફોટો અપલોડ કરો</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calculate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'calculate'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>૨. સ્કેન થયેલ ગણતરી (Review & Auto-Count)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedImage && (
              <button
                type="button"
                disabled={isScanning}
                onClick={() => void runAutoExtract(selectedImage)}
                className="px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>ફોટો ફરી સ્કેન કરો</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                resetAllFieldsToZero(true);
                setSuccessMessage('તમામ આંકડા 0 કરી દીધા છે.');
              }}
              className="px-2.5 py-1 text-xs bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>0 કરો</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Scanning Live Banner */}
          {isScanning && (
            <div className="bg-indigo-50 border-2 border-indigo-400 rounded-xl p-3.5 flex items-center gap-3 text-indigo-950 text-xs sm:text-sm font-bold animate-pulse">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
              <span>{statusMessage || 'ફોટો સ્કેન થઈ રહ્યો છે... આપોઆપ ગણતરી તૈયાર થઈ રહી છે'}</span>
            </div>
          )}

          {/* TAB 1: UPLOAD PHOTO */}
          {activeTab === 'upload' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-50 via-white to-emerald-50 border-2 border-dashed border-blue-400 rounded-2xl p-5 sm:p-6 text-center space-y-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    આજનો DCC રિપોર્ટ ફોટો / સ્ક્રીનશોટ મૂકો
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    ફોટો પસંદ કરતા જ તમામ આવક, કપાત અને P.O.S રોકડની ઓટોમેટિક ગણતરી શરૂ થઈ જશે!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl cursor-pointer text-left transition shadow-md active:scale-98"
                  >
                    <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">🖼️ ગેલેરી / ફાઇલ પસંદ કરો</p>
                      <p className="text-[11px] text-blue-100">કમ્પ્યુટર સ્ક્રીનશોટ કે WhatsApp ફોટો</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl cursor-pointer text-left transition shadow-md active:scale-98"
                  >
                    <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <Camera className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">📸 કેમેરાથી ફોટો પાડો</p>
                      <p className="text-[11px] text-emerald-100">પ્રિન્ટ રિપોર્ટ કે સ્ક્રીનનો લાઇવ ફોટો</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional Sample Presets */}
              <div className="border-t border-slate-200 pt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                  ચકાસણી માટે જૂના નમૂનાના ફોટા (Optional Test Samples - ફક્ત ટેસ્ટ માટે)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      type="button"
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      className="border border-slate-200 hover:border-indigo-400 rounded-xl p-2.5 cursor-pointer transition flex flex-col justify-between bg-white text-left"
                    >
                      <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-200 w-full">
                        <img
                          src={sample.path}
                          alt={sample.title}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{sample.titleGu}</p>
                        <p className="text-[11px] text-slate-500 truncate">{sample.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULATE & REVIEW SIDE-BY-SIDE */}
          {activeTab === 'calculate' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Image Viewer */}
              <div className="lg:col-span-5 bg-slate-900 rounded-xl p-2.5 text-white flex flex-col justify-between border border-slate-800">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold flex items-center gap-1 text-amber-300">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>અપલોડ કરેલો રિપોર્ટ ફોટો</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.max(0.7, prev - 0.2))}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.2))}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-64 sm:h-96 overflow-auto bg-black rounded-lg flex items-center justify-center p-1 my-2 border border-slate-800">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Uploaded DCC Report"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                      className="max-w-full transition-transform duration-150"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-2">
                      <p className="text-xs text-slate-400">કોઈ ફોટો અપલોડ કરેલ નથી</p>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        ફોટો પસંદ કરો
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    તારીખ: <strong className="text-amber-300 font-mono">{photoDate}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="text-blue-400 hover:underline cursor-pointer"
                  >
                    બીજો ફોટો બદલો &rarr;
                  </button>
                </div>
              </div>

              {/* Right Column: Auto-Extracted Inputs & Totals */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between text-xs gap-2 flex-wrap">
                  <span className="font-bold text-amber-950">📅 રિપોર્ટની કલેક્શન તારીખ:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="bg-white border border-amber-400 font-mono font-bold px-2 py-0.5 rounded text-amber-950 w-28 text-center text-xs sm:text-sm"
                      placeholder="DD/MM/YYYY"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAllHeads((s) => !s)}
                      className="px-2 py-1 bg-white border border-amber-400 rounded text-[11px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
                    >
                      {showAllHeads ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      <span>{showAllHeads ? 'મુખ્ય ખાના' : 'તમામ 14+13 ખાના'}</span>
                    </button>
                  </div>
                </div>

                {/* Section A: Revenue Heads */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                    <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      આવકની વિગતો (Revenue Heads - અ)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-800">
                      કુલ આવક: ₹{formatIndianInteger(totalRevenue)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {visibleRevIndices.map((idx) => {
                      const item = revenueItems[idx];
                      if (!item) return null;
                      return (
                        <div key={item.id}>
                          <label className="text-[11px] text-slate-700 font-semibold block truncate" title={item.titleEn}>
                            {idx + 1}. {item.titleGu}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={item.amount === 0 ? '' : item.amount}
                            onChange={(e) => updateRevenueAmount(idx, parseFloat(e.target.value))}
                            placeholder="0"
                            className="w-full bg-white border border-emerald-300 font-mono font-bold px-2 py-1 rounded text-right text-slate-900 focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section B: Deduction Heads */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-rose-200 pb-1.5">
                    <span className="font-bold text-xs text-rose-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                      કપાતની વિગતો (Deductions - બ)
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800">
                      કુલ કપાત: ₹{formatIndianInteger(totalDeduction)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {visibleDedIndices.map((idx) => {
                      const item = deductionItems[idx];
                      if (!item) return null;
                      return (
                        <div key={item.id}>
                          <label className="text-[11px] text-slate-700 font-semibold block truncate" title={item.titleEn}>
                            {idx + 1}. {item.titleGu}
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={item.amount === 0 ? '' : item.amount}
                            onChange={(e) => updateDeductionAmount(idx, parseFloat(e.target.value))}
                            placeholder="0"
                            className="w-full bg-white border border-rose-300 font-mono font-bold px-2 py-1 rounded text-right text-slate-900 focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      );
                    })}
                    <div>
                      <label className="text-[11px] text-slate-700 font-semibold block truncate">
                        એડવાન્સ બુકીંગ રકમ
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={advanceBooking === 0 ? '' : advanceBooking}
                        onChange={(e) => setAdvanceBooking(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-white border border-slate-300 font-mono font-bold px-2 py-1 rounded text-right text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: DRM Holiday / Adjustments */}
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-indigo-950 block truncate">રજાનું બાકી DRM (+)</label>
                    <input
                      type="number"
                      step="any"
                      value={holidayDrm === 0 ? '' : holidayDrm}
                      onChange={(e) => setHolidayDrm(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-indigo-300 font-mono font-bold px-2 py-1 rounded text-right text-indigo-950"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-indigo-950 block truncate">G-12 રકમ (+)</label>
                    <input
                      type="number"
                      step="any"
                      value={g12Amount === 0 ? '' : g12Amount}
                      onChange={(e) => setG12Amount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-indigo-300 font-mono font-bold px-2 py-1 rounded text-right text-indigo-950"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-indigo-950 block truncate">CC / દિવાળી રીફંડ (-)</label>
                    <input
                      type="number"
                      step="any"
                      value={ccRefund === 0 ? '' : ccRefund}
                      onChange={(e) => setCcRefund(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full bg-white border border-indigo-300 font-mono font-bold px-2 py-1 rounded text-right text-indigo-950"
                    />
                  </div>
                </div>

                {/* LIVE CALCULATION BAR */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-3.5 shadow-md">
                  <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>આ રિપોર્ટની લાઇવ ઓટો ગણતરી (Live Auto Calculation)</span>
                    <span>અ - બ = P.O.S રોકડ</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-700">
                    <div className="bg-white/10 rounded-lg p-1.5">
                      <span className="text-[10px] text-emerald-300 block">કુલ આવક (અ)</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-white">
                        ₹{formatIndianInteger(totalRevenue)}
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-1.5">
                      <span className="text-[10px] text-rose-300 block">કુલ કપાત (બ)</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-white">
                        ₹{formatIndianInteger(totalDeduction)}
                      </span>
                    </div>
                    <div className="bg-blue-600/60 border border-blue-400 rounded-lg p-1.5">
                      <span className="text-[10px] text-amber-300 font-bold block">P.O.S રોકડ (અ - બ)</span>
                      <span className="font-mono font-black text-xs sm:text-sm text-amber-300">
                        ₹{formatIndianInteger(netPosCash)}
                      </span>
                    </div>
                  </div>
                  {totalDrmToSbi !== netPosCash && (
                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between text-xs text-indigo-200">
                      <span>DRM મેમો કુલ બેંક જમા રકમ:</span>
                      <span className="font-mono font-bold text-amber-300 text-sm">
                        ₹{formatIndianInteger(totalDrmToSbi)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs sm:text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            બંધ કરો (Close)
          </button>

          <button
            type="button"
            disabled={isScanning}
            onClick={handleApplyThisReport}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer font-gujarati"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>
              ✅ આ રિપોર્ટની ગણતરી કરી DCC અને DRM બનાવો (P.O.S: ₹{formatIndianInteger(netPosCash)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
