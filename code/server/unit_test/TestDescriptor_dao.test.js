const chai = require('chai');
const should = chai.should();
const TestDescriptorDAO = require("../database/TestDescriptor_dao");
const dbConnection = require("../database/DatabaseConnection");
const TestDescriptor = require("../modules/TestDescriptor");
const SKU = require("../modules/SKU");
const SKUDao = require("../database/SKU_dao");

const SKUToAdd = [
    new SKU(1, "sku1", 100, 100, "none", 2, 10),
    new SKU(2, "sku2", 100, 100, "none", 2, 10),
    new SKU(3, "sku3", 100, 100, "none", 2, 10),
]

const testDescriptorsToAdd = [
    new TestDescriptor(1, "Test1", "test1description", 1),
    new TestDescriptor(2, "Test2", "test2description", 2),
    new TestDescriptor(3, "Test3", "test3description", 3),
]

const testDescriptorsToModify = [
    new TestDescriptor(1, "ModifiedTest1", "modifiedtest1description", 1),
    new TestDescriptor(2, "ModifiedTest2", "modifiedtest2description", 2),
    new TestDescriptor(3, "ModifiedTest3", "modifiedtest3description", 3),
]

const errorCreateTestDescriptor = new TestDescriptor(4, "WrongTest4", "wrongtest4description", 50);

const errorModifyTestDescriptor = new TestDescriptor(3, "WrongTest4", "wrongtest4description", 50);

function compareTestDescriptor(expected, actual) {
    return expected.name === actual.name && expected.procedureDescription === actual.procedureDescription && expected.idSKU === actual.idSKU;
}

function testCreateTestDescriptor(testDescriptor, expectedError) {
    test(`Create testDescriptor ${testDescriptor.id} ${expectedError ? "error" : ""}`, async function () {
        let id = undefined;
        try {
            id = await TestDescriptorDAO.createTestDescriptor(testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU);
        } catch (err) {
            if (!expectedError)
                throw err;
            return;
        }
        Number.isInteger(id).should.be.true;
        const getTestDescriptor = await TestDescriptorDAO.getTestDescriptorByID(id);
        compareTestDescriptor(testDescriptor, getTestDescriptor).should.be.true;
    })
}

function testDeleteTestDescriptor(testDescriptor) {
    test(`Delete testDescriptor ${testDescriptor.id}`, async function () {
        await TestDescriptorDAO.deleteTestDescriptor(testDescriptor.id);
        const getTestDescriptor = await TestDescriptorDAO.getTestDescriptorByID(testDescriptor.id);
        should.equal(getTestDescriptor, undefined);
    })
}

function testGetTestDescriptors(expectedTestDescriptors) {
    test("Get all testDescriptors", async function () {
        const testDescriptors = [...await TestDescriptorDAO.getTestDescriptors()];
        testDescriptors.should.be.an("array");
        testDescriptors.length.should.be.equal(expectedTestDescriptors.length);
        for (let testDescriptor of testDescriptors) {
            expectedTestDescriptors.some((td) => compareTestDescriptor(td, testDescriptor)).should.be.true;
        }
    });
}

function testModifyTestDescriptor(newTestDescriptor, expectedError) {
    test(`Modify testDescriptor ${newTestDescriptor.id} ${expectedError ? "error" : ""}`, async function () {
        try {
            await TestDescriptorDAO.modifyTestDescriptor(newTestDescriptor);
        } catch (err) {
            if (expectedError)
                return;
            else
                throw err;
        }
        const getTestDescriptor = await TestDescriptorDAO.getTestDescriptorByID(newTestDescriptor.id);
        compareTestDescriptor(newTestDescriptor, getTestDescriptor).should.be.true;
    })
}

describe("Unit Test TestDescriptor_dao", function () {
    beforeAll(async () => {
        await dbConnection.createConnection();
        for (let sku of SKUToAdd)
            await SKUDao.createSKU(sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity);
    });
    afterAll(async () => {
        await SKUDao.deleteAllSKUs();
    })
    for (let td of testDescriptorsToAdd)
        testCreateTestDescriptor(td);

    testGetTestDescriptors(testDescriptorsToAdd);

    for (let td of testDescriptorsToModify)
        testModifyTestDescriptor(td);

    for (let td of testDescriptorsToAdd)
        testModifyTestDescriptor(td);

    testCreateTestDescriptor(errorCreateTestDescriptor, true);
    testModifyTestDescriptor(errorModifyTestDescriptor, true);

    for (let td of testDescriptorsToAdd)
        testDeleteTestDescriptor(td);

})
