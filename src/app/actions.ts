"use server";

import { generateProjectIdea as generateProjectIdeaFlow, GenerateProjectIdeaInput } from '@/ai/flows/generate-project-idea';

export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<string> {
    try {
        const result = await generateProjectIdeaFlow(input);
        return result.idea;
    } catch (error) {
        console.error("Error generating project idea:", error);
        return "Failed to generate an idea. Please try again.";
    }
}
