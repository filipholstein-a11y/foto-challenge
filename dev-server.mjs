import http from 'http';
import url from 'url';

// Development fallback storage
const mockBlobStorage = new Map();

async function handler(req, res) {
  const pathname = new url.URL(req.url, `http://${req.headers.host}`).pathname;
  const searchParams = new url.URL(req.url, `http://${req.headers.host}`).searchParams;

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.writeHead(200).end();
  }

  // Blob API
  if (pathname === '/api/blob') {
    if (req.method === 'GET') {
      const key = searchParams.get('key');
      if (key) {
        const blob = mockBlobStorage.get(key);
        if (blob) {
          try {
            const base64Data = blob.data;
            const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            return res.writeHead(200).end(buffer);
          } catch (err) {
            console.error('Error decoding blob:', err);
          }
        }
      }
      return res.writeHead(404).end(JSON.stringify({ error: 'Blob not found' }));
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          console.log('[BLOB POST] Received request, body size:', body.length);
          const { imageData, fileName } = JSON.parse(body);

          if (!imageData || !fileName) {
            console.error('[BLOB POST] Missing imageData or fileName');
            res.writeHead(400).end(JSON.stringify({ error: 'Missing imageData or fileName' }));
            return;
          }

          console.log('[BLOB POST] Storing image:', fileName, 'size:', imageData.length);

          // Uložit Base64 data do memory mapy
          const fileKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          mockBlobStorage.set(fileKey, {
            data: imageData,
            timestamp: Date.now()
          });

          // Vyčistit staré záznamy
          if (mockBlobStorage.size > 100) {
            const now = Date.now();
            const toDelete = [];
            for (const [key, value] of mockBlobStorage.entries()) {
              if (now - value.timestamp > 86400000) { // 24 hodin
                toDelete.push(key);
              }
            }
            toDelete.forEach(key => mockBlobStorage.delete(key));
          }

          // Vrátit URL
          const mockUrl = `http://localhost:3001/api/blob?key=${fileKey}`;
          console.log('[BLOB POST] Returning URL:', mockUrl);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({ success: true, url: mockUrl })
          );
        } catch (error) {
          console.error('Blob upload error:', error);
          res.writeHead(500).end(JSON.stringify({ error: String(error) }));
        }
      });
      return;
    }

    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // KV API
  if (pathname === '/api/kv') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          // V development módu jen simulujeme KV
          // Vrátíme prázdné pole (development fallback)
          console.log('[KV] Request:', body);
          res.writeHead(200, { 'Content-Type': 'application/json' }).end(
            JSON.stringify({ success: true, data: [] })
          );
        } catch (error) {
          console.error('KV error:', error);
          res.writeHead(500).end(JSON.stringify({ error: String(error) }));
        }
      });
      return;
    }

    res.writeHead(405).end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  // 404
  res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
}

const PORT = 3001;
const server = http.createServer(handler);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
  console.log(`  /api/blob  - Image upload & retrieval`);
  console.log(`  /api/kv    - Key-value storage (mock)`);
});
