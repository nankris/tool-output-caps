const assert = require("assert");
const { clamp } = require("./broken");
assert.strictEqual(clamp(5, 0, 10), 5);
assert.strictEqual(clamp(-1, 0, 10), 0);
assert.strictEqual(clamp(99, 0, 10), 10);
console.log("OK");
