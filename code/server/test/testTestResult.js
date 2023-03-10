const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

const longString = "really really long string that shouldn't be stored in db. asdasdasdasdasdasdasdasdasdasdasdasdrotflrotflrotflrotflrotflrotflrotflrotflrotflrotflrotfl";

let skus = [
  {
    description: "a new sku",
    weight: 5,
    volume: 6,
    notes: "first SKU",
    availableQuantity: 5,
    price: 10.99,
  },
  {
    description: "2 another new sku",
    weight: 1,
    volume: 1,
    notes: "second",
    availableQuantity: 1,
    price: 12.99,
  }
];

const skuItems = [
    {
        RFID: "12345678901234567890123456789012",
        SKUId: 2,
        DateOfStock: "2021/11/29 12:30"
    },
    {
        RFID: "12345678901234567890123456789013",
        SKUId: 2,
        DateOfStock: "2022/11/29 12:30"
    },
    {
        RFID: "12345678901234567890123456789014",
        SKUId: 1,
        DateOfStock: "2021/10/29 12:30"
    },
]

const testDescriptors = [
    {
        name: "Test descriptor 1",
        procedureDescription: "Check the external of the product",
        idSKU: 1
    },
    {
        name: "Test descriptor 2",
        procedureDescription: "The product has 4 legs?",
        idSKU: 1
    },
    {
        name: "Test descriptor 3",
        procedureDescription: "The product should be intact",
        idSKU: 2
    }
]

const testResults = [
    {
        rfid: "12345678901234567890123456789012",
        idTestDescriptor: 1,
        Date: "2021/10/29 12:30",
        Result: true
    },
    {
        rfid: "12345678901234567890123456789013",
        idTestDescriptor: 2,
        Date: "2021/10/15 12:30",
        Result: false
    },
    {
        rfid: "12345678901234567890123456789014",
        idTestDescriptor: 1,
        Date: "2019/10/29 12:30",
        Result: true
    },
]

function compareObjects(expected, actual, ...fields) {
    try {
        for (let f of fields) {
            if (expected[f] !== actual[f])
                return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

function testCreateSKU(expectedStatus, postSKU) {
it("Adding a new SKU", function (done) {
  agent
    .post("/api/sku")
    .send(postSKU)
    .end(function (err, res) {
      if (err) done(err);
      res.should.have.status(expectedStatus);
      done();
    });
});
}

function testDeleteSKU(expectedStatus, id) {
  it(`Deleting SKU ID:${id}`, function (done) {
    agent.delete(`/api/skus/${id}`).then(function (res) {
      res.should.have.status(expectedStatus);
      done();
    });
  });
}

function testCreateSKUItem(skuitem, expectedStatus) {
    it("Posting /api/skuitem", function (done) {
        agent.post('/api/skuitem')
            .set('content-type', 'application/json')
            .send(skuitem)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testDeleteSKUItem(expectedStatus, rfid) {
  it(`Deleting SKUItem rfid:${rfid}`, function (done) {
    agent.delete(`/api/skuitems/${rfid}`).then(function (res) {
      res.should.have.status(expectedStatus);
      done();
    });
  });
}

function testAddNewTestDescriptor(testDescriptor, expectedStatus) {
    it("Posting /api/testDescriptor", function (done) {
        agent.post('/api/testDescriptor')
            .set('content-type', 'application/json')
            .send(testDescriptor)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testDeleteTestDescriptor(id, expectedStatus) {
    it(`Deleting /api/testDescriptor/${id}`, function (done) {
        agent.delete(`/api/testDescriptor/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testAddNewTestResult(testResult, expectedStatus) {
    it("post /api/skuitems/testResult", function (done) {
        agent.post('/api/skuitems/testResult')
            .set('content-type', 'application/json')
            .send(testResult)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testGetTestResultsByRFID(rfid, expectedStatus, expectedNumber, expectedTestResults) {
    it(`get /api/skuitems/${rfid}/testResults`, function (done) {
        agent.get(`/api/skuitems/${rfid}/testResults`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                if (expectedStatus === 200) {
                    res.should.be.json;
                    res.body.should.be.an('array');
                    res.body.should.have.lengthOf(expectedNumber);
                    for (let i = 0; i < expectedNumber; i++) {
                        let el = res.body[i];
                        el.should.haveOwnProperty("id");
                        el.should.haveOwnProperty("idTestDescriptor");
                        el.should.haveOwnProperty("Date");
                        el.should.haveOwnProperty("Result");

                        expectedTestResults.some((expected) => compareObjects(expected, el, "idTestDescriptor", "Date", "Result"))
                            .should.be.true;
                    }
                }
                done();
            });
    });
}

function testGetTestResultsByIDAndRFID(id, rfid, expectedStatus, expectedTestResult) {
    it(`get /api/skuitems/${rfid}/testResults/${id}`, function (done) {
        agent.get(`/api/skuitems/${rfid}/testResults/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                if (expectedStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("idTestDescriptor");
                    res.body.should.haveOwnProperty("Date");
                    res.body.should.haveOwnProperty("Result");
                    compareObjects(expectedTestResult, res.body, "idTestDescriptor", "Date", "Result").should.be.true;
                }
                done();
            });
    });
}

function testEditTestResult(id, rfid, editTestResult, expectedStatus) {
    it(`put /api/skuitems/${rfid}/testResult/${id}`, function (done) {
        agent.put(`/api/skuitems/${rfid}/testResult/${id}`)
            .set('content-type', 'application/json')
            .send(editTestResult)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testDeleteTestResult(id, rfid, expectedStatus) {
    it(`delete /api/skuitems/${rfid}/testResult/${id}`, function (done) {
        agent.delete(`/api/skuitems/${rfid}/testResult/${id}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}
describe("TEST TestResult API", function () {

    describe("Add new skus, skuItems and testDescriptors to test", function () {
        for (let sku of skus) {
            testCreateSKU(201, sku);
        }

        for (let td of testDescriptors) {
            testAddNewTestDescriptor(td, 201);
        }

    });


    describe("Add new skuItems to test", function () {
        for (let si of skuItems)
            testCreateSKUItem(si, 201);
    });

    describe("Add test results", function () {
        for (let tr of testResults) {
            testAddNewTestResult(tr, 201);
        }
    });

    describe("Get test results by rfid", function () {
        for (let tr of testResults) {
            testGetTestResultsByRFID(tr.rfid, 200, testResults.filter((t) => t.rfid === tr.rfid).length, testResults.filter((t) => t.rfid === tr.rfid));
        }
    });

    describe("Get test results by rfid (invalid input)", function () {
        testGetTestResultsByRFID("12345678901234567890123456789055", 404);
        testGetTestResultsByRFID("1234567890123456789012345678905", 422);
        testGetTestResultsByRFID("123456789012345678901234567890aa", 422);
        testGetTestResultsByRFID("aa", 422);
        testGetTestResultsByRFID(32, 422);
    });

    describe("Get test results by id and rfid", function() {
        testGetTestResultsByIDAndRFID(1, testResults[0].rfid, 200, testResults[0]);
        testGetTestResultsByIDAndRFID(2, testResults[1].rfid, 200, testResults[1]);
        testGetTestResultsByIDAndRFID(3, testResults[2].rfid, 200, testResults[2]);
    });

    describe("Get test results by id and rfid (invalid input)", function() {
        testGetTestResultsByIDAndRFID(50, testResults[0].rfid, 404);
        testGetTestResultsByIDAndRFID(1, "12345678901234567890123456798055", 404);
        testGetTestResultsByIDAndRFID("asd", "12345678901234567890123456798055", 422);
        testGetTestResultsByIDAndRFID(1, "12345678901234567890123456795", 422);
        testGetTestResultsByIDAndRFID(1, "1234567890123456789012345679805a", 422);
    });

    describe("Edit test result", function () {
        let editTestResult = {
            newIdTestDescriptor: 2,
            newDate: "2021/10/15 15:30",
            newResult: true
        }
        testEditTestResult(1, testResults[0].rfid, editTestResult, 200);
        testGetTestResultsByIDAndRFID(1, testResults[0].rfid, 200, {
            id: 1,
            idTestDescriptor: editTestResult.newIdTestDescriptor,
            Date: editTestResult.newDate,
            Result: editTestResult.newResult
        });
        testEditTestResult(1, testResults[0].rfid, {
            newIdTestDescriptor: testResults[0].idTestDescriptor,
            newDate: testResults[0].Date,
            newResult: testResults[0].Result
        }, 200);
        testGetTestResultsByIDAndRFID(1, testResults[0].rfid, 200, testResults[0]);
    });

    describe("Edit test result (invalid input)", function () {
        let editTestResult = {
            newIdTestDescriptor: 2,
            newDate: "2021/10/15 15:30",
            newResult: true
        }
        testEditTestResult(50, testResults[0].rfid, editTestResult, 404);
        testEditTestResult(1, "12345678901234567890123456789055", editTestResult, 404);
        testEditTestResult(1, testResults[0].rfid, {...editTestResult, newIdTestDescriptor: 50}, 404);
        testEditTestResult(1, "asd", editTestResult, 422);
        testEditTestResult(0, testResults[0].rfid, editTestResult, 422);
        testEditTestResult(-1, testResults[0].rfid, editTestResult, 422);
        testEditTestResult("asd", testResults[0].rfid, editTestResult, 422);
    });

    describe("Delete test result", function () {
        testDeleteTestResult(1, testResults[0].rfid, 204);
        testDeleteTestResult(2, testResults[1].rfid, 204);
        testDeleteTestResult(3, testResults[2].rfid, 204);
    });

    describe("Delete test result (invalid input)", function () {
        testDeleteTestResult(50, testResults[0].rfid, 204);
        testDeleteTestResult(1, "asd", 422);
        testDeleteTestResult(50, "12345678901234567890123456789055", 204);
        testDeleteTestResult(50, "1234567890123456789012345678905", 422);
        testDeleteTestResult(50, "1234567890123456789012345678905a", 422);
        testDeleteTestResult(0, testResults[0].rfid, 422);
        testDeleteTestResult(-1, testResults[0].rfid, 422);
        testDeleteTestResult("asd", testResults[0].rfid, 422);
    });

    describe("Delete skus and testDescriptors used to test", function () {
        for (let i = 0; i < skus.length; i++) {
            testDeleteSKU(204, i+1);
        }

        for (let skuitem of skuItems) {
            testDeleteSKUItem(204, skuitem.RFID);
        }

        for (let i = 0; i < testDescriptors.length; i++) {
            testDeleteTestDescriptor(i + 1, 204);
        }
    });

});
