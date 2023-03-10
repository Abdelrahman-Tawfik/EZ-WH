const dao = require("../database/SKUItem_dao");
const SKU_dao = require("../database/SKU_dao");
const EzWhException = require("../modules/EzWhException.js");

class SKUItemService {
    constructor() {
    }

    async getSKUItems() {
        try {
            let skuItems = await dao.getSKUItems();
            for (let s of skuItems) {
                s.sku = await SKU_dao.getSKUById(s.sku);
                //TODO: add testResults if needed
            }
            return skuItems;
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getSKUItemsBySKU(SKUID) {
        try {
            let sku = await SKU_dao.getSKUById(SKUID);
            if (sku === undefined) throw EzWhException.NotFound;
            let skuItems = await dao.getSKUItemsBySKU(SKUID);
            for (let s of skuItems) {
                s.sku = sku;
                //TODO: add testResults if needed
            }
            return skuItems;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async getSKUItemByRfid(rfid) {
        try {
            let skuItem = await dao.getSKUItemByRfid(rfid);
            if (skuItem === undefined) throw EzWhException.NotFound;
            skuItem.sku = await SKU_dao.getSKUById(skuItem.sku);
            //TODO: add testResults if needed
            return skuItem;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async deleteSKUItem(rfid) {
        try {
            return await dao.deleteSKUItem(rfid);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    //USED ONLY FOR TESTING
    async deleteAllSKUItems() {
        try {
            return await dao.deleteAllSKUItems();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock) {
        try {
            await this.getSKUItemByRfid(rfid);
            await dao.modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async createSKUItem(rfid, SKUId, dateOfStock) {
        try {
            let sku = await SKU_dao.getSKUById(SKUId);
            if (sku === undefined) throw EzWhException.NotFound;
            await dao.createSKUItem(rfid, SKUId, dateOfStock);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) {
                // If there is already a skuitem with the same rfid
                throw EzWhException.InternalError;
            } else throw EzWhException.InternalError;
        }
    }

}

module.exports = SKUItemService;
