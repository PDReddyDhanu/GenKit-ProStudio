
"use client";

import { ProjectSubmission, Team } from './types';
import { 
    INTERNAL_STAGE_1_RUBRIC, INDIVIDUAL_STAGE_1_RUBRIC,
    INTERNAL_STAGE_2_RUBRIC, INDIVIDUAL_STAGE_2_RUBRIC,
    INTERNAL_FINAL_RUBRIC, INDIVIDUAL_INTERNAL_FINAL_RUBRIC,
    EXTERNAL_FINAL_RUBRIC, INDIVIDUAL_EXTERNAL_FINAL_RUBRIC
} from './constants';

type RubricItem = { id: string; name: string; max: number; description: string };

const ALL_RUBRICS = [
    ...INTERNAL_STAGE_1_RUBRIC, ...INDIVIDUAL_STAGE_1_RUBRIC,
    ...INTERNAL_STAGE_2_RUBRIC, ...INDIVIDUAL_STAGE_2_RUBRIC,
    ...INTERNAL_FINAL_RUBRIC, ...INDIVIDUAL_INTERNAL_FINAL_RUBRIC,
    ...EXTERNAL_FINAL_RUBRIC, ...INDIVIDUAL_EXTERNAL_FINAL_RUBRIC,
];

const STAGE_RUBRICS = {
    InternalStage1: { team: INTERNAL_STAGE_1_RUBRIC, individual: INDIVIDUAL_STAGE_1_RUBRIC },
    InternalStage2: { team: INTERNAL_STAGE_2_RUBRIC, individual: INDIVIDUAL_STAGE_2_RUBRIC },
    InternalFinal: { team: INTERNAL_FINAL_RUBRIC, individual: INDIVIDUAL_INTERNAL_FINAL_RUBRIC },
    ExternalFinal: { team: EXTERNAL_FINAL_RUBRIC, individual: INDIVIDUAL_EXTERNAL_FINAL_RUBRIC },
};

function escapeCsvField(field: any): string {
    if (field === null || field === undefined) {
        return '';
    }
    const stringField = String(field);
    if (stringField.includes(',')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
}

export function generateScoresCsv(projects: ProjectSubmission[], teams: Team[], internalOnly = false): string {
    const headers = [
        "Project ID", "Project Name", "Team Name", "Evaluation Stage", 
        "Evaluator ID", "Evaluated Item", "Evaluated Item ID",
        "Criteria ID", "Criteria Name", "Score", "Max Score", "Comment"
    ];

    const rows = projects.flatMap(p => {
        const team = teams.find(t => t.id === p.teamId);
        if (!team) return [];

        const validStages: (keyof typeof STAGE_RUBRICS)[] = internalOnly
            ? ['InternalStage1', 'InternalStage2', 'InternalFinal']
            : ['InternalStage1', 'InternalStage2', 'InternalFinal', 'ExternalFinal'];
        
        return p.scores
            .filter(score => validStages.includes(score.reviewType))
            .map(score => {
                const criteria = ALL_RUBRICS.find(c => c.id === score.criteria);
                let evaluatedItem = "Team";
                let evaluatedItemId = team.name;

                if (score.memberId) {
                    const member = team.members.find(m => m.id === score.memberId);
                    evaluatedItem = "Individual";
                    evaluatedItemId = member ? member.name : score.memberId;
                }
                
                return [
                    escapeCsvField(p.id),
                    escapeCsvField(p.projectIdeas[0]?.title),
                    escapeCsvField(team.name),
                    escapeCsvField(score.reviewType),
                    escapeCsvField(score.evaluatorId),
                    escapeCsvField(evaluatedItem),
                    escapeCsvField(evaluatedItemId),
                    escapeCsvField(score.criteria),
                    escapeCsvField(criteria?.name),
                    escapeCsvField(score.value),
                    escapeCsvField(criteria?.max),
                    escapeCsvField(score.comment),
                ].join(',');
            });
    });

    return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(csvString: string, filename: string) {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
