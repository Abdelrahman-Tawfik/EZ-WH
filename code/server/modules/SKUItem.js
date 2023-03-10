class SKUItem {
	constructor(rfid, sku, available, dateOfStock) {
		this.rfid = rfid;
		this.sku = sku;
		this.available = available;
		this.dateOfStock = dateOfStock;
	}
}

module.exports = SKUItem;
