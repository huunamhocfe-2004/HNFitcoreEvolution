const router = require("express").Router();
const c = require("../controllers/trialRequestController");
const { authMiddleware, requireRole } = require("../middleware/auth");

router.post("/", c.create);

router.use(authMiddleware, requireRole("admin", "staff"));

router.get("/", c.getAll);
router.get("/has-new", c.hasPending);
router.patch("/:id/status", c.updateStatus);

module.exports = router;
