import { kv } from '@vercel/kv';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const KV_PHOTOS = 'photo_contest:photos';
const KV_CHALLENGES = 'photo_contest:challenges';
const KV_USERS = 'photo_contest:users';
const KV_VOTES = 'photo_contest:votes';

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

  const { action, key, value } = req.body;

  try {
    if (req.method === 'GET') {
      const dataKey = `photo_contest:${key}`;
      const data = await kv.get(dataKey);
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
      if (action === 'set') {
        const dataKey = `photo_contest:${key}`;
        const expiry = key === 'challenges' ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
        await kv.set(dataKey, value, { ex: expiry });
        return res.status(200).json({ success: true });
      }

      if (action === 'get') {
        const dataKey = `photo_contest:${key}`;
        const data = await kv.get(dataKey);
        return res.status(200).json({ success: true, data });
      }
    }

    return res.status(400).json({ success: false, error: 'Invalid request' });
  } catch (error) {
    console.error('KV API Error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}
