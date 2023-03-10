class InternalOrder{
    constructor(id, issueDate, state, customerId, products =[]){
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerId = customerId;
        this.products = products;
    }

    concatProducts(products){
        this.products = this.products.concat(products);
    }
}

module.exports = InternalOrder;