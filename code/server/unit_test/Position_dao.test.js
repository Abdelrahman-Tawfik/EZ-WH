const chai = require('chai');
chai.should();
const dbConnection = require("../database/DatabaseConnection");
const positionsDAO = require("../database/Position_dao");
const skuDAO = require("../database/SKU_dao");
const Position = require("../modules/Position");
const {expect} = require("chai");

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
let expectedPositions = [
    {
        positionID:"111122223333",
        aisleID: "1111",
        row: "2222",
        col: "3333",
        maxWeight: 200,
        maxVolume: 200,
        occupiedWeight:0,
        occupiedVolume:0
    }
    ,
    {
        positionID:"444455556666",
        aisleID: "4444",
        row: "5555",
        col: "6666",
        maxWeight: 400,
        maxVolume: 400,
        occupiedWeight:0,
        occupiedVolume:0
    },
    {
        positionID:"777788889999",
        aisleID: "7777",
        row: "8888",
        col: "9999",
        maxWeight: 500,
        maxVolume: 500,
        occupiedWeight:0,
        occupiedVolume:0
    },
];

function testGetPositions(expectedPositions) {
    test('Get all Positions', async function () {
        let positions = [... await positionsDAO.getPositions()];
        positions.length.should.be.equal(expectedPositions.length);
        positions.should.be.an('array');
        for (let i = 0; i < expectedPositions.length; i++)
            expectedPositions.some((position) => {
                return comparePosition(positions[i], position)
            }).should.be.true;
    });
}



function testGetPositionByID(id,expectedPosition) {
    test(`Get Position by ID ${id}`, async function () {
        let positions = [...await positionsDAO.getPositionByID(id)];
        let position = positions[0];
        position.should.be.an('object');
        comparePosition(position, expectedPosition).should.be.true;
    });
}

function testCreatePosition(postPosition){
    test(`Create Position ${postPosition.positionID}`, async()=>{
        await positionsDAO.createPosition(postPosition);
        let res = await positionsDAO.getPositions();
        let getPosition=res[0];
        const modPost= {...postPosition, occupiedWeight: 0 ,occupiedVolume :0 };
        res.length.should.be.equal(1);
        comparePosition(getPosition, modPost).should.be.true;
    })
}

function testModifyPosition( oldID, newPositionID, newAisleID, newRow, newCol, newMaxWeight,
                             newMaxVolume, newOccupiedWeight, newOccupiedVolume){
    test(`Modify Position Info ${oldID}`, async() => {
        let supposedPosition = new Position(newPositionID,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume);
        await positionsDAO.modifyPosition(oldID,newPositionID,newAisleID,newRow,newCol,newMaxWeight,newMaxVolume,newOccupiedWeight,newOccupiedVolume);
        let res = await positionsDAO.getPositionByID(newPositionID);
        let modifiedPosition=res[0];
        res.length.should.be.equal(1);
        comparePosition(supposedPosition, modifiedPosition).should.be.true;

    })
}
function testModifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol){
    test(`Modify Position ID ${oldID}`, async() => {
        let ret = await positionsDAO.getPositionByID(oldID);
        let beforePosition=ret[0];
        let supposedPosition= {positionID : newPositionID , aisleID : newAisleID, row:newRow , col:newCol , maxWeight:beforePosition.maxWeight ,
            maxVolume:beforePosition.maxVolume , occupiedWeight:beforePosition.occupiedWeight , occupiedVolume: beforePosition.occupiedVolume, }
        await positionsDAO.modifyPositionID(oldID, newPositionID, newAisleID, newRow, newCol);
        let res = await positionsDAO.getPositionByID(newPositionID);
        let modifiedPosition=res[0];
        res.length.should.be.equal(1);
        comparePosition(supposedPosition, modifiedPosition).should.be.true;

    })
}
function testModifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId){
    test(`Modify SKU ${SKUId} assigned Position ${positionId}`, async() => {
        let ret = await positionsDAO.getPositionByID(positionId);
        let beforePosition=ret[0];
        let supposedPosition= {positionID : positionId , aisleID : beforePosition.aisleID, row:beforePosition.row , col:beforePosition.col , maxWeight:beforePosition.maxWeight ,
            maxVolume:beforePosition.maxVolume , occupiedWeight:newOccupiedWeight , occupiedVolume: newOccupiedVolume, }
        await positionsDAO.modifySKUPosition(positionId, newOccupiedWeight, newOccupiedVolume, SKUId);
        let res = await positionsDAO.getPositionByID(positionId);
        let modifiedPosition=res[0];
        res.length.should.be.equal(1);
        comparePosition(supposedPosition, modifiedPosition).should.be.true;

    })
}
function testDeletePosition(id){
    test(`Delete Position ${id}`, async() => {
        await positionsDAO.deletePosition(id);
        let deleted = (await positionsDAO.getPositionByID(id))[0];
        expect(deleted).to.be.undefined;



    })
}





function comparePosition(actualPosition, expectedPosition) {
    return actualPosition.positionID === expectedPosition.positionID &&
        actualPosition.aisleID === expectedPosition.aisleID &&
        actualPosition.row === expectedPosition.row &&
        actualPosition.col === expectedPosition.col &&
        actualPosition.maxWeight === expectedPosition.maxWeight &&
        actualPosition.maxVolume === expectedPosition.maxVolume &&
        actualPosition.occupiedWeight === expectedPosition.occupiedWeight &&
        actualPosition.occupiedVolume === expectedPosition.occupiedVolume ;

}



describe('Test Position DAO', () => {
    beforeAll(async()=> {
        await dbConnection.createConnection();
        await skuDAO.createSKU("Test SKU for Position", 10, 10, "No notes", 10.21,3);
    })
    describe('Test GETs', ()=>{
        beforeAll(async () => {

            await positionsDAO.createPosition(postPositions[0]);
            await positionsDAO.createPosition(postPositions[1]);
            await positionsDAO.createPosition(postPositions[2]);
        })
        testGetPositions(expectedPositions);
        testGetPositionByID("111122223333",expectedPositions[0]);
        afterAll(async ()=>{
            await positionsDAO.deleteAllPositions();
        })
    })
    describe('Test POSTs', ()=>{
        beforeAll(async () => {
            await positionsDAO.deleteAllPositions();

        })
       testCreatePosition(postPositions[0]);
        afterAll(async ()=>{
            await positionsDAO.deleteAllPositions();
        })
    })

    describe('Test PUTs', ()=>{
        beforeAll(async () => {
            await positionsDAO.createPosition(postPositions[0]);

        })
       testModifyPosition(postPositions[0].positionID,"989876765454","9898","7676","5454",1516,1210,222,333);
        afterAll(async ()=>{
            await positionsDAO.deleteAllPositions();
        })
    })
    describe('Test PUTs', ()=>{
        beforeAll(async () => {
            await positionsDAO.createPosition(postPositions[0]);

        })
       testModifyPositionID(postPositions[0].positionID,"989876765454","9898","7676","5454" );
        afterAll(async ()=>{
            await positionsDAO.deletePosition("989876765454");
        })
    })

    describe('Test PUTs', ()=>{
        beforeAll(async () => {
            await positionsDAO.createPosition(postPositions[0]);
        })
        testModifySKUPosition(postPositions[0].positionID ,30 , 30, 1);
        afterAll(async ()=>{
            await positionsDAO.deleteAllPositions();

        })
    })
    describe('Test Delete', ()=>{
        beforeAll(async () => {
            await positionsDAO.createPosition(postPositions[0]);
        })
        testDeletePosition(postPositions[0].positionID);
        afterAll(async ()=>{
            await positionsDAO.deleteAllPositions();

        })
    })
    afterAll(async ()=> {
        await positionsDAO.deleteAllPositions();
        await skuDAO.deleteAllSKUs();
    })
})






