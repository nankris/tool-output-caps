const assert = require("assert");
const { normalize } = require("./broken");
assert.strictEqual(normalize("  Hello "), "Hello");
console.log("OK");
