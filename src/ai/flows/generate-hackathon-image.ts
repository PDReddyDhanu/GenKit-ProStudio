
'use server';
/**
 * @fileOverview An AI agent that generates a summary image for a hackathon.
 *
 * - generateHackathonImage - A function that handles the image generation.
 * - GenerateHackathonImageInput - The input type for the function.
 * - GenerateHackathonImageOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateHackathonImageInputSchema = z.object({
  hackathonName: z.string().describe('The name of the hackathon.'),
  collegeName: z.string().describe('The name of the college hosting the event.'),
  teamCount: z.number().describe('The total number of participating teams.'),
});
export type GenerateHackathonImageInput = z.infer<
  typeof GenerateHackathonImageInputSchema
>;

const GenerateHackathonImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      'The data URI of the generated image.'
    ),
});
export type GenerateHackathonImageOutput = z.infer<
  typeof GenerateHackathonImageOutputSchema
>;

export async function generateHackathonImage(
  input: GenerateHackathonImageInput
): Promise<GenerateHackathonImageOutput> {
  return generateHackathonImageFlow(input);
}

const generateHackathonImageFlow = ai.defineFlow(
  {
    name: 'generateHackathonImageFlow',
    inputSchema: GenerateHackathonImageInputSchema,
    outputSchema: GenerateHackathonImageOutputSchema,
  },
  async input => {
    const prompt = `
        Create a vibrant, celebratory, and abstract digital art piece for a college hackathon.
        The image should feel futuristic, innovative, and exciting.
        
        Key elements to incorporate visually and thematically:
        - The energy of collaboration, with "${input.teamCount} teams" participating.
        - The spirit of "${input.collegeName}".
        - The theme of the hackathon: "${input.hackathonName}".

        Style: Abstract, digital art, vibrant colors, glowing elements, cinematic lighting. Avoid literal text unless it's artistically integrated.
    `;

    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: prompt,
    });

    if (!media.url) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return { imageUrl: media.url };
  }
);
