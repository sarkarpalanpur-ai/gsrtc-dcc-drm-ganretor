import { createWorker, PSM } from 'tesseract.js';
import { parseGSRTCDccOcrText, ParsedOCRResult } from './ocrParser';

export type ClientOCRResult = ParsedOCRResult;
export { parseGSRTCDccOcrText };

/**
 * Loads an image URL or base64 Data URL into an HTMLImageElement.
 */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image for OCR: ${e}`));
    img.src = src;
  });
}

/**
 * Renders a cropped, upscaled, high-contrast grayscale region of an image to a PNG data URL.
 */
function renderPreprocessedRegion(
  img: HTMLImageElement,
  options: {
    sx?: number;
    sy?: number;
    sw?: number;
    sh?: number;
    rotateDeg?: 0 | 90 | 180 | 270;
    scale?: number;
  }
): string {
  const sx = options.sx ?? 0;
  const sy = options.sy ?? 0;
  const sw = options.sw ?? img.naturalWidth;
  const sh = options.sh ?? img.naturalHeight;
  const rotate = options.rotateDeg ?? 0;
  const scale = options.scale ?? (sw < 1200 ? 2 : 1.5);

  const targetW = Math.round(sw * scale);
  const targetH = Math.round(sh * scale);

  const canvas = document.createElement('canvas');
  if (rotate === 90 || rotate === 270) {
    canvas.width = targetH;
    canvas.height = targetW;
  } else {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  if (rotate === 90) {
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
  } else if (rotate === 180) {
    ctx.translate(canvas.width, canvas.height);
    ctx.rotate(Math.PI);
  } else if (rotate === 270) {
    ctx.translate(0, canvas.height);
    ctx.rotate(-Math.PI / 2);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
  ctx.restore();

  // Gentle contrast boost & grayscale conversion for crisp table text recognition
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const contrast = 1.35;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const adj = Math.min(255, Math.max(0, (lum - 128) * contrast + 135));
    d[i] = adj;
    d[i + 1] = adj;
    d[i + 2] = adj;
  }
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL('image/png');
}

/**
 * Browser-side fallback OCR extractor powered by Tesseract.js.
 * Used when /api/extract is unavailable (e.g., static hosting without Node backend).
 */
export async function extractDCCWithClientOCR(
  imageSrc: string,
  onProgress?: (status: string) => void
): Promise<ClientOCRResult> {
  onProgress?.('રિપોર્ટ ફોટો પ્રોસેસ થઈ રહ્યો છે...');
  const img = await loadImageElement(imageSrc);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const worker = await createWorker('eng');

  try {
    const textChunks: string[] = [];

    // Strategy 1: If landscape (e.g. desktop screenshot or wide photo), split into Left & Right table columns
    if (w >= h * 1.1) {
      onProgress?.('ડાબી બાજુનું આવક ટેબલ વંચાઈ રહ્યું છે...');
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_COLUMN });

      const leftImg = renderPreprocessedRegion(img, {
        sx: 0,
        sy: 0,
        sw: Math.round(w * 0.564),
        sh: h,
        scale: w < 1500 ? 2 : 1.5,
      });
      const leftRes = await worker.recognize(leftImg);
      textChunks.push(leftRes.data.text);

      onProgress?.('જમણી બાજુનું કપાત ટેબલ વંચાઈ રહ્યું છે...');
      const rightX = Math.round(w * 0.558);
      const rightImg = renderPreprocessedRegion(img, {
        sx: rightX,
        sy: 0,
        sw: w - rightX,
        sh: h,
        scale: w < 1500 ? 2 : 1.5,
      });
      const rightRes = await worker.recognize(rightImg);
      textChunks.push(rightRes.data.text);
    }

    const combinedText = textChunks.join('\n');
    let bestResult = parseGSRTCDccOcrText(combinedText);

    // Strategy 2: Full-frame single-block scan if portrait or column split didn't extract enough rows
    if (bestResult.matchedFieldsCount < 4) {
      onProgress?.('સંપૂર્ણ ફોટો સ્કેન થઈ રહ્યો છે...');
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
      const fullImg = renderPreprocessedRegion(img, { scale: w < 1200 ? 2 : 1.3 });
      const fullRes = await worker.recognize(fullImg);
      const candidate = parseGSRTCDccOcrText(fullRes.data.text);
      if (candidate.matchedFieldsCount > bestResult.matchedFieldsCount) {
        bestResult = candidate;
      }
    }

    // Strategy 3: Check rotated 90° and 270° orientations (camera photos shot sideways)
    if (bestResult.matchedFieldsCount < 4) {
      for (const deg of [90, 270] as const) {
        onProgress?.(`ફોટો એંગલ (${deg}°) તપાસાઈ રહ્યો છે...`);
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
        const rotImg = renderPreprocessedRegion(img, {
          rotateDeg: deg,
          scale: Math.max(w, h) < 1400 ? 1.8 : 1.2,
        });
        const rotRes = await worker.recognize(rotImg);
        const candidate = parseGSRTCDccOcrText(rotRes.data.text);
        if (candidate.matchedFieldsCount > bestResult.matchedFieldsCount) {
          bestResult = candidate;
        }
        if (bestResult.matchedFieldsCount >= 6) break;
      }
    }

    return bestResult;
  } finally {
    await worker.terminate();
  }
}
