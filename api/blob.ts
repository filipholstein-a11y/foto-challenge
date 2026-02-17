import type { VercelRequest, VercelResponse } from '@vercel/node';

// Development fallback storage - používáme Map který se vyprázdní po restartu serveru
const mockBlobStorage = new Map<string, { data: string; timestamp: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token,X-Requested-With,Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Retrieve blob data by fileKey
    const { key } = req.query;
    if (key && typeof key === 'string') {
      const blob = mockBlobStorage.get(key);
      if (blob) {
        const base64Data = blob.data;
        const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000');
        return res.status(200).end(buffer);
      }
    }
    return res.status(404).json({ error: 'Blob not found' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'Missing imageData or fileName' });
    }

    // Pokud máme Vercel Blob dostupný, používáme jej
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        
        // Převodění base64 data URL na Blob
        let blob: Blob;
        
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
          // Data URL format: data:image/jpeg;base64,...
          const base64String = imageData.split(',')[1];
          const byteCharacters = atob(base64String);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: 'image/jpeg' });
        } else {
          return res.status(400).json({ error: 'Invalid image data format' });
        }

        // Upload do Vercel Blob
        const result = await put(fileName, blob, {
          access: 'public',
          contentType: 'image/jpeg',
        });

        return res.status(200).json({ success: true, url: result.url });
      } catch (blobError) {
        console.warn('Vercel Blob not available, using development fallback', blobError);
        // Pokud Blob selže, padneme na fallback níže
      }
    }

    // Development fallback: uložit Base64 na serveru a vrátit referenční URL
    console.warn('Using development blob storage fallback - data stored in memory');
    
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      // Vytvořit jedinečný klíč pro obrázek
      const fileKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Uložit Base64 data do memory mapy
      mockBlobStorage.set(fileKey, {
        data: imageData,
        timestamp: Date.now()
      });

      // Vyčistit staré záznamy (starší než 24 hodin) pro neplýtvání pamětí
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

      // Vrátit URL která odkazuje na lokální blob endpoint
      const mockUrl = `http://localhost:3001/api/blob?key=${fileKey}`;
      return res.status(200).json({ success: true, url: mockUrl });
    } else {
      return res.status(400).json({ error: 'Invalid image data format' });
    }
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
