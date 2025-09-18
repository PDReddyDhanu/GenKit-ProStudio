
"use server";

import { generateProjectIdea as generateProjectIdeaFlow, GenerateProjectIdeaInput } from '@/ai/flows/generate-project-idea';
import { suggestThemes as suggestThemesFlow, SuggestThemesInput } from '@/ai/flows/ai-project-idea-suggestions';
import { aiCodeReviewForSubmissions as aiCodeReviewFlow, AiCodeReviewForSubmissionsInput } from '@/ai/flows/ai-code-review-for-submissions';
import { generateProjectSummary as generateProjectSummaryFlow, ProjectSummaryInput } from '@/ai/flows/project-summary-for-judges';
import { fetchGuidanceInfo as fetchGuidanceInfoFlow, FetchGuidanceInfoInput } from '@/ai/flows/fetch-guidance-info';
import { generateProjectImage as generateProjectImageFlow, GenerateProjectImageInput } from '@/ai/flows/generate-project-image';
import { generatePitchOutline as generatePitchOutlineFlow, GeneratePitchOutlineInput, GeneratePitchOutlineOutput } from '@/ai/flows/generate-pitch-outline';
import { findTeammateMatches as findTeammateMatchesFlow, FindTeammateMatchesInput, FindTeammateMatchesOutput } from '@/ai/flows/find-teammate-matches';
import { generateHackathonReport as generateHackathonReportFlow, GenerateHackathonReportInput } from '@/ai/flows/generate-hackathon-summary-report';
import { triageSupportTicket as triageSupportTicketFlow, TriageSupportTicketInput, TriageSupportTicketOutput } from '@/ai/flows/triage-support-ticket';
import { generateSupportResponse as generateSupportResponseFlow, GenerateSupportResponseInput, GenerateSupportResponseOutput } from '@/ai/flows/generate-support-response';


// AI Related Actions
export async function generateProjectIdea(input: GenerateProjectIdeaInput): Promise<string> {
    try {
        const result = await generateProjectIdeaFlow(input);
        return result.idea;
    } catch (error) {
        console.error("Error generating project idea:", error);
        return "Failed to generate an idea. Please try again.";
    }
}

export async function suggestThemes(query: SuggestThemesInput): Promise<string[]> {
    try {
        const result = await suggestThemesFlow(query);
        return result.themes;
    } catch (error) {
        console.error("Error suggesting themes:", error);
        return [];
    }
}

export async function getAiCodeReview(input: AiCodeReviewForSubmissionsInput): Promise<string> {
    try {
        const result = await aiCodeReviewFlow(input);
        return result.review;
    } catch (error) {
        console.error("Error getting AI code review:", error);
        return "Failed to get AI code review. Please try again.";
    }
}

export async function getAiProjectSummary(input: ProjectSummaryInput): Promise<string> {
    try {
        const result = await generateProjectSummaryFlow(input);
        return result.summary;
    } catch (error) {
        console.error("Error getting AI project summary:", error);
        return "Failed to get AI project summary. Please try again.";
    }
}

export async function getGuidance(input: FetchGuidanceInfoInput): Promise<string> {
    try {
        const result = await fetchGuidanceInfoFlow(input);
        return result.response;
    } catch (error) {
        console.error("Error fetching guidance:", error);
        return "Sorry, I couldn't fetch guidance at this time. Please try again later.";
    }
}

export async function generateProjectImageAction(input: GenerateProjectImageInput): Promise<string | null> {
    try {
        const result = await generateProjectImageFlow(input);
        return result.imageUrl;
    } catch (error) {
        console.error("Error generating project image:", error);
        return null;
    }
}

export async function generatePitchOutline(input: GeneratePitchOutlineInput): Promise<GeneratePitchOutlineOutput | null> {
    try {
        return await generatePitchOutlineFlow(input);
    } catch (error) {
        console.error("Error generating pitch outline:", error);
        return null;
    }
}

export async function findTeammateMatches(input: FindTeammateMatchesInput): Promise<FindTeammateMatchesOutput> {
    try {
        return await findTeammateMatchesFlow(input);
    } catch (error) {
        console.error("Error finding teammate matches:", error);
        return { matches: [] };
    }
}

export async function generateHackathonReport(input: GenerateHackathonReportInput): Promise<string | null> {
    try {
        const result = await generateHackathonReportFlow(input);
        return result.report;
    } catch (error) {
        console.error("Error generating hackathon report:", error);
        return "Failed to generate report. Please try again.";
    }
}

export async function triageSupportTicket(input: TriageSupportTicketInput): Promise<TriageSupportTicketOutput | null> {
    try {
        return await triageSupportTicketFlow(input);
    } catch (error) {
        console.error("Error triaging support ticket:", error);
        return null;
    }
}

export async function generateSupportResponse(input: GenerateSupportResponseInput): Promise<GenerateSupportResponseOutput | null> {
    try {
        return await generateSupportResponseFlow(input);
    } catch (error) {
        console.error("Error generating support response:", error);
        return null;
    }
}
