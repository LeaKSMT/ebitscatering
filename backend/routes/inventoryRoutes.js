const express = require("express");
const router = express.Router();

const inventoryController = require("../controllers/inventoryController");

router.get("/", inventoryController.getInventoryItems);
router.post("/", inventoryController.createInventoryItem);
router.put("/:id", inventoryController.updateInventoryItem);
router.delete("/:id", inventoryController.archiveInventoryItem);

router.post("/release", inventoryController.releaseItemToBooking);
router.post("/return-check", inventoryController.savePostEventCheck);

router.get("/booking/:bookingId", inventoryController.getBookingInventoryItems);
router.get("/logs/recent", inventoryController.getInventoryLogs);

module.exports = router;