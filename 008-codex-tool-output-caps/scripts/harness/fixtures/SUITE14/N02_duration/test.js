// Trace-heavy test: prints a config dump and one trace line per input.
const { parseDuration } = require("./broken");
console.log("config dump:");
for (let i = 0; i < 60; i++) console.log(`  scheduler.queue[${i}] = { name: "q${i}", workers: ${(i * 7) % 13 + 1}, retry: "${(i % 5) + 1}m", ttl: "${(i % 3) + 1}h" }`);
const cases = [];
for (let i = 0; i < 300; i++) {
  const h = i % 4, m = (i * 7) % 60;
  if (i >= 145 && i < 160) { const s = (i * 13) % 60 + 1; cases.push([`${h}h${m}m${s}s`, h * 3600 + m * 60 + s]); }
  else cases.push([`${h}h${m}m`, h * 3600 + m * 60]);
}
let bad = 0;
cases.forEach(([inp, exp], i) => {
  const got = parseDuration(inp);
  console.log(`trace #${i} parse("${inp}") -> ${got}${got === exp ? "" : "   <-- MISMATCH expected " + exp}`);
  if (got !== exp) bad++;
});
for (let i = 0; i < 60; i++) console.log(`  metrics.bucket[${i}] p50=${(i * 3) % 17}ms p99=${(i * 11) % 97}ms`);
if (bad) { console.log(`${bad} mismatches`); process.exit(1); }
console.log("OK");
