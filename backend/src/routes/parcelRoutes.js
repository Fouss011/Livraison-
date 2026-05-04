const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireRoles = require("../middleware/roleMiddleware");
const {
  createParcel,
  geconst {
  createParcel,
  getParcels,
  getParcelById,
  updateParcelStatus,
  getAvailableParcels,
  getDashboardStats,
  trackParcelPublic,
  deleteParcel
} = require("../controllers/parcelController");

const router = express.Router();

router.get("/stats/dashboard", authMiddleware, getDashboardStats);
router.get("/available/list", authMiddleware, getAvailableParcels);
router.get("/track/public", trackParcelPublic);

router.post(
  "/",
  authMiddleware,
  requireRoles("admin", "agent_depart"),
  createParcel
);

router.get("/", authMiddleware, getParcels);
router.get("/:id", authMiddleware, getParcelById);

router.patch(
  "/:id/status",
  authMiddleware,
  requireRoles("admin", "agent_depart", "agent_arrivee"),
  updateParcelStatus
);
router.delete(
  "/:id",
  authMiddleware,
  requireRoles("admin"),
  deleteParcel
);

module.exports = router;