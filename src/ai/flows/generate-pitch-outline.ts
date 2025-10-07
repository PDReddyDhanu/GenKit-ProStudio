
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
  prompt: `You are a world-class academic presentation coach. Your task is to create a comprehensive and effective presentation outline for a student team based on their project details. The total number of slides should be 9.

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

Then, create 8 more slides for the main presentation, structured for a detailed academic review:
1.  **Problem Statement:** Clearly define the problem the project is addressing. What is the gap or issue?
2.  **Literature Survey:** Summarize existing work, research papers, or similar projects related to this problem.
3.  **Objectives:** List the key, measurable objectives of the project.
4.  **Methodology & Implementation:** Describe the approach, architecture, key algorithms, and the technology stack used in detail.
5.  **Advantages & Disadvantages:** Provide a balanced view of your approach. What are its strengths and potential limitations?
6.  **Results & Future Work:** Explain the results achieved, show demos if applicable, discuss potential impact, and outline the next steps.
7.  **Conclusion:** A summary slide that recaps the problem, solution, and key outcomes.
8.  **Q&A:** An invitation for questions.

For each of these 8 slides, provide a clear title and 3-5 detailed bullet points for the content.

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

Generate the complete 9-slide outline now.`,
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
