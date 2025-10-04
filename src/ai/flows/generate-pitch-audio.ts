
'use server';
/**
 * @fileOverview An AI agent that generates an audio voiceover for a pitch outline.
 *
 * - generatePitchAudio - A function that handles the audio generation process.
 * - GeneratePitchAudioInput - The input type for the function.
 * - GeneratePitchAudioOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { WaveFile } from 'wavefile';

const GeneratePitchAudioInputSchema = z.object({
  pitchText: z.string().describe('The full text content of the presentation slides to be converted to speech.'),
});
export type GeneratePitchAudioInput = z.infer<typeof GeneratePitchAudioInputSchema>;

const GeneratePitchAudioOutputSchema = z.object({
  audioUrl: z.string().describe('The data URI of the generated WAV audio file.'),
});
export type GeneratePitchAudioOutput = z.infer<typeof GeneratePitchAudioOutputSchema>;

export async function generatePitchAudio(input: GeneratePitchAudioInput): Promise<GeneratePitchAudioOutput> {
  return generatePitchAudioFlow(input);
}

// Helper function to convert raw PCM audio buffer to a valid WAV file buffer
async function toWav(pcmData: Buffer): Promise<Buffer> {
    const wav = new WaveFile();
    // The TTS model provides 1-channel, 24000Hz, 16-bit PCM audio.
    wav.fromScratch(1, 24000, '16', pcmData);
    return wav.toBuffer();
}

const generatePitchAudioFlow = ai.defineFlow(
  {
    name: 'generatePitchAudioFlow',
    inputSchema: GeneratePitchAudioInputSchema,
    outputSchema: GeneratePitchAudioOutputSchema,
  },
  async ({ pitchText }) => {
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A standard, clear voice
          },
        },
      },
      prompt: pitchText,
    });

    if (!media?.url) {
      throw new Error('No audio media was returned from the TTS model.');
    }

    // The media URL is a data URI with base64-encoded raw PCM data.
    const base64Pcm = media.url.substring(media.url.indexOf(',') + 1);
    const pcmBuffer = Buffer.from(base64Pcm, 'base64');
    
    // Convert the raw PCM to a proper WAV file format.
    const wavBuffer = await toWav(pcmBuffer);

    // Return the WAV file as a data URI.
    const audioUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

    return { audioUrl };
  }
);
