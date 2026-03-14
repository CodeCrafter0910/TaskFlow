const express = require("express");
const router = express.Router();
const { register, login, logout, getMe } = require("../controllers/auth");
const { registerValidation, loginValidation } = require("../middleware/validate");
const { protect } = require("../middleware/auth");

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

module.exports = router;
