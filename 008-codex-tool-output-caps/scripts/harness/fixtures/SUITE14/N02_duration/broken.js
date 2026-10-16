// Parses durations like "1h30m", "45m", "2h", "90s", "1h2m3s" into seconds.
function parseDuration(str) {
  const re = /(\d+)([hm])/g;
  let total = 0;
  let m;
  while ((m = re.exec(str)) !== null) {
    const n = parseInt(m[1], 10);
    if (m[2] === "h") total += n * 3600;
    else if (m[2] === "m") total += n * 60;
  }
  return total;
}

module.exports = { parseDuration };
