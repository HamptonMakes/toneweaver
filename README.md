# 🎶 toneweaver

Generate tonal sound packs for games and apps. Pure math — no samples, no dependencies, no DAW required.

Toneweaver creates sets of musically harmonious tones built on **pentatonic scales**, so any combination of sounds played together feels pleasant and relaxing. Each "pack" is a different timbre recipe — singing bowls, crystal bells, bamboo, and more.

**Two ways to use it:**
- **Offline** — Generate WAV files with the CLI
- **Runtime** — Synthesize tones live in React Native or web apps (zero audio assets!)

## Runtime Player (React Native / Web)

```bash
npm install toneweaver react-native-audio-api
```

```typescript
import { AudioContext } from 'react-native-audio-api';
import { TonePlayer } from 'toneweaver/player';
import { singingBowls } from 'toneweaver/packs';

const ctx = new AudioContext();
const player = new TonePlayer(ctx, singingBowls);

player.playNote(0);       // play button tone (0–5)
player.playSuccess();     // ascending win arpeggio
player.startAmbient();    // background drone (looping)
player.stopAmbient();     // fade out drone
player.setPack(celeste);  // switch packs instantly
player.setVolume(0.5);    // master volume
```

No audio files needed — sounds are synthesized from the pack recipe in real time.

## CLI / Offline Generation

```bash
npm install
npx ts-node src/index.ts
```

This generates all sound packs as WAV files in `./output/`.

## Sound Packs

| Pack | Vibe | Root | Duration |
|------|------|------|----------|
| `singing-bowls` | Warm, meditative, shimmering | C3 | 3.5s |
| `crystal-bells` | Bright, glassy, sparkling | G4 | 2.5s |
| `soft-keys` | Warm, piano-like, gentle | C4 | 2.0s |
| `bamboo` | Hollow, woody, quick | D4 | 1.0s |
| `celeste` | Delicate, music-box sparkle | C5 | 1.8s |

Each pack produces **6 tones** (pentatonic scale + octave), a **success arpeggio**, and a **30s ambient loop**.

## Usage

```bash
# Generate all packs
npx ts-node src/index.ts

# Generate a specific pack
npx ts-node src/index.ts --pack singing-bowls

# Custom output directory
npx ts-node src/index.ts --output ./sounds

# List available packs
npx ts-node src/index.ts --list
```

## How It Works

Each tone is synthesized from scratch using additive synthesis:

1. **Partials** — Multiple sine waves at specific frequency ratios define the timbre (e.g., singing bowls use non-integer ratios like 2.71× for metallic warmth)
2. **Detuning** — Pairs of slightly detuned partials create a natural beating/shimmer effect
3. **Envelope** — ADSR (Attack/Decay/Sustain/Release) shapes how the tone rises and fades
4. **Scale** — Notes are spaced on a pentatonic scale so any combination sounds musical

## Creating Your Own Pack

Add a new `PackDefinition` in `src/packs.ts`:

```typescript
export const myPack: PackDefinition = {
  name: "my-pack",
  description: "A custom sound pack",
  rootNote: NOTES.C4,   // Base frequency
  duration: 2.0,         // Seconds
  envelope: {
    attack: 0.005,       // Quick onset
    decay: 0.2,          // Fade to sustain
    sustain: 0.3,        // Held level
    release: 1.5,        // Final fade
  },
  partials: [
    { ratio: 1.0, amplitude: 1.0 },            // Fundamental
    { ratio: 2.0, amplitude: 0.5 },             // 2nd harmonic
    { ratio: 2.0, amplitude: 0.3, detune: 4 },  // Beating pair
  ],
};
```

Then add it to `ALL_PACKS` and regenerate.

## Output Format

- **Format**: WAV (PCM, 16-bit, 44.1 kHz, mono)
- **Files**: `output/<pack-name>/0.wav` through `5.wav`
- Ready to use in any game engine or audio framework

## License

MIT
