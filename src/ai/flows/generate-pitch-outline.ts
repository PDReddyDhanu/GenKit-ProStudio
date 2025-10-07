
'use server';
/**
 * @fileOverview An AI agent that generates a presentation outline for a student project.
 *
 * - generatePitchOutline - A function that handles the pitch outline generation process.
 * - GeneratePitchOutlineInput - The input type for the generatePitchOutline function.
 * - GeneratePitchOutlineOutput - The return type for the generatePitchOutline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePitchOutlineInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  projectDescription: z.string().describe('The description of the project.'),
  aiCodeReview: z.string().optional().describe('An optional AI-generated code review for additional context.'),
  course: z.string().optional().describe('The course or department for the project.'),
  guideName: z.string().optional().describe('The name of the faculty guide.'),
  teamMembers: z.array(z.string()).optional().describe('A list of team member names.'),
});
export type GeneratePitchOutlineInput = z.infer<typeof GeneratePitchOutlineInputSchema>;

const SlideSchema = z.object({
    title: z.string().describe("The title of the presentation slide."),
    content: z.string().describe("The key talking points or content for the slide, formatted as markdown bullet points.")
});

const GeneratePitchOutlineOutputSchema = z.object({
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
  prompt: `You are a world-class academic presentation coach. Your task is to create a concise and effective presentation outline for a student team based on their project details. The total number of slides should be 6.

**First slide MUST be an introductory slide with the following format:**
- **Title:** "Project Introduction"
- **Content:**
    - Project Title: [Your Project Title]
    - Course: [Course Name / Department]
    - Under the guidance of: [Guide’s Name]
    - Team Members:
        - [Member 1]
        - [Member 2]
        - [Member 3]
        ...

Then, create 5 more slides for the main presentation, structured for a typical academic review:
1.  **Background & Objectives:** Briefly explain the problem area and list the project's key objectives.
2.  **Methodology & Implementation:** Describe the approach, key features, and the technology stack used.
3.  **Results & Future Work:** Explain the results achieved, potential impact, and what the next steps for the project would be.
4.  **Conclusion:** A summary slide.
5.  **Q&A:** An invitation for questions.

For each of these 5 slides, provide a title and 2-4 bullet points for the content.

**Project Details:**
- Project Name: {{{projectName}}}
- Project Description: {{{projectDescription}}}
{{#if course}}- Course/Department: {{{course}}}{{/if}}
{{#if guideName}}- Guide: {{{guideName}}}{{/if}}
{{#if teamMembers}}
- Team Members:
{{#each teamMembers}}
    - {{{this}}}
{{/each}}
{{/if}}
{{#if aiCodeReview}}
**AI Code Review Analysis (for context):** {{{aiCodeReview}}}
{{/if}}

Generate the complete 6-slide outline now.`,
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
