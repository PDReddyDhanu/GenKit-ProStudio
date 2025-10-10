

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
import { Project, Team, ReviewType } from '@/lib/types';
import { 
    INTERNAL_STAGE_1_RUBRIC, INDIVIDUAL_STAGE_1_RUBRIC,
    INTERNAL_STAGE_2_RUBRIC, INDIVIDUAL_STAGE_2_RUBRIC,
    INTERNAL_FINAL_RUBRIC, INDIVIDUAL_INTERNAL_FINAL_RUBRIC,
    EXTERNAL_FINAL_RUBRIC, INDIVIDUAL_EXTERNAL_FINAL_RUBRIC
} from '@/lib/constants';


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

const calculateStageScore = (project: Project, team: Team, reviewType: ReviewType, teamRubric: any[], individualRubric: any[]) => {
    const stageScores = project.scores.filter(s => s.reviewType === reviewType);
    if (stageScores.length === 0) return 0;
    
    const evaluatorScores: Record<string, { teamScore: number, individualScores: Record<string, number>, individualCount: number }> = {};

    stageScores.forEach(score => {
        if (!evaluatorScores[score.evaluatorId]) {
            evaluatorScores[score.evaluatorId] = { teamScore: 0, individualScores: {}, individualCount: 0 };
        }

        if (score.memberId) {
             if (!evaluatorScores[score.evaluatorId].individualScores[score.memberId]) {
                evaluatorScores[score.evaluatorId].individualScores[score.memberId] = 0;
            }
            evaluatorScores[score.evaluatorId].individualScores[score.memberId] += score.value;
        } else {
             evaluatorScores[score.evaluatorId].teamScore += score.value;
        }
    });
    
    let totalObtained = 0;
    const evaluatorCount = Object.keys(evaluatorScores).length;

    for (const evalId in evaluatorScores) {
        const { teamScore, individualScores } = evaluatorScores[evalId];
        let totalIndividual = 0;
        const membersScored = Object.keys(individualScores).length;
        
        for (const memberId in individualScores) {
            totalIndividual += individualScores[memberId];
        }
        
        const avgIndividualScore = membersScored > 0 ? (totalIndividual / membersScored) : 0;
        
        totalObtained += teamScore + (avgIndividualScore * team.members.length);
    }

    return evaluatorCount > 0 ? totalObtained / evaluatorCount : 0;
};

const calculateFinalScore = (project: Project, team: Team) => {
    const stageData = [
        { reviewType: 'InternalStage1' as ReviewType, teamRubric: INTERNAL_STAGE_1_RUBRIC, indRubric: INDIVIDUAL_STAGE_1_RUBRIC },
        { reviewType: 'InternalStage2' as ReviewType, teamRubric: INTERNAL_STAGE_2_RUBRIC, indRubric: INDIVIDUAL_STAGE_2_RUBRIC },
        { reviewType: 'InternalFinal' as ReviewType, teamRubric: INTERNAL_FINAL_RUBRIC, indRubric: INDIVIDUAL_INTERNAL_FINAL_RUBRIC },
        { reviewType: 'ExternalFinal' as ReviewType, teamRubric: EXTERNAL_FINAL_RUBRIC, indRubric: INDIVIDUAL_EXTERNAL_FINAL_RUBRIC },
    ];

    return stageData.reduce((acc, stage) => {
        return acc + calculateStageScore(project, team, stage.reviewType, stage.teamRubric, stage.indRubric);
    }, 0);
};

const generateSummaryReportFlow = ai.defineFlow(
  {
    name: 'generateSummaryReportFlow',
    inputSchema: GenerateSummaryReportInputSchema,
    outputSchema: GenerateSummaryReportOutputSchema,
  },
  async input => {
    
    const rankedProjects = input.projects
        .map(p => {
            const team = input.teams.find(t => t.id === p.teamId);
            if (!team) return null;
            const primaryIdea = p.projectIdeas[0];
            const finalScore = calculateFinalScore(p, team);
            return {
                projectName: primaryIdea?.title || 'Untitled Project',
                teamName: team?.name || "Unknown Team",
                description: primaryIdea?.description || 'No description available.',
                score: finalScore,
            };
        })
        .filter(p => p !== null)
        .sort((a, b) => b!.score - a!.score)
        .map(p => ({
            ...p,
            score: p!.score.toFixed(2),
        }));
    
    const promptInput = {
      collegeName: input.collegeName,
      teams: input.teams,
      projects: rankedProjects,
    };

    const {output} = await prompt(promptInput);
    return output!;
  }
);

