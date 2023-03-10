const express = require("express");
const { validationResult, param, check } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const { UserTypes } = require("../modules/User");
const UserService = require('../services/User_service');
const userService = new UserService();


const router = express.Router();

// User
router.get('/userinfo', (req, res) => {  //TODO
  return res.status(500).end();
});

router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await userService.getSuppliers();
    return res.status(200).json(suppliers);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await userService.getUsers();
    return res.status(200).json(users);
  } catch (err) {
    console.log("Error in Server");
    console.log(err);
    return res.status(500).end();
  }
});

router.post('/newUser',  // TODO
  check('username').isEmail(), check('name').exists(), check('surname').exists(),
  check('password').isLength({ min: 8 }), check('type').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0
        || !UserTypes.isUserTypes(req.body.type) ||
        req.body.type === UserTypes.MANAGER || req.body.type === UserTypes.ADMINISTRATOR) {
        return res.status(422).end();
      }
      await userService.createUser(req.body.username, req.body.name,
        req.body.surname, req.body.password, req.body.type);
      return res.status(201).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Conflict) return res.status(409).end();
      return res.status(503).end();
    }
  });

router.post('/managerSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.MANAGER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/customerSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.INTERNAL_CUSTOMER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/supplierSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.SUPPLIER);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/clerkSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.CLERK);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/qualityEmployeeSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.QUALITY_CHECK_EMPLOYEE);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/deliveryEmployeeSessions',
  check('username').isEmail(), check('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0) {
        return res.status(401).end();
      }
      let user = await userService.login(req.body.username, req.body.password, UserTypes.DELIVERY_EMPLOYEE);
      return res.status(200).json(user);
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.Unauthorized) return res.status(401).end();
      return res.status(500).end();
    }
  });

router.post('/logout', (req, res) => { // TODO
  return res.status(500).end();
});

router.put('/users/:username',
  param('username').isEmail(), check('oldType').exists(), check('newType').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || Object.keys(req.body).length === 0 ||
        !UserTypes.isUserTypes(req.body.oldType) || !UserTypes.isUserTypes(req.body.newType)
        || req.body.oldType === UserTypes.MANAGER || req.body.oldType === UserTypes.ADMINISTRATOR
        || req.body.newType === UserTypes.MANAGER || req.body.newType === UserTypes.ADMINISTRATOR) {
        return res.status(422).end();
      }
      await userService.modifyUserRights(req.params.username,
        req.body.oldType, req.body.newType);
      return res.status(200).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  });

router.delete('/users/:username/:type',
  param('username').isEmail(), param('type').exists(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty() || !UserTypes.isUserTypes(req.params.type) ||
        req.params.type === UserTypes.ADMINISTRATOR || req.params.type === UserTypes.MANAGER) {
        return res.status(422).end();
      }
      await userService.deleteUser(req.params.username, req.params.type);
      return res.status(204).end();
    }
    catch (err) {
      console.log("Error in Server");
      console.log(err);
      return res.status(503).end();
    }
  });

module.exports = router;