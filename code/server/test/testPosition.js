const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);

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
let falsePostPositions = [
    {//Missing Field
        positionID:"111122223333",
        aisleID: "1111",
        maxWeight: 200,
        maxVolume: 200
    },
    {
        //empty Object
    },
    {//PositionId Wrong Composition
        positionID:"777788889999",
        aisleID: "7777",
        row: "1234",
        col: "9999",
        maxWeight: 500,
        maxVolume: 500
    },
];

let putPositions = [
    {
        newAisleID: "1212",
        newRow: "1212",
        newCol: "1212",
        newMaxWeight: 1200,
        newMaxVolume: 600,
        newOccupiedWeight: 0,
        newOccupiedVolume:0
    }
    ,
    {
        newAisleID: "1234",
        newRow: "5678",
        newCol: "9123",
        newMaxWeight: 9000,
        newMaxVolume: 9191,
        newOccupiedWeight: 200,
        newOccupiedVolume:100
    },
    {
        newAisleID: "9876",
        newRow: "5432",
        newCol: "1987",
        newMaxWeight: 1200,
        newMaxVolume: 600,
        newOccupiedWeight: 200,
        newOccupiedVolume:100
    },
];

let falsePutPositions = [
    {//Missing Field
        newAisleID: "9876",
        newRow: "5432",
        newCol: "1987",
        newMaxWeight: 1200,
        newMaxVolume: 600,
        newOccupiedVolume:100
    },
    {
        //empty object
    },
    {//Wrong value in validation
        newAisleID: "9876",
        newRow: "5432",
        newCol: 1987,//
        newMaxWeight: 1200,
        newMaxVolume: 600,
        newOccupiedWeight: 200,
        newOccupiedVolume:100
    },
    {//ID already exists
        newAisleID: "1212",
        newRow: "1212",
        newCol: "1212",
        newMaxWeight: 1200,
        newMaxVolume: 600,
        newOccupiedWeight: 200,
        newOccupiedVolume:100
    },
];




/***GET***/
function testGetAllPositions(expectedStatus, expectedNumber) {
  describe(`get /api/positions`, function () {
    it(`Getting /api/positions`, function (done) {
      agent.get(`/api/positions`).end(function (err, res) {
        if (err) {
          done(err);
        }
        res.should.have.status(expectedStatus);
        res.should.be.json;
        res.body.should.be.a("array");
          res.body.should.have.lengthOf(expectedNumber);
        for (let i = 0; i < res.body.length; i++) {
          let p = res.body[i];
          p.should.haveOwnProperty("positionID");
          p.should.haveOwnProperty("aisleID");
          p.should.haveOwnProperty("row");
          p.should.haveOwnProperty("col");
          p.should.haveOwnProperty("maxWeight");
          p.should.haveOwnProperty("maxVolume");
          p.should.haveOwnProperty("occupiedWeight");
          p.should.haveOwnProperty("occupiedVolume");
        }
        done();
      });
    });
  });
}

function testGetPositionById(expectedStatus, id) {
  describe(`get /api/skus/${id}`, function () {
    it(`Getting /api/skus/${id}`, function (done) {
      agent.get(`/api/skus/${id}`).end(function (err, res) {
        if (err) {
          done(err);
        }
        if (res.body.status === 200) {
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

function testCreatePosition(expectedStatus, postPosition) {
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

/***PUT***/
function testModifyPosition(expectedStatus, id, putPosition) {
  describe(`PUT /api/position/${id}`, function () {
    it(`Modifying /api/position/${id}`, function (done) {
      agent
        .put(`/api/position/${id}`)
        .send(putPosition)
        .end(function (err, res) {
          if (err) done(err);
          res.should.have.status(expectedStatus);
          done();
        });
    });
  });
}

function testModifyPositionID(expectedStatus, id, newID) {
  describe(`PUT /api/position/${id}/changeID`, function () {
    it(`/api/position/${id}/changeID`, function (done) {
      agent
        .put(`/api/position/${id}/changeID`)
        .send(newID)
        .end(function (err, res) {
          if (err) done(err);
          res.should.have.status(expectedStatus);
          done();
        });
    });
  });
}

/***DELETE***/
function testDeletePosition(expectedStatus, id) {
  it(`Deleting Position ID:${id}`, function (done) {
    agent.delete(`/api/position/${id}/`).then(function (res) {
      res.should.have.status(expectedStatus);
      done();
    });
  });
}

function testDeleteAllPositions(expectedStatus) {
    it(`Deleting all positions`, function (done) {
        agent.delete(`/api/position/`).then(function (res) {
            res.should.have.status(expectedStatus);
            done();
        });
    });
}

describe("TEST Position API", function () {
    describe("Testing POST APIs",function (){
        testDeleteAllPositions(204);
        //Correct Posts
        testCreatePosition(201, postPositions[0]);
        testCreatePosition(201, postPositions[1]);
        testCreatePosition(201, postPositions[2]);


        //False Posts
        testCreatePosition(422, falsePostPositions[0]);//Missing Fields
        testCreatePosition(422, falsePostPositions[1]);//Empty Object
        testCreatePosition(422, falsePostPositions[2]);//Wrong ID Composition
        testCreatePosition(503, postPositions[2]);//Position already exist

    })

    describe("Testing GET APIs",function (){
        testDeleteAllPositions(204);

        //Correct Posts
        testCreatePosition(201, postPositions[0]);
        testCreatePosition(201, postPositions[1]);
        testCreatePosition(201, postPositions[2]);

        testGetAllPositions(200,3);

        for (let postPosition of postPositions)
            testGetPositionById(200, postPosition.positionID);
    })

    describe("Testing PUT APIs" ,function (){
        testDeleteAllPositions(204);

        //Correct Posts
        testCreatePosition(201, postPositions[0]);
        testCreatePosition(201, postPositions[1]);
        testCreatePosition(201, postPositions[2]);

        //Correct Puts
        testModifyPosition(200 , "111122223333", putPositions[0]);
        testModifyPosition(200 , "444455556666", putPositions[2]);

        //False Puts
        testModifyPosition(404 , "938476736273", putPositions[1]);//ID Not Found
        testModifyPosition(422 , "938567476736273", putPositions[1]);//ID Wrong Composition
        testModifyPosition(422 , "asas", putPositions[1]);//ID not validated

        testModifyPosition(422 , "777788889999", falsePutPositions[0]);//Missing Field
        testModifyPosition(422 , "777788889999", falsePutPositions[1]);//Empty Object
        testModifyPosition(422 , "777788889999", falsePutPositions[2]);//Wrong Values
        testModifyPosition(503 , "987654321987", falsePutPositions[3]);//Id Already Exists

        //Correct ID Edit
        testModifyPositionID(200, "777788889999", {newPositionID : "676792928484"});

        //False ID Edit
        testModifyPositionID(503, "987654321987", {newPositionID : "121212121212"});//new ID Already Exists
        testModifyPositionID(404, "847930295724", {newPositionID : "123456789123"});//old ID not found
        testModifyPositionID(422, "987654321987", {newPositionID : "3245"});//new ID not validated
        testModifyPositionID(422, "62334", {newPositionID : "123456789123"});//old ID not validated
        testModifyPositionID(422, "987654321987", {newPositionID : "asdadfa"});//new ID not validated



    })

    describe("Testing DELETE APIs", function(){
        testDeleteAllPositions(204);
        describe("Creating positions to delete", function() {
            //Correct Posts
            testCreatePosition(201, postPositions[0]);
            testCreatePosition(201, postPositions[1]);
            testCreatePosition(201, postPositions[2]);
        });
        describe("Creating positions to delete", function() {
            testDeletePosition(204, postPositions[0].positionID);//Correct Delete
            testDeletePosition(204, 123456789897);//Not Found
            testDeletePosition(422, 11112222333433);//ID Not Validated
            // clear db
            testDeletePosition(204, postPositions[1].positionID);
            testDeletePosition(204, postPositions[2].positionID);
        });
    })
});