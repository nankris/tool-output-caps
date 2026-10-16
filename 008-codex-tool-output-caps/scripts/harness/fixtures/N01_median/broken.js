// Small stats helpers used by the nightly report.
function sortNums(arr) {
  return arr.slice().sort((a, b) => a - b);
}

function mean(arr) {
  return arr.reduce((s, x) => s + x, 0) / arr.length;
}

function median(arr) {
  const s = sortNums(arr);
  const mid = Math.floor(s.length / 2);
  return s[mid];
}

module.exports = { sortNums, mean, median };
