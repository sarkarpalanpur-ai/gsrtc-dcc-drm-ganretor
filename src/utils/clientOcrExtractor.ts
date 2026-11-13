import { createWorker, PSM, OEM } from 'tesseract.js';
import { parseGSRTCDccOcrText, ParsedOCRResult, scoreOcrCandidate } from './ocrParser';

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
 * Renders a cropped, optionally upscaled/rotated grayscale region of an image to a PNG data URL.
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
    enhanceContrast?: boolean;
  }
): string {
  const sx = options.sx ?? 0;
  const sy = options.sy ?? 0;
  const sw = options.sw ?? img.naturalWidth;
  const sh = options.sh ?? img.naturalHeight;
  const rotate = options.rotateDeg ?? 0;
  const scale = options.scale ?? 1;

  const targetW = Math.max(1, Math.round(sw * scale));
  const targetH = Math.max(1, Math.round(sh * scale));

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

  if (options.enhanceContrast) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    const contrast = 1.25;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const adj = Math.min(255, Math.max(0, (lum - 128) * contrast + 130));
      d[i] = adj;
      d[i + 1] = adj;
      d[i + 2] = adj;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  return canvas.toDataURL('image/png');
}

async function createBrowserOcrWorker() {
  // Prefer local bundled ./tessdata/eng.traineddata.gz (works offline/GitHub Pages without external data block),
  // falling back to default Tesseract CDN if unavailable.
  const localLangPath =
    typeof window !== 'undefined' ? new URL('./tessdata', window.location.href).href : './tessdata';
  try {
    return await createWorker('eng', OEM.LSTM_ONLY, {
      langPath: localLangPath,
    });
  } catch {
    return await createWorker('eng');
  }
}

/**
 * Browser-side OCR extractor powered by Tesseract.js.
 * Uses the exact same crisp rectangle-split + total-verified scoring strategy as the server extractor
 * so static deployments (e.g. GitHub Pages) produce the exact same calculation as AI Studio.
 */
export async function extractDCCWithClientOCR(
  imageSrc: string,
  onProgress?: (status: string) => void
): Promise<ClientOCRResult> {
  onProgress?.('રિપોર્ટ ફોટો પ્રોસેસ થઈ રહ્યો છે...');
  const img = await loadImageElement(imageSrc);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const worker = await createBrowserOcrWorker();

  try {
    const candidates: ParsedOCRResult[] = [];
    const pickBest = (): { best: ParsedOCRResult; bestScore: number } => {
      let best = candidates[0] || parseGSRTCDccOcrText('');
      let bestScore = candidates.length > 0 ? scoreOcrCandidate(best) : -1;
      for (const c of candidates) {
        const s = scoreOcrCandidate(c);
        if (s > bestScore) {
          bestScore = s;
          best = c;
        }
      }
      return { best, bestScore };
    };

    if (w >= h * 1.1) {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_COLUMN });

      // Pass A: Exact crisp Omnificent 56/44 column split (identical to server/extractService.ts)
      onProgress?.('ડાબી અને જમણી બાજુનું ટેબલ વંચાઈ રહ્યું છે...');
      const leftA = await worker.recognize(imageSrc, {
        rectangle: {
          left: 0,
          top: 0,
          width: Math.round(w * 0.564),
          height: h,
        },
      });
      const rightStartA = Math.round(w * 0.558);
      const rightA = await worker.recognize(imageSrc, {
        rectangle: {
          left: rightStartA,
          top: 0,
          width: w - rightStartA,
          height: h,
        },
      });
      const passA = parseGSRTCDccOcrText(`${leftA.data.text}\n${rightA.data.text}`);
      candidates.push(passA);

      // Pass B: Symmetric 50/50 split on crisp image if both printed totals did not yet verify
      if (scoreOcrCandidate(passA) < 100) {
        onProgress?.('રકમ તાળો મેળવવા ફરી ચકાસણી થઈ રહી છે...');
        const leftB = await worker.recognize(imageSrc, {
          rectangle: {
            left: 0,
            top: 0,
            width: Math.round(w * 0.505),
            height: h,
          },
        });
        const rightStartB = Math.round(w * 0.495);
        const rightB = await worker.recognize(imageSrc, {
          rectangle: {
            left: rightStartB,
            top: 0,
            width: w - rightStartB,
            height: h,
          },
        });
        candidates.push(parseGSRTCDccOcrText(`${leftB.data.text}\n${rightB.data.text}`));
      }

      // Pass C: Upscaled grayscale-contrast columns for low-resolution / blurry phone screenshots
      if (pickBest().bestScore < 100) {
        const scale = w < 1500 ? 2 : 1.5;
        const leftC = renderPreprocessedRegion(img, {
          sx: 0,
          sy: 0,
          sw: Math.round(w * 0.564),
          sh: h,
          scale,
          enhanceContrast: true,
        });
        const rightC = renderPreprocessedRegion(img, {
          sx: rightStartA,
          sy: 0,
          sw: w - rightStartA,
          sh: h,
          scale,
          enhanceContrast: true,
        });
        const leftCRes = await worker.recognize(leftC);
        const rightCRes = await worker.recognize(rightC);
        candidates.push(parseGSRTCDccOcrText(`${leftCRes.data.text}\n${rightCRes.data.text}`));
      }
    }

    // Pass D: Full-frame single-block scan if portrait or column passes didn't match enough rows
    if (pickBest().bestScore < 4) {
      onProgress?.('સંપૂર્ણ ફોટો સ્કેન થઈ રહ્યો છે...');
      await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
      const crispFull = await worker.recognize(imageSrc);
      candidates.push(parseGSRTCDccOcrText(crispFull.data.text));

      if (pickBest().bestScore < 50) {
        const enhancedFull = renderPreprocessedRegion(img, {
          scale: w < 1200 ? 2 : 1.3,
          enhanceContrast: true,
        });
        const enhRes = await worker.recognize(enhancedFull);
        candidates.push(parseGSRTCDccOcrText(enhRes.data.text));
      }
    }

    // Pass E: Rotated 90° and 270° orientations (sideways camera photos)
    if (pickBest().best.matchedFieldsCount < 4) {
      for (const deg of [90, 270] as const) {
        onProgress?.(`ફોટો એંગલ (${deg}°) તપાસાઈ રહ્યો છે...`);
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
        const rotImg = renderPreprocessedRegion(img, {
          rotateDeg: deg,
          scale: Math.max(w, h) < 1400 ? 1.8 : 1.2,
          enhanceContrast: true,
        });
        const rotRes = await worker.recognize(rotImg);
        candidates.push(parseGSRTCDccOcrText(rotRes.data.text));
        if (pickBest().bestScore >= 100 || pickBest().best.matchedFieldsCount >= 8) break;
      }
    }

    return pickBest().best;
  } finally {
    await worker.terminate();
  }
}
