import { put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageData, fileName } = req.body;

    if (!imageData || !fileName) {
      return res.status(400).json({ error: 'Missing imageData or fileName' });
    }

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
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ error: String(error) });
  }
}
