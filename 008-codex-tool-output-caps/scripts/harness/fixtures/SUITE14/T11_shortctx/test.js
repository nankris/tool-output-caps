const assert = require("assert");
const { left, mid, right } = require("./broken");
assert.strictEqual(left(1), 1);
assert.strictEqual(mid(1), 2);
assert.strictEqual(right(1), 1);
console.log("OK");
