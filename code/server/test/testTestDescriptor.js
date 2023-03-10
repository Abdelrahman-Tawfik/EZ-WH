const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

const longString = "really really long string that shouldn't be stored in db. asdasdasdasdasdasdasdasdasdasdasdasdrotflrotflrotflrotflrotflrotflrotflrotflrotflrotflrotfl";

const skus = [
    {
        description: "A chair",
        weight: 5,
        volume: 8,
        notes: "Just a chair",
        price: 10.99,
        availableQuantity: 25
    },
    {
        description: "A table",
        weight: 7,
        volume: 10,
        notes: "Same color of the chair",
        price: 25,
        availableQuantity: 12
    }
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

function testCreateSKU(sku, expectedStatus) {
    it("Posting /api/sku", function (done) {
        agent.post('/api/sku')
            .set('content-type', 'application/json')
            .send(sku)
            .end(function (err, res) {
                if (err)
                    done(err);
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

function testGetTestDescriptors(expectedNumber, expectedTestDescriptors) {
    it(`Getting /api/testDescriptors`, function (done) {
        agent.get(`/api/testDescriptors`)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                res.body.should.have.lengthOf(expectedNumber);
                for (let i = 0; i < expectedNumber; i++) {
                    let el = res.body[i];
                    el.should.haveOwnProperty("id");
                    el.should.haveOwnProperty("name");
                    (expectedTestDescriptors.map((s) => s.name)).should.include(el.name);
                    el.should.haveOwnProperty("procedureDescription");
                    (expectedTestDescriptors.map((s) => s.procedureDescription)).should.include(el.procedureDescription);
                    el.should.haveOwnProperty("idSKU");
                    (expectedTestDescriptors.map((s) => s.idSKU)).should.include(el.idSKU);
                }
                done();
            });
    });
}

function testGetTestDescriptorsById(id, expectedStatus, expectedTestDescriptor) {
    it(`get /api/testDescriptors/${id}`, function (done) {
        agent.get(`/api/testDescriptors/${id}`)
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(expectedStatus);
                if (expectedStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("name");
                    res.body.name.should.be.equal(expectedTestDescriptor.name);
                    res.body.should.haveOwnProperty("procedureDescription");
                    res.body.procedureDescription.should.be.equal(expectedTestDescriptor.procedureDescription);
                    res.body.should.haveOwnProperty("idSKU");
                    res.body.idSKU.should.be.equal(expectedTestDescriptor.idSKU);
                }
                done();
            });
    });
}

function testGetTestDescriptorsByIdInvalidInput() {
    testGetTestDescriptorsById("ciao", 422);
    testGetTestDescriptorsById(0, 422);
    testGetTestDescriptorsById(-1, 422);
    testGetTestDescriptorsById(longString, 422);
}

function testEditTestDescriptor(id, testDescriptor, expectedStatus) {
    it(`Putting /api/testDescriptor/${id}`, function (done) {
        agent.put(`/api/testDescriptor/${id}`)
            .send({
                newName: testDescriptor.name,
                newProcedureDescription: testDescriptor.procedureDescription,
                newIdSKU: testDescriptor.idSKU
            })
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

function testDeleteTestDescriptorInvalidInput() {
    testDeleteTestDescriptor(0, 422);
    testDeleteTestDescriptor(-1, 422);
    testDeleteTestDescriptor("asd", 422);
    testDeleteTestDescriptor(longString, 422);
}

describe("TEST TestDescriptor API", function () {
    describe("Adding sku to test", function () {
        testCreateSKU(skus[0], 201);
        testCreateSKU(skus[1], 201);
    });

    describe("Adding testDescriptors", function () {
        testAddNewTestDescriptor(testDescriptors[0], 201);
        testAddNewTestDescriptor(testDescriptors[1], 201);

        testGetTestDescriptors(2, testDescriptors);
    });

    describe("Add testDescriptor invalid input", function () {
        // Try add testDescriptor for non existing SKUid
        testAddNewTestDescriptor({...testDescriptors[2], idSKU: 50}, 404);
        // Should be like before
        testGetTestDescriptors(2, testDescriptors);

        testAddNewTestDescriptor({...testDescriptors[0], idSKU: "ciao"}, 422);
        testAddNewTestDescriptor({...testDescriptors[0], idSKU: 0}, 422);
        testAddNewTestDescriptor({...testDescriptors[0], idSKU: -1}, 422);
        testAddNewTestDescriptor({...testDescriptors[0], idSKU: longString}, 422);
        // TODO: Uncomment these if we should reject really long strings
        // testAddNewTestDescriptor({...testDescriptors[0], name: longString}, 422);
        // testAddNewTestDescriptor({...testDescriptors[0], procedureDescription: longString}, 422);
    });

    describe("Get testDescriptor by ID", function () {
        // Try to get the testDescriptor by id
        testGetTestDescriptorsById(1, 200, testDescriptors[0]);
        testGetTestDescriptorsById(2, 200, testDescriptors[1]);
    });

    describe("Get testDescriptor by ID (Invalid input)", function () {
        // Try a non existing id
        testGetTestDescriptorsById(50, 404);

        // Try invalid input get testDescriptor by id
        testGetTestDescriptorsByIdInvalidInput();
    });

    describe("Edit testDescriptor", function () {
        // Try editing the first test descriptor
        const t1 = {...testDescriptors[0]};
        t1.name = "Test descriptor 3";
        testEditTestDescriptor(1, t1, 200);
        testGetTestDescriptorsById(1, 200, t1);
        const t2 = {...t1};
        t2.procedureDescription = "...";
        testEditTestDescriptor(1, t2, 200);
        testGetTestDescriptorsById(1, 200, t2);
    });

    describe("Edit testDescriptor (Invalid input)", function () {
        // TODO: Uncomment these if we should reject really long strings
        // testEditTestDescriptor(1, {...testDescriptors[0], name: longString}, 422);
        // testEditTestDescriptor(1, {...testDescriptors[0], description: longString}, 422);
        testEditTestDescriptor(0, testDescriptors[0], 422);
        testEditTestDescriptor(-1, testDescriptors[0], 422);
        testEditTestDescriptor(1, {...testDescriptors[0], idSKU: -1}, 422);
        testEditTestDescriptor(1, {...testDescriptors[0], idSKU: 0}, 422);
        testEditTestDescriptor(50, {...testDescriptors[0]}, 404);
        testEditTestDescriptor(1, {...testDescriptors[0], idSKU: 50}, 404);
    });

    // // Let's bring the first test descriptor back
    // testEditTestDescriptor(1, testDescriptors[0], 200);

    describe("Delete testDescriptors", function () {
        testDeleteTestDescriptor(1, 204);
        testDeleteTestDescriptor(2, 204);
        testDeleteTestDescriptor(3, 204);
        testDeleteTestDescriptor(4, 204);
        testGetTestDescriptors(0);

    });

    describe("Delete testDescriptors (Invalid input)", function () {
        // Test for invalid input in delete
        testDeleteTestDescriptorInvalidInput();
    });

    describe("Delete sku used to test", function () {
        for (let i = 0; i < skus.length; i++)
            testDeleteSKU(204, i+1);
    });
});