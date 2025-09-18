
'use server';
/**
 * @fileOverview An AI agent that triages student support tickets.
 *
 * - triageSupportTicket - A function that categorizes a ticket and suggests a response.
 * - TriageSupportTicketInput - The input type for the function.
 * - TriageSupportTicketOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TriageSupportTicketInputSchema = z.object({
  subject: z.string().describe('The subject line of the support ticket.'),
  question: z.string().describe('The full question or issue submitted by the student.'),
  studentName: z.string().describe('The name of the student submitting the ticket.'),
});
export type TriageSupportTicketInput = z.infer<typeof TriageSupportTicketInputSchema>;

const TriageSupportTicketOutputSchema = z.object({
  category: z.enum(['Technical Issue', 'Rule Clarification', 'Team Dispute', 'Scoring Question', 'General Inquiry'])
    .describe('The best category for this ticket.'),
  priority: z.enum(['Low', 'Medium', 'High'])
    .describe("The urgency of the ticket. 'Team Dispute' or 'Technical Issue' blocking submission should be High."),
  suggestedResponse: z.string()
    .describe('A polite, helpful, and templated first response to the student. It should acknowledge their question and let them know an admin will look into it. Address the student by name.'),
});
export type TriageSupportTicketOutput = z.infer<typeof TriageSupportTicketOutputSchema>;

export async function triageSupportTicket(input: TriageSupportTicketInput): Promise<TriageSupportTicketOutput> {
  return triageSupportTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'triageSupportTicketPrompt',
  input: {schema: TriageSupportTicketInputSchema},
  output: {schema: TriageSupportTicketOutputSchema},
  prompt: `You are an AI assistant for a hackathon platform called HackSprint. Your job is to triage support tickets from students.

Analyze the following ticket and determine its category and priority. Then, craft a suggested first response for the admin to send.

**Ticket Details:**
- **From:** {{{studentName}}}
- **Subject:** {{{subject}}}
- **Question:** {{{question}}}

**Categorization Rules:**
- **Technical Issue:** Problems with the website, submission errors, login issues, AI features not working.
- **Rule Clarification:** Questions about hackathon rules, deadlines, or judging criteria.
- **Team Dispute:** Inter-personal problems within a team. These are always HIGH priority.
- **Scoring Question:** Questions or disputes about how a project was scored.
- **General Inquiry:** Anything that doesn't fit into the other categories.

Based on this, provide the category, priority, and a suggested response in the required JSON format. The response should be empathetic and reassuring.`,
});

const triageSupportTicketFlow = ai.defineFlow(
  {
    name: 'triageSupportTicketFlow',
    inputSchema: TriageSupportTicketInputSchema,
    outputSchema: TriageSupportTicketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
