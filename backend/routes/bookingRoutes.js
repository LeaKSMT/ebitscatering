const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, bookingController.getBookings);
router.get("/:id", verifyToken, bookingController.getBookingById);
router.post("/", verifyToken, bookingController.createBooking);
router.put("/:id", verifyToken, bookingController.updateBooking);
router.delete("/:id", verifyToken, bookingController.deleteBooking);

module.exports = router;