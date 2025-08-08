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
  theme: z.string().describe('The theme to generate a project idea for.'),
});
export type GenerateProjectIdeaInput = z.infer<typeof GenerateProjectIdeaInputSchema>;

const GenerateProjectIdeaOutputSchema = z.object({
  idea: z.string().describe('A creative and concise hackathon project idea.'),
});
export type GenerateProjectIdeaOutput = z.infer<typeof GenerateProjectIdeaOutputSchema>;

export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<GenerateProjectIdeaOutput> {
  return generateProjectIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectIdeaPrompt',
  input: {schema: GenerateProjectIdeaInputSchema},
  output: {schema: GenerateProjectIdeaOutputSchema},
  prompt: `Generate a creative and concise hackathon project idea based on the theme: "{{{theme}}}". The idea should be suitable for a 24-48 hour hackathon. Provide a short project name and a one-sentence description. For example: "Project: EchoLearn. Description: An AI-powered app that listens to lectures and generates summarized study notes."`,
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
    return {idea: output!.idea!};
  }
);
