# Changelog

## 0.2.0 — 2026-04-14

### Sound quality

- **Per-partial decay**: Upper harmonics now fade faster than the fundamental, creating a natural warm-over-time evolution instead of static synthetic tones
- **Smooth envelope curves**: Raised-cosine attack (no click) and exponential decay/release
- **Low-pass filter**: Every pack now has a cutoff to roll off harsh highs
- **Singing bowls**: Quieter overall — lower sustain, reduced partial amplitudes, tighter 1600 Hz cutoff
- **Crystal bells**: Warmer — dropped the 5th partial, halved cutoff to 3 kHz, softer attack, faster upper harmonic decay

### New sounds

- **Success sound**: Ascending pentatonic arpeggio (root → 3rd → 5th → octave) per pack, with overlapping notes that ring into a chord
- **Ambient loop**: 30-second seamlessly looping drone per pack — built from root + fifth one octave below, with slow beating and gentle breathing modulation

### Preview

- Updated `preview.html` with 🏆 Success and 🌊 Ambient toggle buttons

## 0.1.0 — 2026-04-14

### Initial release

- 5 sound packs: Singing Bowls, Crystal Bells, Soft Keys, Bamboo, Celeste
- 6 pentatonic tones per pack (one per game button)
- Pure additive synthesis — zero audio dependencies
- WAV output (16-bit PCM, 44.1 kHz, mono)
- CLI with `--pack`, `--output`, `--list` options
- Browser preview page (`preview.html`)
