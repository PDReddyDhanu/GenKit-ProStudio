

'use server';
/**
 * @fileOverview An AI agent that generates a comprehensive summary report for a collection of projects.
 *
 * - generateSummaryReport - A function that handles the report generation process.
 * - GenerateSummaryReportInput - The input type for the function.
 * - GenerateSummaryReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { Project, Team } from '@/lib/types';

const GenerateSummaryReportInputSchema = z.object({
  collegeName: z.string(),
  projects: z.array(z.custom<Project>()),
  teams: z.array(z.custom<Team>()),
});
export type GenerateSummaryReportInput = z.infer<typeof GenerateSummaryReportInputSchema>;

const GenerateSummaryReportOutputSchema = z.object({
  report: z.string().describe('A comprehensive project summary report in Markdown format.'),
});
export type GenerateSummaryReportOutput = z.infer<typeof GenerateSummaryReportOutputSchema>;


export async function generateSummaryReport(input: GenerateSummaryReportInput): Promise<GenerateSummaryReportOutput> {
  return generateSummaryReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryReportPrompt',
  input: {schema: z.any()}, // Use z.any() because we are transforming the input before passing it to the prompt.
  output: {schema: GenerateSummaryReportOutputSchema},
  prompt: `You are an AI assistant tasked with generating a comprehensive and engaging summary report for academic projects at a college.
The output must be a single, well-formatted Markdown string.

**College:** {{{collegeName}}}
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

1.  **Executive Summary:** A short, engaging paragraph summarizing the students' work, participation, and overall quality of projects.
2.  **Key Statistics:** A bulleted list with key numbers (e.g., Number of Participants, Number of Teams, Number of Projects).
3.  **Top Projects:** Announce the top 3 projects based on the **Ranked Projects Information** above. For each winner, list their **Rank**, **Team Name**, **Project Name**, and **Final Score**.
4.  **Project Highlights & Trends:** Analyze the submitted projects. Identify 2-3 interesting trends or standout project ideas (even if they didn't win) and briefly describe them. This shows a deeper engagement with the submissions.
5.  **Conclusion:** A concluding paragraph that congratulates all participants for their hard work.

Structure your entire response as a single Markdown document. Use headings, bold text, and lists to make it readable and professional.
`,
});

const generateSummaryReportFlow = ai.defineFlow(
  {
    name: 'generateSummaryReportFlow',
    inputSchema: GenerateSummaryReportInputSchema,
    outputSchema: GenerateSummaryReportOutputSchema,
  },
  async input => {
    // Sort projects by score to find winners and create a simplified object for the prompt
    const rankedProjects = [...input.projects]
        .sort((a, b) => b.averageScore - a.averageScore)
        .map(p => {
            const team = input.teams.find(t => t.id === p.teamId);
            return {
                projectName: p.title,
                teamName: team?.name || "Unknown Team",
                description: p.description,
                score: p.averageScore.toFixed(2),
            };
        });
    
    // Construct the object that the prompt expects
    const promptInput = {
      collegeName: input.collegeName,
      teams: input.teams,
      projects: rankedProjects, // Pass the simplified, sorted array
    };

    const {output} = await prompt(promptInput);
    return output!;
  }
);
