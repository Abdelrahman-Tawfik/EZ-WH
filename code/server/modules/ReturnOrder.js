class ReturnOrder {
    constructor(id, returnDate, restockOrderId, products=[]){
        this.id = id;
        this.returnDate = returnDate;
        this.restockOrderId = restockOrderId;
        this.products = products;
    }

    addProduct(product){
        this.products.push(product);
    }
}

module.exports = ReturnOrder;