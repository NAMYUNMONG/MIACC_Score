import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const requiredFiles = ["index.html", "score.html", "m32/index.html"];
const failures = [];

for (const relativePath of requiredFiles) {
  const target = path.join(dist, relativePath);
  if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
    failures.push(`missing or empty: ${relativePath}`);
  }
}

const indexPath = path.join(dist, "index.html");
if (fs.existsSync(indexPath)) {
  const html = fs.readFileSync(indexPath, "utf8");
  for (const label of ["MIACC Worship Tools", "description"]) {
    if (!html.includes(label)) failures.push(`root metadata missing: ${label}`);
  }

  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const href = match[1];
    if (!href.startsWith("/MIACC_Score/")) continue;
    const relativePath = href.slice("/MIACC_Score/".length);
    const target = relativePath.endsWith("/")
      ? path.join(dist, relativePath, "index.html")
      : path.join(dist, relativePath);
    if (!fs.existsSync(target)) failures.push(`broken root asset: ${href}`);
  }
}

if (failures.length) {
  console.error("Main portal check failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Main portal check passed (root, Score, and M32 entry points)." );
