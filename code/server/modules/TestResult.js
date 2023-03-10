class TestResult {
    constructor(rfid, id, idTestDescriptor, date, result) {
        this.rfid = rfid;
        this.id = id;
        this.idTestDescriptor = idTestDescriptor;
        this.date = date;
        this.result = result;
    }
}

module.exports = TestResult;