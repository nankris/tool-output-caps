// Minimal CSV reader for the billing export.
function parseLine(line) {
  return line.split(",");
}

function parseCsv(text) {
  const lines = text.trim().split("\n");
  const header = parseLine(lines[0]);
  return lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i]));
    return row;
  });
}

module.exports = { parseLine, parseCsv };
