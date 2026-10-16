const assert = require("assert");
const { scale } = require("./broken");
assert.strictEqual(scale(3), 30);
console.log("OK");
