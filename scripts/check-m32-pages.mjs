import fs from "node:fs";
import path from "node:path";

const root = path.resolve("dist/m32");
const hubPath = path.join(root, "index.html");

if (!fs.existsSync(hubPath)) {
  console.error(`M32 Hub is missing: ${hubPath}`);
  process.exit(1);
}

const missing = [];
const checkedLinks = new Set();

function localLinks(html) {
  return [...html.matchAll(/\b(?:href|src)\s*=\s*["']([^"'#?]+)["']/gi)]
    .map((match) => match[1])
    .filter((link) => !/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(link));
}

for (const htmlName of fs.readdirSync(root).filter((name) => name.endsWith(".html"))) {
  const htmlPath = path.join(root, htmlName);
  const html = fs.readFileSync(htmlPath, "utf8");
  if (!/<title[\s>][\s\S]*?<\/title>/i.test(html)) {
    missing.push(`${htmlName}: missing <title>`);
  }
  for (const link of [...new Set(localLinks(html))]) {
    const decoded = decodeURIComponent(link);
    const candidate = decoded.startsWith("/MIACC_Score/")
      ? path.resolve("dist", decoded.slice("/MIACC_Score/".length))
      : path.resolve(path.dirname(htmlPath), decoded);
    checkedLinks.add(`${htmlName} -> ${link}`);
    if (!candidate.startsWith(path.resolve("dist") + path.sep) && candidate !== path.resolve("dist")) {
      missing.push(`${htmlName}: ${link} (escapes dist)`);
    } else if (!fs.existsSync(candidate)) {
      missing.push(`${htmlName}: ${link}`);
    }
  }
}

const required = [
  "index.html",
  "audio-lab.html",
  "audio-lab.js",
  "MIACC_M32_11AM_UserRouting_V2.scn",
  "MIDAS_M32_Church_Appendix_V1.html",
  "MIDAS_M32_Church_Manual_V1.html",
  "MIDAS_M32_FX_Setup_Guide_Church_V2.html",
];
for (const name of required) {
  const filePath = path.join(root, name);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size === 0) {
    missing.push(`${name}: required file is missing or empty`);
  }
}

if (missing.length) {
  console.error("Broken M32 Pages links:");
  missing.forEach((link) => console.error(`- ${link}`));
  process.exit(1);
}

console.log(`M32 Pages link check passed (${checkedLinks.size} local links across deployed HTML files).`);
