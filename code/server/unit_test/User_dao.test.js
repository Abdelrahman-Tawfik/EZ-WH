const chai = require('chai');
const should = chai.should();
const UserDAO = require("../database/User_dao");
const dbConnection = require("../database/DatabaseConnection");
const {User} = require("../modules/User");

const hardcodedUsers = [
    new User(2, "Best", "Supplier", "supplier1@ezwh.com", "supplier", "testpassword"),
    new User(3, "UPS", "Guy", "deliveryEmployee1@ezwh.com", "deliveryEmployee", "testpassword"),
    new User(4, "Michael", "Reeves", "clerk1@ezwh.com", "clerk", "testpassword"),
    new User(5, "Creed", "Bratton", "qualityEmployee1@ezwh.com", "qualityEmployee", "testpassword"),
    new User(6, "John", "Doe", "user1@ezwh.com", "customer", "testpassword")
]
const hardcodedSuppliers = [
    new User(2, "Best", "Supplier", "supplier1@ezwh.com", "supplier", "testpassword")
]

const usersToAdd = [
    new User(7, "Zoey", "Bennet", "supplier2@ezwh.com", "supplier", "testpassword"),
    new User(8, "Scott", "Cartwright", "customer2@ezwh.com", "customer", "testpassword"),
    new User(9, "Daniela", "Rossi", "clerk2@ezwh.com", "clerk", "testpassword")
]

const usersToModify = [
    new User(7, "Zoey", "Bennet", "supplier2@ezwh.com", "clerk", "testpassword"),
    new User(8, "Scott", "Cartwright", "customer2@ezwh.com", "qualityEmployee", "testpassword"),
    new User(9, "Daniela", "Rossi", "clerk2@ezwh.com", "supplier", "testpassword")
]
function compareUser(expected, actual) {
    return expected.name === actual.name && expected.surname === actual.surname && expected.email === actual.email &&
        expected.type === actual.type && actual.verifyPassword(expected.password);
}

function testGetUsers(expectedUsers) {
    test("Get all Users", async function () {
        const users = [...await UserDAO.getUsers()];
        users.should.be.an("array");
        users.length.should.be.equal(expectedUsers.length);
        for (let user of users) {
            expectedUsers.some((u) => compareUser(u, user)).should.be.true;
        }
    });
}

function testGetSuppliers(expectedSuppliers) {
    test("Get all Suppliers", async function () {
        const suppliers = [...await UserDAO.getSuppliers()];
        suppliers.should.be.an("array");
        suppliers.length.should.be.equal(expectedSuppliers.length);
        for (let supplier of suppliers) {
            expectedSuppliers.some((u) => compareUser(u, supplier)).should.be.true;
        }
    })
}

function testCreateUser(user) {
    test(`Create User ${user.type} ${user.email} `, async function () {
        const id = await UserDAO.createUser(user.email, user.name, user.surname, User.storePassword(user.password), user.type);
        Number.isInteger(id).should.be.true;
        const getUser = await UserDAO.getUserByID(id);
        compareUser(user, getUser).should.be.true;
    });
}

function testDeleteUser(user) {
    test(`Delete User${user.type} ${user.email} `, async function () {
        await UserDAO.deleteUser(user.email, user.type);
        const getUser = await UserDAO.getUserByID(user.id);
        should.equal(getUser, undefined);
    });
}

function testGetUserByEmail(user) {
    test(`Get User ${user.email}`, async function () {
        const getUser = await UserDAO.getUserByEmail(user.email, user.type);
        compareUser(user, getUser).should.be.true;
    })
}

function testModifyUserRights(user, newType) {
    test(`Modify ${user.type} ${user.email} to ${newType}`, async function () {
        await UserDAO.modifyUserRights(user.email, user.type, newType);
        const getUser = await UserDAO.getUserByID(user.id);
        const expectedUser = new User(user.id, user.name, user.surname, user.email, newType, user.password);
        compareUser(expectedUser, getUser).should.be.true;
    });
}


describe("Unit Test User_dao", function () {
    beforeAll(async () => {
        await dbConnection.createConnection();
    });
    afterAll(async () => {
        for (let user of usersToAdd)
            await UserDAO.deleteUser(user.email, user.type);
    });
    testGetUsers(hardcodedUsers);
    testGetSuppliers(hardcodedSuppliers);
    for (let user of usersToAdd)
        testCreateUser(user);
    for (let user of hardcodedUsers)
        testGetUserByEmail(user);
    testModifyUserRights(usersToAdd[0], usersToModify[0].type);
    testModifyUserRights(usersToAdd[1], usersToModify[1].type);
    testModifyUserRights(usersToAdd[2], usersToModify[2].type);
    testModifyUserRights(usersToModify[0], usersToAdd[0].type);
    testModifyUserRights(usersToModify[1], usersToAdd[1].type);
    testModifyUserRights(usersToModify[2], usersToAdd[2].type);

    for (let user of usersToAdd)
        testDeleteUser(user);

});