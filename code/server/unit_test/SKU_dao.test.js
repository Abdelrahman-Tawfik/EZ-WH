const chai = require('chai');
chai.should();
const skuDAO = require('../database/SKU_dao');
const posDAO = require('../database/Position_dao');
const tdDAO = require("../database/TestDescriptor_dao");
const SKU = require("../modules/SKU");
const Position = require("../modules/Position");
const dbConnection = require("../database/DatabaseConnection");
const { expect } = require('chai');
const TestDescriptor = require('../modules/TestDescriptor');

function testGetSKUs(expectedSKUs) {
    test('Get All SKUs', async function () {
        let skus = await skuDAO.getSKUs();
        skus.length.should.be.equal(expectedSKUs.length);
        for (let i = 0; i < expectedSKUs.length; i++)
            expectedSKUs.some((sku) => {
                return compareSKU(skus[i], sku)
            }).should.be.true;
    });
}

function testGetTestDescriptorsBySKUID(id, expectedTestDescriptors) {
    test(`Get test descriptors of SKUID ${id}`, async function () {
        let tds = await skuDAO.getTestDescriptorsBySKUID(id);
        tds.length.should.be.equal(expectedTestDescriptors.length);
        for (let i = 0; i < expectedTestDescriptors.length; i++)
            (expectedTestDescriptors.some((td) => {
                return compareTestDescriptor(tds[i], td)
            })).should.be.true;
    });
}

function testCreateSKU(expectedSKU) {
    test('Create SKU', async function () {
        await skuDAO.createSKU(expectedSKU.description, expectedSKU.weight,
            expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let actualSKU = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(actualSKU, expectedSKU).should.be.true;
    })
}

function testGetSKUById(id, expectedSKU) {
    test(`Get SKU by ID ${id}`, async function () {
        let sku = await skuDAO.getSKUById(id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testModifySKU(expectedSKU) {
    test(`Modify SKU ${expectedSKU.id}`, async function () {
        await skuDAO.modifySKU(expectedSKU.id, expectedSKU.description,
            expectedSKU.weight, expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let sku = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testAddSKUPosition(expectedSKU) {
    test(`Add position${expectedSKU.positionID} to SKU ${expectedSKU.id} `, async function () {
        await skuDAO.addSKUPosition(expectedSKU.id, expectedSKU.positionID);
        let sku = await skuDAO.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testDeleteSKU(id) {
    test(`Delete SKU ${id}`, async () => {
        await skuDAO.deleteSKU(id);
        let sku = await skuDAO.getSKUById(id);
        expect(sku).to.be.undefined;
    });
}

function compareSKU(actualSKU, expectedSKU) {
    if (expectedSKU === undefined) return true;
    else
        return actualSKU.description === expectedSKU.description &&
            actualSKU.weight === expectedSKU.weight &&
            actualSKU.volume === expectedSKU.volume &&
            actualSKU.notes === expectedSKU.notes &&
            actualSKU.availableQuantity === expectedSKU.availableQuantity &&
            actualSKU.positionID == expectedSKU.positionID &&
            actualSKU.position == expectedSKU.position &&
            actualSKU.price === expectedSKU.price;
}

function compareTestDescriptor(actualTD, expectedTD) {
    return actualTD.name === expectedTD.name &&
        actualTD.procedureDescription === expectedTD.procedureDescription &&
        actualTD.idSKU === expectedTD.idSKU;
}

let SKU1 = new SKU(1, "a new sku", 100, 50, "first SKU", 10.99, 50);
let SKU2 = new SKU(2, "a second sku", 110, 60, "second SKU", 11.99, 60);
let newSKU1 = new SKU(SKU1.id, "newDescription", SKU1.weight, 60, "newNotes", 12.99, 20);
let pos1 = new Position("800234543412", "8002", "3454", "3412", 1000, 1000);
let pos2 = new Position("801234543412", "8012", "3454", "3412", 1000, 1000);
let SKU1Pos = new SKU(newSKU1.id, newSKU1.description, newSKU1.weight, newSKU1.volume,
    newSKU1.notes, newSKU1.price, newSKU1.availableQuantity, pos1.positionID);
let SKU2Pos = new SKU(SKU2.id, SKU2.description, SKU2.weight, SKU2.volume,
        SKU2.notes, SKU2.price, SKU2.availableQuantity, pos2.positionID);
let td1 = new TestDescriptor(1, "Test1", "procedure 1", 1);
let td2 = new TestDescriptor(2, "Test2", "procedure 2", 1);
let td3 = new TestDescriptor(3, "Test3", "procedure 3", 1);
let td4 = new TestDescriptor(4, "Test4", "procedure 4", 2);
let td5 = new TestDescriptor(5, "Test5", "procedure 5", 2);
let td6 = new TestDescriptor(6, "Test6", "procedure 6", 2);

describe('Test SKU DAO', () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
    });

    describe('test create/get functions', () => {
        testCreateSKU(SKU1);
        testGetSKUs([SKU1]);
        testCreateSKU(SKU2);
        testGetSKUById(1, SKU1);
        testGetSKUById(2, SKU2);
        testGetSKUs([SKU1, SKU2]);
        afterAll(async () => {
            await posDAO.createPosition(pos1);
            await posDAO.createPosition(pos2);
            await tdDAO.createTestDescriptor(td1.name,td1.procedureDescription, td1.idSKU);
            await tdDAO.createTestDescriptor(td2.name,td2.procedureDescription, td2.idSKU);
            await tdDAO.createTestDescriptor(td3.name,td3.procedureDescription, td3.idSKU);
            await tdDAO.createTestDescriptor(td4.name,td4.procedureDescription, td4.idSKU);
            await tdDAO.createTestDescriptor(td5.name,td5.procedureDescription, td5.idSKU);
            await tdDAO.createTestDescriptor(td6.name,td6.procedureDescription, td6.idSKU);
        });
    })
    describe('test modify/delete SKU', () => {
        testGetTestDescriptorsBySKUID(1, [td1, td2, td3]);
        testGetTestDescriptorsBySKUID(2, [td4, td5, td6]);
        testModifySKU(newSKU1);
        testGetSKUs([newSKU1, SKU2]);
        testAddSKUPosition(SKU1Pos);
        testAddSKUPosition(SKU2);
        testGetSKUs([SKU1Pos, SKU2]);
        testDeleteSKU(1);
        testDeleteSKU(2);
        testGetSKUs([]);
        afterAll(async ()=>{
            await posDAO.deletePosition(pos1.positionID);
            await posDAO.deletePosition(pos2.positionID);
            await tdDAO.deleteTestDescriptor(1);
            await tdDAO.deleteTestDescriptor(2);
            await tdDAO.deleteTestDescriptor(3);
            await tdDAO.deleteTestDescriptor(4);
            await tdDAO.deleteTestDescriptor(5);
            await tdDAO.deleteTestDescriptor(6);
        });
    });
})

