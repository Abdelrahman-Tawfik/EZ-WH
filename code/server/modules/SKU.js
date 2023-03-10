class SKU {
	constructor(id, description, weight, volume, notes, price, availableQuantity, positionID, position = undefined, testDescriptors = []) {
		this.id = id;
		this.description = description;
		this.weight = weight;
		this.volume = volume;
		this.notes = notes;
		this.price = price;
		this.availableQuantity = availableQuantity;
		this.positionID = positionID;
		this.position = position;
		this.testDescriptors = testDescriptors;
	}
	/*
	initTestDescriptors() {
		this.testDescriptors = [];
	}
	*/
	addTestDescriptor(testDescriptor) {
		this.testDescriptors.push(testDescriptor);
	}
}

module.exports = SKU;
