import { GoogleGenAI } from "@google/genai";

export const generateProjectIdea = async (theme: string, apiKey: string): Promise<string> => {
    if (!apiKey) {
        return "API Key is not configured. Please enter your API Key.";
    }
    try {
        const ai = new GoogleGenAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash"});

        const prompt = `Generate a creative and concise hackathon project idea based on the theme: "${theme}". The idea should be suitable for a 24-48 hour hackathon. Provide a short project name and a one-sentence description. For example: "Project: EchoLearn. Description: An AI-powered app that listens to lectures and generates summarized study notes."`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;

    } catch (error) {
        console.error("Error generating project idea:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            return "The provided API Key is not valid. Please check and try again.";
        }
        return "Failed to generate an idea. Please try again.";
    }
};
