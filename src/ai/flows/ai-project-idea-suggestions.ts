
// This file is machine-generated - edit at your own risk.
'use server';
/**
 * @fileOverview An AI agent that provides theme suggestions to guide academic project idea generation.
 *
 * - suggestThemes - A function that suggests themes for project idea generation.
 * - SuggestThemesInput - The input type for the suggestThemes function.
 * - SuggestThemesOutput - The return type for the suggestThemes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestThemesInputSchema = z.string().describe('The user query to help generate project themes.');
export type SuggestThemesInput = z.infer<typeof SuggestThemesInputSchema>;

const SuggestThemesOutputSchema = z.object({
  themes: z.array(z.string()).describe('A list of suggested themes based on the user query.'),
});
export type SuggestThemesOutput = z.infer<typeof SuggestThemesOutputSchema>;

export async function suggestThemes(query: SuggestThemesInput): Promise<SuggestThemesOutput> {
  return suggestThemesFlow(query);
}

const prompt = ai.definePrompt({
  name: 'suggestThemesPrompt',
  input: {schema: SuggestThemesInputSchema},
  output: {schema: SuggestThemesOutputSchema},
  prompt: `You are an expert at generating academic project themes. Your task is to generate three creative and relevant project themes based on the user's input. The themes must be closely related to the provided query. For example, if the user provides "Renewable Energy", you could suggest "Smart Grid Optimization", "Solar Panel Efficiency Modeling", and "AI for Wind Turbine Maintenance".

User's Interest: {{{$input}}}

Respond in the required JSON format.`,
});

const suggestThemesFlow = ai.defineFlow(
  {
    name: 'suggestThemesFlow',
    inputSchema: SuggestThemesInputSchema,
    outputSchema: SuggestThemesOutputSchema,
  },
  async query => {
    const {output} = await prompt(query);
    return output!;
  }
);
