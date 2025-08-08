'use server';
/**
 * @fileOverview An AI agent that provides guidance on hackathons and career development.
 *
 * - fetchGuidanceInfo - A function that provides helpful information based on a user query.
 * - FetchGuidanceInfoInput - The input type for the fetchGuidanceInfo function.
 * - FetchGuidanceInfoOutput - The return type for the fetchGuidanceInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchGuidanceInfoInputSchema = z.object({
  query: z.string().describe('The user\'s question about hackathons or careers.'),
});
export type FetchGuidanceInfoInput = z.infer<typeof FetchGuidanceInfoInputSchema>;

const FetchGuidanceInfoOutputSchema = z.object({
  response: z.string().describe('The helpful, informative response to the user\'s query.'),
});
export type FetchGuidanceInfoOutput = z.infer<typeof FetchGuidanceInfoOutputSchema>;

export async function fetchGuidanceInfo(input: FetchGuidanceInfoInput): Promise<FetchGuidanceInfoOutput> {
  return fetchGuidanceInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guidancePrompt',
  input: {schema: FetchGuidanceInfoInputSchema},
  output: {schema: FetchGuidanceInfoOutputSchema},
  prompt: `You are a friendly and knowledgeable AI career and hackathon coach. Your goal is to provide clear, concise, and encouraging guidance to students.

Answer the following user query: {{{query}}}

Provide a helpful and well-structured response. Use markdown for formatting if it helps (e.g., lists, bold text).`,
  config: {
    temperature: 0.5,
  },
});

const fetchGuidanceInfoFlow = ai.defineFlow(
  {
    name: 'fetchGuidanceInfoFlow',
    inputSchema: FetchGuidanceInfoInputSchema,
    outputSchema: FetchGuidanceInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
