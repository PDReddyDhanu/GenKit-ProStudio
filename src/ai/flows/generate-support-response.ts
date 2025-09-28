

'use server';
/**
 * @fileOverview An AI agent that suggests a detailed resolution for a support ticket.
 *
 * - generateSupportResponse - A function that generates a helpful response for an admin/faculty.
 * - GenerateSupportResponseInput - The input type for the function.
 * - GenerateSupportResponseOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSupportResponseInputSchema = z.object({
  subject: z.string().describe('The subject line of the support ticket.'),
  question: z.string().describe('The full question or issue submitted by the student.'),
  category: z.string().describe('The AI-pre-triaged category of the ticket.'),
});
export type GenerateSupportResponseInput = z.infer<typeof GenerateSupportResponseInputSchema>;

const GenerateSupportResponseOutputSchema = z.object({
  resolution: z.string().describe('A comprehensive, helpful, and step-by-step response to resolve the student\'s issue. It should be written in Markdown format.'),
});
export type GenerateSupportResponseOutput = z.infer<typeof GenerateSupportResponseOutputSchema>;

export async function generateSupportResponse(input: GenerateSupportResponseInput): Promise<GenerateSupportResponseOutput> {
  return generateSupportResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSupportResponsePrompt',
  input: {schema: GenerateSupportResponseInputSchema},
  output: {schema: GenerateSupportResponseOutputSchema},
  prompt: `You are an expert support agent for a college project management platform called GenKit ProStudio. Your task is to provide a complete and helpful resolution to a student's support ticket. The faculty member or admin will use your response to help the student.

The response should be empathetic, clear, and if possible, provide step-by-step instructions.

**Ticket Details:**
- **Category:** {{{category}}}
- **Subject:** {{{subject}}}
- **Question:** {{{question}}}

**Your Task:**
Craft a detailed resolution for this issue. Use Markdown for formatting (e.g., lists, bold text, code blocks) to make the response easy to read. If the question is about a team dispute, provide impartial advice on communication and compromise. If it's a technical issue, suggest common troubleshooting steps.`,
});

const generateSupportResponseFlow = ai.defineFlow(
  {
    name: 'generateSupportResponseFlow',
    inputSchema: GenerateSupportResponseInputSchema,
    outputSchema: GenerateSupportResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
