const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const ReturnOrderService = require('../services/ReturnOrder_service');
const returnOrderService = new ReturnOrderService();
const dayjs = require("dayjs");

const router = express.Router();

router.post(
  "/returnOrder",
  body("returnDate").exists(),
  body("products").isArray(),
  body("restockOrderId").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    // 
    if (!validationErrors.isEmpty() || !dayjs(req.body.returnDate, ['YYYY/MM/DD', 'YYYY/MM/DD HH:mm'], true).isValid()) {
      return res.status(422).end();
    }
    try{
      await returnOrderService.createReturnOrder(req.body.returnDate, req.body.products, req.body.restockOrderId)
      return res.status(201).end();
    } catch (err) {
      console.log(err);
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if  (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else return res.status(503).end();
    }
});

router.get(
  "/returnOrders",
  async (req, res) => {
    try{
      const returnOrders = await returnOrderService.getReturnOrders();
      return res.status(200).json(returnOrders);
    } catch (err) {
      console.log(err);
      return res.status(500).end();
    }
});

router.get("/returnOrders/:ID", param("ID").isInt({ min: 1 }), async (req, res) => {
  try {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    const returnOrder = await returnOrderService.getReturnOrderByID(req.params.ID);
    if (returnOrder === undefined) return res.status(404).end();
    return res.status(200).json(returnOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
});

router.delete(
  "/returnOrder/:ID",
  param("ID").isInt({ min: 1 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await returnOrderService.deleteReturnOrder(req.params.ID);
      return res.status(204).end();
    } catch (err) {
      console.log(err);
      return res.status(503).end();
    }
  }
);

module.exports = router;