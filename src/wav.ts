import * as fs from "fs";
import * as path from "path";

/**
 * Write a mono 16-bit PCM WAV file from floating-point samples (-1 to 1).
 */
export function writeWav(
  filePath: string,
  samples: Float64Array,
  sampleRate: number
): void {
  const numSamples = samples.length;
  const bytesPerSample = 2; // 16-bit
  const dataSize = numSamples * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write("WAVE", 8);

  // fmt sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // sub-chunk size (PCM)
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * bytesPerSample, 28); // byte rate
  buffer.writeUInt16LE(bytesPerSample, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // PCM samples
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const int16 = Math.round(clamped * 32767);
    buffer.writeInt16LE(int16, 44 + i * bytesPerSample);
  }

  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, buffer);
}
