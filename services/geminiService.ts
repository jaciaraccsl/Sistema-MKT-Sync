import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTaskIdeas = async (currentDescription: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI Key Missing";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a creative marketing assistant. Enhance the following task description or provide 3 creative marketing angles for it. Keep it punchy and use emojis. Input: "${currentDescription}"`,
    });
    return response.text || "Could not generate ideas.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to AI assistant.";
  }
};

export const generateCaption = async (topic: string, tone: string): Promise<string> => {
    if (!process.env.API_KEY) return "AI Key Missing";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write an engaging Instagram caption about: "${topic}". Tone: ${tone}. Include emojis and 5 relevant hashtags. Keep it under 150 words.`
        });
        return response.text || "Sem ideias hoje...";
    } catch (error) {
        return "Erro ao conectar com a IA.";
    }
}

export const analyzeSentiment = async (text: string): Promise<string> => {
   if (!process.env.API_KEY) return "neutral";
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment of this text and return ONLY one word: "happy", "neutral", or "concerned". Text: "${text}"`,
    });
    return response.text?.trim().toLowerCase() || "neutral";
   } catch (error) {
     return "neutral";
   }
}