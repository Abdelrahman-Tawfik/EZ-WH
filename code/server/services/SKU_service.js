const dao = require("../database/SKU_dao");
const Position_dao = require("../database/Position_dao");
const EzWhException = require("../modules/EzWhException.js");

class SKUService {
    constructor() {
    }

    async getSKUs() {
        try {
            let skus = await dao.getSKUs();
            for (let s of skus) {
                let testDescriptors = await dao.getTestDescriptorsBySKUID(s.id);
                testDescriptors.forEach((t) => s.addTestDescriptor(t));
                if (s.positionID) {
                    let tmpPos = await Position_dao.getPositionByID(s.position);
                    s.position = tmpPos && tmpPos.length > 0 ? tmpPos : null;
                }
            }
            return skus;
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async createSKU(description, weight, volume, notes, price, availableQuantity) {
        try {
            return await dao.createSKU(description, weight, volume, notes, price, availableQuantity);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getSKUById(id) {
        try {
            let sku = await dao.getSKUById(id);
            if (sku === undefined) {
                throw EzWhException.NotFound;
            }
            let testDescriptors = await dao.getTestDescriptorsBySKUID(sku.id);
            testDescriptors.forEach((t) => sku.addTestDescriptor(t));
            if (sku.positionID) {
                let tmpPos = await Position_dao.getPositionByID(sku.positionID);
                sku.position = tmpPos && tmpPos.length > 0 ? tmpPos[0] : null;
            }
            return sku;
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {
        try {
            let sku = await dao.getSKUById(id);
            if (sku === undefined) throw EzWhException.NotFound;
            if (sku.positionID) {
                let tmpPos = await Position_dao.getPositionByID(sku.positionID);
                sku.position = tmpPos && tmpPos.length > 0 ? tmpPos[0] : null;
            }
            if (
                sku.position &&
                (sku.position.maxWeight < newWeight * newAvailableQuantity ||
                    sku.position.maxVolume < newVolume * newAvailableQuantity)
            )
                throw EzWhException.PositionFull;
            if (sku.position)
                await this.modifySKUPosition(
                    sku.position.positionID,
                    newWeight * newAvailableQuantity,
                    newVolume * newAvailableQuantity,
                    id
                );
            await dao.modifySKU(id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity);
        } catch (err) {
            if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
            else if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId) {
        try {
            let position = await Position_dao.getPositionByID(positionId);
            return await Position_dao.modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
            else throw EzWhException.InternalError;
        }
    }

    async addSKUPosition(id, positionId) {
        try {
            let sku = await dao.getSKUById(id);
            if (sku === undefined) throw EzWhException.NotFound;
            let position = await Position_dao.getPositionByID(positionId);
            if (position && position.length > 0) position = position[0];
            else throw EzWhException.NotFound;
            if (
                position.maxWeight < sku.weight * sku.availableQuantity ||
                position.maxVolume < sku.volume * sku.availableQuantity
            )
                throw EzWhException.PositionFull;
            if (position.sku !== null) throw EzWhException.PositionFull;
            await Position_dao.modifySKUPosition(
                positionId,
                sku.weight * sku.availableQuantity,
                sku.volume * sku.availableQuantity,
                id
            );
            await dao.addSKUPosition(id, positionId);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else if (err === EzWhException.PositionFull) throw EzWhException.PositionFull;
            else throw EzWhException.InternalError;
        }
    }

    async deleteSKU(id) {
        try {
            return await dao.deleteSKU(id);
        } catch (err) {
            console.log(err);
            throw EzWhException.InternalError;
        }
    }
}

module.exports = SKUService;
