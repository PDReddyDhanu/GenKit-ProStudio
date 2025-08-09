'use server';

/**
 * @fileOverview Project idea generator AI agent.
 *
 * - generateProjectIdea - A function that handles the project idea generation process.
 * - GenerateProjectIdeaInput - The input type for the generateProjectIdea function.
 * - GenerateProjectIdeaOutput - The return type for the generateProjectIdea function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectIdeaInputSchema = z.object({
  theme: z.string().describe('A user-provided interest or theme to generate a project idea for.'),
});
export type GenerateProjectIdeaInput = z.infer<typeof GenerateProjectIdeaInputSchema>;

const GenerateProjectIdeaOutputSchema = z.object({
  idea: z.string().describe('A creative and concise hackathon project idea with a title and description.'),
});
export type GenerateProjectIdeaOutput = z.infer<typeof GenerateProjectIdeaOutputSchema>;

export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<GenerateProjectIdeaOutput> {
  return generateProjectIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectIdeaPrompt',
  input: {schema: GenerateProjectIdeaInputSchema},
  output: {schema: GenerateProjectIdeaOutputSchema},
  prompt: `Generate a creative and concise hackathon project idea based on the user's interest: "{{{theme}}}". The idea should be suitable for a 24-48 hour hackathon. Provide a short project name and a one-sentence description. For example, if the user interest is "animal conservation", you might suggest: "Project: WildTrack. Description: An app that uses citizen-submitted photos to track and map local wildlife populations."`,
  config: {
    temperature: 0.8,
    maxOutputTokens: 100,
  },
});

const generateProjectIdeaFlow = ai.defineFlow(
  {
    name: 'generateProjectIdeaFlow',
    inputSchema: GenerateProjectIdeaInputSchema,
    outputSchema: GenerateProjectIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // The output from the prompt is already the structured object we need.
    return output!;
  }
);
