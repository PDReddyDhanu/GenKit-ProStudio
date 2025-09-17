'use server';
/**
 * @fileOverview An AI agent that generates a summary video for a hackathon.
 *
 * - generateHackathonSummaryVideo - A function that handles the video generation.
 * - GenerateHackathonSummaryVideoInput - The input type for the function.
 * - GenerateHackathonSummaryVideoOutput - The return type for the function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import {Readable} from 'stream';

export const GenerateHackathonSummaryVideoInputSchema = z.object({
  hackathonName: z.string().describe('The name of the hackathon.'),
  collegeName: z.string().describe('The name of the college hosting the event.'),
  prizeMoney: z.string().describe('The total prize money.'),
  projectCount: z.number().describe('The total number of submitted projects.'),
  teamCount: z.number().describe('The total number of participating teams.'),
});
export type GenerateHackathonSummaryVideoInput = z.infer<
  typeof GenerateHackathonSummaryVideoInputSchema
>;

export const GenerateHackathonSummaryVideoOutputSchema = z.object({
  videoUrl: z
    .string()
    .describe(
      'The data URI of the generated video in webm format with vp9 codec.'
    ),
});
export type GenerateHackathonSummaryVideoOutput = z.infer<
  typeof GenerateHackathonSummaryVideoOutputSchema
>;

export async function generateHackathonSummaryVideo(
  input: GenerateHackathonSummaryVideoInput
): Promise<GenerateHackathonSummaryVideoOutput> {
  return generateHackathonSummaryVideoFlow(input);
}

const generateHackathonSummaryVideoFlow = ai.defineFlow(
  {
    name: 'generateHackathonSummaryVideoFlow',
    inputSchema: GenerateHackathonSummaryVideoInputSchema,
    outputSchema: GenerateHackathonSummaryVideoOutputSchema,
  },
  async input => {
    const prompt = `
      Create a high-energy, cinematic summary video for a hackathon event.
      The video should be encouraging and celebrate the participation.

      Key information to include visually or conceptually:
      - College Name: ${input.collegeName}
      - Hackathon Name: ${input.hackathonName}
      - Total Projects: ${input.projectCount}
      - Total Teams: ${input.teamCount}
      - Prize Pool: ${input.prizeMoney}

      Video style:
      - Abstract data visualizations, glowing text, and energetic transitions.
      - A futuristic and optimistic tone.
      - Use text overlays to display the key information.
      - Start with a shot that represents the "${input.collegeName}" and its spirit of innovation.
      - Show concepts of teamwork and coding.
      - End with a celebratory shot and the text "Congratulations to all participants!".
    `;

    let {operation} = await ai.generate({
      model: googleAI.model('veo-2.0-generate-001'),
      prompt: prompt,
      config: {
        durationSeconds: 8,
        aspectRatio: '16:9',
      },
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait for the operation to complete
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.checkOperation(operation);
    }

    if (operation.error) {
      throw new Error(
        'Failed to generate video: ' + (operation.error.message || 'Unknown error')
      );
    }

    const video = operation.output?.message?.content.find(p => !!p.media);

    if (!video?.media?.url || video.media.contentType !== 'video/webm') {
      throw new Error('Generated video not found or in unexpected format.');
    }
    
    // The URL from Veo is temporary and needs to be fetched and converted to a data URI.
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }

    const videoDownloadResponse = await fetch(
      `${video.media.url}&key=${apiKey}`
    );

    if (
      !videoDownloadResponse ||
      videoDownloadResponse.status !== 200 ||
      !videoDownloadResponse.body
    ) {
      throw new Error('Failed to download generated video from the temporary URL.');
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64Video = Buffer.from(buffer).toString('base64');
    
    return {
      videoUrl: `data:video/webm;base64,${base64Video}`,
    };
  }
);
