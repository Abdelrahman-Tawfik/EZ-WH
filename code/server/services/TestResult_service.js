const dao = require("../database/TestResult_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const TestDescriptor_dao = require("../database/TestDescriptor_dao");
const EzWhException = require("../modules/EzWhException.js");

class TestResultService {
    constructor() {
    }

    async getTestResultsByRFID(RFID) {
        // TODO
        try {
            let skuItem = await SKUItem_dao.getSKUItemByRfid(RFID);
            console.log(skuItem);
            console.log(RFID);
            if (skuItem === undefined) throw EzWhException.NotFound;
            let TestResultList = await dao.getTestResultsByRFID(RFID);
            console.log(TestResultList);
            return TestResultList.map((tr) => {
                return {
                    id: tr.id,
                    idTestDescriptor: tr.idTestDescriptor,
                    Date: tr.date,
                    Result: !!tr.result,
                };
            });
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async getTestResultByIDAndRFID(RFID, id) {
        // TODO
        try {
            let td = await dao.getTestResultByIDAndRFID(RFID, id);
            if (td === undefined) throw EzWhException.NotFound;
            else
                return {
                    id: td.id,
                    idTestDescriptor: td.idTestDescriptor,
                    Date: td.date,
                    Result: !!td.result,
                };
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async addTestResult(RFID, idTestDescriptor, date, result) {
        // TODO
        try {
            let skuItem = await SKUItem_dao.getSKUItemByRfid(RFID);
            console.log(RFID);
            console.log(skuItem);
            if (skuItem === undefined) throw EzWhException.NotFound;
            let tr = await TestDescriptor_dao.getTestDescriptorByID(idTestDescriptor);
            console.log(idTestDescriptor);
            console.log(tr);
            if (tr === undefined) throw EzWhException.NotFound;
            await dao.addTestResult(RFID, idTestDescriptor, date, result);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async modifyTestResult(RFID, id, newIdTestDescriptor, newDate, newResult) {
        //TODO
        try {
            await SKUItem_dao.getSKUItemByRfid(RFID);
            console.log(newIdTestDescriptor);
            let td = await TestDescriptor_dao.getTestDescriptorByID(newIdTestDescriptor);
            if (td === undefined) throw EzWhException.NotFound;
            let tr = await dao.getTestResultByIDAndRFID(RFID, id);
            if (tr === undefined) throw EzWhException.NotFound;
            tr.idTestDescriptor = newIdTestDescriptor;
            tr.date = newDate;
            tr.result = newResult;
            await dao.modifyTestResult(tr);
        } catch (err) {
            console.log("Error in Facade: ModifyTestResult");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async deleteTestResult(RFID, id) {
        try {
            await dao.deleteTestResult(RFID, id);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

}

module.exports = TestResultService;
