const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const phoneFiles = [
  "domivault-expenses-1080x1920.png",
  "domivault-reports-1080x1920.png",
  "domivault-warranties-1080x1920.png",
];

const phoneDirs = [
  "C:/Users/Liv/Documents/Codex/2026-06-16/review-this-repo-lvcg-mernaichatbot-https/work/homey/play_store_assets/phone",
];

const tabletFiles = [
  "domivault-dashboard",
  "domivault-expenses",
  "domivault-reports",
  "domivault-warranties",
];

const tabletDirs = [
  {
    dir: "C:/Users/Liv/Documents/Codex/2026-06-16/review-this-repo-lvcg-mernaichatbot-https/work/homey/play_store_assets/tablet_7in",
    suffix: "1200x1920",
    overlay: `
<svg width="1200" height="1920" xmlns="http://www.w3.org/2000/svg">
  <rect x="202" y="585" width="845" height="58" fill="#fcfdff"/>
  <text x="205" y="628" font-family="Arial, Helvetica, sans-serif" font-size="43" font-weight="700" fill="#020617">DomiVault User</text>
</svg>`,
  },
  {
    dir: "C:/Users/Liv/Documents/Codex/2026-06-16/review-this-repo-lvcg-mernaichatbot-https/work/homey/play_store_assets/tablet_10in",
    suffix: "1600x2560",
    overlay: `
<svg width="1600" height="2560" xmlns="http://www.w3.org/2000/svg">
  <rect x="248" y="755" width="1145" height="84" fill="#fcfdff"/>
  <text x="266" y="816" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#020617">DomiVault User</text>
</svg>`,
  },
];

const phoneOverlay = `
<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
  <rect x="136" y="607" width="808" height="62" fill="#fcfdff"/>
  <text x="140" y="648" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#020617">DomiVault User</text>
</svg>`;

async function redact(filePath, overlay) {
  const input = await sharp(filePath).png().toBuffer();
  await sharp(input)
    .composite([{ input: Buffer.from(overlay), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toFile(filePath);

  const metadata = await sharp(filePath).metadata();
  const megabytes = (fs.statSync(filePath).size / 1024 / 1024).toFixed(2);
  console.log(`${filePath} | ${metadata.width}x${metadata.height} | ${megabytes} MB`);
}

(async () => {
  for (const dir of phoneDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of phoneFiles) {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        await redact(filePath, phoneOverlay);
      }
    }
  }

  for (const config of tabletDirs) {
    if (!fs.existsSync(config.dir)) continue;
    for (const prefix of tabletFiles) {
      const filePath = path.join(config.dir, `${prefix}-${config.suffix}.png`);
      if (fs.existsSync(filePath)) {
        await redact(filePath, config.overlay);
      }
    }
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
