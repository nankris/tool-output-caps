// Verbose regression run: 400 generated cases. Prints one line per case.
const { median } = require("./broken");
let seed = 12345;
function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
function ref(a) { const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
console.log("== stats regression suite v3.2 ==");
for (let i = 0; i < 40; i++) console.log(`[setup] loading fixture shard ${i}/40 checksum=${(rnd() * 1e9) | 0}`);
let failed = 0;
for (let i = 0; i < 400; i++) {
  // even-length arrays only appear in the middle of the run
  const even = i >= 190 && i < 210;
  const len = even ? 2 * (2 + (i % 4)) : 2 * (2 + (i % 4)) + 1;
  const arr = Array.from({ length: len }, () => Math.round(rnd() * 100));
  const got = median(arr), exp = ref(arr);
  if (got === exp) console.log(`case ${i}: len=${len} median=${got} ok`);
  else { failed++; console.log(`case ${i}: len=${len} median(${JSON.stringify(arr)}) expected ${exp} got ${got} FAIL`); }
}
for (let i = 0; i < 40; i++) console.log(`[teardown] flushing shard ${i}/40 ok`);
if (failed) { console.log(`RESULT: ${failed} of 400 cases failed`); process.exit(1); }
console.log("OK");
