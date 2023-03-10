const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const RestockOrderService = require('../services/RestockOrder_service');
const restockOrderService = new RestockOrderService();
const dayjs = require("dayjs");

const router = express.Router();

const states = ["ISSUED", "DELIVERY", "DELIVERED",
    "TESTED", "COMPLETEDRETURN", "COMPLETED"];

router.get(
  "/restockOrders",
  async (req, res) => {
    try {
      const restockOrders = await restockOrderService.getRestockOrders();
      return res.status(200).json(restockOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
  }
);

router.get(
  "/restockOrdersIssued",
  async (req, res) => {
    try {
      const restockOrdersIssued = await restockOrderService.getRestockOrders("ISSUED");
      return res.status(200).json(restockOrdersIssued);
    } catch (err) {
      return res.status(500).end();
    }
  }
);

router.get(
  "/restockOrders/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      const restockOrder = await restockOrderService.getRestockOrderByID(req.params.ID);
      if (restockOrder===undefined)
        return res.status(404).end();
      else
        return res.status(200).json(restockOrder);
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(500).end();
    }
  }
);

router.get(
  "/restockOrders/:ID/returnItems",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      const returnItems = await restockOrderService.getRestockOrderReturnItems(req.params.ID);
      return res.status(200).json(returnItems);
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      return res.status(500).end();
    }
  }
);

router.post("/restockOrder",
  body("issueDate").exists(),
  body("products").isArray(),
  body("supplierId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty() || !dayjs(req.body.issueDate, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid()) {
      return res.status(422).end();
    }
    try {
      await restockOrderService.createRestockOrder(req.body.issueDate, req.body.products, req.body.supplierId);
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
  }
);

router.put("/restockOrder/:ID",
  param("ID").isInt({ min:1 }),
  body("newState").isIn(states),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.params.ID);
      await restockOrderService.modifyRestockOrderState(req.params.ID, req.body.newState);
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
});

router.put("/restockOrder/:ID/skuItems",
  param("ID").isInt({ min:1 }),
  body("skuItems").isArray(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      // console.log(req.body);
      await restockOrderService.addSkuItemsToRestockOrder(req.params.ID, req.body.skuItems)
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
});

router.put("/restockOrder/:ID/transportNote",
  body("transportNote").exists(),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await restockOrderService.addTransportNoteToRestockOrder(req.params.ID, req.body.transportNote);
      return res.status(200).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
});

router.delete(
  "/restockOrder/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await restockOrderService.deleteRestockOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

module.exports = router;