const chai = require('chai');
chai.should();
const { expect } = require('chai');
const dao = require('../database/RestockOrder_dao');
const Item_dao = require('../database/Item_dao');
const SKU_dao = require('../database/SKU_dao');
const SKUItem_dao = require('../database/SKUItem_dao');
const ReturnOrder_dao = require('../database/ReturnOrder_dao');
const TestDescriptor_dao = require('../database/TestDescriptor_dao');
const TestResult_dao = require('../database/TestResult_dao');
const dbConnection = require("../database/DatabaseConnection");


const restockOrderSample1 = {
    "id": 1,
    "issueDate": "2020/01/01 08:00",
    "state": "ISSUED",
    "supplierId": 1,
    "products": [],
    "skuItems": []
};
const SKUSample1 = {
    "id": 1,
    "description": "sampled description for SKU",
    "weight": 30,
    "volume": 40,
    "notes": "sample note for SKU",
    "price": 10,
    "availableQuantity": 50
}
const itemSample1 = {
    "id": 1,
    "description": "sample description for Item",
    "price": SKUSample1.price,
    "skuId": 1,
    "supplierId": 1
};
const productSample1 = {
    "SKUId": itemSample1.skuId,
    "itemId": itemSample1.id,
    "description": itemSample1.description,
    "price": itemSample1.price,
    "qty": 20,
};
const SKUItemSampel1 = {
    "SKUId": SKUSample1.id,
    "RFID": "12345678901234567890123456789015",
    "itemId": itemSample1.id,
    "dateOfStock": "2021-01-01 09:00"
}
// const products = [productSample];

function testCreateRestockOrder(restockOrder) {
    test(`Create and Get By ID { issueDate: ${restockOrder.issueDate}, supplierId: ${restockOrder.supplierId} }`, async function () {
        const id = await dao.createRestockOrder(restockOrder.issueDate, restockOrder.supplierId);
        const getRestockOrder = await dao.getRestockOrderByID(id);
        compareRestockOrder(restockOrder, getRestockOrder).should.be.true;
    });
}

function testGetRestockOrders(expectedRestockOrders) {
    test(`Get all Restock Orders`, async function () {
        const getRestockOrders = await dao.getRestockOrders();
        for (let restockOrder of getRestockOrders) {
            expectedRestockOrders.some(
                (r) => compareRestockOrder(r, restockOrder)
            ).should.be.true;
        }
    });
}

function testDeleteRestockOrder(restockOrder) {
    test(`Delete and Get By ID { restockOrderID: ${restockOrder.id} }`, async function () {
        await dao.deleteRestockOrder(restockOrder.id);
        const getRestockOrder = await dao.getRestockOrderByID(restockOrder.id);
        expect(getRestockOrder).to.be.undefined;
    });
}

function testCreateRestockOrderProduct(restockOrder, product, itemID) {
    test(`Restock Order Product, Create and Get By ID { SKUId: ${product.SKUId} }`, async function () {
        await dao.createRestockOrderProduct(product.itemId, restockOrder.supplierId, restockOrder.id, product.qty);
        const getProducts = await dao.getRestockOrderProductsByRestockOrderID(restockOrder.id);
        const getProduct = getProducts[0];
        (getProducts.length === 1).should.be.true;
        (
            itemID === getProduct.ItemID &&
            restockOrder.id === getProduct.RestockOrderID &&
            product.qty === getProduct.QTY
        ).should.be.true;
    });
}

function testAddSkuItemToRestockOrder(restockOrder, skuItem){
    test(`Restock Order SKUItem, Create and Get By ID { RFID: ${skuItem.RFID} }`, async function () {
        await dao.addSkuItemToRestockOrder(restockOrder.id, skuItem.RFID, skuItem.SKUId, skuItem.itemId, restockOrder.supplierId);
        const getSKUItems = await dao.getRestockOrderSKUItemsByRestockOrderID(restockOrder.id);
        const getSKUItem = getSKUItems[0];
        (getSKUItems.length === 1).should.be.true;
        (
            getSKUItem.RFID === skuItem.RFID &&
            getSKUItem.ItemID === skuItem.itemId &&
            getSKUItem.RestockOrderID === restockOrder.id
        ).should.be.true;
    });
}

function testModifyRestockOrderState(restockOrder, newState){
    test(`Modify State { restockOrderID : ${restockOrder.id} }`, async function () {
        await dao.modifyRestockOrderState(restockOrder.id, newState);
        const getRestockOrder = await dao.getRestockOrderByID(restockOrder.id);
        (getRestockOrder.state === newState).should.be.true;
    });
}

function testAddTransportNoteToRestockOrder(restockOrder, transportNote){
    test(`Add transport note { restockOrderID : ${restockOrder.id} }`, async function () {
        await dao.addTransportNoteToRestockOrder(restockOrder.id, transportNote);
        const getRestockOrder = await dao.getRestockOrderByID(restockOrder.id);
        (getRestockOrder.transportNote === transportNote).should.be.true;
    });
}

function testGetRestockOrderReturnItems(restockOrder, returnItem){
    test(`Get Restock Order return Items { restockOrderID : ${restockOrder.id} }`, async function () {
        await ReturnOrder_dao.createReturnOrder("2020-01-01", restockOrder.id);
        await ReturnOrder_dao.createReturnOrderProducts(1, SKUItemSampel1.RFID, itemSample1.id, itemSample1.supplierId);  //1 is returnorderid
        await TestDescriptor_dao.createTestDescriptor("", "", SKUItemSampel1.SKUId);
        await TestResult_dao.addTestResult(SKUItemSampel1.RFID, 1, "", false);  //1 is testdescriptorid
        const getReturnItems = await dao.getRestockOrderReturnItems(restockOrder.id);
        const getReturnItem = getReturnItems[0];
        (getReturnItem.rfid === returnItem.rfid &&
            getReturnItem.itemId === returnItem.itemId &&
            getReturnItem.SKUId === returnItem.SKUId).should.be.true;
    });
}

function compareRestockOrder(actualRestockOrder, expectedRestockOrder) {
    const result = actualRestockOrder.issueDate === expectedRestockOrder.issueDate &&
        actualRestockOrder.state === expectedRestockOrder.state &&
        actualRestockOrder.supplierID === expectedRestockOrder.supplierID &&
        actualRestockOrder.transportNote === expectedRestockOrder.transportNote &&
        actualRestockOrder.products.length === expectedRestockOrder.products.length;
    if (result) {
        for (let i = 0; i < actualRestockOrder.length; i++) {
            let a_product = actualRestockOrder.products[i];
            let e_product = expectedRestockOrder.products[i];
            if (a_product.SKUId !== e_product.SKUId ||
                a_product.ItemId !== e_product.ItemId ||
                a_product.description !== e_product.description ||
                a_product.price !== e_product.price ||
                a_product.qty !== e_product.qty)
                return false;
        }
        return true;
    }
    else {
        return false;
    }
}

describe('Unit test RestockOrder_dao', () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
        await SKU_dao.createSKU(SKUSample1.description, SKUSample1.weight, SKUSample1.volume, SKUSample1.notes, SKUSample1.price, SKUSample1.availableQuantity);
        await Item_dao.createItem(itemSample1);
        await SKUItem_dao.createSKUItem(SKUItemSampel1.RFID, SKUItemSampel1.SKUId, SKUItemSampel1.dateOfStock);

    })
    testCreateRestockOrder(restockOrderSample1);
    testGetRestockOrders([restockOrderSample1]);
    testCreateRestockOrderProduct(restockOrderSample1, productSample1, itemSample1.id);
    testAddSkuItemToRestockOrder(restockOrderSample1, SKUItemSampel1);
    testModifyRestockOrderState(restockOrderSample1, "DELIVERED");
    testAddTransportNoteToRestockOrder(restockOrderSample1, " { delivered : 2020/02/02 } ");
    testGetRestockOrderReturnItems(restockOrderSample1, { "SKUId": SKUItemSampel1.SKUId, "itemId": SKUItemSampel1.itemId, "rfid": SKUItemSampel1.RFID})
    testDeleteRestockOrder(restockOrderSample1);
    afterAll(async () => {
        await TestResult_dao.deleteTestResult(SKUItemSampel1.RFID, 1);
        await TestDescriptor_dao.deleteTestDescriptor(1);
        await ReturnOrder_dao.deleteReturnOrder(1);
        await SKUItem_dao.deleteSKUItem(SKUItemSampel1.id);
        await Item_dao.deleteItem(itemSample1.id);
        await SKU_dao.deleteSKU(SKUSample1.id);
    })
});