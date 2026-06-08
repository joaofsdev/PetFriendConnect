const express = require("express");
const adminController = require("../controllers/adminController.js");

const router = express.Router();

// Usuários
router.get("/usuarios", adminController.listarUsuarios);
router.get("/usuarios/:id", adminController.obterUsuario);
router.put("/usuarios/:id", adminController.editarUsuario);
router.delete("/usuarios/:id", adminController.desativarUsuario);
router.patch("/usuarios/:id/ativar", adminController.ativarUsuario);

// Denúncias
router.get("/denuncias", adminController.listarDenuncias);
router.get("/denuncias/:id", adminController.obterDenuncia);
router.patch("/denuncias/:id", adminController.atualizarDenuncia);

// Dashboard
router.get("/dashboard", adminController.obterDashboard);

// Configurações
router.get("/configuracoes", adminController.listarConfiguracoes);
router.put("/configuracoes/:chave", adminController.atualizarConfiguracao);

// Logs
router.get("/logs", adminController.listarLogs);

module.exports = router;
