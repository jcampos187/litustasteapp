import sharp from "sharp";
import { readdirSync } from "fs";
import { join, extname } from "path";
import { renameSync } from "fs";
import { existsSync, mkdirSync } from "fs";

const PUBLIC = join(import.meta.dirname, "..", "public");
const ORIGINALS = join(PUBLIC, "originals");

// Ensure originals backup folder exists
if (!existsSync(ORIGINALS)) {
  mkdirSync(ORIGINALS, { recursive: true });
}

const files = readdirSync(PUBLIC).filter(
  (f) => f.endsWith(".jpeg") || f.endsWith(".jpg") || f.endsWith(".png"),
);

async function optimize() {
  for (const file of files) {
    const src = join(PUBLIC, file);
    // Back up original
    renameSync(src, join(ORIGINALS, file));
    console.log(`📦 Backed up: ${file}`);

    const ext = extname(file).toLowerCase();
    const isPng = ext === ".png";

    const img = sharp(join(ORIGINALS, file));
    const metadata = await img.metadata();
    const width = metadata.width ?? 1200;

    // Determine target width — max 600px for carousel
    const targetWidth = Math.min(width, 600);

    // Build sharp pipeline
    let pipeline = img
      .resize(targetWidth, undefined, { fit: "inside", withoutEnlargement: true })
      .withMetadata({ orientation: metadata.orientation });

    // Output as WebP (smaller + modern)
    const outName = file.replace(/\.(jpeg|jpg|png)$/i, ".webp");
    const outPath = join(PUBLIC, outName);

    if (isPng) {
      pipeline = pipeline.webp({ quality: 80, effort: 6 });
    } else {
      pipeline = pipeline.webp({ quality: 80, effort: 6 });
    }

    await pipeline.toFile(outPath);
    const outStats = await sharp(outPath).metadata();
    const origSize = metadata.size ?? 0;
    const newSize = outStats.size ?? 0;
    console.log(
      `✅ ${file} → ${outName}  (${width}px → ${targetWidth}px, ${(origSize / 1024).toFixed(0)}K → ${(newSize / 1024).toFixed(0)}K, ${((1 - newSize / origSize) * 100).toFixed(0)}% smaller)`,
    );

    // Also output a small placeholder blur-up version
    const placeholder = await sharp(join(ORIGINALS, file))
      .resize(20, undefined, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 20, effort: 6 })
      .toBuffer();

    const phPath = join(PUBLIC, file.replace(/\.(jpeg|jpg|png)$/i, "-blur.webp"));
    await sharp(placeholder).toFile(phPath);
    console.log(`  └─ Blur placeholder: ${(placeholder.length / 1024).toFixed(1)}K`);
  }
  console.log("\n✨ All done! Images optimized as WebP in /public");
}

optimize().catch(console.error);
