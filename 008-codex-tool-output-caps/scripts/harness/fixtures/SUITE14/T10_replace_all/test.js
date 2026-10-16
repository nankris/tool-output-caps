const assert = require("assert");
const { API, url, health } = require("./broken");
assert.strictEqual(API, "http://api.example");
assert.strictEqual(url("/v1"), "http://api.example/v1");
assert.strictEqual(health(), "http://api.example/health");
console.log("OK");
