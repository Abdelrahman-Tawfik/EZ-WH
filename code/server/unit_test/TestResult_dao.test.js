const chai = require('chai');
const should = chai.should();
const TestResultDAO = require("../database/TestResult_dao");
const dbConnection = require("../database/DatabaseConnection");
const SKU = require("../modules/SKU");
const TestDescriptor = require("../modules/TestDescriptor");
const SKUItem = require("../modules/SKUItem");
const TestResult = require("../modules/TestResult");
const SKUDao = require("../database/SKU_dao");
const TestDescriptorDAO = require("../database/TestDescriptor_dao");
const SKUItemDao = require("../database/SKUItem_dao");

const SKUToAdd = [
    new SKU(1, "sku1", 100, 100, "none", 2,10),
    new SKU(2, "sku2", 100, 100, "none", 2,10),
    new SKU(3, "sku3", 100, 100, "none", 2,10),
]

const testDescriptorsToAdd = [
    new TestDescriptor(1, "Test1", "test1description", 1),
    new TestDescriptor(2, "Test2", "test2description", 2),
    new TestDescriptor(3, "Test3", "test3description", 3),
]

const SKUItemsToAdd = [
    new SKUItem("12345678901234567890123456789012", 2, false, "2021/11/29 12:30"),
    new SKUItem("12345678901234567890123456789013", 2, false, "2022/11/29 12:30"),
    new SKUItem("12345678901234567890123456789014", 1, false, "2021/10/29 12:30")
]

const testResultsToAdd = [
    new TestResult("12345678901234567890123456789012", 1, 1, "2021/10/29 12:30", true),
    new TestResult("12345678901234567890123456789013", 2, 2, "2021/10/15 12:30", false),
    new TestResult("12345678901234567890123456789014", 3, 3, "2019/10/29 12:30", true),
]

const testResultsToEdit = [
    new TestResult("12345678901234567890123456789012", 1, 3, "2026/10/29 12:30", false),
    new TestResult("12345678901234567890123456789013", 2, 2, "2024/10/15 12:30", true),
    new TestResult("12345678901234567890123456789014", 3, 1, "2013/10/29 12:30", true),
]
const errorTestResultToAdd = new TestResult("12345678901234567890123456789012", 1, 50, "2026/10/29 12:30", false);
const errorTestResultToEdit = new TestResult("12345678901234567890123456789012", 1, 50, "2026/10/29 12:30", false);


function compareTestResult(expected, actual) {
    return expected.rfid === actual.rfid && expected.idTestDescriptor === actual.idTestDescriptor &&
        expected.date === actual.date && !!expected.result === !!actual.result;
}

function testCreateTestResult(testResult, expectedError) {
    test(`Create testResult ${testResult.id}`, async function() {
        let id = undefined;
        try {
            id = await TestResultDAO.addTestResult(testResult.rfid, testResult.idTestDescriptor, testResult.date, testResult.result);
        } catch (err) {
            if (!expectedError)
                throw err;
            return;
        }
        Number.isInteger(id).should.be.true;
        const getTestResult = await TestResultDAO.getTestResultByIDAndRFID(testResult.rfid, id);
        compareTestResult(testResult, getTestResult).should.be.true;
    })
}

function testGetTestResultsByRFID(expectedTestResults) {
    test(`Get testResult for RFID ${expectedTestResults[0].rfid}`, async function () {
        const testResults = [...await TestResultDAO.getTestResultsByRFID(expectedTestResults[0].rfid)];
        testResults.should.be.an("array");
        testResults.length.should.be.equal(expectedTestResults.length);
        for (let testResult of expectedTestResults) {
            expectedTestResults.some((tr) => compareTestResult(tr, testResult)).should.be.true;
        }
    });
}

function testDeleteTestResult(testResult) {
    test(`Delete testResult ${testResult.id}`, async function () {
        await TestResultDAO.deleteTestResult(testResult.rfid, testResult.id);
        const getTestResult = await TestResultDAO.getTestResultByIDAndRFID(testResult.rfid, testResult.id);
        should.equal(getTestResult, undefined);
    })
}

function testModifyTestResult(newTestResult, expectedError) {
    test(`Modify testResult ${newTestResult.id} ${expectedError ? "error" : ""}`, async function () {
        try {
            await TestResultDAO.modifyTestResult(newTestResult);
        } catch (err) {
            if (expectedError)
                return;
            else
                throw err;
        }
        const getTestResult = await TestResultDAO.getTestResultByIDAndRFID(newTestResult.rfid, newTestResult.id);
        compareTestResult(newTestResult, getTestResult).should.be.true;
    })
}

describe("Unit Test TestResult_dao", function () {
    beforeAll(async () => {
        await dbConnection.createConnection();
        for (let sku of SKUToAdd)
            await SKUDao.createSKU(sku.description, sku.weight, sku.volume, sku.notes, sku.price, sku.availableQuantity);
        for (let td of testDescriptorsToAdd)
            await TestDescriptorDAO.createTestDescriptor(td.name, td.procedureDescription, td.idSKU);
        for (let skuItem of SKUItemsToAdd)
            await SKUItemDao.createSKUItem(skuItem.rfid, skuItem.sku, skuItem.dateOfStock);
    });
    afterAll(async () => {
        await SKUDao.deleteAllSKUs();
        await SKUItemDao.deleteAllSKUItems();
        for (let td of testDescriptorsToAdd)
            await TestDescriptorDAO.deleteTestDescriptor(td.id);
    });

    testCreateTestResult(errorTestResultToAdd, true);

    for (let tr of testResultsToAdd)
        testCreateTestResult(tr);

    testGetTestResultsByRFID(testResultsToAdd.filter((tr) => tr.rfid === "12345678901234567890123456789012"));
    testGetTestResultsByRFID(testResultsToAdd.filter((tr) => tr.rfid === "12345678901234567890123456789013"));
    testGetTestResultsByRFID(testResultsToAdd.filter((tr) => tr.rfid === "12345678901234567890123456789014"));

    for (let tr of testResultsToEdit)
        testModifyTestResult(tr);
    testModifyTestResult(errorTestResultToEdit, true);

    for (let tr of testResultsToAdd)
        testDeleteTestResult(tr);
})