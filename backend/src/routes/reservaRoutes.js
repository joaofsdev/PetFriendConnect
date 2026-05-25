const express = require("express");
const reservaController = require("../controllers/reservaController.js");
const { authenticate, authorize } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", authenticate, reservaController.listarReservas);

router.get("/:id", authenticate, reservaController.obterReserva);

router.post(
  "/",
  authenticate,
  authorize(["DONO"]),
  reservaController.validateCriarReserva,
  reservaController.handleValidationErrors,
  reservaController.criarReserva,
);

router.patch(
  "/:id/cancelar",
  authenticate,
  authorize(["DONO"]),
  reservaController.cancelarReserva,
);

module.exports = router;
