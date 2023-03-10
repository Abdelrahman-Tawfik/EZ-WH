const chai = require('chai');
chai.should();
const dbConnection = require("../database/DatabaseConnection");
const skuitemDAO = require("../database/SKUItem_dao");
const skuDAO = require("../database/SKU_dao");
const {expect} = require("chai");


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
];
let postSKUItems = [
    {
        RFID:"98987676545434567876543434540111",
        SKUId:1,
        DateOfStock:"2021/12/31 21:30"
    }
    ,
    {
        RFID:"45678987654567899876543456543112",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"45678987654567899876543456543113",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"45678987654567899876543456543114",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
];
let expectedAll = [
    {
        RFID:"98987676545434567876543434540111",
        SKUId:1,
        Available:0,
        DateOfStock:"2021/12/31 21:30"
    }
    ,
    {
        RFID:"45678987654567899876543456543112",
        SKUId:2,
        Available:0,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"45678987654567899876543456543113",
        SKUId:2,
        Available:0,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"45678987654567899876543456543114",
        SKUId:2,
        Available:0,
        DateOfStock:"2021/12/29 16:30"
    },
];
let expectedID = [//only do after modyfing last 2 posts  skuitems to available
    {
        RFID:"45678987654567899876543456543113",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"45678987654567899876543456543114",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
];




function testGetSKUItems(expectedAll) {
    test('Get all SKUItems', async function () {
        let skuItems = [... await skuitemDAO.getSKUItems()];
        skuItems.length.should.be.equal(expectedAll.length);
        skuItems.should.be.an('array');
        for (let i = 0; i < expectedAll.length; i++)
            expectedAll.some((skuItem) => {
                return compareSKUItem(skuItems[i], skuItem)
            }).should.be.true;
    });
}
function testGetSKUItemBySKU(SKUID,expectedIDs) {
    test(`Get SKUItems for SKUID :${SKUID}`, async function () {
        let skuItems = [...await skuitemDAO.getSKUItemsBySKU(SKUID)];
        skuItems.length.should.be.equal(expectedID.length);
        skuItems.should.be.an('array');
        for (let i = 0; i < expectedID.length; i++)
            expectedID.some((skuItem) => {
                return compareSKUItemID(skuItems[i], skuItem)
            }).should.be.true;
    });
}

function testGetSKUItemByRfid(rfid,expectedRFID) {
    test(`Get a SKUItem by RFID:${rfid}`, async function () {
        let skuItem = await skuitemDAO.getSKUItemByRfid(rfid);
        skuItem.should.be.an('object');
        compareSKUItem(skuItem, expectedRFID).should.be.true;
    });
}
function testCreateSKUItem(rfid, SKUId, dateOfStock){
    test('Create SKUItem ${rfid}', async()=>{
        await skuitemDAO.createSKUItem(rfid, SKUId, dateOfStock);
        let getSKUItem=await skuitemDAO.getSKUItemByRfid(rfid);
        const newSKUItem= {RFID : rfid , SKUId:SKUId, DateOfStock: dateOfStock};
        getSKUItem.should.be.an('object');
        compareSKUItemID(getSKUItem, newSKUItem).should.be.true;
    })
}
function testModifySKUItem( rfid, newRfid, newAvailable, newDateOfStock){
    test('Modify SKUItem ${rfid}', async() => {
        let beforeSKUItem = await skuitemDAO.getSKUItemByRfid(rfid);
        let supposedSKUItem = {RFID:newRfid ,SKUId: beforeSKUItem.sku , Available: newAvailable, DateOfStock: newDateOfStock}
        await skuitemDAO.modifySKUItem(rfid, newRfid, newAvailable, newDateOfStock);
        let modifiedSKUItem = await skuitemDAO.getSKUItemByRfid(newRfid);
        modifiedSKUItem.should.be.an('object');
        compareSKUItem(modifiedSKUItem,supposedSKUItem);

    })
}
function testDeleteSKUItem(rfid){
    test('Delete SKUItem ${rfid}', async() => {
        await skuitemDAO.deleteSKUItem(rfid);
        let deleted = await skuitemDAO.getSKUItemByRfid(rfid);
        expect(deleted).to.be.undefined;



    })
}

//new SKUItem(skuItems[i].RFID,skuItems[i].SKUId,skuItems[i].Available, skuItems[i].DateOfStock)
function compareSKUItem(actualSKUItem, expectedSKUItem) {
    return actualSKUItem.RFID === expectedSKUItem.rfid &&
        actualSKUItem.SKUId === expectedSKUItem.sku &&
        actualSKUItem.Available === expectedSKUItem.available &&
        actualSKUItem.DateOfStock === expectedSKUItem.dateOfStock;

}
function compareSKUItemID(actualSKUItem, expectedSKUItem) {
    return actualSKUItem.RFID === expectedSKUItem.rfid &&
        actualSKUItem.SKUId === expectedSKUItem.sku &&
        actualSKUItem.DateOfStock === expectedSKUItem.dateOfStock ;

}

describe('Test SKUItems DAO', () => {
    describe('Test GETs', ()=>{
        beforeAll(async () => {
            await dbConnection.createConnection();
            await skuDAO.createSKU("ID 1 Test SKU for SKUItem", 10, 10, "No notes", 10.21,3);
            await skuDAO.createSKU("ID 2 Test SKU for SKUItem", 10, 10, "No notes", 10.21,3);
            await skuitemDAO.createSKUItem(postSKUItems[3].RFID,postSKUItems[3].SKUId,postSKUItems[3].DateOfStock);
            await skuitemDAO.createSKUItem(postSKUItems[1].RFID,postSKUItems[1].SKUId,postSKUItems[1].DateOfStock);
            await skuitemDAO.createSKUItem(postSKUItems[2].RFID,postSKUItems[2].SKUId,postSKUItems[2].DateOfStock);

        })
        testCreateSKUItem(postSKUItems[0].RFID,postSKUItems[0].SKUId,postSKUItems[0].DateOfStock);
        testGetSKUItems(expectedAll);
        testGetSKUItemByRfid(postSKUItems[1].RFID,postSKUItems[1]);
        testModifySKUItem(postSKUItems[2].RFID,"98987676545434567876543434540123",1,postSKUItems[2].DateOfStock);
        testModifySKUItem(postSKUItems[3].RFID,"98987676545434567876543434540124",1,postSKUItems[3].DateOfStock);
        testGetSKUItemBySKU(2,expectedID);
        testDeleteSKUItem(postSKUItems[0].RFID);

       //BY ID
        afterAll(async ()=>{
            await skuitemDAO.deleteSKUItem(postSKUItems[0].RFID);
            await skuitemDAO.deleteAllSKUItems();
            await skuDAO.deleteAllSKUs();
        })
    })


})
