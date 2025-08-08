// This file is machine-generated - edit at your own risk.
'use server';
/**
 * @fileOverview An AI agent that provides theme suggestions to guide project idea generation.
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
  prompt: `You are a helpful assistant that suggests themes for hackathon project ideas. 
Given the user's query, suggest three relevant themes. For example, if the user provides "Animal forest", you could suggest "Wildlife Conservation Tech", "Interactive Nature Experiences", and "Gamified Environmental Education".

Query: {{{$input}}}

Respond in JSON format.
Themes:`, // Ensure response is in JSON format
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
