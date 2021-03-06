const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validation = require("./validation");

router.get("/signup", userController.signupForm);
router.get("/login", userController.loginForm);
router.post("/users/signup", validation.validateUsers, userController.create);
router.post("/users/login", validation.validateUsers, userController.login);
router.get("/users/logout", userController.logout);
router.get("/profile", userController.showProfile);
router.get("/profile/charge", userController.charge);
router.post("/profile/downgrade", userController.downgrade);

module.exports = router;
