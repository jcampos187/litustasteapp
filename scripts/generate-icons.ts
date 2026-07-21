/* eslint-disable no-console */
import sharp from "sharp";
import path from "path";

const SIZES = [192, 512];
const SVG_PATH = path.resolve(__dirname, "../public/icon.svg");
const OUT_DIR = path.resolve(__dirname, "../public");

async function main() {
  console.log("📦 Generating PWA icons from icon.svg...\n");

  for (const size of SIZES) {
    const outPath = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(SVG_PATH)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`  ✅ icon-${size}.png (${size}x${size})`);
  }

  console.log("\n✨ Done! All icons generated in public/");
}

main().catch((err) => {
  console.error("Icon generation failed:", err);
  process.exit(1);
});
