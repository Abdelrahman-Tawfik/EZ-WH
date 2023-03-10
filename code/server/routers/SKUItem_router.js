const express = require("express");
const { validationResult, param, body } = require("express-validator");
const EzWhException = require("../modules/EzWhException.js");
const SKUItemService = require('../services/SKUItem_service');
const skuitemService = new SKUItemService();
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

const router = express.Router();

//GET /skuitems
router.get("/skuitems", async (req, res) => {
  try {
    let skuitems = await skuitemService.getSKUItems();
    return res.status(200).json(
      skuitems.map((s) => {
        return {
          RFID: s.rfid,
          SKUId: s.sku.id,
          Available: s.available,
          DateOfStock: s.dateOfStock,
        };
      })
    );
  } catch (err) {
    return res.status(500).end();
  }
});

//GET /skuitems/sku/:id
router.get("/skuitems/sku/:id", param("id").isInt({min : 1}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			let skuitems = await skuitemService.getSKUItemsBySKU(req.params.id);
			return res.status(200).json(skuitems.map((s) => {
			return {
				RFID: s.rfid,
				SKUId: s.sku.id,
				DateOfStock: s.dateOfStock,
        };
      })
    );
  } catch (err) {
    if (err === EzWhException.NotFound) return res.status(404).end();
    else return res.status(500).end();
  }
});

//GET /skuitems/:rfid
router.get("/skuitems/:rfid", param("rfid").isNumeric().isLength({min: 32, max: 32}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			let skuitem = await skuitemService.getSKUItemByRfid(req.params.rfid);
			return res.status(200).json({
				RFID: skuitem.rfid,
				SKUId: skuitem.sku.id,
				Available: skuitem.available,
				DateOfStock: skuitem.dateOfStock,
    });
  } catch (err) {
    if (err === EzWhException.NotFound) {
      return res.status(404).end();
    } else return res.status(500).end();
  }
});

//POST /skuitem
router.post(
  "/skuitem",
  body("RFID").isNumeric().isLength({min: 32, max: 32}),
  body("SKUId").isInt({ min: 1 }),
  body("DateOfStock").custom((value) => {
    if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()) {
      throw new Error("Invalid date");
    }
    return true;
  }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await skuitemService.createSKUItem(req.body.RFID, req.body.SKUId, req.body.DateOfStock);
      return res.status(201).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else if (err === EzWhException.InternalError) return res.status(503).end();
    }
  }
);

//PUT /skuitems/:rfid
router.put(
    "/skuitems/:rfid",
    param("rfid").isNumeric().isLength({min: 32, max: 32}),
	body("newRFID").exists().isNumeric().isLength({min: 32, max: 32}),
	body("newAvailable").isInt({min : 0, max: 1}),
	body("newDateOfStock").custom((value) => {
		if (value !== null && !dayjs(value, ["YYYY/MM/DD", "YYYY/MM/DD HH:mm"], true).isValid()) {
      throw new Error("Invalid date");
    }
    return true;
  }),
  async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).end();
    }
    try {
      await skuitemService.modifySKUItem(req.params.rfid, req.body.newRFID, req.body.newAvailable, req.body.newDateOfStock);
      return res.status(200).end();
    } catch (err) {
      if (err === EzWhException.NotFound) return res.status(404).end();
      else return res.status(503).end();
    }
  }
);

//DELETE /skuitems/:rfid
router.delete("/skuitems/:rfid", param("rfid").isNumeric().isLength({min: 32, max: 32}),
	async (req, res) => {
		const validationErrors = validationResult(req);
		if (!validationErrors.isEmpty()) {
			return res.status(422).end();
		}
		try {
			await skuitemService.deleteSKUItem(req.params.rfid);
			return res.status(204).end();
		} catch (err) {
			return res.status(503).end();
		}
});
//USED ONLY FOR TESTING
router.delete(
    "/skuitems/",
    async (req, res) => {
        try {
            await skuitemService.deleteAllSKUItems();
            return res.status(204).end();
        } catch (err) {
            if (err === EzWhException.NotFound) return res.status(404).end();
            else if (err === EzWhException.InternalError) return res.status(503).end();
        }
    }
);

module.exports = router;