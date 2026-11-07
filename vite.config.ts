import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { extractDCCFromImage } from './server/extractService';

dotenv.config();

function gsrtcApiPlugin(): Plugin {
  return {
    name: 'gsrtc-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/extract' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', chunk => {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
          });
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const { imageBase64, mimeType } = JSON.parse(rawBody);
              if (!imageBase64) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing imageBase64' }));
                return;
              }
              const extractedData = await extractDCCFromImage(imageBase64, mimeType);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: extractedData }));
            } catch (err: any) {
              console.error('API Extract Error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Failed to extract data' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), gsrtcApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
