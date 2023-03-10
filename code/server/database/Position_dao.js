const Position = require("../modules/Position");

exports.getPositions = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = "SELECT * FROM Position;";
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            }
            const positions = rows.map(
                (r) =>
                    new Position(
                        r.PositionID,
                        r.AisleID,
                        r.Row,
                        r.Col,
                        r.MaxWeight,
                        r.MaxVolume,
                        r.OccupiedWeight,
                        r.OccupiedVolume
                    )
            );
            resolve(positions);
        });
    });
}
exports.getPositionByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM Position WHERE PositionID = ?`;
        dbConnection.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
            }
            const p = rows.map(
                (r) =>
                    new Position(
                        r.PositionID,
                        r.AisleID,
                        r.Row,
                        r.Col,
                        r.MaxWeight,
                        r.MaxVolume,
                        r.OccupiedWeight,
                        r.OccupiedVolume,
                        r.SKUID
                    )
            );
            resolve(p);
        });
    });
}
exports.createPosition = (position) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO Position(PositionID, AisleID, Row, Col, MaxWeight, MaxVolume) 
      VALUES (?, ?, ?, ?, ?, ?);`;
        dbConnection.run(
            sql,
            [position.positionID, position.aisleID, position.row, position.col, position.maxWeight, position.maxVolume],
            (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
}

exports.modifyPosition = (
    oldID,
    newPositionID,
    newAisleID,
    newRow,
    newCol,
    newMaxWeight,
    newMaxVolume,
    newOccupiedWeight,
    newOccupiedVolume
) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE Position SET PositionID =${newPositionID} , AisleID = ${newAisleID}, Row =${newRow} , Col =${newCol} , MaxWeight =${newMaxWeight} , MaxVolume=${newMaxVolume} ,OccupiedWeight=${newOccupiedWeight}, OccupiedVolume =${newOccupiedVolume}
    WHERE PositionID = ${oldID};`;
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            } else resolve();
        });
    });
}

exports.modifySKUPosition = (positionId, newOccupiedWeight, newOccupiedVolume, SKUId) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE Position SET OccupiedWeight =${newOccupiedWeight} , OccupiedVolume =${newOccupiedVolume} , SKUID =${SKUId} WHERE PositionID = ${positionId};`;
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            } else resolve();
        });
    });
}

exports.modifyPositionID = (oldID, newPositionID, newAisleID, newRow, newCol) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE Position SET PositionID =${newPositionID} , AisleID = ${newAisleID}, Row =${newRow} , Col =${newCol} WHERE PositionID = ${oldID};`;
        dbConnection.run(sql, [], (err) => {
            if (err) {
                reject(err);
            } else resolve();
        });
    });
}

exports.deletePosition = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM Position WHERE PositionID = ?;`;
        dbConnection.run(sql, [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

//USED ONLY FOR TESTING
exports.deleteAllPositions = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM Position `;
        dbConnection.run(sql, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

}
