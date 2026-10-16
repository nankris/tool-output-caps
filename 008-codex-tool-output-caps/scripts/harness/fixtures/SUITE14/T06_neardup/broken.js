function formatUser(id) {
  return "user:" + id;
}

function formatItem(id) {
  return "user:" + id; // bug: should be item:
}

function label(kind, id) {
  return kind === "user" ? formatUser(id) : formatItem(id);
}

module.exports = { formatUser, formatItem, label };
