const dao = require("../database/Position_dao");
const Position = require("../modules/Position");
const EzWhException = require("../modules/EzWhException.js");

class PositionService {
    constructor() {
    }

    async getPositions() {
        try {
            return await dao.getPositions();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    async getPositionByID(id) {
        try {
            let position = await dao.getPositionByID(id);
            if (typeof position !== "undefined" && position.length === 0) throw EzWhException.NotFound;
            else return position[0];
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            else throw EzWhException.InternalError;
        }
    }

    async createPosition(positionID, aisleID, row, col, maxWeight, maxVolume) {
        try {
            const position = new Position(positionID, aisleID, row, col, maxWeight, maxVolume);
            return await dao.createPosition(position);
        } catch (err) {
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
            else throw EzWhException.InternalError;
        }
    }

    async modifyPosition(
        oldID,
        newPositionID,
        newAisleID,
        newRow,
        newCol,
        newMaxWeight,
        newMaxVolume,
        newOccupiedWeight,
        newOccupiedVolume
    ) {
        try {
            await this.getPositionByID(oldID);
            return await dao.modifyPosition(
                oldID,
                newPositionID,
                newAisleID,
                newRow,
                newCol,
                newMaxWeight,
                newMaxVolume,
                newOccupiedWeight,
                newOccupiedVolume
            );
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
            else throw EzWhException.InternalError;
        }
    }

    async modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol) {
        try {
            await this.getPositionByID(oldID);
            return await dao.modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol);
        } catch (err) {
            if (err === EzWhException.NotFound) throw EzWhException.NotFound;
            if (err.code === "SQLITE_CONSTRAINT" && err.errno === 19) throw EzWhException.InternalError;
            else throw EzWhException.InternalError;
        }
    }

    async deletePosition(id) {
        try {
            return await dao.deletePosition(id);
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }

    //USED ONLY FOR TESTING
    async deleteAllPositions() {
        try {
            return await dao.deleteAllPositions();
        } catch (err) {
            throw EzWhException.InternalError;
        }
    }
}

module.exports = PositionService;
