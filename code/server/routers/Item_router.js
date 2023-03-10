const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const ItemService = require('../services/Item_service');
const itemService = new ItemService();
const router = express.Router();

//GET /items
router.get("/items", async (req, res) => {
  try {
    const items = await itemService.getItems();
    return res.status(200).json(
        items.map((i) => {
            return {
                id: i.id,
                description: i.description,
                price: i.price,
                SKUId: i.skuId,
                supplierId: i.supplierId,
            };
        })
    );
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /items/:id/:supplierId
router.get("/items/:id/:supplierId", param("id").isInt({ min: 0 }), param("supplierId").isInt({ min: 0 }),async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    const item = await itemService.getItemByIDAndSupplierID(req.params.id, req.params.supplierId);
    return res.status(200).json({
        id: item.id,
        description: item.description,
        price: item.price,
        SKUId: item.skuId,
        supplierId: item.supplierId
    });
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else res.status(500).end();
  }
});

//POST /item
router.post(
  "/item",
  body("id").isInt({ min: 0 }),
  body("description").exists(),
  body("price").isFloat({ min: 0 }),
  body("SKUId").isInt({ min: 0 }),
  body("supplierId").isInt({ min: 0 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await itemService.createItem(req.body.id, req.body.description, req.body.price, req.body.SKUId, req.body.supplierId);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /item/:id
router.put(
  "/item/:id/:supplierId",
  param("id").isInt({ min: 0 }),
  param("supplierId").isInt({ min: 0 }),
  body("newDescription").exists(),
  body("newPrice").isFloat({ min: 0 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await itemService.modifyItem(req.params.id, req.params.supplierId, req.body.newDescription, req.body.newPrice);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.EntryNotAllowed) return res.status(422).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//DELETE /items/:id
router.delete("/items/:id/:supplierId", param("id").isInt({ min: 0 }),param("supplierId").isInt({ min: 0 }), async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(422).end();
  }
  try {
    await itemService.deleteItem(req.params.id , req.params.supplierId);
    return res.status(204).end();
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else if (err === EzWhException.InternalError) return res.status(503).end();
  }
});

module.exports = router;