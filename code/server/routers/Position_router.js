const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const PositionService = require('../services/Position_service');
const positionService = new PositionService();

const router = express.Router();

//GET /positions
router.get("/positions", async (req, res) => {
  try {
    const positions = await positionService.getPositions();
    return res.status(200).json(positions);
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /positions/:id
router.get("/positions/:id", param("id").isString().isNumeric().isLength({ min: 12, max: 12 }), async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    const position = await positionService.getPositionByID(req.params.id);
    return res.status(200).json(position);
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else res.status(500).end();
  }
});

//POST /position
router.post(
  "/position",
  body("positionID").exists().isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("aisleID").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("row").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("col").exists().isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("maxWeight").exists().isInt({min : 0}),
  body("maxVolume").exists().isInt({min : 0}),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    let id1 = req.body.aisleID.concat(req.body.row, req.body.col);
    let result = req.body.positionID.localeCompare(id1);
    if (result !== 0) {
      return res.status(422).end();
    }

    try {
      await positionService.createPosition(
        req.body.positionID,
        req.body.aisleID,
        req.body.row,
        req.body.col,
        req.body.maxWeight,
        req.body.maxVolume
      );
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /position/:positionID
router.put(
  "/position/:positionID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("newAisleID").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newRow").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newCol").isString().isNumeric().isLength({ min: 4, max: 4 }),
  body("newMaxWeight").isInt({min : 0}),
  body("newMaxVolume").isInt({min : 0}),
  body("newOccupiedWeight").isInt({min : 0}),
  body("newOccupiedVolume").isInt({min : 0}),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    const newPositionID = req.body.newAisleID.concat(req.body.newRow, req.body.newCol);
    try {
      await positionService.modifyPosition(
        req.params.positionID,
        newPositionID,
        req.body.newAisleID,
        req.body.newRow,
        req.body.newCol,
        req.body.newOccupiedWeight,
        req.body.newMaxVolume,
        req.body.newOccupiedWeight,
        req.body.newOccupiedVolume
      );
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /position/:positionID/changeID
router.put(
  "/position/:positionID/changeID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  body("newPositionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    const newAisleID = req.body.newPositionID.slice(0, 4);
    const newRow = req.body.newPositionID.slice(4, 8);
    const newCol = req.body.newPositionID.slice(8, 12);
    try {
      await positionService.modifyPositionID(req.params.positionID, req.body.newPositionID, newAisleID, newRow, newCol);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//DELETE /position/:positionID
router.delete(
  "/position/:positionID",
  param("positionID").isString().isNumeric().isLength({ min: 12, max: 12 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await positionService.deletePosition(req.params.positionID);
      return res.status(204).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//USED ONLY FOR TESTING
router.delete(
    "/position/",
    async (req, res) => {
        try {
            await positionService.deleteAllPositions();
            return res.status(204).end();
        } catch (err) {
            if (err === EzWhException.NotFound) return res.status(404).end();
            else if (err === EzWhException.InternalError) return res.status(503).end();
        }
    }
);

module.exports = router;