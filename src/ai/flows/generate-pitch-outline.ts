'use server';
/**
 * @fileOverview An AI agent that generates a presentation outline for a hackathon project.
 *
 * - generatePitchOutline - A function that handles the pitch outline generation process.
 * - GeneratePitchOutlineInput - The input type for the generatePitchOutline function.
 * - GeneratePitchOutlineOutput - The return type for the generatePitchOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GeneratePitchOutlineInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
  aiCodeReview: z.string().optional().describe('An optional AI-generated code review for additional context.'),
});
export type GeneratePitchOutlineInput = z.infer<typeof GeneratePitchOutlineInputSchema>;

const SlideSchema = z.object({
    title: z.string().describe("The title of the presentation slide."),
    content: z.string().describe("The key talking points or content for the slide, formatted as markdown bullet points.")
});

export const GeneratePitchOutlineOutputSchema = z.object({
  slides: z.array(SlideSchema).describe('An array of slide objects representing the presentation outline.'),
});
export type GeneratePitchOutlineOutput = z.infer<typeof GeneratePitchOutlineOutputSchema>;


export async function generatePitchOutline(input: GeneratePitchOutlineInput): Promise<GeneratePitchOutlineOutput> {
  return generatePitchOutlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePitchOutlinePrompt',
  input: {schema: GeneratePitchOutlineInputSchema},
  output: {schema: GeneratePitchOutlineOutputSchema},
  prompt: `You are a world-class pitch coach for hackathons. Your task is to create a concise and effective 5-slide presentation outline for a team based on their project details.

The presentation should be structured as follows:
1.  **Introduction:** Project Name and a catchy one-liner.
2.  **The Problem:** Clearly state the problem the project solves.
3.  **Our Solution:** Describe the project, its key features, and the technology stack used.
4.  **Impact & Future:** Explain the potential impact and what the next steps for the project would be.
5.  **Thank You & Q&A:** A concluding slide.

For each slide, provide a title and 2-4 bullet points for the content.

**Project Name:** {{{projectName}}}
**Project Description:** {{{projectDescription}}}
{{#if aiCodeReview}}
**AI Code Review Analysis (for context):** {{{aiCodeReview}}}
{{/if}}

Generate the 5-slide outline now.`,
});

const generatePitchOutlineFlow = ai.defineFlow(
  {
    name: 'generatePitchOutlineFlow',
    inputSchema: GeneratePitchOutlineInputSchema,
    outputSchema: GeneratePitchOutlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
