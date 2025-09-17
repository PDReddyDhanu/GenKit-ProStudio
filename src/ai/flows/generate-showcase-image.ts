'use server';

/**
 * @fileOverview An AI agent that generates an image for a project showcase based on a summary.
 *
 * - generateShowcaseImage - A function that handles the image generation.
 * - GenerateShowcaseImageInput - The input type for the generateShowcaseImage function.
 * - GenerateShowcaseImageOutput - The return type for the generateShowcaseImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateShowcaseImageInputSchema = z.object({
  summary: z.string().describe('A short, punchy summary of the project.'),
});
export type GenerateShowcaseImageInput = z.infer<typeof GenerateShowcaseImageInputSchema>;

export const GenerateShowcaseImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateShowcaseImageOutput = z.infer<typeof GenerateShowcaseImageOutputSchema>;

export async function generateShowcaseImage(input: GenerateShowcaseImageInput): Promise<GenerateShowcaseImageOutput> {
    return generateShowcaseImageFlow(input);
}

const generateShowcaseImageFlow = ai.defineFlow(
    {
        name: 'generateShowcaseImageFlow',
        inputSchema: GenerateShowcaseImageInputSchema,
        outputSchema: GenerateShowcaseImageOutputSchema,
    },
    async (input) => {
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: `Generate a highly abstract, cinematic, and visually stunning digital art piece that represents the following concept: "${input.summary}". Use a dark, futuristic theme with vibrant accent colors. The image should be iconic and symbolic, not literal.`,
        });

        if (!media.url) {
            throw new Error('Image generation failed to return a data URI.');
        }

        return { imageUrl: media.url };
    }
);
