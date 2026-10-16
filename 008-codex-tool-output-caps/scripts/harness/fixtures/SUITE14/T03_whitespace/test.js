const assert = require("assert");
const { greet } = require("./broken");
assert.strictEqual(greet("Ada"), "hello-Ada");
console.log("OK");
