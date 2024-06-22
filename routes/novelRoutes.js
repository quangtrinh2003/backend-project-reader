const router = require("express").Router();
const novelController = require("./../controllers/novelController");
const authController = require("./../controllers/authController");

router.post(
  "/upload",
  authController.authentication,
  novelController.createNovel,
);

router.post(
  "/upload/:id",
  authController.authentication,
  authController.authorization,
  novelController.createNovelChapter,
);

router
  .route("/edit/:id/:chapter")
  .get(
    authController.authentication,
    authController.authorization,
    novelController.getEditChapter,
  )
  .patch(
    authController.authentication,
    authController.authorization,
    novelController.updateEditChapter,
  );

router
  .route("/:id/:chapter?")
  .get(novelController.novelRetrieveRouting)
  .post(authController.authentication, authController.checkNovelInvolved);
router.route("/").get(novelController.getNovels);

module.exports = router;
