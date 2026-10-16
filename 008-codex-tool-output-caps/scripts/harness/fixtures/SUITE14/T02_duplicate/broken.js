function processA(x) {
  return x + 1; // identical buggy body
}

function processB(x) {
  return x + 1; // identical buggy body
}

function run(kind, x) {
  if (kind === "A") return processA(x);
  return processB(x);
}

module.exports = { processA, processB, run };
