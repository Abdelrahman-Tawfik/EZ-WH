const TestDescriptor = require("../modules/TestDescriptor");

exports.getTestDescriptors = () => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = "SELECT * FROM TestDescriptor";
        dbConnection.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const tds = rows.map((r) => new TestDescriptor(r.TestDescriptorID, r.Name, r.ProcedureDescription, r.SKUID));
            resolve(tds);
        });
    });
}

exports.getTestDescriptorByID = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = "SELECT * FROM TestDescriptor WHERE TestDescriptorID=?";
        dbConnection.all(sql, [id], (err, rows) => {
            if (err) {

                reject(err);
                return;
            }
            const tds = rows.map((r) => new TestDescriptor(r.TestDescriptorID, r.Name, r.ProcedureDescription, r.SKUID));
            resolve(tds[0]);
        });
    });
}

exports.createTestDescriptor = (name, procedureDescription, idSKU) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO TestDescriptor (Name, ProcedureDescription, SKUID)
      VALUES (?, ?, ?)`;
        dbConnection.run(sql, [name, procedureDescription, idSKU], function (err) {
            if (err) {
                reject(err);
            }
            resolve(this.lastID);
        });
    });
}

exports.modifyTestDescriptor = (testDescriptor) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE TestDescriptor SET Name=?,
         ProcedureDescription=?, SKUID=?
         WHERE TestDescriptorID=?`;
        dbConnection.run(
            sql,
            [testDescriptor.name, testDescriptor.procedureDescription, testDescriptor.idSKU, testDescriptor.id],
            function (err) {
                if (err) {

                    reject(err);
                }
                resolve();
            }
        );
    });
}

exports.deleteTestDescriptor = (id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM TestDescriptor WHERE TestDescriptorID=?`;
        dbConnection.run(sql, [id], function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
