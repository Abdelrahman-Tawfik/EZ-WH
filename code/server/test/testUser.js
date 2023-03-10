const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.should();

const app = require('../server');
const agent = chai.request.agent(app);

let long_string = "really really long string that shouldn't be stored in db. asdasdasdasdasdasdasdasdasdasdasdasdrotflrotflrotflrotflrotflrotflrotflrotflrotflrotflrotfl";

const nHardcodedSuppliers = 1;
const nHardcodedUsers = 4;

const hardcodedManager = {
        name: "Michael",
        surname: "Scott",
        username: "manager1@ezwh.com",
        type: "manager",
        password: "testpassword"
    };

const hardcodedUsers = [
    {
        name: "UPS",
        surname: "Guy",
        username: "deliveryEmployee1@ezwh.com",
        type: "deliveryEmployee",
        password: "testpassword"
    },
    {
        name: "Michael",
        surname: "Reeves",
        username: "clerk1@ezwh.com",
        type: "clerk",
        password: "testpassword"
    },
    {
        name: "Creed",
        surname: "Bratton",
        username: "qualityEmployee1@ezwh.com",
        type: "qualityEmployee",
        password: "testpassword"
    },
    {
        name: "John",
        surname: "Doe",
        username: "user1@ezwh.com",
        type: "customer",
        password: "testpassword"
    }
]

const hardcodedSuppliers = [
    {
        name: "Best",
        surname: "Supplier",
        username: "supplier1@ezwh.com",
        type: "supplier",
        password: "testpassword"
    }
]

let types = ["manager", "customer", "supplier", "clerk", "qualityEmployee", "deliveryEmployee"];

let managers = [
    {
        username: "michaelscott@ezwh.com",
        name: "Michael",
        surname: "Scott",
        password: "testpassword",
        type: "manager"
    }
];

let customers = [
    {
        username: "robertcalifornia@ezwh.com",
        name: "Robert",
        surname: "California",
        password: "testpassword",
        type: "customer"
    }
];

let suppliers = [
    {
        username: "robertdunder@ezwh.com",
        name: "Robert",
        surname: "Dunder",
        password: "testpassword",
        type: "supplier"
    }
];

let clerks = [
    {
        username: "kevinmalone@ezwh.com",
        name: "Kevin",
        surname: "Malone",
        password: "testpassword",
        type: "clerk"
    },
    {
        username: "stanleyhudson@ezwh.com",
        name: "Stanley",
        surname: "Hudson",
        password: "testpassword",
        type: "clerk"
    }
];

let qualityEmployees = [
    {
        username: "greatbratton@ezwh.com",
        name: "Creed",
        surname: "Bratton",
        password: "testpassword",
        type: "qualityEmployee"
    }
];

let deliveryEmployee = [
    {
        username: "darrylphilbin@ezwh.com",
        name: "Darryl",
        surname: "Philbin",
        password: "testpassword",
        type: "deliveryEmployee"
    }
];
let users = [...customers, ...suppliers, ...clerks, ...qualityEmployees, ...deliveryEmployee];

function testGetUsers(userType, expectedNumber, expectedUsers) {
    it(`Getting /api/${userType}s`, function (done) {
        agent.get(`/api/${userType}s`)
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
                    (expectedUsers.map((s) => s.name)).should.include(el.name);
                    el.should.haveOwnProperty("surname");
                    (expectedUsers.map((s) => s.surname)).should.include(el.surname);
                    el.should.haveOwnProperty("email");
                    (expectedUsers.map((s) => s.username)).should.include(el.email);
                }
                done();
            });
    });
}

function testAddNewUser(user, expectedStatus) {
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
}

function testDeleteUser(username, userType, expectedStatus) {
    it(`Deleting /api/users/${username}/${userType}`, function (done) {
        agent.delete(`/api/users/${username}/${userType}`)
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testDeleteUserInvalidInput() {
    testDeleteUser("asdf", "customer", 422);
    testDeleteUser("supplier1@ezwh.com", "manager", 422);
    testDeleteUser("supplier1@ezwh.com", "administrator", 422);
    testDeleteUser(long_string + "@ezwh.com", "customer", 422);
}

function testUserSession(userType, username, password, expectedStatus) {
    it(`Posting /api/${userType}Sessions`, function (done) {
        agent.post(`/api/${userType}Sessions`)
            .send({
                username: username,
                password: password
            })
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                if (expectedStatus === 200) {
                    res.should.be.json;
                    res.body.should.haveOwnProperty("username");
                    res.body.should.haveOwnProperty("name");
                }
                done();
            });
    });
}

// NB. This will delete the first user from the list if it's already present in db. Use as last test
function testUserSessionInvalidInput() {
    testDeleteUser(users[0].username, users[0].type, 204);
    testAddNewUser(users[0], 201);
    testUserSession(users[0].type, users[0].username, "wrong", 401);
    testUserSession(users[0].type, "wrong", users[0].password, 401);
    testDeleteUser(users[0].username, users[0].type, 204);
    for (let t of types) {
        testUserSession(t, "wrong", "wrong", 401);
    }
}

function testEditUserType(username, oldType, newType, expectedStatus) {
    it(`Putting /api/users/${username}`, function (done) {
        agent.put(`/api/users/${username}`)
            .send({
                oldType: oldType,
                newType: newType
            })
            .end(function (err, res) {
                if (err)
                    done(err);
                res.should.have.status(expectedStatus);
                done();
            });
    });
}

function testEditUserTypeInvalidInput() {
    testEditUserType("asd", "asd", "supplier", 422);
    testEditUserType("asd@asd.com", "asd", "supplier", 422);
    testEditUserType("asd@asd.com", "customer", "supplier", 404);
}

describe("TEST User API", function () {
    // Delete all users inserted in previous run of tests
    // for (let u of users) {
    //     testDeleteUser(u.username, u.type, 204);
    // }

    describe("Checking presence of hardcoded users", function () {
        // Verify that the db contain no users
        testGetUsers("supplier", nHardcodedSuppliers, hardcodedSuppliers);
        testGetUsers("user", nHardcodedUsers + nHardcodedSuppliers, [...hardcodedUsers, ...hardcodedSuppliers]);
    });

    describe("Adding supplier", function () {
        // Add new user
        testAddNewUser(suppliers[0], 201);

        // Try adding the same user another time
        testAddNewUser(suppliers[0], 409);

        // Add user with same email as before but different type. Should be ok
        s = {...suppliers[0]};
        s.type = "customer";
        testAddNewUser(s, 201);
        testDeleteUser(s.username, s.type, 204);

        // Test that the user was added
        testGetUsers("supplier", nHardcodedSuppliers + 1, [...hardcodedSuppliers, ...suppliers]);
        testGetUsers("user", 1 + nHardcodedSuppliers + nHardcodedUsers, [...users, ...hardcodedSuppliers, ...hardcodedUsers]);
    });


    describe("Log in supplier", function () {
        // Test login with created user
        testUserSession("supplier", suppliers[0].username, suppliers[0].password, 200);
    });

    describe("Delete users (Invalid input)", function () {
        // Test invalid input for delete user
        testDeleteUserInvalidInput();
    });

    describe("Removing added supplier", function () {

        // Remove user and test that was removed
        testDeleteUser(suppliers[0].username, suppliers[0].type, 204);
        testGetUsers("supplier", nHardcodedSuppliers, hardcodedSuppliers);
        testGetUsers("user", nHardcodedUsers + nHardcodedSuppliers, [...hardcodedUsers, ...hardcodedSuppliers]);
    });

    describe("Adding users (Invalid input)", function () {
        testAddNewUser({}, 422);
        // TODO: Uncomment these if we should reject really long strings
        // testAddNewUser({...suppliers[0], name: long_string}, 422);
        // testAddNewUser({...suppliers[0], surname: long_string}, 422);
        // testAddNewUser({...suppliers[0], password: long_string}, 422);
        testAddNewUser({...suppliers[0], username: "gianni"}, 422);
        testAddNewUser({...suppliers[0], username: long_string + "@ezwh.it"}, 422);
        testAddNewUser({...suppliers[0], type: "wrong"}, 422);
        testAddNewUser({...suppliers[0], type: "administrator"}, 422);
        testAddNewUser({...suppliers[0], type: "manager"}, 422);
    });

    describe("Adding users", function () {
        // Test adding a lot of users
        for (let u of users) {
            testAddNewUser(u, 201);
        }

        // Test that all the users were added
        testGetUsers("supplier", 1 + nHardcodedSuppliers, [...suppliers, ...hardcodedSuppliers]);
        testGetUsers("user", users.length + nHardcodedUsers + nHardcodedSuppliers, [...users, ...hardcodedUsers, ...hardcodedSuppliers]);
    });

    describe("Login with added users", function () {
        // Test login with added users
        for (let u of users) {
            testUserSession(u.type, u.username, u.password, 200);
        }
    });

    describe("Delete added users", function () {
        // Delete all added users
        for (let u of users) {
            testDeleteUser(u.username, u.type, 204);
        }
    });

    describe("Adding users to test edit", function () {
        // Add user to change his rights
        testAddNewUser(qualityEmployees[0], 201);
        testGetUsers("supplier", nHardcodedSuppliers, hardcodedSuppliers);
        testGetUsers("user", 1 + nHardcodedSuppliers + nHardcodedUsers, [qualityEmployees[0], ...hardcodedSuppliers, ...hardcodedUsers]);
    });

    describe("Edit users", function () {
        // Try to make Creed Bratton manager
        testEditUserType(qualityEmployees[0].username, qualityEmployees[0].type, "manager", 422);
        // Didn't work... try to make him administrator now!
        testEditUserType(qualityEmployees[0].username, qualityEmployees[0].type, "administrator", 422);
        // Ok make him a supplier...
        testEditUserType(qualityEmployees[0].username, qualityEmployees[0].type, "supplier", 200);
        // Test that the change happened
        testGetUsers("supplier", 1 + nHardcodedSuppliers, [{...qualityEmployees[0], type: "supplier"}, ...hardcodedSuppliers]);
        testGetUsers("user", 1 + nHardcodedSuppliers + nHardcodedUsers, [{...qualityEmployees[0], type: "supplier"}, ...hardcodedSuppliers, ...hardcodedUsers]);
    });

    describe("Deleting edited user", function () {
        testDeleteUser(qualityEmployees[0].username, "supplier", 204);
        // Now db should contain only hardcoded accounts
        // TODO: fix this to contain hardcoded accounts number
        testGetUsers("supplier", nHardcodedSuppliers, hardcodedSuppliers);
        testGetUsers("user", nHardcodedUsers + nHardcodedSuppliers, [...hardcodedUsers, ...hardcodedSuppliers]);
    });

    describe("Edit user (Invalid input)", function () {
        // Test invalid input for edit user type
        testEditUserTypeInvalidInput();
    });

    describe("Login (Incalid input)", function () {
        // Test invalid input for users session
        testUserSessionInvalidInput();
    });

    describe("Login manager", function () {
        // TODO: add login test for manager
        testUserSession("manager", hardcodedManager.username, hardcodedManager.password, 200);
    });
});
