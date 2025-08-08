'use server';
/**
 * @fileOverview A project summary AI agent for judges.
 *
 * - generateProjectSummary - A function that handles the project summary generation process.
 * - ProjectSummaryInput - The input type for the generateProjectSummary function.
 * - ProjectSummaryOutput - The return type for the generateProjectSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProjectSummaryInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
  githubUrl: z.string().describe('The GitHub URL of the project.'),
});
export type ProjectSummaryInput = z.infer<typeof ProjectSummaryInputSchema>;

const ProjectSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the project.'),
});
export type ProjectSummaryOutput = z.infer<typeof ProjectSummaryOutputSchema>;

export async function generateProjectSummary(input: ProjectSummaryInput): Promise<ProjectSummaryOutput> {
  return generateProjectSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'projectSummaryPrompt',
  input: {schema: ProjectSummaryInputSchema},
  output: {schema: ProjectSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes hackathon projects for judges.

  Given the project name, description, and GitHub URL, generate a concise summary that highlights the project's core idea and key features.

  Project Name: {{{projectName}}}
  Project Description: {{{projectDescription}}}
  GitHub URL: {{{githubUrl}}}

  Summary: `,
});

const generateProjectSummaryFlow = ai.defineFlow(
  {
    name: 'generateProjectSummaryFlow',
    inputSchema: ProjectSummaryInputSchema,
    outputSchema: ProjectSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
