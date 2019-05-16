const express = require("express");
const router = express.Router();
const wikiController = require("../controllers/wikiController");
const validation = require("./validation");
const helper = require("../auth/helpers");

router.get("/wiki", wikiController.show);
router.get("/wiki/new", helper.ensureAuthenticated, wikiController.new);
router.post("/wiki/create", wikiController.create);
router.get("/wiki/:id", wikiController.showWiki);
router.get("/wiki/:id/edit", helper.ensureAuthenticated, wikiController.edit);
router.post("/wiki/:id/update", wikiController.update);
router.post("/wiki/:id/delete", wikiController.delete);
router.get("/getPrivateWikis", wikiController.getPrivateWikis);
router.get("/getCollabWikis", wikiController.getCollabWikis);

module.exports = router;
