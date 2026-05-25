const express = require("express");
const cuidadorController = require("../controllers/cuidadorController.js");
const { authenticate } = require("../middlewares/authMiddleware.js");

const router = express.Router();

// Listar cuidadores
router.get("/", authenticate, cuidadorController.listarCuidadores);

// Perfil de um cuidador
router.get("/:id", authenticate, cuidadorController.obterPerfilCuidador);

// Agenda pública de um cuidador (slots disponíveis)
router.get("/:id/agenda", authenticate, cuidadorController.obterAgendaCuidador);

module.exports = router;
