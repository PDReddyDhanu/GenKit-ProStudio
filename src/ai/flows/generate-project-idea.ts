
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
  idea: z.string().describe('A creative and concise academic project idea with a title and description.'),
});
export type GenerateProjectIdeaOutput = z.infer<typeof GenerateProjectIdeaOutputSchema>;

export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<GenerateProjectIdeaOutput> {
  return generateProjectIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectIdeaPrompt',
  input: {schema: GenerateProjectIdeaInputSchema},
  output: {schema: GenerateProjectIdeaOutputSchema},
  prompt: `Generate a creative and concise academic project idea based on the user's interest: "{{{theme}}}". The idea should be suitable for a semester-long project. Provide a short project title and a one-sentence description. For example, if the user interest is "computer vision for agriculture", you might suggest: "Project: AgroVision. Description: An AI-powered system to detect and classify crop diseases from drone imagery."`,
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
    return output!;
  }
);
