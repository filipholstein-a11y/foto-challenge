import { put } from '@vercel/blob';

const API_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

/**
 * Připravovací funkce pro volání KV API
 */
async function kvRequest(action: string, key: string, value?: any) {
  try {
    const response = await fetch(`${API_URL}/api/kv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, key, value }),
    });

    if (!response.ok) {
      throw new Error(`KV request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('KV request error:', error);
    throw error;
  }
}

/**
 * Načtení dat z Vercel KV
 */
export async function loadPhotos() {
  try {
    return await kvRequest('get', 'photos');
  } catch (error) {
    console.error('Error loading photos from KV:', error);
    return [];
  }
}

export async function loadChallenges() {
  try {
    return await kvRequest('get', 'challenges');
  } catch (error) {
    console.error('Error loading challenges from KV:', error);
    return [];
  }
}

export async function loadUsers() {
  try {
    return await kvRequest('get', 'users');
  } catch (error) {
    console.error('Error loading users from KV:', error);
    return [];
  }
}

export async function loadVotes() {
  try {
    return await kvRequest('get', 'votes');
  } catch (error) {
    console.error('Error loading votes from KV:', error);
    return [];
  }
}

/**
 * Uložení dat do Vercel KV
 */
export async function savePhotos(photos: any[]) {
  try {
    await kvRequest('set', 'photos', photos);
    return true;
  } catch (error) {
    console.error('Error saving photos to KV:', error);
    return false;
  }
}

export async function saveChallenges(challenges: any[]) {
  try {
    await kvRequest('set', 'challenges', challenges);
    return true;
  } catch (error) {
    console.error('Error saving challenges to KV:', error);
    return false;
  }
}

export async function saveUsers(users: any[]) {
  try {
    await kvRequest('set', 'users', users);
    return true;
  } catch (error) {
    console.error('Error saving users to KV:', error);
    return false;
  }
}

export async function saveVotes(votes: string[]) {
  try {
    await kvRequest('set', 'votes', votes);
    return true;
  } catch (error) {
    console.error('Error saving votes to KV:', error);
    return false;
  }
}

/**
 * Upload obrázku do Vercel Blob a vrácení URL
 */
export async function uploadImageToBlob(imageData: string, fileName: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/blob`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData, fileName }),
    });

    if (!response.ok) {
      throw new Error(`Blob upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Error uploading image to Blob:', error);
    return null;
  }
}


