// Prints every parsed row, then checks totals.
const fs = require("fs");
const { parseCsv } = require("./broken");
const rows = parseCsv(fs.readFileSync(__dirname + "/data.csv", "utf8"));
let total = 0, badRows = 0;
for (const r of rows) {
  const amt = Number(r.amount);
  console.log(`row ${r.id}: ${r.name} | ${r.city} | ${r.amount}`);
  if (!Number.isFinite(amt)) badRows++; else total += amt;
}
const expected = fs.readFileSync(__dirname + "/data.csv", "utf8").trim().split("\n").slice(1)
  .map((l) => Number(l.slice(l.lastIndexOf(",") + 1))).reduce((a, b) => a + b, 0);
console.log(`total=${total} expected=${expected} badRows=${badRows}`);
if (total !== expected || badRows) process.exit(1);
if (rows.find((r) => r.id === "245").city.indexOf(",") < 0) process.exit(1);
console.log("OK");
