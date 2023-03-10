const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
chai.should();

const app = require("../server");
const agent = chai.request.agent(app);

function testDeleteAllSKUItems(expectedStatus) {
    it(`Deleting all SKUItems`, function (done) {
        agent.delete(`/api/skuitems/`).then(function (res) {
            res.should.have.status(expectedStatus);
            done();
        });
    });
}

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


let postSKUItems = [
    {
        RFID:"98987676545434567876543434540987",
        SKUId:2,
        DateOfStock:"2021/12/31 21:30"
    }
    ,
    {
        RFID:"45678987654567899876543456543456",
        SKUId:3,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        //different date format
        RFID:"12345678901234567890123456789015",
        SKUId:2,
        DateOfStock:"2020/11/29"
    },
    {
        //null date of stock
        RFID:"09876532123456728876356789324532",
        SKUId:1,
        DateOfStock:null
    },
    {
        RFID:"11111111111111111111111111111111",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        RFID:"21111111111111111111111111111111",
        SKUId:3,
        DateOfStock:"2021/12/29 16:30"
    },
];
let falsePostSKUItems = [
    {
        //Longer RFID
        RFID:"989876765454345678765434345123140987",
        SKUId:2,
        DateOfStock:"2021/11/23 21:30"
    }
    ,
    {
        //SKUID Not Available (404)
        RFID:"45678987654567899876543456543456",
        SKUId:90,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        //missing SKUID
        RFID:"45678987654567899876543456543456",
        DateOfStock:"2021/12/29 16:30"
    },
    {
        //RFID already exists (503)
        RFID:"98987676545434567876543434540987",
        SKUId:2,
        DateOfStock:"2021/12/29 16:30"
    },
    {
        //wrong date format
        RFID:"09876532153423423376356789324532",
        SKUId:2,
        DateOfStock:"23/12/2022 02:30"
    },
    {
        //wrong date format
        RFID:"09876532123456728876356789324532",
        SKUId:1,
        DateOfStock:"2019-11-15 11:30"
    },
    {
        //wrong date format
        RFID:"98765433456789876543234567876233",
        SKUId:1,
        DateOfStock:" 11:30 2019/11/15"
    },
    {
        //wrong date format
        RFID:"09876532123456728876356789324532",
        SKUId:1,
        DateOfStock:" 11:30 2019/11/15"
    },
    {
        //wrong rfid format
        RFID:"1486754235asdqw23376356789324532",
        SKUId:1,
        DateOfStock:" 2021/12/29 16:30"
    }
];
let putSKUItems = [
    {
        //same RFID new availability
        newRFID:"98987676545434567876543434540987",
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    }
    ,
    {
        //different RFID
        newRFID:"69712307990785467908456734569735",
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    },
    {
        //different RFID new date
        newRFID:"69712307990785467208456734569735",
        newAvailable:1,
        newDateOfStock:"2021/01/29"
    }

];
let falsePutSKUItems = [
    {
        //availabilty value
        newRFID:"98987676764434567876543434540987",
        newAvailable:3,
        newDateOfStock:"2021/11/29 12:30"
    }
    ,
    {
        //Long RFID
        newRFID:"6971230799078511467908456734569735",
        newAvailable:0,
        newDateOfStock:"2021/11/29 12:30"
    },
    {
        //wrong date format
        newRFID:"69712307990785467208456734569735",
        newAvailable:0,
        newDateOfStock:"12/12/2012"
    },
    {
        //RFID already exists
        newRFID:"21111111111111111111111111111111",
        newAvailable:0,
        newDateOfStock:"2021/01/29"
    },
    {
        //Missing Field
        newAvailable:0,
        newDateOfStock:"2021/01/29"
    }

];

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

function testCreateSKUItem(expectedStatus, postSKUItem) {
    describe("POST /api/skuitem", function () {
        it("Adding a /api/skuitem", function (done) {
            agent
                .post("/api/skuitem")
                .send(postSKUItem)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedStatus);
                    done();
                });
        });
    });
}

function testGetAllSKUItems(expectedStatus , expectedNumber) {
    describe(`get /api/skuitems`, function () {
        it(`Getting /api/skuitems`, function (done) {
            agent.get(`/api/skuitems`).end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(expectedStatus);
                res.should.be.json;
                res.body.should.be.a("array");
                res.body.should.have.lengthOf(expectedNumber);
                for (let i = 0; i < res.body.length; i++) {
                    let s = res.body[i];
                    s.should.haveOwnProperty("RFID");
                    s.should.haveOwnProperty("SKUId");
                    s.should.haveOwnProperty("Available");
                    s.should.haveOwnProperty("DateOfStock");
                }
                done();
            });
        });
    });
}

function testGetSKUItemById(expectedStatus, id, expectedNumber) {
    describe(`get /api/skuitems/sku/${id}`, function () {
        it(`Getting /api/skuitems/sku/${id}`, function (done) {
            agent.get(`/api/skuitems/sku/${id}`).end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(expectedStatus);
                res.should.be.json;
                res.body.should.be.a("array");
                res.body.should.have.lengthOf(expectedNumber);
                for (let i = 0; i < res.body.length; i++) {
                    let s = res.body[i];
                    s.should.haveOwnProperty("RFID");
                    s.should.haveOwnProperty("SKUId");
                    s.should.haveOwnProperty("DateOfStock");
                }
                done();
            });
        });
    });
}

function testGetSKUItemByRFID(expectedStatus, rfid) {
    describe(`get /api/skuitems/${rfid}`, function () {
        it(`Getting /api/skuitems/${rfid}`, function (done) {
            agent.get(`/api/skuitems/${rfid}`).end(function (err, res) {
                if (err) {
                    done(err);
                }
                res.should.have.status(expectedStatus);
                if(res.status===200){
                res.should.be.json;
                res.body.should.be.a("object");
                res.body.should.haveOwnProperty("RFID");
                res.body.should.haveOwnProperty("SKUId");
                res.body.should.haveOwnProperty("Available");
                res.body.should.haveOwnProperty("DateOfStock");
                 }
                done();
            });
        });
    });
}
function testModifySKUItem(expectedStatus, rfid, putSKUItem) {
    describe(`PUT /api/skuitems/${rfid}`, function () {
        it(`Modifying /api/skuitems/${rfid}`, function (done) {
            agent
                .put(`/api/skuitems/${rfid}`)
                .send(putSKUItem)
                .end(function (err, res) {
                    if (err) done(err);
                    res.should.have.status(expectedStatus);
                    done();
                });
        });
    });
}

function testDeleteSKUItem(expectedStatus, rfid) {
    it(`Deleting SKUItem RFID:${rfid}`, function (done) {
        agent.delete(`/api/skuitems/${rfid}`).then(function (res) {
            res.should.have.status(expectedStatus);
            done();
        });
    });
}
describe("TEST SKUItem API", function () {
    describe("Adding SKU to test", function () {
        for (let sku of skus)
            testCreateSKU(201, sku);
    });

    describe("Testing POST APIs" , function (){
        testDeleteAllSKUItems(204);
        //Correct Posts
        testCreateSKUItem(201, postSKUItems[0]);
        testCreateSKUItem(201, postSKUItems[1]);
        testCreateSKUItem(201, postSKUItems[2]);
        testCreateSKUItem(201, postSKUItems[3]);
        testCreateSKUItem(201, postSKUItems[4]);
        testCreateSKUItem(201, postSKUItems[5]);


        //False Posts
        testCreateSKUItem(422, falsePostSKUItems[0]);
        testCreateSKUItem(404, falsePostSKUItems[1]);
        testCreateSKUItem(422, falsePostSKUItems[2]);
        testCreateSKUItem(503, falsePostSKUItems[3]);
        testCreateSKUItem(422, falsePostSKUItems[4]);
        testCreateSKUItem(422, falsePostSKUItems[5]);
        testCreateSKUItem(422, falsePostSKUItems[6]);
        testCreateSKUItem(422, falsePostSKUItems[7]);
        testCreateSKUItem(422, falsePostSKUItems[8]);
    });


    describe("Testing PUT APIs" ,function (){
        prepare();

        //Correct Puts
        testModifySKUItem(200,"98987676545434567876543434540987", putSKUItems[0]);
        testModifySKUItem(200,"45678987654567899876543456543456", putSKUItems[1]);
        testModifySKUItem(200,"12345678901234567890123456789015", putSKUItems[2]);

        //false puts
        testModifySKUItem(404,"12345678905432567890123456789015", putSKUItems[0]);//not found rfid
        testModifySKUItem(422,"98987676545434567876543434540987", falsePutSKUItems[0]);
        testModifySKUItem(422,"98987676545434567876543434540987", falsePutSKUItems[1]);
        testModifySKUItem(422,"98987676545434567876543434540987", falsePutSKUItems[2]);
        testModifySKUItem(503,"98987676545434567876543434540987", falsePutSKUItems[3]);
        testModifySKUItem(422,"98987676545434567876543434540987", falsePutSKUItems[4]);
        testModifySKUItem(422,"9898767654543456784540987", putSKUItems[2]);//RFID Validation
        testModifySKUItem(422,"a string", putSKUItems[2]);//RFID Validation

    })
    describe("Testing GET APIs ", function(){
        prepare();
        //Get ALL
        testGetAllSKUItems(200, 6);

        //get by ID
        testGetSKUItemById(200,2, 3)
        testGetSKUItemById(200,1, 0)
        testGetSKUItemById(200,3, 1)

        //Get By RFID
        testGetSKUItemByRFID(200,"98987676545434567876543434540987" );
        testGetSKUItemByRFID(404,"98987676545434012876543434540912" );
        testGetSKUItemByRFID(422,"98987676545434012876543434643432540987" );
        testGetSKUItemByRFID(422,"A String" );

    })

    describe("Deleting SKU used to test", function () {
        for (let i = 0; i < skus.length; i++)
            testDeleteSKU(204, i+1);
    })
})


function prepare(){
    testDeleteAllSKUItems(204);
    //Correct Posts
    testCreateSKUItem(201, postSKUItems[0]);
    testCreateSKUItem(201, postSKUItems[1]);
    testCreateSKUItem(201, postSKUItems[2]);
    testCreateSKUItem(201, postSKUItems[3]);
    testCreateSKUItem(201, postSKUItems[4]);
    testCreateSKUItem(201, postSKUItems[5]);

    testModifySKUItem(200, postSKUItems[0].RFID, {
        //different RFID
        newRFID:postSKUItems[0].RFID,
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    });
    testModifySKUItem(200, postSKUItems[1].RFID, {
        //different RFID
        newRFID:postSKUItems[1].RFID,
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    });
    testModifySKUItem(200, postSKUItems[2].RFID, {
        //different RFID
        newRFID:postSKUItems[2].RFID,
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    });
    testModifySKUItem(200, postSKUItems[3].RFID, {
        //different RFID
        newRFID:postSKUItems[3].RFID,
        newAvailable:0,
        newDateOfStock:"2021/11/29 12:30"
    });
    testModifySKUItem(200, postSKUItems[4].RFID, {
        //different RFID
        newRFID:postSKUItems[4].RFID,
        newAvailable:1,
        newDateOfStock:"2021/11/29 12:30"
    });
    testModifySKUItem(200, postSKUItems[5].RFID, {
        //different RFID
        newRFID:postSKUItems[5].RFID,
        newAvailable:0,
        newDateOfStock:"2021/11/29 12:30"
    });

}






