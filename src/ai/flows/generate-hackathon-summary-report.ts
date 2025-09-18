
'use server';
/**
 * @fileOverview An AI agent that generates a comprehensive summary report for a hackathon.
 *
 * - generateHackathonReport - A function that handles the report generation process.
 * - GenerateHackathonReportInput - The input type for the function.
 * - GenerateHackathonReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Project, Team, Hackathon } from '@/lib/types';

const GenerateHackathonReportInputSchema = z.object({
  hackathon: z.custom<Hackathon>(),
  projects: z.array(z.custom<Project>()),
  teams: z.array(z.custom<Team>()),
});
export type GenerateHackathonReportInput = z.infer<typeof GenerateHackathonReportInputSchema>;

const GenerateHackathonReportOutputSchema = z.object({
  report: z.string().describe('A comprehensive hackathon summary report in Markdown format.'),
});
export type GenerateHackathonReportOutput = z.infer<typeof GenerateHackathonReportOutputSchema>;


export async function generateHackathonReport(input: GenerateHackathonReportInput): Promise<GenerateHackathonReportOutput> {
  return generateHackathonReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHackathonReportPrompt',
  input: {schema: z.any()}, // Use z.any() because we are transforming the input before passing it to the prompt.
  output: {schema: GenerateHackathonReportOutputSchema},
  prompt: `You are an AI assistant tasked with generating a comprehensive and engaging summary report for a college hackathon.
The output must be a single, well-formatted Markdown string.

**Hackathon Details:**
- Name: {{{hackathon.name}}}
- Prize Money: {{{hackathon.prizeMoney}}}
- Deadline: {{{hackathon.deadline}}}
- Total Teams: {{{teams.length}}}
- Total Projects Submitted: {{{projects.length}}}

**Ranked Projects Information:**
{{#each projects}}
- **Project:** {{projectName}}
  - **Team:** {{teamName}}
  - **Description:** "{{description}}"
  - **Score:** {{score}}
{{/each}}


**Your Task:**
Generate a markdown report that includes the following sections:

1.  **Executive Summary:** A short, engaging paragraph summarizing the event's energy, participation, and overall success.
2.  **Key Statistics:** A bulleted list with key numbers (e.g., Number of Participants, Number of Teams, Number of Projects).
3.  **Winning Teams:** Announce the top 3 winners based on the **Ranked Projects Information** above. For each winner, list their **Rank**, **Team Name**, **Project Name**, and **Final Score**.
4.  **Project Highlights & Trends:** Analyze the submitted projects. Identify 2-3 interesting trends or standout project ideas (even if they didn't win) and briefly describe them. This shows a deeper engagement with the submissions.
5.  **Conclusion:** A concluding paragraph that thanks all participants and looks forward to the next event.

Structure your entire response as a single Markdown document. Use headings, bold text, and lists to make it readable and professional.
`,
});

const generateHackathonReportFlow = ai.defineFlow(
  {
    name: 'generateHackathonReportFlow',
    inputSchema: GenerateHackathonReportInputSchema,
    outputSchema: GenerateHackathonReportOutputSchema,
  },
  async input => {
    // Sort projects by score to find winners and create a simplified object for the prompt
    const rankedProjects = [...input.projects]
        .sort((a, b) => b.averageScore - a.averageScore)
        .map(p => {
            const team = input.teams.find(t => t.id === p.teamId);
            return {
                projectName: p.name,
                teamName: team?.name || "Unknown Team",
                description: p.description,
                score: p.averageScore.toFixed(2),
            };
        });
    
    // Construct the object that the prompt expects
    const promptInput = {
      hackathon: input.hackathon,
      teams: input.teams,
      projects: rankedProjects, // Pass the simplified, sorted array
    };

    const {output} = await prompt(promptInput);
    return output!;
  }
);
