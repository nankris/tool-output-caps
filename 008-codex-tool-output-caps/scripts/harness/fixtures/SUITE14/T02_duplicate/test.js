const assert = require("assert");
const { processA, processB, run } = require("./broken");
// Only processA must be fixed; processB stays intentionally broken (duplicate stress).
assert.strictEqual(processA(3), 6);
assert.strictEqual(run("A", 4), 8);
// processB still wrong is OK for this task's functional check:
assert.strictEqual(processB(3), 4); // still +1
console.log("OK");
