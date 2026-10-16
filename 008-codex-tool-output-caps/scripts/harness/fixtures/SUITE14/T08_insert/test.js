const assert = require("assert");
const { safeDiv } = require("./broken");
assert.strictEqual(safeDiv(10, 2), 5);
assert.strictEqual(safeDiv(10, 0), null);
console.log("OK");
