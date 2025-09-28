

'use server';
/**
 * @fileOverview An AI agent for matching students with potential teammates for academic projects.
 *
 * - findTeammateMatches - A function that finds compatible teammates.
 * - FindTeammateMatchesInput - The input type for the function.
 * - FindTeammateMatchesOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(z.string()).optional(),
  workStyle: z.array(z.string()).optional(),
});

const FindTeammateMatchesInputSchema = z.object({
  currentUser: UserProfileSchema.describe('The user for whom we are finding matches.'),
  otherUsers: z.array(UserProfileSchema).describe('A list of other users available to be matched.'),
});
export type FindTeammateMatchesInput = z.infer<typeof FindTeammateMatchesInputSchema>;

const MatchSchema = z.object({
    user: UserProfileSchema.describe("The matched user's profile."),
    compatibilityScore: z.number().min(0).max(1).describe('A score from 0 to 1 indicating the compatibility.'),
    reasoning: z.string().describe('A brief, one-sentence explanation for why they are a good match.'),
});

const FindTeammateMatchesOutputSchema = z.object({
  matches: z.array(MatchSchema).describe('A list of the top 3-5 most compatible teammates, sorted by compatibilityScore descending.'),
});
export type FindTeammateMatchesOutput = z.infer<typeof FindTeammateMatchesOutputSchema>;


export async function findTeammateMatches(input: FindTeammateMatchesInput): Promise<FindTeammateMatchesOutput> {
  return findTeammateMatchesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findTeammateMatchesPrompt',
  input: {schema: FindTeammateMatchesInputSchema},
  output: {schema: FindTeammateMatchesOutputSchema},
  prompt: `You are an expert at building high-performing student project teams. Your task is to analyze a student's profile and suggest the best possible teammates from a list of available students.

Your analysis should be based on two main factors:
1.  **Skill Complementarity:** Find users who have skills that the current user lacks, and vice-versa. A good team has a mix of frontend, backend, design, and documentation skills.
2.  **Work Style Harmony:** Find users with similar or compatible work styles. For example, two 'late-night coders' might work well together. A 'strong presenter' is a great match for a team that needs to sell their idea.

**Current User Profile:**
- Name: {{{currentUser.name}}}
- Skills: {{#if currentUser.skills}}{{#each currentUser.skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
- Work Style: {{#if currentUser.workStyle}}{{#each currentUser.workStyle}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

**Available Students:**
{{#each otherUsers}}
- **User ID:** {{{id}}}
  - **Name:** {{{name}}}
  - **Skills:** {{#if skills}}{{#each skills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
  - **Work Style:** {{#if workStyle}}{{#each workStyle}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
{{/each}}

Analyze the list and provide the top 3-5 best matches. For each match, provide a compatibility score (0.0 to 1.0) and a concise, single-sentence reason for the match. Return your response in the required JSON format.`,
});

const findTeammateMatchesFlow = ai.defineFlow(
  {
    name: 'findTeammateMatchesFlow',
    inputSchema: FindTeammateMatchesInputSchema,
    outputSchema: FindTeammateMatchesOutputSchema,
  },
  async input => {
    // If there are no other users, return an empty list.
    if (input.otherUsers.length === 0) {
      return { matches: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
