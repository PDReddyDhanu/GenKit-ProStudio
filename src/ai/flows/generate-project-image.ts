
'use server';

/**
 * @fileOverview An AI agent that generates an image for a project based on its title and description.
 *
 * - generateProjectImage - A function that handles the project image generation process.
 * - GenerateProjectImageInput - The input type for the generateProjectImage function.
 * - GenerateProjectImageOutput - The return type for the generateProjectImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectImageInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
});
export type GenerateProjectImageInput = z.infer<typeof GenerateProjectImageInputSchema>;

const GenerateProjectImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateProjectImageOutput = z.infer<typeof GenerateProjectImageOutputSchema>;

export async function generateProjectImage(input: GenerateProjectImageInput): Promise<GenerateProjectImageOutput> {
    return generateProjectImageFlow(input);
}

const generateProjectImageFlow = ai.defineFlow(
    {
        name: 'generateProjectImageFlow',
        inputSchema: GenerateProjectImageInputSchema,
        outputSchema: GenerateProjectImageOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `Generate a visually stunning, iconic, and abstract representation of a hackathon project. 
            The image should be symbolic and evocative, not literal.
            Project Name: "${input.projectName}"
            Description: "${input.projectDescription}"
            Style: digital art, abstract, vibrant colors, cinematic lighting, futuristic.`,
        });

        if (!media.url) {
            throw new Error('Image generation failed to return a data URI.');
        }

        return { imageUrl: media.url };
    }
);
