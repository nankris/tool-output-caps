function normalize(s) {
  s = s.trim();
  s = s.toUpperCase(); // bug: should not uppercase
  return s;
}

module.exports = { normalize };
