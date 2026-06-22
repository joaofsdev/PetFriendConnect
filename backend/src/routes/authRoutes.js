const express = require("express");
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController.js");
const { authenticate } = require("../middlewares/authMiddleware.js");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: true, message: "Muitas tentativas. Tente novamente em 15 minutos.", statusCode: 429 },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register
router.post(
  "/register",
  authLimiter,
  authController.validateRegister,
  authController.handleValidationErrors,
  authController.register,
);

// POST /api/auth/login
router.post(
  "/login",
  authLimiter,
  authController.validateLogin,
  authController.handleValidationErrors,
  authController.login,
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  authController.validateForgotPassword,
  authController.handleValidationErrors,
  authController.solicitarResetSenha,
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  authController.validateResetPassword,
  authController.handleValidationErrors,
  authController.resetarSenha,
);

// GET /api/auth/me
router.get("/me", authenticate, authController.me);

// PUT /api/auth/me
router.put(
  "/me",
  authenticate,
  authController.validateUpdateProfile,
  authController.handleValidationErrors,
  authController.atualizarPerfil,
);

// PATCH /api/auth/me/senha
router.patch(
  "/me/senha",
  authenticate,
  authController.validateChangePassword,
  authController.handleValidationErrors,
  authController.alterarSenha,
);

// OAuth social
router.get("/google", authController.iniciarOAuth("google"));
router.get("/google/callback", authController.callbackOAuth("google"));
router.get("/facebook", authController.iniciarOAuth("facebook"));
router.get("/facebook/callback", authController.callbackOAuth("facebook"));

module.exports = router;
