const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

function newReturnOrder(expectedHTTPStatus, returnOrder) {
    it('adding a new return order', function (done) {
        if (returnOrder !== undefined) {
            agent.post('/api/returnOrder').send(returnOrder)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/returnOrder')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteReturnOrder(expectedHTTPStatus, id) {
    it(`deleting a return order with id=${id}`, function (done) {
        agent.delete(`/api/returnOrder/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function getReturnOrders(expectedHTTPStatus, expectedLength, expectedReturnOrders) {
    it('getting all return orders', function (done) {
        agent.get('/api/returnOrders')
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);
                    for (let i = 0; i < expectedLength; i++) {
                        let ro = res.body[i];
                        ro.should.haveOwnProperty("id");
                        ro.should.haveOwnProperty("returnDate");
                        ro.should.haveOwnProperty("products");
                        ro.should.haveOwnProperty("restockOrderId");
                        ro.products.should.be.an('array');
                        expectedReturnOrders.some((retOrd) => {
                            return compareReturnOrder(retOrd, ro)
                        }).should.be.equal(true);
                    }
                }
                done();
            });
    });
}
function getReturnOrder(expectedHTTPStatus, id, expectedReturnOrder) {
    it(`getting a return order with id = ${id}`, function (done) {
        if (expectedReturnOrder !== undefined) {
            agent.get(`/api/returnOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        res.should.be.json;
                        res.body.should.haveOwnProperty("returnDate");
                        res.body.should.haveOwnProperty("products");
                        res.body.should.haveOwnProperty("restockOrderId");
                        res.body.products.should.be.an('array');
                        compareReturnOrder(expectedReturnOrder, res.body).should.be.equal(true);
                    }
                    done();
                });
        } else {
            agent.get(`/api/returnOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function compareReturnOrder(expectedRO, actualRO) {
    let cmp_flag = true;
    if (expectedRO.returnDate !== actualRO.returnDate) return false;
    if (expectedRO.products.length !== actualRO.products.length)
        return false;
    for (let i = 0; i < expectedRO.products.length; i++) {
        exppr = expectedRO.products[i];
        cmp_flag = actualRO.products.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.description === exppr.description &&
                p.itemId === exppr.itemId &&
                p.price === exppr.price &&
                p.RFID === exppr.RFID;
        });
        if (!cmp_flag) return false;
    }
    if (expectedRO.restockOrderId !== actualRO.restockOrderId) return false;
    return true;
}
function newRestockOrder(expectedHTTPStatus, restockOrder) {
    it('adding a new restock order', function (done) {
        if (restockOrder !== undefined) {
            agent.post('/api/restockOrder')
                .set('content-type', 'application/json')
                .send(restockOrder)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/restockOrder')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteRestockOrder(expectedHTTPStatus, id) {
    it(`deleting a restock order with id=${id}`, function (done) {
        agent.delete(`/api/restockOrder/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newSKU(expectedHTTPStatus, SKU) {
    it('adding a new SKU', function (done) {
        if (SKU !== undefined) {
            agent.post('/api/sku')
                .set('content-type', 'application/json')
                .send(SKU)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/sku')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteSKU(expectedHTTPStatus, id) {
    it(`deleting a SKU with id=${id}`, function (done) {
        agent.delete(`/api/skus/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newSKUItem(expectedHTTPStatus, SKUItem) {
    it('adding a new SKUItem', function (done) {
        if (SKUItem !== undefined) {
            agent.post('/api/skuitem')
                .set('content-type', 'application/json')
                .send(SKUItem)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/skuitem')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteSKUItem(expectedHTTPStatus, rfid) {
    it(`deleting a skuitem with rfid=${rfid}`, function (done) {
        agent.delete(`/api/skuitems/${rfid}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newUser(expectedHTTPStatus, user) {
    it('adding a new user', function (done) {
        if (user !== undefined) {
            agent.post('/api/newUser')
                .set('content-type', 'application/json')
                .send(user)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/newUser')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteUser(expectedHTTPStatus, username, type) {
    it(`deleting a user with username=${username} and type=${type}`, function (done) {
        agent.delete(`/api/users/${username}/${type}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function newItem(expectedHTTPStatus, item) {
    it('adding a new item', function (done) {
        if (item !== undefined) {
            agent.post('/api/item')
                .set('content-type', 'application/json')
                .send(item)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/item')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteItem(id, supplierId, expectedStatus) {
    it(`delete /api/items/${id}/${supplierId}`, function (done) {
        agent.delete(`/api/items/${id}/${supplierId}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}
function modifyRestockOrderStatus(expectedHTTPStatus, id, status) {
    it(`modifing a restock order with id=${id} to status=${status}`, function (done) {
        if (status !== undefined) {
            agent.put(`/api/restockOrder/${id}`)
                .set('content-type', 'application/json')
                .send(status)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.put(`/api/restockOrder/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function addSKUItemList(expectedHTTPStatus, id, SKUItemList) {
    it(`adding skuItem list to restock order ${id}`, function (done) {
        if (SKUItemList !== undefined) {
            agent.put(`/api/restockOrder/${id}/skuItems`)
                .set('content-type', 'application/json')
                .send(SKUItemList)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post(`/api/restockOrder/${id}/skuItems`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}

let restockOrderIssued1 = {
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 1, "description": "first sku", "price": 10.99, "qty": 30 },
    { "SKUId": 2, "itemId": 2, "description": "second sku", "price": 10.99, "qty": 20 }],
    "supplierId": 7
};
let restockOrderIssued2 = {
    "issueDate": "2021/11/23",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20 },
    { "SKUId": 3, "itemId": 4, "description": "third sku", "price": 10.99, "qty": 30 }],
    "supplierId": 8
};
let supplier1 = {
    "username": "user1@ezwh.com",
    "name": "John",
    "surname": "Smith",
    "password": "testpassword",
    "type": "supplier"
};
let supplier2 = {
    "username": "user3@ezwh.com",
    "name": "Paul",
    "surname": "Brown",
    "password": "testpassword",
    "type": "supplier"
};
let SKU1 = {
    "description": "first sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 50
};
let SKU2 = {
    "description": "second sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 20
};
let SKU3 = {
    "description": "third sku",
    "weight": 100,
    "volume": 50,
    "notes": "first SKU",
    "price": 10.99,
    "availableQuantity": 30
};
let SKUItem1 = {
    "RFID": "12345678901234567890123456789015",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem2 = {
    "RFID": "12345678901234567890123456789016",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem3 = {
    "RFID": "12345678901234567890123456789017",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem4 = {
    "RFID": "12345678901234567890123456789018",
    "SKUId": 1,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem5 = {
    "RFID": "12345678901234567890123456789025",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem6 = {
    "RFID": "12345678901234567890123456789026",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem7 = {
    "RFID": "12345678901234567890123456789027",
    "SKUId": 2,
    "DateOfStock": "2021/11/29 12:30"
};
let item1 = {
    "id": 1,
    "description": "first sku",
    "price": 10.99,
    "SKUId": 1,
    "supplierId": 7
};
let item2 = {
    "id": 2,
    "description": "second sku",
    "price": 10.99,
    "SKUId": 2,
    "supplierId": 7
};
let item3 = {
    "id": 3,
    "description": "first sku",
    "price": 10.99,
    "SKUId": 1,
    "supplierId": 8
};
let item4 = {
    "id": 4,
    "description": "third sku",
    "price": 10.99,
    "SKUId": 3,
    "supplierId": 8
};
let returnOrder1 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 1, "description": "first sku", "price": 10.99, "qty": 30, "RFID": "12345678901234567890123456789015" },
    { "SKUId": 2, "itemId": 2, "description": "second sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789025" }],
    "restockOrderId": 1
};
let returnOrder2 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError1 = {
    "returnDate": "2021/12/40 00:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError2 = {
    "returnDate": "",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError3 = {
    "returnDate": 1,
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError4 = {
    "return": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3,"description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError5 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 15, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError6 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789040" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError7 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 4
};
let returnOrderError8 = {
    "returnDate": "2021/12/29 09:33",
    "products": { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    "restockOrderId": 2
};
let returnOrderError9 = {
    "returnDate": "2021/12/29 09:33",
    "product": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError10 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrder": 2
};
let returnOrderError11 = {
    "returnDate": "2021/12/29 09:33",
    "products": [],
    "restockOrderId": 2
};
let returnOrderError12 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError13 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": true, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError14 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 2
};
let returnOrderError15 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": true
};
let returnOrderError16 = {
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 3, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": "abcd"
};
let SKUItemList1 = [{ "SKUId": 1, "itemId": 1, "rfid": "12345678901234567890123456789015" }, { "SKUId": 2, "itemId": 2, "rfid": "12345678901234567890123456789025" }];
let SKUItemList2 = [{ "SKUId": 1, "itemId": 3, "rfid": "12345678901234567890123456789016" }, { "SKUId": 1, "itemId": 3, "rfid": "12345678901234567890123456789017" }];

function prepare() {
    describe('Adding Users and SKU to test', () => {
        newUser(201, supplier1);
        newUser(201, supplier2);
        newSKU(201, SKU1);
        newSKU(201, SKU2);
        newSKU(201, SKU3);
    })
    describe("Adding SKUItem to test", () => {
        newSKUItem(201, SKUItem1);
        newSKUItem(201, SKUItem2);
        newSKUItem(201, SKUItem3);
        newSKUItem(201, SKUItem4);
        newSKUItem(201, SKUItem5);
        newSKUItem(201, SKUItem6);
        newSKUItem(201, SKUItem7);
    });
    describe("Adding items and restockOrders", () => {
        newItem(201, item1);
        newItem(201, item2);
        newItem(201, item3);
        newItem(201, item4);
        newRestockOrder(201, restockOrderIssued1);
        newRestockOrder(201, restockOrderIssued2);
    });
    describe("Populating restockOrders", () => {
        modifyRestockOrderStatus(200, 1, { "newState": "DELIVERED" });
        modifyRestockOrderStatus(200, 2, { "newState": "DELIVERED" });
        addSKUItemList(200, 1, { "skuItems": SKUItemList1 });
        addSKUItemList(200, 2, { "skuItems": SKUItemList2 });
    });
}
function clean() {
    describe('cleaning environment', () => {
        deleteRestockOrder(204, 1);
        deleteRestockOrder(204, 2);
        deleteItem(1, 7, 204);
        deleteItem(2, 7, 204);
        deleteItem(3, 8, 204);
        deleteItem(4, 8, 204);
        deleteUser(204, supplier1.username, supplier1.type);
        deleteUser(204, supplier2.username, supplier2.type);
        deleteSKUItem(204, SKUItem1.RFID);
        deleteSKUItem(204, SKUItem2.RFID);
        deleteSKUItem(204, SKUItem3.RFID);
        deleteSKUItem(204, SKUItem4.RFID);
        deleteSKUItem(204, SKUItem5.RFID);
        deleteSKUItem(204, SKUItem6.RFID);
        deleteSKUItem(204, SKUItem7.RFID);
        deleteSKU(204, 1);
        deleteSKU(204, 2);
        deleteSKU(204, 3);
    });
}

describe('TEST ReturnOrder API', function () {
    prepare();

    describe('test add returnOrder api - success', () => {
        newReturnOrder(201, returnOrder1);
        newReturnOrder(201, returnOrder2);
        getReturnOrders(200, 2, [returnOrder1, returnOrder2]);
        getReturnOrder(200, 1, returnOrder1);
        getReturnOrder(200, 2, returnOrder2);
        deleteReturnOrder(204, 1);
        deleteReturnOrder(204, 2);
        getReturnOrder(404, 1);
        getReturnOrder(404, 2);
        getReturnOrders(200, 0, []);

    });
    describe("test delete returnOrder api - success", () => {
    });

    describe('test returnOrder api - failure', () => {
        newReturnOrder(422, returnOrderError1);
        newReturnOrder(422, returnOrderError2);
        newReturnOrder(422, returnOrderError3);
        newReturnOrder(422, returnOrderError4);
        newReturnOrder(422, returnOrderError5);
        newReturnOrder(422, returnOrderError6);
        newReturnOrder(404, returnOrderError7);
        newReturnOrder(422, returnOrderError8);
        newReturnOrder(422, returnOrderError9);
        newReturnOrder(422, returnOrderError10);
        // newReturnOrder(422, returnOrderError11);
        newReturnOrder(422, returnOrderError12)
        newReturnOrder(422, returnOrderError13);
        newReturnOrder(422, returnOrderError14);
        newReturnOrder(422, returnOrderError15);
        newReturnOrder(422, returnOrderError16);
        deleteReturnOrder(422, "abcd");
        deleteReturnOrder(422, false);
    });

    clean();
});

