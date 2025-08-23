"use server";

import { generateProjectIdea as generateProjectIdeaFlow, GenerateProjectIdeaInput } from '@/ai/flows/generate-project-idea';
import { suggestThemes as suggestThemesFlow, SuggestThemesInput } from '@/ai/flows/ai-project-idea-suggestions';
import { aiCodeReviewForSubmissions as aiCodeReviewFlow, AiCodeReviewForSubmissionsInput } from '@/ai/flows/ai-code-review-for-submissions';
import { generateProjectSummary as generateProjectSummaryFlow, ProjectSummaryInput } from '@/ai/flows/project-summary-for-judges';
import { fetchGuidanceInfo as fetchGuidanceInfoFlow, FetchGuidanceInfoInput } from '@/ai/flows/fetch-guidance-info';

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