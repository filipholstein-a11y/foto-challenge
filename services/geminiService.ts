
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY); 

export async function getPhotoCritique(base64Image: string, title: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image.split(',')[1] || base64Image,
            },
          },
          {
            text: `Analyze this photograph titled "${title}". 
            Provide a very brief 2-sentence critique focusing on composition and lighting. 
            Be professional and encouraging.`,
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
