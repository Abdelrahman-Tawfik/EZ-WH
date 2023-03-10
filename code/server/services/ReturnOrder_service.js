const dao = require("../database/ReturnOrder_dao");
const SKU_dao = require("../database/SKU_dao");
const SKUItem_dao = require("../database/SKUItem_dao");
const RestockOrder_dao = require("../database/RestockOrder_dao");
const EzWhException = require("../modules/EzWhException.js");
const Item_dao = require("../database/Item_dao");

class ReturnOrderService {
    constructor() {
    }

    async createReturnOrder(returnDate, products, restockOrderID) {
        const restockOrder =  await RestockOrder_dao.getRestockOrderByID(restockOrderID);
        if (restockOrder===undefined){
            console.log(`RestockOrder ${restockOrderID} not found!`);
            throw EzWhException.NotFound;
        }
        const returnOrderID = await dao.createReturnOrder(returnDate, restockOrderID);
        for (let product of products) {
            if(product.SKUId===undefined || product.itemId===undefined ||product.description===undefined|| product.RFID === undefined ||
                product.price===undefined || !Number.isInteger(product.SKUId) || typeof product.price !== "number" ) {
                await dao.deleteReturnOrder(restockOrderID);
                throw EzWhException.EntryNotAllowed;
            }
            const SKUItem = await SKUItem_dao.getSKUItemByRfid(product.RFID);
            if (SKUItem===undefined){
                console.log(`SKUItem ${product.RFID} not found!`);
                await dao.deleteReturnOrder(returnOrderID);
                console.log(`ReturnOrder ${returnOrderID} deleted for rollback!`);
                throw EzWhException.EntryNotAllowed;
            }
            const item = await Item_dao.getItemByIDAndSupplierID(product.itemId,restockOrder.supplierId);
            if (item===undefined){
                await dao.deleteReturnOrder(returnOrderID);
                throw EzWhException.EntryNotAllowed;
            }
            const SKU = await SKU_dao.getSKUById(product.SKUId);
            if (SKU === undefined) {
                console.log(`SKU ${product.SKUId} not found!`);
                await dao.deleteReturnOrder(returnOrderID);
                console.log(`ReturnOrder ${returnOrderID} deleted for rollback!`);
                throw EzWhException.EntryNotAllowed;
            }
            // const SKU = await SKU_dao.getSKUById(product.)
            await dao.createReturnOrderProducts(returnOrderID, product.RFID,product.itemId, restockOrder.supplierId);
            await SKUItem_dao.modifySKUItem(SKUItem.rfid ,SKUItem.rfid , 0 , SKUItem.dateOfStock );
        }
    }

    async getReturnOrderProducts(returnOrderID) {
        let returnProducts = [];
        const products = await dao.getReturnOrderProducts(returnOrderID);
        // console.log(`products: ${products}`)
        for (let product of products) {
            const SKUItem = await SKUItem_dao.getSKUItemByRfid(product.RFID);
            // console.log(`SKUItem: ${SKUItem}`)
            const SKU = await SKU_dao.getSKUById(SKUItem.sku)
            // console.log(`SKUs: ${SKU}`)
            const itemId = product.ItemID ;
            const returnProduct =
                {
                    "SKUId": SKUItem.sku,
                    "itemId": itemId,
                    "description": SKU.description,
                    "price": SKU.price,
                    "RFID": product.RFID,
                }
            returnProducts.push(returnProduct);
        }
        return returnProducts;
    }

    async getReturnOrders() {
        const returnOrders = await dao.getReturnOrders();
        // console.log(returnOrders);
        for (let returnOrder of returnOrders) {
            const products = await this.getReturnOrderProducts(returnOrder.id);
            // console.log(products);
            for (let p of products) {
                returnOrder.addProduct(p);
            }
        }
        return returnOrders;
    }

    async getReturnOrderByID(ID) {
        const returnOrder = await dao.getReturnOrderByID(ID);
        const products = await this.getReturnOrderProducts(ID);
        for (let p of products) {
            returnOrder.addProduct(p);
        }
        return returnOrder;
    }

    async deleteReturnOrder(ID) {
        await dao.deleteReturnOrder(ID);
    }

}

module.exports = ReturnOrderService;
