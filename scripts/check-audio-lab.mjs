import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve("dist/m32");
const html = fs.readFileSync(path.join(root, "audio-lab.html"), "utf8");
const js = fs.readFileSync(path.join(root, "audio-lab.js"), "utf8");
const hub = fs.readFileSync(path.join(root, "index.html"), "utf8");
const failures = [];

try {
  new vm.Script(js, { filename: "audio-lab.js" });
} catch (error) {
  failures.push(`JavaScript syntax: ${error.message}`);
}

const htmlIds = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const idSet = new Set(htmlIds);
for (const id of new Set([...js.matchAll(/\$\(["']([^"']+)["']\)/g)].map((match) => match[1]))) {
  if (!idSet.has(id)) failures.push(`missing DOM id referenced by JS: ${id}`);
}
for (const id of htmlIds) {
  if (htmlIds.indexOf(id) !== htmlIds.lastIndexOf(id)) failures.push(`duplicate DOM id: ${id}`);
}

for (const processor of ["gate", "eq", "comp", "fx"]) {
  const controls = [...html.matchAll(new RegExp(`data-processor-toggle=["']${processor}["']`, "g"))];
  if (controls.length < 2) failures.push(`${processor}: signal-line and module bypass controls are required`);
}
for (const pair of [["gateWet", "gateDry"], ["eqWet", "eqDry"], ["compWet", "compDry"]]) {
  if (!pair.every((node) => js.includes(node))) failures.push(`missing fixed bypass pair: ${pair.join(" / ")}`);
}
if (!js.includes("fxEnable") || !js.includes("processorState={gate:true,eq:true,comp:true,fx:true}")) {
  failures.push("independent Reverb bypass or processor state is missing");
}
if ((js.match(/\.disconnect\(\)/g) ?? []).length > 1) {
  failures.push("processor switching must not rebuild the graph with disconnect()");
}
if (!/<details[^>]*id=["']labPractice["'][^>]*hidden/.test(hub)) {
  failures.push("legacy inline Hub simulator is not hidden");
}

if (failures.length) {
  console.error("Audio Lab check failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}
console.log(`Audio Lab check passed (${htmlIds.length} unique controls, 4 independent processor bypasses).`);
