const assert = require("assert");
const { add } = require("./broken");
assert.strictEqual(add(2, 3), 5);
assert.strictEqual(add(-1, 1), 0);
console.log("OK");
