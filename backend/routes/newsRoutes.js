const express = require("express");
const router = express.Router();
const newsController = require("../controllers/newsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const uploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]);

// Public endpoints
router.get("/", newsController.getPublicNews);
router.get("/slider", newsController.getSliderNews);
router.get("/:id", newsController.getNewsById);

// Protected endpoints for Admin, Trustee, BranchManager
router.use(authMiddleware);
router.use(roleMiddleware(['Admin', 'Trustee', 'BranchManager']));

router.get("/admin/list", newsController.getAllNewsAdmin);
router.post("/", uploadFields, newsController.createNews);
router.put("/:id", uploadFields, newsController.updateNews);
router.delete("/:id", newsController.deleteNews);

module.exports = router;
