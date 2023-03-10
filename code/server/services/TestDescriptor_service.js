const dao = require("../database/TestDescriptor_dao");
const SKU_dao = require("../database/SKU_dao");
const EzWhException = require("../modules/EzWhException.js");

class TestDescriptorService {
    constructor() {
    }

    async getTestDescriptors() {
        try {
            let TestDescriptorList = await dao.getTestDescriptors();
            return TestDescriptorList.map((td) => {
                return {
                    id: td.id,
                    name: td.name,
                    procedureDescription: td.procedureDescription,
                    idSKU: td.idSKU,
                };
            });
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

    async getTestDescriptorByID(id) {
        try {
            let td = await dao.getTestDescriptorByID(id);
            console.log(td);
            if (td === undefined) throw EzWhException.NotFound;
            return {
                id: td.id,
                name: td.name,
                procedureDescription: td.procedureDescription,
                idSKU: td.idSKU,
            };
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async createTestDescriptor(name, procedureDescription, idSKU) {
        // TODO
        try {
            let sku = await SKU_dao.getSKUById(idSKU);
            console.log(sku);
            if (sku === undefined) throw EzWhException.NotFound;
            await dao.createTestDescriptor(name, procedureDescription, idSKU);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async modifyTestDescriptor(id, newName, newProcedureDescription, newIdSKU) {
        try {
            let sku = await SKU_dao.getSKUById(newIdSKU);
            console.log(sku);
            if (sku === undefined) throw EzWhException.NotFound;
            let td = await this.getTestDescriptorByID(id);
            if (td === undefined) throw EzWhException.NotFound;
            td.name = newName;
            td.procedureDescription = newProcedureDescription;
            td.idSKU = newIdSKU;
            console.log(td);
            await dao.modifyTestDescriptor(td);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            if (err === EzWhException.NotFound) throw err;
            throw EzWhException.InternalError;
        }
    }

    async deleteTestDescriptor(id) {
        try {
            await dao.deleteTestDescriptor(id);
        } catch (err) {
            console.log("Error in Facade");
            console.log(err);
            throw EzWhException.InternalError;
        }
    }

}

module.exports = TestDescriptorService;
