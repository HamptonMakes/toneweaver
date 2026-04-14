import * as path from "path";
import { generatePack, SAMPLE_RATE } from "./generator";
import { generateSuccess, generateAmbient } from "./extras";
import { writeWav } from "./wav";
import { ALL_PACKS } from "./packs";
import { pentatonicScale } from "./scales";
import { PackDefinition } from "./types";

function usage() {
  console.log(`
toneweaver — generate tonal sound packs

Usage:
  npx ts-node src/index.ts [options]

Options:
  --list              List available sound packs
  --pack <name>       Generate a specific pack (default: all)
  --output <dir>      Output directory (default: ./output)
  --help              Show this help
`);
}

function listPacks() {
  console.log("\nAvailable sound packs:\n");
  for (const pack of ALL_PACKS) {
    console.log(`  ${pack.name.padEnd(18)} ${pack.description}`);
  }
  console.log();
}

function generateAndWrite(pack: PackDefinition, outputDir: string) {
  const packDir = path.join(outputDir, pack.name);
  const tones = generatePack(pack);

  console.log(`\n🎵 ${pack.name}`);
  console.log(`   ${pack.description}`);

  // Button tones
  for (const tone of tones) {
    const fileName = `${tone.noteIndex}.wav`;
    const filePath = path.join(packDir, fileName);
    writeWav(filePath, tone.samples, SAMPLE_RATE);

    const freqStr = tone.frequency.toFixed(1).padStart(7);
    const durStr = (tone.samples.length / SAMPLE_RATE).toFixed(1);
    console.log(`   ${fileName}  ${freqStr} Hz  ${durStr}s`);
  }

  // Success sound
  const success = generateSuccess(pack);
  const successPath = path.join(packDir, "success.wav");
  writeWav(successPath, success, SAMPLE_RATE);
  console.log(
    `   success.wav        ${(success.length / SAMPLE_RATE).toFixed(1)}s`
  );

  // Ambient loop
  const ambient = generateAmbient(pack, 30);
  const ambientPath = path.join(packDir, "ambient.wav");
  writeWav(ambientPath, ambient, SAMPLE_RATE);
  console.log(
    `   ambient.wav        ${(ambient.length / SAMPLE_RATE).toFixed(1)}s  (loop)`
  );
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    usage();
    return;
  }

  if (args.includes("--list")) {
    listPacks();
    return;
  }

  const outputIdx = args.indexOf("--output");
  const outputDir = outputIdx >= 0 ? args[outputIdx + 1] : "./output";

  const packIdx = args.indexOf("--pack");
  const packName = packIdx >= 0 ? args[packIdx + 1] : null;

  let packs = ALL_PACKS;
  if (packName) {
    const found = ALL_PACKS.find((p) => p.name === packName);
    if (!found) {
      console.error(`Unknown pack: "${packName}"`);
      listPacks();
      process.exit(1);
    }
    packs = [found];
  }

  console.log("🎶 toneweaver");

  for (const pack of packs) {
    generateAndWrite(pack, outputDir);
  }

  console.log(`\n✅ Done! Files written to ${outputDir}/`);
}

main();
