'use server';

/**
 * @fileOverview A detailed project idea generator AI agent.
 *
 * - generateDetailedProjectIdea - A function that handles the project idea generation process.
 * - GenerateDetailedProjectIdeaInput - The input type for the function.
 * - GenerateDetailedProjectIdeaOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDetailedProjectIdeaInputSchema = z.object({
  theme: z.string().describe('A user-provided interest or theme to generate a project idea for.'),
});
export type GenerateDetailedProjectIdeaInput = z.infer<typeof GenerateDetailedProjectIdeaInputSchema>;

const GenerateDetailedProjectIdeaOutputSchema = z.object({
  title: z.string().describe('A creative and professional project title.'),
  description: z.string().describe('A concise, one-sentence summary of the project.'),
  abstract: z.string().describe('A detailed abstract of the project, approximately 200-400 words long, explaining the problem, proposed solution, and methodology.'),
  keywords: z.string().describe('A comma-separated list of 5-7 relevant keywords for the project.'),
});
export type GenerateDetailedProjectIdeaOutput = z.infer<typeof GenerateDetailedProjectIdeaOutputSchema>;

export async function generateDetailedProjectIdea(input: GenerateDetailedProjectIdeaInput): Promise<GenerateDetailedProjectIdeaOutput> {
  return generateDetailedProjectIdeaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDetailedProjectIdeaPrompt',
  input: {schema: GenerateDetailedProjectIdeaInputSchema},
  output: {schema: GenerateDetailedProjectIdeaOutputSchema},
  prompt: `You are an expert academic project advisor. Your task is to generate a complete and detailed project proposal based on a user-provided theme.

The output must be in the required JSON format and should include:
1.  **title:** A creative yet professional title for the project.
2.  **description:** A single, compelling sentence that summarizes the project's core idea.
3.  **abstract:** A detailed abstract of around 200-400 words. It should clearly define the problem statement, the proposed solution, key features, and the methodology or technologies to be used.
4.  **keywords:** A comma-separated string of 5 to 7 relevant technical and domain-specific keywords.

**User's Theme:** "{{{theme}}}"

Generate the project proposal now.`,
  config: {
    temperature: 0.9,
  },
});

const generateDetailedProjectIdeaFlow = ai.defineFlow(
  {
    name: 'generateDetailedProjectIdeaFlow',
    inputSchema: GenerateDetailedProjectIdeaInputSchema,
    outputSchema: GenerateDetailedProjectIdeaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
