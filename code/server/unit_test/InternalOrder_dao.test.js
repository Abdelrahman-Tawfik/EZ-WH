const chai = require('chai');
const should = chai.should();
const dbConnection = require("../database/DatabaseConnection");
const InternalOrder = require("../modules/InternalOrder");
const SKU = require("../modules/SKU");
const SKUItem = require("../modules/SKUItem");
const {User} = require("../modules/User");
const SKUDao = require("../database/SKU_dao");
const SKUItemDao = require("../database/SKUItem_dao");
const UserDAO = require("../database/User_dao");
const InternalOrderDAO = require("../database/InternalOrder_dao");

const states = ["ISSUED", "ACCEPTED", "REFUSED", "CANCELED", "COMPLETED"];

const SKUToAdd = [
    new SKU(1, "sku1", 100, 100, "none", 2, 10),
    new SKU(2, "sku2", 100, 100, "none", 2, 10),
    new SKU(3, "sku3", 100, 100, "none", 2, 10),
]

const SKUItemsToAdd = [
    new SKUItem("12345678901234567890123456789012", 1, false, "2021/11/29 12:30"),
    new SKUItem("12345678901234567890123456789013", 2, false, "2022/11/29 12:30"),
    new SKUItem("12345678901234567890123456789014", 1, false, "2021/10/29 12:30"),
    new SKUItem("12345678901234567890123456789015", 3, false, "2021/10/29 12:30"),
]

const errorSKUItems = [
    new SKUItem("123456789012345678901234567890188", 1, false, "2021/11/29 12:30"),
]

const usersToAdd = [
    new User(7, "Zoey", "Bennet", "customer2@ezwh.com", "customer", "testpassword"),
    new User(8, "Scott", "Cartwright", "customer3@ezwh.com", "customer", "testpassword"),
]

const internalOrdersToAdd = [
    new InternalOrder(1, "2021/11/29 09:33", states[0], 7,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[0], 8,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

const errorInternalOrders = [
    new InternalOrder(1, "2021/11/29 09:33", states[0], 7,
        [{"SKUId": 50, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[0], 50,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

const internalOrdersState1 = [
    new InternalOrder(1, "2021/11/29 09:33", states[1], 7,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[1], 8,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

const internalOrdersState2 = [
    new InternalOrder(1, "2021/11/29 09:33", states[2], 7,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[1], 8,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

const internalOrdersState3 = [
    new InternalOrder(1, "2021/11/29 09:33", states[3], 7,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[1], 8,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

const internalOrdersState4 = [
    new InternalOrder(1, "2021/11/29 09:33", states[4], 7,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 2, "description": "sku2", "price": 2, "qty": 3}]),
    new InternalOrder(2, "2013/11/29 09:33", states[1], 8,
        [{"SKUId": 1, "description": "sku1", "price": 2, "qty": 3},
            {"SKUId": 3, "description": "sku3", "price": 2, "qty": 3}])
]

function compareInternalOrder(expected, actual) {
    return expected.id === actual.id && expected.issueDate === actual.issueDate &&
        expected.state === actual.state && expected.customerId === actual.customerId;
}

function compareInternalOrderProduct(expected, actual) {
    return expected.SKUId === actual.SKUID && expected.description === actual.description &&
        expected.price === actual.price && expected.qty === actual.QTY;
}

function compareInternalOrderSKUItem(expected, actual) {
    return expected.rfid === actual.RFID && expected.sku === actual.SKUID;
}

function testCreateInternalOrder(internalOrder, expectedError) {
    test(`Create InternalOrder`, async function() {
        let id = undefined;
        try {
            id = await InternalOrderDAO.createInternalOrder(internalOrder.issueDate, internalOrder.customerId)
            for (let product of internalOrder.products)
                await InternalOrderDAO.createInternalOrderProduct(id, product.SKUId, product.description, product.price, product.qty);
        } catch (err) {
            await InternalOrderDAO.deleteInternalOrder(internalOrder.id);
            if (!expectedError)
                throw err;
            return;
        }
        Number.isInteger(id).should.be.true;
        const getInternalOrder = (await InternalOrderDAO.getInternalOrderByID(id))[0];
        compareInternalOrder(internalOrder, getInternalOrder).should.be.true;
        let getInternalOrderProducts = await InternalOrderDAO.getInternalOrderProductByInternalOrderID(id)
        for (let product of getInternalOrderProducts)
            internalOrder.products.some((iop) => compareInternalOrderProduct(iop, product)).should.be.true;
    });
}

function testDeleteInternalOrder(internalOrder) {
    test(`Delete InternalOrder ${internalOrder.id}`, async function () {
        await InternalOrderDAO.deleteInternalOrder(internalOrder.id);
        const getInternalOrder = await InternalOrderDAO.getInternalOrderByID(internalOrder.id);
        should.equal(getInternalOrder.length, 0);
    })
}

function testGetInternalOrders(state, expectedInternalOrders) {
    test(`Get InternalOrders with state=${state}`, async function () {
        let getInternalOrders = await InternalOrderDAO.getInternalOrders(state);
        for (let internalOrder of getInternalOrders) {
            expectedInternalOrders.some((io) => compareInternalOrder(io, internalOrder)).should.be.true;
        }
    })
}

function testModifyInternalOrderState(internalOrder, skuItems, expectedError) {
    test(`Modify internalOrder ${internalOrder.id} to state ${internalOrder.state}`, async function () {
        await InternalOrderDAO.modifyInternalOrderState(internalOrder.id, internalOrder.state);
        let getInternalOrder = (await InternalOrderDAO.getInternalOrderByID(internalOrder.id))[0];
        compareInternalOrder(internalOrder, getInternalOrder).should.be.true;
        if (internalOrder.state === states[4]) {
            try {
                for (let skuItem of skuItems)
                    await InternalOrderDAO.createInternalOrderSKUItem(internalOrder.id, skuItem.sku, skuItem.rfid);
            } catch (err) {
                await InternalOrderDAO.modifyInternalOrderState(internalOrder.id, states[3]);
                if (!expectedError)
                    throw err;
                return;
            }
            let getInternalOrderSKUItems = await InternalOrderDAO.getInternalOrderSKUItemByInternalOrderID(internalOrder.id);
            for (let internalOrderSKUItem of getInternalOrderSKUItems)
                skuItems.some((si) => compareInternalOrderSKUItem(si, internalOrderSKUItem)).should.be.true;
        }
    })
}

describe("Unit Test InternalOrder_dao", function () {
    beforeAll(async () => {
        await dbConnection.createConnection();
        for (let sku of SKUToAdd)
            await SKUDao.createSKU(sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity);
        for (let skuItem of SKUItemsToAdd)
            await SKUItemDao.createSKUItem(skuItem.rfid, skuItem.sku, skuItem.dateOfStock);
        for (let user of usersToAdd)
            await UserDAO.createUser(user.email, user.name, user.surname, User.storePassword(user.password), user.type);
    });
    afterAll(async () => {
        await SKUDao.deleteAllSKUs();
        await SKUItemDao.deleteAllSKUItems();
        for (let user of usersToAdd)
            await UserDAO.deleteUser(user.email, user.type);
        for (let internalOrder of internalOrdersToAdd)
            await InternalOrderDAO.deleteInternalOrder(internalOrder.id);
    });
    for (let internalOrder of errorInternalOrders)
        testCreateInternalOrder(internalOrder, true);

    for (let internalOrder of internalOrdersToAdd)
        testCreateInternalOrder(internalOrder);

    testGetInternalOrders(states[0], internalOrdersToAdd);

    for (let internalOrder of internalOrdersState1)
        testModifyInternalOrderState(internalOrder);

    for (let internalOrder of internalOrdersState2)
        testModifyInternalOrderState(internalOrder);

    for (let internalOrder of internalOrdersState3)
        testModifyInternalOrderState(internalOrder);

    testModifyInternalOrderState(internalOrdersState4[0], errorSKUItems, true);

    testModifyInternalOrderState(internalOrdersState4[0], [SKUItemsToAdd[0], SKUItemsToAdd[1]]);
    testModifyInternalOrderState(internalOrdersState4[1], [SKUItemsToAdd[2], SKUItemsToAdd[3]]);



    for (let internalOrder of internalOrdersToAdd)
        testDeleteInternalOrder(internalOrder);

})