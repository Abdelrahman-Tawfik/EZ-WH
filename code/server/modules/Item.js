class Item {
  constructor(id, description, price, skuId, supplierId) {
    this.id = id;
    this.description = description;
    this.price = price;
    this.skuId = skuId;
    this.supplierId = supplierId;
  }
}

module.exports = Item;
