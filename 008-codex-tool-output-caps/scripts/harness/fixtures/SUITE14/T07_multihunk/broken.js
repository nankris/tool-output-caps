const TAX = 0.05; // should be 0.1

function priceWithTax(net) {
  return net * (1 + TAX);
}

function label() {
  return "tax=5%"; // should reflect 10%
}

module.exports = { TAX, priceWithTax, label };
