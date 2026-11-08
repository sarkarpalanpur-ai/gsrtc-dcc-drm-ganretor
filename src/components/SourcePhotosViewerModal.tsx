import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';

interface SourcePhotosViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHOTOS = [
  {
    id: 'photo-3',
    title: 'Photo 3: DCC Summary (Computer Print)',
    titleGu: 'ડી.સી.સી. સમરી (કમ્પ્યુટર પ્રિન્ટ)',
    src: '/assets/aistudio/20261107_201715_4b88928c.jpg',
    tag: 'DCC English Form'
  },
  {
    id: 'photo-1',
    title: 'Photo 1: DCC Summary (Gujarati Traditional)',
    titleGu: 'ડી.સી.સી. સમરી (ગુજરાતી ફોર્મેટ & સ્લિપ)',
    src: '/assets/aistudio/17940651291415103403549490171358_47414ff8.jpg',
    tag: 'DCC Gujarati Form'
  },
  {
    id: 'photo-2',
    title: 'Photo 2: Daily Revenue Memo (DRM)',
    titleGu: 'ડેઇલી રેવન્યુ મેમો (SBI બેંક ચલણ)',
    src: '/assets/aistudio/20261107_201652_6b1f74a3.jpg',
    tag: 'DRM Memo'
  }
];

export const SourcePhotosViewerModal: React.FC<SourcePhotosViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  const currentPhoto = PHOTOS[activePhotoIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 no-print">
      <div className="bg-slate-900 rounded-2xl max-w-5xl w-full h-[94vh] flex flex-col shadow-2xl border border-slate-800 overflow-hidden text-white">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
            {PHOTOS.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => {
                  setActivePhotoIndex(idx);
                  setZoomLevel(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activePhotoIndex === idx
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {photo.titleGu}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <a
              href={currentPhoto.src}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
              title="Open full image in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-600 text-slate-200 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Container with Pan / Zoom */}
        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
          <div
            className="transition-transform duration-200 ease-out origin-center max-w-full max-h-full flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={currentPhoto.src}
              alt={currentPhoto.title}
              className="max-h-[80vh] w-auto object-contain rounded-lg shadow-lg border border-slate-800"
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-slate-950 p-2.5 px-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{currentPhoto.title} ({currentPhoto.tag})</span>
          <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
