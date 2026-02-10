
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);

async function fetchUrlAsBase64(url: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.prototype.slice.call(bytes, i, i + chunkSize));
  }
  return btoa(binary);
}

export async function getPhotoCritique(imageInput: string, title: string) {
  try {
    // imageInput can be a base64 data URI or a public URL
    let base64data = '';
    if (imageInput.startsWith('http')) {
      base64data = await fetchUrlAsBase64(imageInput);
    } else {
      base64data = imageInput.split(',')[1] || imageInput;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64data,
            },
          },
          {
            text: `Analyze this photograph titled "${title}". Provide a very brief 2-sentence critique focusing on composition and lighting. Be professional and encouraging.`,
          },
        ],
      },
    });

    return response.text || "Nebyla nalezena žádná analýza.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Nepodařilo se analyzovat fotografii.";
  }
}
