import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Sparkles, CheckCircle2, AlertCircle, RefreshCw, FileText, Image as ImageIcon } from 'lucide-react';
import { DCCRecord } from '../types';
import { SAMPLE_RECORD_06_11_2026 } from '../utils/defaultData';

interface PhotoUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: Partial<DCCRecord>) => void;
}

const SAMPLE_PHOTOS = [
  {
    id: 'photo-3',
    title: 'DCC Summary (Computer Format)',
    titleGu: 'ડી.સી.સી. સમરી (કમ્પ્યુટર ફોર્મેટ)',
    path: '/assets/aistudio/20261107_201715_4b88928c.jpg',
    description: 'Surat City Depot - Revenue, Deductions, State Wise, GST'
  },
  {
    id: 'photo-1',
    title: 'DCC Summary (Gujarati Traditional Sheet)',
    titleGu: 'ડી.સી.સી. સમરી (ગુજરાતી પરંપરાગત શીટ)',
    path: '/assets/aistudio/17940651291415103403549490171358_47414ff8.jpg',
    description: 'Surat City-2 - 101A, 102C, 620, DRM Slip, Signatures'
  },
  {
    id: 'photo-2',
    title: 'Daily Revenue Memo (DRM)',
    titleGu: 'ડેઇલી રેવન્યુ મેમો (DRM - SBI)',
    path: '/assets/aistudio/20261107_201652_6b1f74a3.jpg',
    description: 'Rural Income 44,22,250/- remitted to SBI with words'
  }
];

export const PhotoUploaderModal: React.FC<PhotoUploaderModalProps> = ({
  isOpen,
  onClose,
  onDataExtracted,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_PHOTOS[0].path);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage('');
      setSuccessMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (samplePath: string) => {
    setSelectedImage(samplePath);
    setSelectedMimeType('image/jpeg');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleExtract = async () => {
    if (!selectedImage) {
      setErrorMessage('કૃપા કરીને પહેલા ફોટો પસંદ કરો અથવા અપલોડ કરો (Please select or upload a photo first).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setStatusMessage('ફોટો પ્રોસેસિંગ અને AI OCR દ્વારા વિગતો મેળવી રહ્યું છે... (Analyzing photo with Gemini AI...)');

    try {
      let base64ToSend = selectedImage;

      // If it's a relative path from sample photos, fetch and convert to base64
      if (selectedImage.startsWith('/')) {
        setStatusMessage('સેમ્પલ ફોટો લોડ થઈ રહ્યો છે... (Loading sample image...)');
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        base64ToSend = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      setStatusMessage('GSRTC DCC & DRM હેડ અને રકમનું વિશ્લેષણ ચાલુ છે... (Extracting heads & amounts...)');

      const apiResp = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64ToSend,
          mimeType: selectedMimeType,
        }),
      });

      const result = await apiResp.json();

      if (!apiResp.ok || result.error) {
        throw new Error(result.error || 'Failed to extract data');
      }

      const extracted = result.data;
      onDataExtracted(extracted);
      setSuccessMessage('DCC અને DRM વિગતો સફળતાપૂર્વક ઓટો-ફિલ થઈ ગઈ છે! (DCC & DRM auto-filled successfully!)');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Extraction error:', err);
      // Fallback: If network or quota fails, provide the pre-verified 06/11/2026 dataset so user isn't stuck
      setErrorMessage(
        `Gemini API માં ત્રુટિ: ${err.message || 'Error'}. 06/11/2026 નો ચકાસાયેલ ડેટા લોડ કરવો હોય તો નીચે બટન દબાવો.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLoadSample = () => {
    onDataExtracted(SAMPLE_RECORD_06_11_2026);
    setSuccessMessage('06/11/2026 સુરત સીટી સેમ્પલ ડેટા સફળતાપૂર્વક લોડ થઈ ગયો!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/90 flex items-center justify-center text-amber-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">ફોટો સ્કેનર & ઓટો-ફિલ (AI Photo Scanner)</h2>
              <p className="text-xs text-slate-300 font-gujarati">
                DCC કે DRM શીટનો ફોટો અપલોડ કરો અને વિગતો ઓટો-ફિલ મેળવો
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

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1-Photo Guarantee Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border-2 border-red-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 font-gujarati flex items-center gap-1.5">
                <span>માત્ર ૧ જ ફોટો અપલોડ કરો (Upload Only 1 Photo)</span>
                <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">100% Auto-Fill</span>
              </h3>
              <p className="text-xs text-slate-700 font-gujarati leading-relaxed">
                ફક્ત <strong>DCC Summary (કમ્પ્યુટર સમરી)</strong> નો ૧ જ ફોટો અપલોડ કરશો એટલે સિસ્ટમ તેની જાતે:
                <br />
                <span className="inline-block mt-0.5 font-semibold text-red-900">
                  ૧. અંગ્રેજી DCC Summary &bull; ૨. પરંપરાગત ગુજરાતી ડી.સી.સી. (૧૦૧ A, ૬૨૦) &bull; ૩. SBI DRM મેમો &bull; ૪. કરન્સી નોટોની ગણતરી
                </span>
                <br />
                બધા જ પેજ <strong>આપોઆપ (Auto-fill)</strong> તૈયાર કરી દેશે!
              </p>
            </div>
          </div>

          {/* Preset Sample Photos Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                સેમ્પલ ફોટો (DCC Summary Photo 3)
              </span>
              <button
                type="button"
                onClick={handleDirectLoadSample}
                className="text-xs text-red-700 hover:text-red-800 font-semibold underline cursor-pointer"
              >
                સીધો સેમ્પલ ડેટા લોડ કરો (Instant Load)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_PHOTOS.map((sample) => {
                const isSelected = selectedImage === sample.path;
                return (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample.path)}
                    className={`border-2 rounded-xl p-2.5 cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-red-600 bg-red-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="aspect-4/3 rounded-lg overflow-hidden bg-slate-100 mb-2 border border-slate-200">
                      <img
                        src={sample.path}
                        alt={sample.title}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">{sample.title}</p>
                      <p className="text-[11px] font-gujarati text-slate-600 truncate">{sample.titleGu}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload New Custom Photo Section with Separate Gallery & Camera Options */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              અથવા નવો ફોટો અપલોડ કરો (Upload From Mobile / PC)
            </span>

            {/* Hidden Input 1: GALLERY & FILES (NO capture attribute, opens Android Gallery / Files picker) */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Hidden Input 2: LIVE CAMERA (capture="environment", opens camera immediately if desired) */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Dual Quick Action Buttons for Mobile & Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Choose from Gallery / Files */}
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 hover:border-blue-600 rounded-xl cursor-pointer text-left transition shadow-xs hover:shadow-md active:scale-98"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 font-gujarati">
                  <p className="text-xs sm:text-sm font-bold text-blue-950">
                    🖼️ ગેલેરી / ફાઇલ્સમાંથી પસંદ કરો
                  </p>
                  <p className="text-[11px] text-blue-700 font-medium truncate">
                    Google Photos, Gallery કે WhatsApp ફોટો
                  </p>
                </div>
              </button>

              {/* Option 2: Take Live Photo via Camera */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 hover:border-emerald-600 rounded-xl cursor-pointer text-left transition shadow-xs hover:shadow-md active:scale-98"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 font-gujarati">
                  <p className="text-xs sm:text-sm font-bold text-emerald-950">
                    📸 કેમેરાથી ફોટો પાડો
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium truncate">
                    મોબાઇલ કેમેરાથી DCC શીટનો ફોટો લો
                  </p>
                </div>
              </button>
            </div>

            {/* Drag & Drop Zone (defaults to opening Gallery/Files dialog) */}
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-xl p-3.5 sm:p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-red-50/20"
            >
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 font-gujarati">
                અહીં ક્લિક કરો અથવા ફોટો ડ્રેગ કરીને મૂકો (Drag & Drop)
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                JPG, PNG, HEIC, WebP સપોર્ટેડ છે
              </p>
            </div>
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 bg-white shrink-0">
                <img
                  src={selectedImage}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  તૈયાર છે (Ready to Scan)
                </span>
                <p className="text-xs text-slate-700 mt-1 truncate font-medium">
                  {selectedImage.startsWith('/') ? selectedImage.split('/').pop() : 'Custom Uploaded Photo'}
                </p>
                <p className="text-[11px] text-slate-500 font-gujarati">
                  AI આ ફોટામાંથી તમામ આવક, કપાત અને DRM રકમ શોધી લેશે
                </p>
              </div>
            </div>
          )}

          {/* Status / Error / Success Messages */}
          {isLoading && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 text-amber-800 text-xs sm:text-sm">
              <RefreshCw className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={handleDirectLoadSample}
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                06/11/2026 સેમ્પલ ડેટા સીધો લોડ કરો
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            રદ કરો (Cancel)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDirectLoadSample}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              સેમ્પલ ભરો (Sample)
            </button>
            <button
              onClick={handleExtract}
              disabled={isLoading || !selectedImage}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>પ્રોસેસિંગ...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Gemini AI વડે ઓટો-ફિલ કરો</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
