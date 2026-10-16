const assert = require("assert");
const { formatUser, formatItem, label } = require("./broken");
assert.strictEqual(formatUser(1), "user:1");
assert.strictEqual(formatItem(2), "item:2");
assert.strictEqual(label("item", 9), "item:9");
console.log("OK");
