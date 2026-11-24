// Re-creates the optimized portraits and credential badges in public/images from Mariam's original files.
// Usage: node scripts/optimize-images.mjs <dir-with-originals>
// Originals (not committed) were downloaded from her existing Wix site:
//   portrait_home.jpg   <- 7b24a0_f336156f8a5c40b7bb9fca0f98da721a~mv2_d_3264_2448_s_4_2.jpg (3264x2448)
//   portrait_about.jpg  <- 7b24a0_5425b6326245462fbbc3d02e2d1e431d~mv2_d_3000_2000_s_2.jpg   (3000x2000)
//   badge_cpcc.png      <- 7b24a0_29fb2bc446a445c794cc5d6c4aa99115~mv2.png                    (600x600)
//   badge_pcc.jpg       <- 7b24a0_90f1f96b99eb42ceba52296b334e0a16~mv2.jpg                    (189x128)
import sharp from 'sharp';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const src = path.resolve(process.argv[2] ?? './originals');
const out = path.resolve('public/images');
await mkdir(out, { recursive: true });

const jobs = [
  // 4:5 crops that keep her face, the table and the horizon / the columns on both sides.
  { in: 'portrait_home.jpg', out: 'mariam-hero.jpg', crop: { left: 1088, top: 0, width: 1958, height: 2448 }, size: [1200, 1500], fmt: 'jpeg' },
  { in: 'portrait_about.jpg', out: 'mariam-about.jpg', crop: { left: 500, top: 0, width: 1600, height: 2000 }, size: [1000, 1250], fmt: 'jpeg' },
  { in: 'badge_cpcc.png', out: 'badge-cpcc.png', size: [240, 240], fmt: 'png' },
  { in: 'badge_pcc.jpg', out: 'badge-pcc.jpg', fmt: 'jpeg' },
];

for (const j of jobs) {
  let img = sharp(path.join(src, j.in)).rotate();
  if (j.crop) img = img.extract(j.crop);
  if (j.size) img = img.resize(j.size[0], j.size[1], { fit: 'cover' });
  img = j.fmt === 'png' ? img.png({ palette: true, quality: 85, compressionLevel: 9 }) : img.jpeg({ quality: 80, mozjpeg: true });
  const info = await img.toFile(path.join(out, j.out));
  console.log(j.out.padEnd(20), `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(1)} KB`);
}
