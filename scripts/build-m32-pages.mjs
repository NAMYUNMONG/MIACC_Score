import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const srcDir = path.resolve("m32-pages-assets");
const outDir = path.resolve("public/m32");
const incompleteManifest = path.join(srcDir, "incomplete-assets.json");

if (!fs.existsSync(srcDir)) {
  console.error(`M32 asset source directory is missing: ${srcDir}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const incomplete = fs.existsSync(incompleteManifest)
  ? JSON.parse(fs.readFileSync(incompleteManifest, "utf8"))
  : {};
const names = fs.readdirSync(srcDir);
const assets = new Map();

function addAsset(key, part) {
  const parts = assets.get(key) ?? [];
  parts.push(part);
  assets.set(key, parts);
}

for (const name of names) {
  if (name.endsWith(".gz.b64")) {
    addAsset(name, { name, single: true, index: 0, suffix: "" });
    continue;
  }

  const match = name.match(/^(.*\.gz\.b64)\.(\d{3})([a-z]*)$/i);
  if (match) {
    addAsset(match[1], {
      name,
      single: false,
      index: Number(match[2]),
      suffix: match[3].toLowerCase(),
    });
  }
}

function sortAndValidateParts(key, parts) {
  if (parts.some((part) => part.single) && parts.length !== 1) {
    throw new Error("single and chunked forms cannot be mixed");
  }
  if (parts[0].single) return parts;

  parts.sort(
    (a, b) => a.index - b.index || a.suffix.localeCompare(b.suffix, "en"),
  );

  const indexes = [...new Set(parts.map((part) => part.index))];
  indexes.forEach((index, position) => {
    if (index !== position) {
      throw new Error(
        `missing numeric chunk: expected ${String(position).padStart(3, "0")}`,
      );
    }

    const suffixes = parts
      .filter((part) => part.index === index)
      .map((part) => part.suffix);
    if (suffixes.length === 1 && suffixes[0] === "") return;
    if (suffixes.some((suffix) => suffix === "")) {
      throw new Error(`chunk ${String(index).padStart(3, "0")} mixes split and unsplit forms`);
    }
    suffixes.forEach((suffix, suffixIndex) => {
      const expected = String.fromCharCode(97 + suffixIndex);
      if (suffix !== expected) {
        throw new Error(
          `missing suffix for chunk ${String(index).padStart(3, "0")}: expected ${expected}`,
        );
      }
    });
  });
  return parts;
}

function decodeBase64(parts) {
  const base64 = parts
    .map((part) => fs.readFileSync(path.join(srcDir, part.name), "utf8"))
    .join("")
    .replace(/\s/g, "");
  if (!base64 || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error("invalid base64 payload");
  }
  return Buffer.from(base64, "base64");
}

function validateOutput(target, data) {
  if (data.length === 0) throw new Error("decoded file is empty");
  if (target.endsWith(".html")) {
    const html = data.toString("utf8");
    if (!/(?:<!doctype\s+html|<html[\s>])/i.test(html)) {
      throw new Error("decoded HTML has no doctype or html element");
    }
    if (!/<title[\s>][\s\S]*?<\/title>/i.test(html)) {
      throw new Error("decoded HTML has no title");
    }
  }
  if (target.endsWith(".scn")) {
    const scene = data.toString("utf8");
    if (!scene.trim() || !scene.startsWith("#")) {
      throw new Error("decoded SCN is empty or not a text scene");
    }
  }
}

const failures = [];
const skipped = [];

for (const [key, unsortedParts] of [...assets.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  const target = key.replace(/\.gz\.b64$/, "");
  let parts = unsortedParts;
  try {
    parts = sortAndValidateParts(key, unsortedParts);
    const data = zlib.gunzipSync(decodeBase64(parts));
    validateOutput(target, data);
    fs.writeFileSync(path.join(outDir, target), data);
    console.log(
      `rebuilt public/m32/${target} from ${parts.map((part) => part.name.slice(key.length + 1) || "single").join(", ")}`,
    );
  } catch (error) {
    const reason = incomplete[target];
    const order = parts
      .map((part) => part.name.slice(key.length + 1) || "single")
      .join(", ");
    const message = `${target} [${order}]: ${error.message}`;
    const outputPath = path.join(outDir, target);
    if (fs.existsSync(outputPath)) fs.rmSync(outputPath);
    if (reason) {
      skipped.push(`${message} (${reason})`);
      console.warn(`INCOMPLETE ASSET - ${message}; ${reason}`);
    } else {
      failures.push(message);
      console.error(`ASSET ERROR - ${message}`);
    }
  }
}

console.log(`M32 assets: ${assets.size - skipped.length - failures.length} rebuilt, ${skipped.length} incomplete, ${failures.length} failed.`);
if (failures.length) process.exit(1);
