import { GoogleGenAI, Type } from "@google/genai";
import { BreakActivity } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFunBreakActivity = async (subject: string): Promise<BreakActivity> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest a fun, safe, and short (5 minute) break activity for a kid who just finished studying ${subject}. Return a JSON object with title, description, and an emoji.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            emoji: { type: Type.STRING }
          },
          required: ['title', 'description', 'emoji']
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as BreakActivity;
  } catch (error) {
    console.error("Gemini Break Error:", error);
    return {
      title: "Stretch & Wiggle!",
      description: "Stand up, stretch your arms to the sky, and wiggle your toes!",
      emoji: "🧘"
    };
  }
};

export const getFruitFact = async (fruitType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me a one-sentence fun fact about a ${fruitType} for a child.`,
    });
    return response.text || "Fruits are nature's candy!";
  } catch (error) {
    console.error("Gemini Fact Error:", error);
    return "Great job growing this fruit!";
  }
};
