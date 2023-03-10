const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);

let postSKUs = [
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
let falsePostSKUs = [
  {
    //missing values
    description: "a new sku",
    weight: 100,
    price: 10.99,
  },
  {
    //empty Object
  },
  {
    description: 1231, //wrong values
    weight: "wrong",
    volume: 530,
    notes: "third",
    availableQuantity: 10,
    price: 13.99,
  },
];

let putSKUs = [
  {
    newDescription: "edited",
    newWeight: 1,
    newVolume: 1,
    newNotes: "third",
    newAvailableQuantity: 10,
    newPrice: 13.99,
  },
  {
    newDescription: "edited",
    newWeight: 1,
    newVolume: 1,
    newNotes: "NEW first SKU",
    newAvailableQuantity: 50,
    newPrice: 10.99,
  },
  {
    newDescription: "edited",
    newWeight: 200,
    newVolume: 1,
    newNotes: "third",
    newAvailableQuantity: 1000,
    newPrice: 13.99,
  },
];

let falsePutSKUs = [
  {
    //missing valuses
    newNotes: "NEW first SKU",
    newAvailableQuantity: 50,
    newPrice: 10.99,
  },
  {
    //empty object
  },
  {
    newDescription: "Not enough position",
    newWeight: 1,
    newVolume: 1,
    newNotes: "third",
    newPrice: 13.99,

  },
  {
    //Position not able to handle
    newDescription: "high qty",
    newWeight: 130,
    newVolume: 540,
    newNotes: "third",
    newAvailableQuantity: 1000,
    newPrice: 13.99,
  },
];

let postPositions = [
  {
    positionID:"111122223333",
    aisleID: "1111",
    row: "2222",
    col: "3333",
    maxWeight: 200,
    maxVolume: 200
  }
  ,
  {
    positionID:"444455556666",
    aisleID: "4444",
    row: "5555",
    col: "6666",
    maxWeight: 400,
    maxVolume: 400
  },
  {
    positionID:"777788889999",
    aisleID: "7777",
    row: "8888",
    col: "9999",
    maxWeight: 500,
    maxVolume: 500
  },
];



function CreatePosition(expectedStatus, postPosition) {
  describe("POST /api/position", function () {
    it("Adding a /api/position", function (done) {
      agent
          .post("/api/position")
          .send(postPosition)
          .end(function (err, res) {
            if (err) done(err);
            res.should.have.status(expectedStatus);
            done();
          });
    });
  });
}
function DeleteAllPositions(expectedStatus) {
  it(`Deleting all positions`, function (done) {
    agent.delete(`/api/position/`).then(function (res) {
      res.should.have.status(expectedStatus);
      done();
    });
  });
}
function deleteAllSKUs() {
  for (let i = 1; i < 30; i++) {
    testDeleteSKU(204, i);
  }
}

function prepare() {
  deleteAllSKUs();
  DeleteAllPositions(204);
  CreatePosition(201, postPositions[0]);
  CreatePosition(201, postPositions[1]);
  CreatePosition(201, postPositions[2]);
}


/***GET***/
function testGetAllSKUs(expectedStatus) {
  describe(`get /api/skus`, function () {
    it(`Getting /api/skus`, function (done) {
      agent.get(`/api/skus`).end(function (err, res) {
        if (err) {
          done(err);
        }
        res.should.have.status(expectedStatus);
        res.should.be.json;
        res.body.should.be.a("array");
        for (let i = 0; i < res.body.length; i++) {
          let s = res.body[i];
          s.should.haveOwnProperty("id");
          s.should.haveOwnProperty("description");
          s.should.haveOwnProperty("weight");
          s.should.haveOwnProperty("volume");
          s.should.haveOwnProperty("price");
          s.should.haveOwnProperty("notes");
          s.should.haveOwnProperty("position");
          s.should.haveOwnProperty("availableQuantity");
          s.should.haveOwnProperty("testDescriptors");
          s.testDescriptors.should.be.a("array");
        }
        done();
      });
    });
  });
}

function testGetSKUById(expectedStatus, id) {
  describe(`get /api/skus/${id}`, function () {
    it(`Getting /api/skus/${id}`, function (done) {
      agent.get(`/api/skus/${id}`).end(function (err, res) {
        if (err) {
          done(err);
        }
        res.should.have.status(expectedStatus);
        if (res.status === 200) {
          res.should.be.json;
          res.body.should.be.an("object");
          res.body.should.haveOwnProperty("description");
          res.body.should.haveOwnProperty("weight");
          res.body.should.haveOwnProperty("volume");
          res.body.should.haveOwnProperty("price");
          res.body.should.haveOwnProperty("notes");
          res.body.should.haveOwnProperty("position");
          res.body.should.haveOwnProperty("availableQuantity");
          res.body.should.haveOwnProperty("testDescriptors");
          res.body.testDescriptors.should.be.a("array");
          res.should.have.status(expectedStatus);
        }
        done();
      });
    });
  });
}

/***POST***/

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

/***PUT***/
function testModifySKU(expectedStatus, id, putSKU) {
  describe(`PUT /api/sku/${id}`, function () {
    it(`Modifying /api/sku/${id}`, function (done) {
      agent
        .put(`/api/sku/${id}`)
        .send(putSKU)
        .end(function (err, res) {
          if (err) done(err);
          res.should.have.status(expectedStatus);
          done();
        });
    });
  });
}

function testModifySKUPosition(expectedStatus, id, position) {
  describe(`PUT /api/sku/${id}/position`, function () {
    it(`Modifying /api/sku/${id}/position`, function (done) {
      agent
        .put(`/api/sku/${id}/position`)
        .send(position)
        .end(function (err, res) {
          if (err) done(err);
          res.should.have.status(expectedStatus);
          done();
        });
    });
  });
}

/***DELETE***/
function testDeleteSKU(expectedStatus, id) {
  it(`Deleting SKU ID:${id}`, function (done) {
    agent.delete(`/api/skus/${id}`).then(function (res) {
      res.should.have.status(expectedStatus);
      done();
    });
  });
}

describe("TEST SKU API", function () {
  describe("Testing POST APIs" , function (){
    prepare();
    //Correct Posts
    testCreateSKU(201, postSKUs[0]);
    testCreateSKU(201, postSKUs[1]);
    testCreateSKU(201, postSKUs[2]);

    //False Posts
    testCreateSKU(422, falsePostSKUs[0]); //missing values
    testCreateSKU(422, falsePostSKUs[1]); //empty Object
    testCreateSKU(422, falsePostSKUs[2]); //wrong values in body validation
  })

  describe("Testing GET APIs ", function(){
    prepare();
    //Correct Posts
    testCreateSKU(201, postSKUs[0]);
    testCreateSKU(201, postSKUs[1]);
    testCreateSKU(201, postSKUs[2]);

    //Get ALL
    testGetAllSKUs(200);



    //Correct Gets
    testGetSKUById(200, 1);
    testGetSKUById(200, 2);
    testGetSKUById(200, 3);

    //False Gets
    testGetSKUById(404, 4); //Wrong ID
    testGetSKUById(422, "asa"); //Wrong Id Validation
  })

  describe("Testing PUT APIs" ,function (){
    prepare();
    //Correct Posts
    testCreateSKU(201, postSKUs[0]);
    testCreateSKU(201, postSKUs[1]);
    testCreateSKU(201, postSKUs[2]);

    //Correct Puts
    testModifySKU(200, 1, putSKUs[0]);
    testModifySKU(200, 2, putSKUs[1]);
    testModifySKU(200, 3, putSKUs[2]);
    testModifySKUPosition(200 , 1 , {position : "111122223333"});


    //False Puts
    testModifySKUPosition(422 , 3 , {position : "777788889999"});//Not Enough position

    testModifySKU(404, 12, putSKUs[0]);
    testModifySKU(422, 1, falsePutSKUs[3]); //not enough position
    testModifySKU(422, 1, falsePutSKUs[0]); //missing fields
    testModifySKU(422, 1, falsePutSKUs[2]); //missing fields
    testModifySKU(422, 2, falsePutSKUs[1]); //empty object
  })

  describe("Add Position to SKU", function (){
    prepare();
    //Correct Posts
    testCreateSKU(201, postSKUs[0]);
    testCreateSKU(201, postSKUs[1]);
    testCreateSKU(201, postSKUs[2]);

    //Correct
    testModifySKUPosition(200, 1 , {position : "111122223333"});
    testModifySKUPosition(200, 2 , {position : "444455556666"});

    //False
    testModifySKUPosition(404 , 9 , {position : "777788889999"}); //SKU Not found
    testModifySKUPosition(404 , 1 , {position : "777712349999"}); //Position Not found
    testModifySKUPosition(422 , "fbd" , {position : "777712349999"}); //Id Validation
    testModifySKUPosition(422 , 2 , {position : "777712354323449999"}); //PositionID Validation
    testModifySKUPosition(422 , 3 , {position : "777788889999"}); //Not Enough position
    testModifySKUPosition(422 , 2 , {position : "111122223333"});//Position already assigned



  })

  describe("Delete SKU",function() {
    testDeleteSKU(204,1);
    testDeleteSKU(204,2);
    testDeleteSKU(204,3);
    DeleteAllPositions(204);
  });
})


