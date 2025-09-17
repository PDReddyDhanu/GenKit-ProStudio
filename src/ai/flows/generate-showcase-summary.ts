'use server';

/**
 * @fileOverview An AI agent that generates a very short, punchy summary for a project showcase.
 *
 * - generateShowcaseSummary - A function that handles the summary generation.
 * - GenerateShowcaseSummaryInput - The input type for the generateShowcaseSummary function.
 * - GenerateShowcaseSummaryOutput - The return type for the generateShowcaseSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateShowcaseSummaryInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
});
export type GenerateShowcaseSummaryInput = z.infer<typeof GenerateShowcaseSummaryInputSchema>;

export const GenerateShowcaseSummaryOutputSchema = z.object({
  summary: z.string().describe('A very short, punchy, one-line summary of the project for a cinematic showcase.'),
});
export type GenerateShowcaseSummaryOutput = z.infer<typeof GenerateShowcaseSummaryOutputSchema>;

export async function generateShowcaseSummary(input: GenerateShowcaseSummaryInput): Promise<GenerateShowcaseSummaryOutput> {
  return generateShowcaseSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateShowcaseSummaryPrompt',
  input: {schema: GenerateShowcaseSummaryInputSchema},
  output: {schema: GenerateShowcaseSummaryOutputSchema},
  prompt: `You are an expert at creating taglines. Based on the project name and description, generate a very short, punchy, one-line summary (less than 10 words). This will be used in a fast-paced, cinematic showcase.

Project Name: {{{projectName}}}
Project Description: {{{projectDescription}}}

Generate the tagline:`,
    config: {
        temperature: 0.9,
    }
});

const generateShowcaseSummaryFlow = ai.defineFlow(
  {
    name: 'generateShowcaseSummaryFlow',
    inputSchema: GenerateShowcaseSummaryInputSchema,
    outputSchema: GenerateShowcaseSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
