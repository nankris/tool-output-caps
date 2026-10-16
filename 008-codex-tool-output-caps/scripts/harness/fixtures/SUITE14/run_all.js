// Runs every package's test.js and prints a summary. Exit 0 only if all pass.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dirs = fs.readdirSync(__dirname).filter((d) => fs.existsSync(path.join(__dirname, d, "test.js"))).sort();
let pass = 0;
for (const d of dirs) {
  const r = spawnSync("node", ["test.js"], { cwd: path.join(__dirname, d), encoding: "utf8" });
  const ok = r.status === 0;
  if (ok) pass++;
  console.log(`--- ${d}: ${ok ? "PASS" : "FAIL"}`);
  if (!ok) process.stdout.write((r.stdout || "") + (r.stderr || ""));
}
console.log(`SUMMARY ${pass}/${dirs.length} passing`);
process.exit(pass === dirs.length ? 0 : 1);
