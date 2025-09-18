'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/ai-project-idea-suggestions.ts';
import '@/ai/flows/ai-code-review-for-submissions.ts';
import '@/ai/flows/project-summary-for-judges.ts';
import '@/ai/flows/generate-project-idea.ts';
import '@/ai/flows/fetch-guidance-info.ts';
import '@/ai/flows/generate-project-image.ts';
import '@/ai/flows/generate-pitch-outline.ts';
import '@/ai/flows/find-teammate-matches.ts';
import '@/ai/flows/generate-hackathon-summary-report.ts';
import '@/ai/flows/triage-support-ticket.ts';
import '@/ai/flows/generate-support-response.ts';
