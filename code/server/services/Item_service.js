const dao = require("../database/Item_dao");
const SKU_dao = require("../database/SKU_dao");
const User_dao = require("../database/User_dao");
const Item = require("../modules/Item");
const EzWhException = require("../modules/EzWhException.js");

class ItemService {
    constructor() {
    }

    async getItems() {
        try {
            return await dao.getItems();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getItemByIDAndSupplierID(id, supplierId) {
        try {
            let item = await dao.getItemByIDAndSupplierID(id, supplierId);
            if (item === undefined) throw EzWhException.NotFound;
            else return item;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async createItem(ItemID, Description, Price, SKUID, SupplierID) {
        try {
            let sku = await SKU_dao.getSKUById(SKUID);
            if (sku === undefined) throw EzWhException.NotFound;
            let suppliers = await User_dao.getSuppliers();
            let supplier = suppliers.find(({id}) => id === SupplierID);
            if (supplier === undefined) throw EzWhException.InternalError;
            const item = new Item(ItemID, Description, Price, SKUID, SupplierID);
            return await dao.createItem(item);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.EntryNotAllowed; //ItemID already exists for this supplier OR supplier have same SKUID
            else if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifyItem(id,supplierId, newDescription, newPrice) {
        try {
            await this.getItemByIDAndSupplierID(id,supplierId);
            return await dao.modifyItem(id,supplierId, newDescription, newPrice);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async deleteItem(id,supplierId) {
        try {
            return await dao.deleteItem(id,supplierId);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

}

module.exports = ItemService;
