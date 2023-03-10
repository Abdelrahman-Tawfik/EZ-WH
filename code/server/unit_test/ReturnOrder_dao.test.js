const chai = require('chai');
chai.should();
const skuDAO = require('../database/SKU_dao');
const RetODAO = require('../database/ReturnOrder_dao');
const RestODAO = require("../database/RestockOrder_dao");
const UserDAO = require("../database/User_dao");
const SKUItemDAO = require("../database/SKUItem_dao");
const dbConnection = require("../database/DatabaseConnection");
const { expect } = require('chai');
const ItemDAO = require("../database/Item_dao");

function testCreateReturnOrder(expectedRO) {
    test('create returnOrder', async function () {
        await RetODAO.createReturnOrder(expectedRO.returnDate, expectedRO.restockOrderId);
        let actualRO = await RetODAO.getReturnOrderByID(expectedRO.id);
        compareRO(actualRO, expectedRO).should.be.true;
    });
}

function testCreateReturnOrderError(expectedRO) {
    test('create returnOrder with error', async function () {
        try {
            await RetODAO.createReturnOrder(expectedRO.returnDate, expectedRO.restockOrderId);
            false.should.be.true;
        } catch (err) {
            true.should.be.true;
        }
    });
}

function testCreateReturnOrderProducts(restockOrderId, restockOrder, products) {
    test('create returnOrder product', async function () {
        for (let i = 0; i < products.length; i++) {
            await RetODAO.createReturnOrderProducts(products[i].ReturnOrderID,
                products[i].RFID, products[i].itemId, restockOrder.supplierId);
        }
        let actualProducts = await RetODAO.getReturnOrderProducts(restockOrderId);
        for (let i = 0; i < products.length; i++)
            (products.some((p) => {
                return p.RFID === actualProducts[i].RFID &&
                    p.ReturnOrderID == actualProducts[i].ReturnOrderID;
            })).should.be.true;
    });
}

function testCreateReturnOrderProductsError(restockOrder, products) {
    test('create returnOrder product', async function () {
        try {
            for (let i = 0; i < products.length; i++) {
                await RetODAO.createReturnOrderProducts(products[i].ReturnOrderID,
                    products[i].RFID, products[i].itemId, restockOrder.supplierId);
            }
            false.should.be.true;
        } catch (err) {
            true.should.be.true
        }
    });
}

function testGetReturnOrderProduct(id, products) {
    test(`get returnOrder products of retOrd ${id}`, async function () {
        let actualProducts = await RetODAO.getReturnOrderProducts(id);
        for (let i = 0; i < products.length; i++)
            (products.some((p) => {
                return p.RFID === actualProducts[i].RFID &&
                    p.ReturnOrderID == actualProducts[i].ReturnOrderID;
            })).should.be.true;
    });
}

function testGetReturnOrders(expectedROs) {
    test('get all return orders', async function () {
        let ros = await RetODAO.getReturnOrders();
        ros.length.should.be.equal(expectedROs.length);
        for (let i = 0; i < expectedROs.length; i++)
            expectedROs.some((ro) => {
                return compareRO(ros[i], ro)
            }).should.be.true;
    });
}

function testGetReturnOrderByID(expectedRO) {
    test(`get return order with id = ${expectedRO.id}`, async function () {
        let ro = await RetODAO.getReturnOrderByID(expectedRO.id);
        compareRO(ro, expectedRO).should.be.true;
    });
}

function testDeleteReturnOrder(id) {
    test(`delete return order with id = ${id}`, async () => {
        await RetODAO.deleteReturnOrder(id);
        let ro = await RetODAO.getReturnOrderByID(id);
        expect(ro).to.be.undefined;
    });
}

function compareRO(actualRO, expectedRO) {
    return actualRO.returnDate === expectedRO.returnDate &&
        actualRO.restockOrderId === expectedRO.restockOrderId;
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
    "username": "user2@ezwh.com",
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

const itemSample1 = {
    "id": 1,
    "description": "sample description for Item",
    "price": 10,
    "skuId": 1,
    "supplierId": 7
};

const itemSample2 = {
    "id": 2,
    "description": "sample description for Item",
    "price": 10,
    "skuId": 2,
    "supplierId": 7
};

const itemSample3 = {
    "id": 3,
    "description": "sample description for Item",
    "price": 10,
    "skuId": 1,
    "supplierId": 8
};

const itemSample4 = {
    "id": 4,
    "description": "sample description for Item",
    "price": 10,
    "skuId": 3,
    "supplierId": 8
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

let returnOrder1 = {
    "id": 1,
    "returnDate": "2021/12/29 09:33",
    /*"products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 30, "RFID": "12345678901234567890123456789015" },
    { "SKUId": 2, "description": "second sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789025" }],*/
    "restockOrderId": 1
};
let returnOrder2 = {
    "id": 2,
    "returnDate": "2021/12/29 09:33",
    /*"products": [{ "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],*/
    "restockOrderId": 2
};
let returnOrder3 = {
    "id": 2,
    "returnDate": "2021/12/29 09:33",
    "products": [{ "SKUId": 1, "itemId": 1, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789016" },
    { "SKUId": 1, "itemId": 1, "description": "first sku", "price": 10.99, "qty": 20, "RFID": "12345678901234567890123456789017" }],
    "restockOrderId": 3
};

let products1 = [
    { "RFID": "12345678901234567890123456789015", "itemId": 1, "ReturnOrderID": 1 },
    { "RFID": "12345678901234567890123456789016", "itemId": 1, "ReturnOrderID": 1 },
    { "RFID": "12345678901234567890123456789025", "itemId": 2, "ReturnOrderID": 1 }
];
let products2 = [
    { "RFID": "12345678901234567890123456789017", "itemId": 3, "ReturnOrderID": 2 },
    { "RFID": "12345678901234567890123456789018", "itemId": 3, "ReturnOrderID": 2 },
    { "RFID": "12345678901234567890123456789026", "itemId": 4, "ReturnOrderID": 2 },
    { "RFID": "12345678901234567890123456789027", "itemId": 4, "ReturnOrderID": 2 }
];
let products3 = [
    { "RFID": "12345678901234567890123456789015", "itemId": 3, "ReturnOrderID": 2 },
    { "RFID": "12345678901234567890123456789016", "itemId": 3, "ReturnOrderID": 2 },
    { "RFID": "12345678901234567890123456789025", "itemId": 4, "ReturnOrderID": 2 }
];

describe("Test ReturnOrder DAO", () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
        await UserDAO.createUser(supplier1.username, supplier1.name,
            supplier1.surname, supplier1.password, supplier1.type);
        await UserDAO.createUser(supplier2.username, supplier2.name,
            supplier2.surname, supplier2.password, supplier2.type);
        await RestODAO.createRestockOrder(restockOrderIssued1.issueDate,
            restockOrderIssued1.supplierId);
        await RestODAO.createRestockOrder(restockOrderIssued2.issueDate,
            restockOrderIssued2.supplierId);
        await skuDAO.createSKU(SKU1.description, SKU1.weight, SKU1.volume,
            SKU1.notes, SKU1.price, SKU1.availableQuantity);
        await skuDAO.createSKU(SKU2.description, SKU2.weight, SKU2.volume,
            SKU2.notes, SKU2.price, SKU2.availableQuantity);
        await skuDAO.createSKU(SKU3.description, SKU3.weight, SKU3.volume,
            SKU3.notes, SKU3.price, SKU3.availableQuantity);
        await SKUItemDAO.createSKUItem(SKUItem1.RFID, SKUItem1.SKUId, SKUItem1.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem2.RFID, SKUItem2.SKUId, SKUItem2.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem3.RFID, SKUItem3.SKUId, SKUItem3.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem4.RFID, SKUItem4.SKUId, SKUItem4.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem5.RFID, SKUItem5.SKUId, SKUItem5.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem6.RFID, SKUItem6.SKUId, SKUItem6.DateOfStock);
        await SKUItemDAO.createSKUItem(SKUItem7.RFID, SKUItem7.SKUId, SKUItem7.DateOfStock);
        await ItemDAO.createItem(itemSample1);
        await ItemDAO.createItem(itemSample2);
        await ItemDAO.createItem(itemSample3);
        await ItemDAO.createItem(itemSample4);

    });

    describe('test CRUD operations', () => {
        testGetReturnOrders([]);
        testCreateReturnOrder(returnOrder1);
        testCreateReturnOrder(returnOrder2);
        testGetReturnOrderByID(returnOrder1);
        testGetReturnOrderByID(returnOrder2);
        testCreateReturnOrderError(returnOrder3);
        testGetReturnOrders([returnOrder1, returnOrder2]);
        testCreateReturnOrderProducts(1, restockOrderIssued1, products1);
        testCreateReturnOrderProducts(2, restockOrderIssued2, products2);
        testGetReturnOrderProduct(1, products1);
        testGetReturnOrderProduct(2, products2);
        testCreateReturnOrderProductsError(restockOrderIssued2, products3);
        testDeleteReturnOrder(1);
        testDeleteReturnOrder(2);
        testGetReturnOrders([]);
    });

    afterAll(async () => {
        await SKUItemDAO.deleteAllSKUItems();
        await skuDAO.deleteSKU(1);
        await skuDAO.deleteSKU(2);
        await skuDAO.deleteSKU(3);
        await RestODAO.deleteRestockOrder(1);
        await RestODAO.deleteRestockOrder(2);
        await UserDAO.deleteUser(supplier1.username, supplier1.type);
        await UserDAO.deleteUser(supplier2.username, supplier2.type);
    });

});
