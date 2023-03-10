# Integration and API Test Report

Date: 2022/05/25

Version: 1.0

# Contents

- [Dependency graph](#dependency-graph)

- [Integration approach](#integration)

- [Tests](#tests)

- [Coverage of scenarios and FR](#scenario-coverage)

- [Coverage of non-functional requirements](#nfr-coverage)



# Dependency graph 

```plantuml

class server

package routers {
    class InternalOrder_router
    class Item_router
    class Position_router
    class RestockOrder_router
    class ReturnOrder_router
    class SKU_router
    class SKUItem_router
    class TestDescriptor_router
    class TestResult_router
    class User_router
}

package services {
    class InternalOrder_service
    class Item_service
    class Position_service
    class RestockOrder_service
    class ReturnOrder_service
    class SKU_service
    class SKUItem_service
    class TestDescriptor_service
    class TestResult_service
    class User_service
}

package dao {
    class InternalOrder_dao
    class Item_dao
    class Position_dao
    class RestockOrder_dao
    class ReturnOrder_dao
    class SKU_dao
    class SKUItem_dao
    class TestDescriptor_dao
    class TestResult_dao
    class User_dao
}

class DatabaseConnection

server <-- InternalOrder_router
server <-- Item_router
server <-- Position_router
server <-- RestockOrder_router
server <-- ReturnOrder_router
server <-- SKU_router
server <-- SKUItem_router
server <-- TestDescriptor_router
server <-- TestResult_router
server <-- User_router

InternalOrder_router <-- InternalOrder_service
Item_router <-- Item_service
Position_router <-- Position_service
RestockOrder_router <-- RestockOrder_service
ReturnOrder_router <-- ReturnOrder_service
SKU_router <-- SKU_service
SKUItem_router <-- SKUItem_service
TestDescriptor_router <-- TestDescriptor_service
TestResult_router <-- TestResult_service
User_router <-- User_service

InternalOrder_service <-- InternalOrder_dao
InternalOrder_service <-- SKU_dao
InternalOrder_service <-- SKUItem_dao
InternalOrder_service <-- User_dao
Item_service <-- Item_dao
Item_service <-- SKU_dao
Item_service <-- User_dao
Item_service <-- RestockOrder_dao
Item_service <-- ReturnOrder_dao
Position_service <-- Position_dao
RestockOrder_service <-- RestockOrder_dao
RestockOrder_service <-- Item_dao
RestockOrder_service <-- SKUItem_dao
ReturnOrder_service <-- ReturnOrder_dao
ReturnOrder_service <-- RestockOrder_dao
ReturnOrder_service <-- SKU_dao
ReturnOrder_service <-- SKUItem_dao
SKU_service <-- SKU_dao
SKU_service <-- Position_dao
SKUItem_service <-- SKUItem_dao
SKUItem_service <-- SKU_dao
TestDescriptor_service <-- TestDescriptor_dao
TestDescriptor_service <-- SKU_dao
TestResult_service <-- TestResult_dao
TestResult_service <-- TestDescriptor_dao
TestResult_service <-- SKUItem_dao
User_service <-- User_dao

InternalOrder_dao <-- DatabaseConnection
Item_dao <-- DatabaseConnection
Position_dao <-- DatabaseConnection
RestockOrder_dao <-- DatabaseConnection
ReturnOrder_dao <-- DatabaseConnection
SKU_dao <-- DatabaseConnection
SKUItem_dao <-- DatabaseConnection
TestDescriptor_dao <-- DatabaseConnection
TestResult_dao <-- DatabaseConnection
User_dao <-- DatabaseConnection
```
     
# Integration approach

We adopted a bottom-up integration approach, firstly we tested the functions in database folder (*Unit*_dao.js files) that have no dependencies, then we tested at api level without mockups. To test database functions we imported other DAO Classes to create and delete entries in tables due to foreign key constraint.
step1: *Unit*_dao.js (unit tests)
step2: API tests without mockups

For apiTests we assumed that the db exists and contains only the hardcoded users. The tests leave the db in the same state as the initial state (with only hardcoded users).
    


#  Integration Tests


## Step 1
| Classes  | mock up used |Jest test cases |
|--|--|--|
|InternalOrder_dao|-|InternalOrder_dao.test|
|Item_dao|-|Item_dao.test|
|Position_dao|-|Position_dao.test|
|RestockOrder_dao|-|RestockOrder_dao.test|
|ReturnOrder_dao|-|ReturnOrder_dao.test|
|SKU_dao|-|SKU_dao.test|
|SKUItem_dao|-|SKUItem_dao.test|
|TestDescriptor_dao|-|TestDescriptor_dao.test|
|TestResult_dao|-|TestResult_dao.test|
|User_dao|-|User_dao.test|

## Step 2
| Classes  | mock up used | API test cases |
|--|--|--|
|InternalOrder_router|-|testInternalOrder|
|Item_router|-|testItem|
|Position_router|-|testPosition|
|RestockOrder_router|-|testRestockOrder|
|ReturnOrder_router|-|testReturnOrder|
|SKU_router|-|testSKU|
|SKUItem_router|-|testSKUItem|
|TestDescriptor_router|-|testTestDescriptor|
|TestResult_router|-|testTestResult|
|User_router|-|testUser|




# Coverage of Scenarios and FR


| Scenario ID       | Functional Requirements covered | Mocha  Test(s)                                     |
|-------------------|---------------------------------|----------------------------------------------------| 
| UC1               | FR2                             | "TEST SKU API" in testSKU.js                       |             
| UC2               | FR3.1                           | "TEST Position API" in testPosition.js             |             
| UC3, UC5.1, UC5.3 | FR5.1-5.8                       | "TEST RestockOrder API" in testRestockOrder.js     |   
| UC4, UC7          | FR1                             | "TEST User API" in testUser.js                     |             
| UC5.2             | FR5.8.2                         | "Add test results" in testTestResult.js            |
| UC5.3             | FR5.8                           | "TEST SKUItem API" in testSKUItem.js               |
| UC6               | FR5.9-5.12                      | "TEST ReturnOrder API" in testReturnOrder.js       |
| UC9, UC10         | FR6                             | "TEST InternalOrder API" in testInternalOrder.js   |
| UC11              | FR7                             | "TEST Item API" in testItem.js                     |
| UC12              | FR3.2                           | "Test TestDescriptor API" in testTestDescriptor.js |


# Coverage of Non Functional Requirements


### 

| Non Functional Requirement | Test name                                        |
|----------------------------|--------------------------------------------------|
| NFR4                       | "TEST Position API" in testPosition.js           |
| NFR6                       | "TEST SKUItem API" in testSKUItem.js             |
|                            | "TEST TestResult API" in testTestResult.js       |
|                            | "TEST RestockOrder API" in testRestockOrder.js   |
|                            | "TEST ReturnOrder API" in testReturnOrder.js     |
|                            | "TEST InternalOrder API" in testInternalOrder.js |
|                            | "TEST SKUItem API" in testSKUItem.js             |
| NFR9                       | "TEST SKUItem API" in testSKUItem.js             |
|                            | "TEST TestResult API" in testTestResult.js       |
|                            | "TEST RestockOrder API" in testRestockOrder.js   |
|                            | "TEST ReturnOrder API" in testReturnOrder.js     |
|                            | "TEST InternalOrder API" in testInternalOrder.js |
