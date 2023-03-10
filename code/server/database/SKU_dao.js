const SKU = require("../modules/SKU");
const TestDescriptor = require("../modules/TestDescriptor");
const {db: dbConnection} = require("./DatabaseConnection");

exports.getSKUs = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const getSKUs = `SELECT * FROM SKU;`;
        dbConnection.all(getSKUs, (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((s) => new SKU(
                    s["SKUID"],
                    s["Description"],
                    s["Weight"],
                    s["Volume"],
                    s["Notes"],
                    s["Price"],
                    s["AvailableQuantity"],
                    s["Position"]
                )));
            }
        });
    });
}

exports.getTestDescriptorsBySKUID = (skuid) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM TestDescriptor WHERE SKUID = ?;`;
        dbConnection.all(sql, skuid, (err, rows) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve(rows.map((t) => new TestDescriptor(t["TestDescriptorID"], t["Name"], t["ProcedureDescription"], t["SKUID"])));
            }
        });
    });
}

exports.createSKU = (description, weight, volume, notes, price, availableQuantity) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const createSKU = `INSERT INTO SKU(description, weight, volume, price, notes, availableQuantity) 
							VALUES (?, ?, ?, ?, ?, ?);`;
        dbConnection.run(createSKU, [description, weight, volume, price, notes, availableQuantity], (err) => {
            if (err) {
                reject(err.toString());
            } else {
                resolve();
            }
        });
    });
}

exports.getSKUById = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM SKU WHERE SKUID = ?;`;
        dbConnection.get(sql, id, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? new SKU(
                    row["SKUID"],
                    row["Description"],
                    row["Weight"],
                    row["Volume"],
                    row["Notes"],
                    row["Price"],
                    row["AvailableQuantity"],
                    row["Position"]
                ) : undefined);
            }
        });
    });
}

exports.modifySKU = (id, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE SKU SET
            Description = ?,
			Weight = ?,
			Volume = ?,
			Notes = ?,
			Price = ?,
			AvailableQuantity = ?
			WHERE SKUID = ?;`;
        dbConnection.run(
            sql,
            [newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity, id],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

exports.addSKUPosition = (id, positionId) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE SKU SET
		  	Position = ?
		  	WHERE SKUID = ?;`;
        dbConnection.run(sql, [positionId, id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

exports.deleteSKU = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM SKU WHERE SKUID = ?;`;
        dbConnection.run(sql, id, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}
//USED ONLY FOR TESTING
exports.deleteAllSKUs = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM SKU `;
        dbConnection.run(sql, [], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

}
