const TestResult = require("../modules/TestResult");

exports.getTestResultsByRFID = (RFID) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM TestResult WHERE RFID=?`;
        dbConnection.all(sql, [RFID], (err, rows) => {
            if (err) {
                reject(err);
            }
            const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
            resolve(trs);
        });
    });
}

exports.getTestResultByIDAndRFID = (RFID, id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `SELECT * FROM TestResult WHERE RFID=?
       AND TestResultID=?`;
        dbConnection.all(sql, [RFID, id], (err, rows) => {
            if (err) {

                reject(err);
            }
            const trs = rows.map((r) => new TestResult(r.RFID, r.TestResultID, r.TestDescriptorID, r.Date, r.Result));
            resolve(trs[0]);
        });
    });
}

exports.addTestResult = (RFID, idTestDescriptor, date, result) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `INSERT INTO TestResult (RFID, TestDescriptorID, Date, Result)
      VALUES (?, ?, ?, ?)`;
        dbConnection.run(sql, [RFID, idTestDescriptor, date, result], function (err) {
            if (err) {
                reject(err);
            }
            resolve(this.lastID);
        });
    });
}

exports.modifyTestResult = (testResult) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `UPDATE TestResult SET
         TestDescriptorID=?, Date=?,
         Result=? WHERE TestResultID=?AND RFID=?`;
        dbConnection.run(
            sql,
            [testResult.idTestDescriptor, testResult.date, testResult.result, testResult.id, testResult.rfid],
            function (err) {
                if (err) {
                    reject(err);
                }
            resolve();
            }
        );
    });
}

exports.deleteTestResult = (RFID, id) => {
    return new Promise((resolve, reject) => {
        const dbConnection = require("./DatabaseConnection").db;
        const sql = `DELETE FROM TestResult WHERE
       TestResultID=? AND RFID=?`;
        dbConnection.run(sql, [id, RFID], function (err) {
            if (err) {

                reject(err);
            }
            resolve();
        });
    });
}
