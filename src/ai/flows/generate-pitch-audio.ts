'use server';
/**
 * @fileOverview An AI agent that generates an audio voiceover for a pitch script.
 *
 * - generatePitchAudio - A function that handles the audio generation.
 * - GeneratePitchAudioInput - The input type for the function.
 * - GeneratePitchAudioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const GeneratePitchAudioInputSchema = z.object({
  script: z.string().describe('The text script to be converted to speech.'),
});
export type GeneratePitchAudioInput = z.infer<typeof GeneratePitchAudioInputSchema>;

const GeneratePitchAudioOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The generated audio as a data URI. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
export type GeneratePitchAudioOutput = z.infer<typeof GeneratePitchAudioOutputSchema>;


export async function generatePitchAudio(
  input: GeneratePitchAudioInput
): Promise<GeneratePitchAudioOutput> {
  return generatePitchAudioFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generatePitchAudioFlow = ai.defineFlow(
  {
    name: 'generatePitchAudioFlow',
    inputSchema: GeneratePitchAudioInputSchema,
    outputSchema: GeneratePitchAudioOutputSchema,
  },
  async input => {
    if (!input.script.trim()) {
        throw new Error("Input script cannot be empty.");
    }
      
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: input.script,
    });

    if (!media || !media.url) {
      throw new Error('Audio generation failed. No media was returned.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);
