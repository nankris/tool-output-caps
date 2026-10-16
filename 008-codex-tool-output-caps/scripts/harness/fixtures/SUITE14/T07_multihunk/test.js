const assert = require("assert");
const { TAX, priceWithTax, label } = require("./broken");
assert.strictEqual(TAX, 0.1);
assert.ok(Math.abs(priceWithTax(100) - 110) < 1e-9);
assert.strictEqual(label(), "tax=10%");
console.log("OK");
