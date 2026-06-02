const express = require("express");
const authController = require("../controllers/authController.js");
const { authenticate } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  authController.validateRegister,
  authController.handleValidationErrors,
  authController.register,
);

// POST /api/auth/login
router.post(
  "/login",
  authController.validateLogin,
  authController.handleValidationErrors,
  authController.login,
);

// GET /api/auth/me
router.get("/me", authenticate, authController.me);

// OAuth social
router.get("/google", authController.iniciarOAuth("google"));
router.get("/google/callback", authController.callbackOAuth("google"));
router.get("/facebook", authController.iniciarOAuth("facebook"));
router.get("/facebook/callback", authController.callbackOAuth("facebook"));

module.exports = router;
