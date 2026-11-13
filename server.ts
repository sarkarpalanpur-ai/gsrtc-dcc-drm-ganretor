import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { extractDCCFromImage } from './server/extractService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.send('OK');
});

// Server-side AI / Tesseract OCR extraction endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const { imageBase64, mimeType, width, height } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64' });
    }
    const result = await extractDCCFromImage(imageBase64, mimeType, width, height);
    if (!result) {
      return res.json({ success: false, needClientOcr: true });
    }
    res.json({
      success: true,
      data: result.data,
      matchedFieldsCount: result.matchedFieldsCount,
      engine: result.engine,
    });
  } catch (err: any) {
    console.error('API Extract Error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract data', needClientOcr: true });
  }
});

// Serve static built frontend from dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`GSRTC App running at http://0.0.0.0:${port}`);
});
