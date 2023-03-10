const chai = require('chai');
chai.should();
const posDAO = require('../database/Position_dao');
const tdDAO = require('../database/TestDescriptor_dao');
const SKU = require("../modules/SKU");
const SKUService = require("../services/SKU_service");
const skuService = new SKUService();
const Position = require("../modules/Position");
const dbConnection = require("../database/DatabaseConnection");
const EzWhException = require('../modules/EzWhException');
const TestDescriptor = require('../modules/TestDescriptor');

function testGetSKUs(expectedSKUs) {
    test("get all SKUs", async function () {
        let skus = await skuService.getSKUs();
        skus.length.should.be.equal(expectedSKUs.length);
        for (let i = 0; i < expectedSKUs.length; i++)
            expectedSKUs.some((sku) => {
                return compareSKU(skus[i], sku)
            }).should.be.true;
    });
}

function testCreateSKU(expectedSKU) {
    test('create sku', async function () {
        await skuService.createSKU(expectedSKU.description, expectedSKU.weight,
            expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let actualSKU = await skuService.getSKUById(expectedSKU.id);
        compareSKU(actualSKU, expectedSKU).should.be.true;
    })
}

function testCreateSKUError(expectedSKU, error) {
    test(`create sku with error`, async function () {
        try {
            await skuService.createSKU(expectedSKU.description, expectedSKU.weight,
                expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
                expectedSKU.availableQuantity);
        }
        catch (err) {
            err.should.be.equal(error);
        }
    });
}

function testGetSKUById(id, expectedSKU) {
    test(`get sku with id=${id}`, async function () {
        let sku = await skuService.getSKUById(id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testGetSKUByIdError(id, error) {
    test(`get sku with error`, async function () {
        try {
            await skuService.getSKUById(id);
        }
        catch (err) {
            err.should.be.equal(error);
        }
    });
}

function testModifySKU(expectedSKU) {
    test(`modify sku with id=${expectedSKU.id}`, async function () {
        await skuService.modifySKU(expectedSKU.id, expectedSKU.description,
            expectedSKU.weight, expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
            expectedSKU.availableQuantity);
        let sku = await skuService.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testModifySKUError(expectedSKU, error) {
    test(`get sku with error`, async function () {
        try {
            await skuService.modifySKU(expectedSKU.id, expectedSKU.description,
                expectedSKU.weight, expectedSKU.volume, expectedSKU.notes, expectedSKU.price,
                expectedSKU.availableQuantity);
        }
        catch (err) {
            err.should.be.equal(error);
        }
    });
}

function testAddSKUPosition(expectedSKU) {
    test(`add position with id=${expectedSKU.positionID} to sku with id=${expectedSKU.id}`, async function () {
        await skuService.addSKUPosition(expectedSKU.id, expectedSKU.positionID);
        let sku = await skuService.getSKUById(expectedSKU.id);
        compareSKU(sku, expectedSKU).should.be.true;
    });
}

function testAddSKUPositionError(skuId, positionId, error) {
    test(`add position to sku with error`, async function () {
        try {
            await skuService.addSKUPosition(skuId, positionId);
        }
        catch (err) {
            err.should.be.equal(error);
        }
    });
}

function testDeleteSKU(id) {
    test(`delete SKU with id = ${id}`, async () => {
        await skuService.deleteSKU(id);
        try {
            await skuService.getSKUById(id);
        }
        catch (err) {
            err.should.be.equal(EzWhException.NotFound);
        }
    });
}

function compareSKU(actualSKU, expectedSKU) {
    if (expectedSKU === undefined) return true;
    else {
        let cmp = actualSKU.description === expectedSKU.description &&
            actualSKU.weight === expectedSKU.weight &&
            actualSKU.volume === expectedSKU.volume &&
            actualSKU.notes === expectedSKU.notes &&
            actualSKU.availableQuantity === expectedSKU.availableQuantity &&
            actualSKU.positionID == expectedSKU.positionID &&
            comparePosition(actualSKU.position, expectedSKU.position) &&
            actualSKU.price === expectedSKU.price &&
            actualSKU.testDescriptors.length === expectedSKU.testDescriptors.length;
        if (cmp === false) return false;
        for (i = 0; i < actualSKU.testDescriptors.length && cmp; i++)
            cmp = expectedSKU.testDescriptors.some((td) => {
                return compareTestDescriptor(
                    actualSKU.testDescriptors[i], td);
            });
        return cmp;
    }
}

function compareTestDescriptor(actualTD, expectedTD) {
    return actualTD.name === expectedTD.name &&
        actualTD.procedureDescription === expectedTD.procedureDescription &&
        actualTD.idSKU === expectedTD.idSKU;
}

function comparePosition(actualPos, expectedPos) {
    if (expectedPos == undefined && actualPos == undefined) return true;
    if (expectedPos == undefined || actualPos == undefined) return false;
    return actualPos.positionID === expectedPos.positionID &&
        actualPos.aisleID === expectedPos.aisleID &&
        actualPos.row === expectedPos.row &&
        actualPos.col === expectedPos.col &&
        actualPos.maxWeight === expectedPos.maxWeight &&
        actualPos.maxVolume === expectedPos.maxVolume &&
        actualPos.occupiedWeight === expectedPos.occupiedWeight;
    //&& actualPos.sku === expectedPos.sku;
}

let td1 = new TestDescriptor(1, "test descriptor 1", "This test is described by...", 1);
let td2 = new TestDescriptor(2, "test descriptor 2", "This test is described by...", 1);
let SKU1 = new SKU(1, "a new sku", 100, 50, "first SKU", 10.99, 50);
let SKU2 = new SKU(2, "a second sku", 110, 60, "second SKU", 11.99, 60);
let SKUError1 = new SKU(3, "a new sku", "abc", true, "first SKU", undefined, null);
let SKUError2 = new SKU(1, "a new sku", "abc", true, "first SKU", undefined, null);
let newSKU1 = new SKU(SKU1.id, "newDescription", SKU1.weight, 60, "newNotes", 12.99, 20, null, null, [td1, td2]);
let newSKU1Err = new SKU(SKU1.id, "newDescription", SKU1.weight, 60, "newNotes", 12.99, 100);
let pos1 = new Position("800234543412", "8002", "3454", "3412", 5000, 5000);
let pos2 = new Position("801234543412", "8012", "3454", "3412", 1000, 1000);
let newPos1 = new Position("800234543412", "8002", "3454", "3412", 5000, 5000, 2000, 1200);
let newPos1_1 = new Position("800234543412", "8002", "3454", "3412", 5000, 5000, 800, 1200);
let SKU1Pos = new SKU(newSKU1.id, newSKU1.description, newSKU1.weight, newSKU1.volume,
    newSKU1.notes, newSKU1.price, newSKU1.availableQuantity, pos1.positionID, newPos1, [td1, td2]);
let newSKU1Pos = new SKU(newSKU1.id, newSKU1.description, 20, 30,
    newSKU1.notes, newSKU1.price, 40, pos1.positionID, newPos1_1, [td1, td2]);

describe('Test SKU Service', () => {
    beforeAll(async () => {
        await dbConnection.createConnection();
    });
    describe('test create/get sku', () => {
        testGetSKUs([]);
        testCreateSKU(SKU1);
        testCreateSKU(SKU2);
        testGetSKUById(1, SKU1);
        testGetSKUById(2, SKU2);
        afterAll(async () => {
            await posDAO.createPosition(pos1);
            await posDAO.createPosition(pos2);
            await tdDAO.createTestDescriptor(td1.name,
                td1.procedureDescription, td1.idSKU);
            await tdDAO.createTestDescriptor(td2.name,
                td2.procedureDescription, td2.idSKU);
        });
    });
    describe("test modify sku", () => {
        testModifySKU(newSKU1);
        testGetSKUById(1, newSKU1);
        testGetSKUs([newSKU1, SKU2]);
        testAddSKUPosition(SKU1Pos);
        testModifySKU(newSKU1Pos);
    });

    describe('test sku errors', () => {
        testModifySKUError(SKUError1, EzWhException.NotFound);
        testModifySKUError(SKUError2, EzWhException.InternalError);
        testCreateSKUError(SKUError1, EzWhException.InternalError);
        testGetSKUByIdError(3, EzWhException.NotFound);
        testAddSKUPositionError(3, pos2.positionID, EzWhException.NotFound);
        testAddSKUPositionError(2, "123", EzWhException.NotFound);
        testAddSKUPositionError(2, pos2.positionID, EzWhException.PositionFull);
        testModifySKUError(newSKU1Err, EzWhException.PositionFull);
    })

    describe('test delete sku', () => {
        testGetSKUById(1, newSKU1Pos);
        testGetSKUById(2, SKU2);
        testDeleteSKU(1);
        testDeleteSKU(2);
        testGetSKUs([]);
        afterAll(async () => {
            await posDAO.deletePosition(pos1.positionID);
            await posDAO.deletePosition(pos2.positionID);
        });
    });
    
});