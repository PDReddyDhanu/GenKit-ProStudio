
"use client";

import { ProjectSubmission, Team, User } from './types';
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
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
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

export function generateTeamsCsv(teams: Team[], users: User[]): string {
    const headers = [
        "Team ID", "Team Name", "Join Code", "Guide Name",
        "Member Name", "Member Email", "Member Roll No", "Member Contact", "Member GitHub", "Member LinkedIn", "Member Role"
    ];

    const rows: string[] = [];
    teams.forEach(team => {
        team.members.forEach(member => {
            const user = users.find(u => u.id === member.id);
            rows.push([
                escapeCsvField(team.id),
                escapeCsvField(team.name),
                escapeCsvField(team.joinCode),
                escapeCsvField(team.guide?.name),
                escapeCsvField(member.name),
                escapeCsvField(member.email),
                escapeCsvField(user?.rollNo),
                escapeCsvField(user?.contactNumber),
                escapeCsvField(user?.github),
                escapeCsvField(user?.linkedin),
                escapeCsvField(member.role),
            ].join(','));
        });
    });

    return [headers.join(','), ...rows].join('\n');
}


export function generateFullDataCsv(projects: ProjectSubmission[], teams: Team[], users: User[]): string {
    const headers = [
        "Project ID", "Project Title", "Team Name", "Team Join Code", "Project Status", "Review Stage", "Total Score",
        "Student Name", "Student Email", "Student Roll No", "Student Contact", "Student Branch", "Student Department", "Student Skills",
        "Idea Index", "Idea Title", "Idea Description", "Idea Abstract", "Idea GitHub", "Idea Status",
        "Score Stage", "Evaluator ID", "Scored Item", "Criteria", "Score", "Max Score", "Comment"
    ];
    
    const rows: string[] = [];

    projects.forEach(p => {
        const team = teams.find(t => t.id === p.teamId);
        if (!team) return;

        const acceptedIdeaId = p.projectIdeas[0]?.id;

        team.members.forEach(member => {
            const user = users.find(u => u.id === member.id);
            if (!user) return;
            
            const studentInfo = [
                escapeCsvField(p.id),
                escapeCsvField(p.projectIdeas[0]?.title),
                escapeCsvField(team.name),
                escapeCsvField(team.joinCode),
                escapeCsvField(p.status),
                escapeCsvField(p.reviewStage),
                escapeCsvField((p.totalScore || 0).toFixed(2)),
                escapeCsvField(user.name),
                escapeCsvField(user.email),
                escapeCsvField(user.rollNo),
                escapeCsvField(user.contactNumber),
                escapeCsvField(user.branch),
                escapeCsvField(user.department),
                escapeCsvField(user.skills.join('; ')),
            ];

            // Add project ideas
            p.projectIdeas.forEach((idea, index) => {
                const ideaStatus = (p.status === 'Approved' || p.status === 'Rejected')
                    ? (idea.id === acceptedIdeaId ? 'Accepted' : 'Discarded')
                    : 'Pending';
                
                const ideaInfo = [
                    ...studentInfo,
                    escapeCsvField(index + 1),
                    escapeCsvField(idea.title),
                    escapeCsvField(idea.description),
                    escapeCsvField(idea.abstractText),
                    escapeCsvField(idea.githubUrl),
                    escapeCsvField(ideaStatus),
                ];
                // Add an entry for just the idea info if no scores
                if (p.scores.length === 0) {
                     rows.push([...ideaInfo, ...Array(6).fill('')].join(','));
                }
            });

             // Add scores
            p.scores.forEach(score => {
                let evaluatedItem = "Team";
                if (score.memberId) {
                    const scoredMember = team.members.find(m => m.id === score.memberId);
                    if (scoredMember?.id !== user.id) return; // Only add scores for the current student row
                    evaluatedItem = "Individual";
                }
                
                const criteria = ALL_RUBRICS.find(c => c.id === score.criteria);
                const scoreInfo = [
                    ...studentInfo,
                    '', '', '', '', '', '', // Empty idea fields for score rows
                    escapeCsvField(score.reviewType),
                    escapeCsvField(score.evaluatorId),
                    escapeCsvField(evaluatedItem),
                    escapeCsvField(criteria?.name),
                    escapeCsvField(score.value),
                    escapeCsvField(criteria?.max),
                    escapeCsvField(score.comment),
                ];
                rows.push(scoreInfo.join(','));
            });

             if (p.scores.length === 0 && p.projectIdeas.length === 0) {
                rows.push([...studentInfo, ...Array(13).fill('')].join(','));
            }
        });
    });

     return [headers.join(','), ...rows].join('\n');
}

export function downloadCsv(csvString: string, filename: string) {
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
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
