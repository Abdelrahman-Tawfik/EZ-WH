class RestockOrder {
  constructor(
    id,
    issueDate,
    state,
    supplierId,
    transportNote,
    products = [],
    skuItems = []
  ) {
    this.id = id;
    this.issueDate = issueDate;
    this.state = state;
    this.supplierId = supplierId;
    if(transportNote!==null)
    this.transportNote = transportNote;
    this.products = products;
    this.skuItems = skuItems;
  }

  concatProducts(products){
    this.products = this.products.concat(products);
  }

  concatSKUItems(SKUItems){
    this.skuItems = this.skuItems.concat(SKUItems);
  }
}

module.exports = RestockOrder;
