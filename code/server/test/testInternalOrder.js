const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
var agent = chai.request.agent(app);

const states = ["ISSUED", "ACCEPTED", "REFUSED", "CANCELED", "COMPLETED"];

function newInternalOrder(expectedHTTPStatus, internalOrder) {
    it('adding a new internal order', function (done) {
        if (internalOrder !== undefined) {
            agent.post('/api/internalOrders').send(internalOrder)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        } else {
            agent.post('/api/internalOrders')
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function deleteInternalOrder(expectedHTTPStatus, id) {
    it(`deleting an internal order with id=${id}`, function (done) {
        agent.delete(`/api/internalOrders/${id}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}
function modifyInternalOrder(expectedHTTPStatus, id, modifications) {
    it(`modifing an internal order with id=${id}`, function (done) {
        if (modifications !== undefined) {
            agent.put(`/api/internalOrders/${id}`).send(modifications)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function getInternalOrdersByStatus(expectedHTTPStatus, expectedLength, expectedInternalOrders, status) {
    it(`getting all internal orders with status=${status}`, function (done) {
        agent.get(status===undefined?`/api/internalOrders`:`/api/internalOrders${status}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                if (expectedHTTPStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedLength);
                    for (let i = 0; i < expectedLength; i++) {
                        let io = res.body[i];
                        io.should.haveOwnProperty("id");
                        io.should.haveOwnProperty("issueDate");
                        io.should.haveOwnProperty("state");
                        io.should.haveOwnProperty("products");
                        io.products.should.be.an('array');
                        io.should.haveOwnProperty("customerId");
                        expectedInternalOrders.some((intOrd) => {
                            return compareInternalOrder(intOrd, io)
                        }).should.be.true;
                    }
                }
                done();
            });
    });
}
function getInternalOrder(expectedHTTPStatus, id, expectedInternalOrder) {
    it(`getting internal order with id=${id}`, function (done) {
        if (expectedInternalOrder !== undefined) {
            agent.get(`/api/internalOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    if (expectedHTTPStatus === 200) {
                        res.should.be.json;
                        res.body.should.haveOwnProperty("id");
                        res.body.should.haveOwnProperty("issueDate");
                        res.body.should.haveOwnProperty("state");
                        res.body.should.haveOwnProperty("products");
                        res.body.products.should.be.an('array');
                        res.body.should.haveOwnProperty("customerId");
                        compareInternalOrder(expectedInternalOrder, res.body).should.be.true;
                    }
                    done();
                });
        } else {
            agent.get(`/api/internalOrders/${id}`)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedHTTPStatus);
                    done();
                });
        }
    });
}
function compareInternalOrder(expectedIO, actualIO) {
    let cmp_flag = true;
    if (expectedIO.issueDate !== actualIO.issueDate) {
        return false;
    }
    if (expectedIO.state !== actualIO.state) {
        return false;
    }
    if (expectedIO.products.length !== actualIO.products.length) {
        return false;
    }
    for (let i = 0; i < expectedIO.products.length; i++) {
        exppr = expectedIO.products[i];
        cmp_flag = actualIO.products.some((p) => {
            return p.SKUId === exppr.SKUId &&
                p.description === exppr.description &&
                p.price === exppr.price &&
                ((p.RFID !== undefined && p.RFID === exppr.RFID) ||
                    (p.qty !== undefined && p.qty === exppr.qty));
        });
        if (!cmp_flag) {
            return false;
        }
    }
    if (expectedIO.customerId !== actualIO.customerId) {
        return false;
    }
    return true;
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
    it('deleting a SKU', function (done) {
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
    it('deleting a skuitem', function (done) {
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
    it('deleting a user', function (done) {
        agent.delete(`/api/users/${username}/${type}`)
            .end(function (err, res) {
                if (err) done(err);
                res.should.have.status(expectedHTTPStatus);
                done();
            });
    });
}

let customer1 = {
    "username": "user2@ezwh.com",
    "name": "John",
    "surname": "Smith",
    "password": "testpassword",
    "type": "customer"
};
let customer2 = {
    "username": "user3@ezwh.com",
    "name": "Paul",
    "surname": "Brown",
    "password": "testpassword",
    "type": "customer"
};
let supplier1 = {
    "username": "user4@ezwh.com",
    "name": "Paul",
    "surname": "White",
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
let SKUItem8 = {
    "RFID": "12345678901234567890123456789037",
    "SKUId": 3,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem9 = {
    "RFID": "12345678901234567890123456789038",
    "SKUId": 3,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem10 = {
    "RFID": "12345678901234567890123456789039",
    "SKUId": 3,
    "DateOfStock": "2021/11/29 12:30"
};
let SKUItem11 = {
    "RFID": "12345678901234567890123456789040",
    "SKUId": 3,
    "DateOfStock": "2021/11/29 12:30"
};
let internalOrderIssued1 = {
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 3 },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 }],
    "customerId": 7
};
let internalOrderIssued2 = {
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 7
};
let internalOrderIssued3 = {
    "issueDate": "2021/11/29",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError1 = {//Wrong date Validation (422)
    "issueDate": "2019/11 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError2 = {//SKUID not found (503)
    "issueDate": "2018/11/29 09:33",
    "products": [{ "SKUId": 5, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError3 = {//description is int , Shouldn't be allowed ?
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": 5, "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError4 = {//price is String
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": "abc", "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError5 = {//missed qty
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError6 = {//missed customerId
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
};
let internalOrderError7 = {//integer issueDate
    "issueDate": 1,
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError8 = {//string issueDate
    "issueDate": "abc",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": "abc"
};
let internalOrderError9 = {// wrong date format
    "issueDate": "21/11/2021 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError10 = {// wrong field name "customer"
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customer": 8
};
let internalOrderError11 = {//wrong field name "issue"
    "issue": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError12 = {//wrong field name product
    "issueDate": "2021/11/29 09:33",
    "product": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError13 = {//products is not an array
    "issueDate": "2021/11/29 09:33",
    "products": { "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    "customerId": 8
};
let internalOrderError14 = {// string SKUId
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": "abc", "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError15 = { //wrong field name "descript"
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "descript": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError16 = { //negative qty
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": -5 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError17 = {// not existing date 
    "issueDate": "2021/11/33 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError18 = {// wrong format date
    "issueDate": "2021-11-29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 8
};
let internalOrderError19 = {// customerId not found 
    "issueDate": "2021/11/29 09:33",
    "products": [{ "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 3 },
    { "SKUId": 3, "description": "third sku", "price": 10.99, "qty": 3 }],
    "customerId": 9
};
let expectedInternalOrders = [
    { ...internalOrderIssued1, "state": states[0] },
    { ...internalOrderIssued2, "state": states[0] },
    { ...internalOrderIssued3, "state": states[0] },
];
let internalOrderCompleted1 = {
    "issueDate": "2021/11/29 09:33",
    "state": "COMPLETED",
    "products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "RFID": "12345678901234567890123456789015" },
    { "SKUId": 1, "description": "first sku", "price": 10.99, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "description": "first sku", "price": 10.99, "RFID": "12345678901234567890123456789017" },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "RFID": "12345678901234567890123456789025" },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "RFID": "12345678901234567890123456789026" },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "RFID": "12345678901234567890123456789027" }],
    "customerId": 7
}


function prepare() {
    describe('preparing environment', () => {
        newUser(201, customer1);
        newUser(201, customer2);
        newUser(201, supplier1);
        newSKU(201, SKU1);
        newSKU(201, SKU2);
        newSKU(201, SKU3);
        newSKUItem(201, SKUItem1);
        newSKUItem(201, SKUItem2);
        newSKUItem(201, SKUItem3);
        newSKUItem(201, SKUItem4);
        newSKUItem(201, SKUItem5);
        newSKUItem(201, SKUItem6);
        newSKUItem(201, SKUItem7);
        newSKUItem(201, SKUItem8);
        newSKUItem(201, SKUItem9);
        newSKUItem(201, SKUItem10);
        newSKUItem(201, SKUItem11);
    });
}

function clean() {
    describe('cleaning environment', () => {
        deleteUser(204, customer1.username, customer1.type);
        deleteUser(204, customer2.username, customer2.type);
        deleteUser(204, supplier1.username, supplier1.type);
        deleteSKUItem(204, SKUItem1.RFID);
        deleteSKUItem(204, SKUItem2.RFID);
        deleteSKUItem(204, SKUItem3.RFID);
        deleteSKUItem(204, SKUItem4.RFID);
        deleteSKUItem(204, SKUItem5.RFID);
        deleteSKUItem(204, SKUItem6.RFID);
        deleteSKUItem(204, SKUItem7.RFID);
        deleteSKUItem(204, SKUItem8.RFID);
        deleteSKUItem(204, SKUItem9.RFID);
        deleteSKUItem(204, SKUItem10.RFID);
        deleteSKUItem(204, SKUItem11.RFID);
        deleteSKU(204, 1);
        deleteSKU(204, 2);
        deleteSKU(204, 3);
    });
}

describe('TEST InternalOrder API', () => {
    prepare();

    describe("Testing POST APIs", function () {  //TIFA
        newInternalOrder(201, internalOrderIssued1);
        newInternalOrder(201, internalOrderIssued2);
        newInternalOrder(201, internalOrderIssued3);
        getInternalOrdersByStatus(200, 3, expectedInternalOrders, "");
        getInternalOrdersByStatus(200, 3, expectedInternalOrders, "Issued");
        getInternalOrder(200, 1, { ...internalOrderIssued1, "state": states[0] });
        getInternalOrder(200, 2, { ...internalOrderIssued2, "state": states[0] });
        getInternalOrder(200, 3, { ...internalOrderIssued3, "state": states[0] });
        deleteInternalOrder(204, 1);
        getInternalOrdersByStatus(200, 2, [
            { ...internalOrderIssued2, "state": states[0] },
            { ...internalOrderIssued3, "state": states[0] }
        ], "");
        getInternalOrder(404, 1);
        getInternalOrdersByStatus(200, 2, [
            { ...internalOrderIssued2, "state": states[0] },
            { ...internalOrderIssued3, "state": states[0] }
        ], "Issued");

        describe('testing put api internal order - successs', () => {
            modifyInternalOrder(200, 2, { "newState": states[1] });
            getInternalOrdersByStatus(200, 1, [
                { ...internalOrderIssued2, "state": states[1] },
            ], "Accepted");
            getInternalOrdersByStatus(200, 1, [
                { ...internalOrderIssued3, "state": states[0] }
            ], "Issued");
            getInternalOrder(200, 2, { ...internalOrderIssued2, "state": states[1] });
            getInternalOrdersByStatus(200, 2, [
                { ...internalOrderIssued2, "state": states[1] },
                { ...internalOrderIssued3, "state": states[0] }
            ], "");
            modifyInternalOrder(200, 2, {
                "newState": states[4],
                "products": [{
                    "RFID": "12345678901234567890123456789015",
                    "SkuID": 1
                }, {
                    "RFID": "12345678901234567890123456789016",
                    "SkuID": 1
                }, {
                    "RFID": "12345678901234567890123456789017",
                    "SkuID": 1
                }, {
                    "RFID": "12345678901234567890123456789025",
                    "SkuID": 2
                }, {
                    "RFID": "12345678901234567890123456789026",
                    "SkuID": 2
                }, {
                    "RFID": "12345678901234567890123456789027",
                    "SkuID": 2
                }]
            });
            getInternalOrder(200, 2, internalOrderCompleted1);
            getInternalOrdersByStatus(200, 0, null, "Accepted");
            getInternalOrdersByStatus(200, 1, [
                { ...internalOrderIssued3, "state": states[0] }
            ], "Issued");
            getInternalOrdersByStatus(200, 2, [
                internalOrderCompleted1,
                { ...internalOrderIssued3, "state": states[0] }
            ], "");
            deleteInternalOrder(204, 1);
            deleteInternalOrder(204, 2);
            deleteInternalOrder(204, 3);
        });
    })

    clean();
    prepare();
    
    describe('testing create/get/delete internal orders - success', () => {
        newInternalOrder(201, internalOrderIssued1);
        newInternalOrder(201, internalOrderIssued2);
        newInternalOrder(201, internalOrderIssued3);
        getInternalOrdersByStatus(200, 3, expectedInternalOrders);
        getInternalOrdersByStatus(200, 3, expectedInternalOrders, "Issued");
        getInternalOrder(200, 1, { ...internalOrderIssued1, "state": states[0] });
        getInternalOrder(200, 2, { ...internalOrderIssued2, "state": states[0] });
        getInternalOrder(200, 3, { ...internalOrderIssued3, "state": states[0] });
        deleteInternalOrder(204, 1);
        getInternalOrdersByStatus(200, 2, [
            { ...internalOrderIssued2, "state": states[0] },
            { ...internalOrderIssued3, "state": states[0] }
        ], "");
        getInternalOrder(404, 1);
        getInternalOrdersByStatus(200, 2, [
            { ...internalOrderIssued2, "state": states[0] },
            { ...internalOrderIssued3, "state": states[0] }
        ], "Issued");
        getInternalOrdersByStatus(200, 0, [], "Accepted");
        deleteInternalOrder(204, 2);
        deleteInternalOrder(204, 3);
        deleteInternalOrder(204, 3);
        getInternalOrdersByStatus(200, 0, []);
        getInternalOrdersByStatus(200, 0, [], "Issued");
        getInternalOrdersByStatus(200, 0, [], "Accepted");
    });
    
    describe('testing create/get/delete internal orders - failure', () => {
        newInternalOrder(422, internalOrderError1);
        newInternalOrder(503, internalOrderError2);
        newInternalOrder(422, internalOrderError3);
        newInternalOrder(422, internalOrderError4);
        newInternalOrder(422, internalOrderError5);
        newInternalOrder(422, internalOrderError6);
        newInternalOrder(422, internalOrderError7);
        newInternalOrder(422, internalOrderError8);
        newInternalOrder(422, internalOrderError9);
        newInternalOrder(422, internalOrderError10);
        newInternalOrder(422, internalOrderError11);
        newInternalOrder(422, internalOrderError12);
        newInternalOrder(422, internalOrderError13);
        newInternalOrder(422, internalOrderError14);
        newInternalOrder(422, internalOrderError15);
        newInternalOrder(422, internalOrderError16);
        newInternalOrder(422, internalOrderError17);
        newInternalOrder(422, internalOrderError18);
        newInternalOrder(422, internalOrderError19);
        getInternalOrder(404, 4);
        getInternalOrder(422, "abc");
        getInternalOrder(422, -1);
        getInternalOrder(422, true);
        deleteInternalOrder(422, "abc");
        deleteInternalOrder(422, -1);
        deleteInternalOrder(422, true);
    });


    describe('testing put api internal order - success', () => {
        newInternalOrder(201, internalOrderIssued1);
        newInternalOrder(201, internalOrderIssued2);
        newInternalOrder(201, internalOrderIssued3);
        modifyInternalOrder(200, 1, { "newState": states[1] });
        modifyInternalOrder(200, 2, { "newState": states[1] });
        getInternalOrdersByStatus(200, 2, [
            { ...internalOrderIssued1, "state": states[1] },
            { ...internalOrderIssued2, "state": states[1] }
        ], "Accepted");
        getInternalOrdersByStatus(200, 1, [
            { ...internalOrderIssued3, "state": states[0] }
        ], "Issued");
        getInternalOrder(200, 1, { ...internalOrderIssued1, "state": states[1] });
        getInternalOrdersByStatus(200, 3, [
            { ...internalOrderIssued1, "state": states[1] },
            { ...internalOrderIssued2, "state": states[1] },
            { ...internalOrderIssued3, "state": states[0] }
        ]);
        modifyInternalOrder(200, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        getInternalOrder(200, 1, internalOrderCompleted1);
        getInternalOrdersByStatus(200, 1, [
            { ...internalOrderIssued2, "state": states[1] }
        ], "Accepted");
        getInternalOrdersByStatus(200, 1, [
            { ...internalOrderIssued3, "state": states[0] }
        ], "Issued");
        getInternalOrdersByStatus(200, 3, [
            internalOrderCompleted1,
            { ...internalOrderIssued2, "state": states[1] },
            { ...internalOrderIssued3, "state": states[0] }
        ]);
        deleteInternalOrder(204, 1);
        deleteInternalOrder(204, 2);
        deleteInternalOrder(204, 3);
    });

    clean();

    prepare();

    describe('testing put api internal order - failure 1', () => {
        newInternalOrder(201, internalOrderIssued1);
        newInternalOrder(201, internalOrderIssued2);
        newInternalOrder(201, internalOrderIssued3);
        modifyInternalOrder(200, 1, {
            "newState": states[1],
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        getInternalOrder(200, 1, { ...internalOrderIssued1, "state": states[1] });
        modifyInternalOrder(422, 1, { "newState": states[4] });
        modifyInternalOrder(200, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        deleteInternalOrder(204, 1);
        deleteInternalOrder(204, 2);
        deleteInternalOrder(204, 3);
    });

    clean();

    prepare();

    describe('testing put api internal order - failure 2', () => {
        newInternalOrder(201, internalOrderIssued1);
        newInternalOrder(201, internalOrderIssued2);
        newInternalOrder(201, internalOrderIssued3);
        modifyInternalOrder(404, 5, { "newState": states[2] });
        modifyInternalOrder(422, "abc", { "newState": states[2] });
        modifyInternalOrder(422, -5, { "newState": states[2] });
        modifyInternalOrder(422, 1, { "state": states[1] });
        modifyInternalOrder(422, 1, { "newState": "abc" });
        modifyInternalOrder(422, 1, { "newState": 1 });
        modifyInternalOrder(422, 1, { "newState": true });
        modifyInternalOrder(422, 1, { "newState": states[5], });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "product": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(503, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789025",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "product": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": "abc"
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SkuID": true
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "products": [{
                "rfid": "12345678901234567890123456789015",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": states[4],
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SKUId": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(422, 1, {
            "newState": false,
            "products": [{
                "RFID": "12345678901234567890123456789015",
                "SKUId": 1
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        modifyInternalOrder(200, 1, {
            "newState": states[1],
            "products": [{
                "RFID": "1234567890123456789012345",
                "SKUId": false
            }, {
                "RFID": "12345678901234567890123456789016",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789017",
                "SkuID": 1
            }, {
                "RFID": "12345678901234567890123456789025",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789026",
                "SkuID": 2
            }, {
                "RFID": "12345678901234567890123456789027",
                "SkuID": 2
            }]
        });
        deleteInternalOrder(204, 1);
        deleteInternalOrder(204, 2);
        deleteInternalOrder(204, 3);
    });

    clean();
});