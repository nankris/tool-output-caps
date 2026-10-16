function clamp(v, lo, hi) {
  // recently added comment by another process
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v + 0; // bug introduced: should just return v
}

module.exports = { clamp };
