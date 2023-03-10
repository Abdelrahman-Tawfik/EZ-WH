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
  },
  {
    description: "3 another new sku",
    weight: 50,
    volume: 50,
    notes: "third",
    availableQuantity: 900,
    price: 13.99,
  },
];

let suppliers = [
    {
        username: "robertdunder@ezwh.com",
        name: "Robert",
        surname: "Dunder",
        password: "testpassword",
        type: "supplier"
    },
    {
        username: "robertmifflin@ezwh.com",
        name: "Robert",
        surname: "Mifflin",
        password: "testpassword",
        type: "supplier"
    }
];

const items = [
    {
        id: 12,
        description: "A new item",
        price: 10.99,
        SKUId: 1,
        supplierId: 7
    },
    {
        id: 13,
        description: "A newer item",
        price: 12.99,
        SKUId: 2,
        supplierId: 8
    }
]

const editItems = [
    {
        newDescription: "An old item",
        newPrice: 11.99
    },
    {
        newDescription: "An older item",
        newPrice: 15.99
    }
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

function testAddNewUser(user, expectedStatus) {
    describe('post /api/newUser', function () {
        it("Posting /api/newUser", function (done) {
            agent.post('/api/newUser')
                .set('content-type', 'application/json')
                .send(user)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedStatus);
                    done();
                });
        });
    });
}

function testDeleteUser(username, userType, expectedStatus) {
    describe(`delete /api/users/${username}/${userType}`, function () {
        it(`Deleting /api/users/${username}/${userType}`, function (done) {
            agent.delete(`/api/users/${username}/${userType}`)
                .end(function (err, res) {
                    if (err)
                        done(err);
                    res.should.have.status(expectedStatus);
                    done();
                });
        });
    });
}

function testCreateSKU(expectedStatus, postSKU) {
  describe("POST /api/sku", function () {
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

function testCreateItem(item, expectedStatus) {
    it("Posting /api/item", function (done) {
        agent.post('/api/item')
            .set('content-type', 'application/json')
            .send(item)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testDeleteItem(id, supplierId, expectedStatus) {
    it(`delete /api/items/${id}/${supplierId}`, function (done) {
        agent.delete(`/api/items/${id}/${supplierId}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testGetItems(expectedStatus, expectedNumber, expectedItems) {
    it(`get /api/items`, function (done) {
        agent.get(`/api/items`)
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
                        el.should.haveOwnProperty("description");
                        el.should.haveOwnProperty("price");
                        el.should.haveOwnProperty("SKUId");
                        el.should.haveOwnProperty("supplierId");

                        expectedItems.some((expected) => compareObjects(expected, el, "description", "price", "SKUId", "supplierId"))
                            .should.be.true;
                    }
                }
                done();
            });
    });
}

function testGetItemByIdAndSupplierId(id, supplierId, expectedStatus, expectedItem) {
    it(`get /api/items/${id}/${supplierId}`, function (done) {
        agent.get(`/api/items/${id}/${supplierId}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                if (expectedStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("id");
                    res.body.should.haveOwnProperty("description");
                    res.body.should.haveOwnProperty("price");
                    res.body.should.haveOwnProperty("SKUId");
                    res.body.should.haveOwnProperty("supplierId");
                    compareObjects(expectedItem, res.body, "id", "description", "price", "SKUId", "supplierId").should.be.true;
                }
                done();
            });
    });
}

function testEditItem(id, supplierId, editItem, expectedStatus) {
    it(`put /api/item/${id}/${supplierId}`, function (done) {
        agent.put(`/api/item/${id}/${supplierId}`)
            .set('content-type', 'application/json')
            .send(editItem)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

describe("TEST Item API", function () {

    describe("Adding new sku and supplier to test item", function () {
        for (let supplier of suppliers) {
            testAddNewUser(supplier, 201);
        }
        for (let sku of skus) {
            testCreateSKU(201, sku);
        }
    });

    describe("Add new items", function () {
        for (let item of items) {
            testCreateItem(item, 201);
        }
        testCreateItem(items[0], 422);
        testCreateItem({...items[0], id: 10}, 422);
        testCreateItem({...items[0], id: 10, SKUId: 50}, 404);
        testCreateItem({...items[0], id: 10, SKUId: -1}, 422);
        testCreateItem({...items[0], id: 10, SKUId: "asd"}, 422);
        testGetItems(200, items.length, items);
        for (let item of items) {
            testGetItemByIdAndSupplierId(item.id, item.supplierId,200, item);
        }

    });

    describe("Get items by id (Invalid input)", function () {
        testGetItemByIdAndSupplierId(50, 0, 404);
        testGetItemByIdAndSupplierId(0, 0, 404);
        testGetItemByIdAndSupplierId(-1, -1, 422);
        testGetItemByIdAndSupplierId("asd", 1, 422);
    });

    describe("Edit items", function () {
        for (let i = 0; i < items.length; i++) {
            testEditItem(items[i].id, items[i].supplierId, editItems[i], 200);
            testGetItemByIdAndSupplierId(items[i].id, items[i].supplierId,200, {
                ...items[i],
                description: editItems[i].newDescription,
                price: editItems[i].newPrice
            });
        }
    });

    describe("Edit items (Invalid input)", function () {
        testEditItem(50, 0, editItems[0], 404);
        testEditItem(0, 0, editItems[0], 404);
        testEditItem(-1, -1, editItems[0], 422);
        testEditItem("asd", 0, editItems[0], 422);

    });

    describe("Delete inserted items", function () {
        for (let item of items) {
            testDeleteItem(item.id, item.supplierId, 204);
        }
        testDeleteItem(50, 50, 204);
        testDeleteItem(0, 0, 204);
        testDeleteItem(-1, -1, 422);

        testGetItems(200, 0);
    });

    describe("Deleting skus and suppliers", function () {
        for (let supplier of suppliers) {
            testDeleteUser(supplier.username, "supplier", 204);
        }
        for (let i = 0; i < skus.length; i++) {
            testDeleteSKU(204, i + 1);
        }
    });
});