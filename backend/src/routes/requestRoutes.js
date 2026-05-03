const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireRoles = require("../middleware/roleMiddleware");
const {
  createPickupRequest,
  getPickupRequests,
  updatePickupRequestStatus
} = require("../controllers/requestController");

const router = express.Router();

router.post("/", createPickupRequest);

router.get(
  "/",
  authMiddleware,
  requireRoles("admin", "agent_depart", "agent_arrivee"),
  getPickupRequests
);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRoles("admin", "agent_depart", "agent_arrivee"),
  updatePickupRequestStatus
);

module.exports = router;