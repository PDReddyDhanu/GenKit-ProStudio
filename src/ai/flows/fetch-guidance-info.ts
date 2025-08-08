
'use server';

/**
 * @fileOverview An AI agent that fetches real-time guidance information.
 *
 * - fetchGuidanceInfo - A function that fetches information about hackathons, news, jobs, or internships.
 * - FetchGuidanceInfoInput - The input type for the fetchGuidanceInfo function.
 * - FetchGuidanceInfoOutput - The return type for the fetchGuidanceInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { search } from '@genkit-ai/googleai';

// Define the schema for a single search result item
const GuidanceInfoSchema = z.object({
    title: z.string().describe('The title of the item.'),
    link: z.string().describe('The direct URL to the item.'),
    snippet: z.string().describe('A brief summary or snippet of the item.'),
});
export type GuidanceInfo = z.infer<typeof GuidanceInfoSchema>;

// Define the input schema for the flow
const FetchGuidanceInfoInputSchema = z.object({
  query: z.string().describe('The user\'s search query.'),
  category: z.enum(['hackathons', 'tech_news', 'jobs', 'internships']).describe('The category of information to fetch.'),
});
export type FetchGuidanceInfoInput = z.infer<typeof FetchGuidanceInfoInputSchema>;

// Define the output schema for the flow
const FetchGuidanceInfoOutputSchema = z.object({
  results: z.array(GuidanceInfoSchema).describe('A list of fetched guidance items.'),
});
export type FetchGuidanceInfoOutput = z.infer<typeof FetchGuidanceInfoOutputSchema>;

// Define the search tool
const webSearch = ai.defineTool(
    {
        name: 'webSearch',
        description: 'Performs a web search for the given query and returns a list of relevant results.',
        inputSchema: z.object({
            query: z.string()
        }),
        outputSchema: z.any(),
    },
    async (input) => {
        return await search(input.query);
    }
);

// Define the main prompt for the AI
const prompt = ai.definePrompt({
  name: 'guidancePrompt',
  input: { schema: FetchGuidanceInfoInputSchema },
  output: { schema: FetchGuidanceInfoOutputSchema },
  tools: [webSearch],
  prompt: `You are a helpful assistant that provides users with real-time information about hackathons, tech news, jobs, and internships.
  
  Based on the user's query and selected category, perform a web search to find the most relevant and up-to-date information.
  
  Category: {{{category}}}
  User Query: {{{query}}}
  
  Return a list of at least 5 results. For each result, provide a clear title, a direct link, and a concise snippet.
  `,
});

// Define the flow
const fetchGuidanceInfoFlow = ai.defineFlow(
  {
    name: 'fetchGuidanceInfoFlow',
    inputSchema: FetchGuidanceInfoInputSchema,
    outputSchema: FetchGuidanceInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

// Export a wrapper function to be called from server actions
export async function fetchGuidanceInfo(input: FetchGuidanceInfoInput): Promise<FetchGuidanceInfoOutput> {
  return fetchGuidanceInfoFlow(input);
}
