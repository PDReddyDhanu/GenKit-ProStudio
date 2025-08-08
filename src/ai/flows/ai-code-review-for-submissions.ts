'use server';
/**
 * @fileOverview An AI code review agent for submitted projects.
 *
 * - aiCodeReviewForSubmissions - A function that handles the code review process.
 * - AiCodeReviewForSubmissionsInput - The input type for the aiCodeReviewForSubmissions function.
 * - AiCodeReviewForSubmissionsOutput - The return type for the aiCodeReviewForSubmissions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiCodeReviewForSubmissionsInputSchema = z.object({
  githubUrl: z.string().describe('The URL of the GitHub repository to review.'),
});
export type AiCodeReviewForSubmissionsInput = z.infer<typeof AiCodeReviewForSubmissionsInputSchema>;

const AiCodeReviewForSubmissionsOutputSchema = z.object({
  review: z.string().describe('The AI-generated code review.'),
});
export type AiCodeReviewForSubmissionsOutput = z.infer<typeof AiCodeReviewForSubmissionsOutputSchema>;

export async function aiCodeReviewForSubmissions(input: AiCodeReviewForSubmissionsInput): Promise<AiCodeReviewForSubmissionsOutput> {
  return aiCodeReviewForSubmissionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCodeReviewForSubmissionsPrompt',
  input: {schema: AiCodeReviewForSubmissionsInputSchema},
  output: {schema: AiCodeReviewForSubmissionsOutputSchema},
  prompt: `You are an AI code review assistant. You are provided with a GitHub repository URL.
  You will review the code in the repository and provide a summary of the code quality, identify potential issues, and provide recommendations for improvement.
  \n  GitHub URL: {{{githubUrl}}}`,
});

const aiCodeReviewForSubmissionsFlow = ai.defineFlow(
  {
    name: 'aiCodeReviewForSubmissionsFlow',
    inputSchema: AiCodeReviewForSubmissionsInputSchema,
    outputSchema: AiCodeReviewForSubmissionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
