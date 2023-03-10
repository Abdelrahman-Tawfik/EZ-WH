const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const SKUService = require('../services/SKU_service');
const skuService = new SKUService();

const router = express.Router();

//GET /skus
router.get("/skus", async (req, res) => {
  try {
    let skus = await skuService.getSKUs();
    return res.status(200).json(skus.map((s) => {return {
        id: s.id,
        description: s.description,
        weight: s.weight,
        volume: s.volume,
        notes: s.notes,
        position: s.position ? s.position.id : null,
        availableQuantity: s.availableQuantity,
        price: s.price,
        testDescriptors: s.testDescriptors.map((t) => t.id)
    }}));
  } catch (err) {
    if (err === EzWhException.InternalError) return res.status(500).end();
  }
});

//GET /skus/:id
router.get("/skus/:id", param("id").isInt({min : 1}),
	async (req, res) => {
	const validationErrors = validationResult(req);
	if (!validationErrors.isEmpty()) {
		return res.status(422).end();
	}
	try {
		let sku = await skuService.getSKUById(req.params.id);
		return res.status(200).json({
            id: sku.id,
            description: sku.description,
            weight: sku.weight,
            volume: sku.volume,
            notes: sku.notes,
            position: sku.position ? sku.position.id : null,
            availableQuantity: sku.availableQuantity,
            price: sku.price,
            testDescriptors: sku.testDescriptors.map((t) => t.id)
        });
	} catch (err) {
		if (err === EzWhException.InternalError)
			return res.status(500).end();
		else if (err === EzWhException.NotFound)
			return res.status(404).end();
	}
});

//POST /sku
router.post(
  "/sku",
  body("description").isString().isLength({min: 1}),
  body("weight").isInt({ min: 0 }),
  body("volume").isInt({ min: 0 }),
  body("notes").isString().isLength({min: 1}),
  body("price").isFloat({ min: 0 }),
  body("availableQuantity").isInt({ min: 0 }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await skuService.createSKU(
        req.body.description,
        req.body.weight,
        req.body.volume,
        req.body.notes,
        req.body.price,
        req.body.availableQuantity
      );
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.InternalError) {
        return res.status(503).end();
      }
    }
  }
);

//PUT /sku/:id
router.put(
    "/sku/:id",
    param("id").isInt({min : 1}),
	body("newDescription").isString().isLength({min: 1}),
	body("newWeight").isInt({min : 0}),
	body("newVolume").isInt({min : 0}),
	body("newNotes").isString().isLength({min: 1}),
	body("newPrice").isFloat({min : 0}),
	body("newAvailableQuantity").isInt({min : 0}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await skuService.modifySKU(req.params.id, req.body.newDescription, req.body.newWeight, req.body.newVolume, req.body.newNotes, req.body.newPrice, req.body.newAvailableQuantity
      );
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.PositionFull) {
        return res.status(422).end();
      } else if (err === EzWhException.InternalError) {
        return res.status(503).end();
      }
      else if (err === EzWhException.NotFound) {
          return res.status(404).end();
      }
    }
  }
);

//PUT /sku/:id/position
router.put(
    "/sku/:id/position",
    param("id").isInt({min : 1}),
	body("position").exists().isString().isNumeric().isLength({ min: 12, max: 12 }),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await skuService.addSKUPosition(req.params.id, req.body.position);
			return res.status(200).end();
		} catch (err) {
			if (err === EzWhException.NotFound)
				return res.status(404).end();
			else if (err === EzWhException.PositionFull)
				return res.status(422).end();
			else if (err === EzWhException.InternalError)
				return res.status(503).end();
		}
});

//DELETE /skus/:id
router.delete("/skus/:id", param("id").isInt({min : 0}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await skuService.deleteSKU(req.params.id);
			return res.status(204).end();
		} catch (err) {
			if (err === EzWhException.InternalError)
				return res.status(500).end();
			else if (err === EzWhException.NotFound)
				return res.status(404).end();
		}
});

module.exports = router;