const API = "http://legacy.example";

function url(path) {
  return "http://legacy.example" + path;
}

function health() {
  return "http://legacy.example" + "/health";
}

module.exports = { API, url, health };
