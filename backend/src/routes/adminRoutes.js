const express = require("express");
const { body, validationResult } = require("express-validator");
const adminController = require("../controllers/adminController.js");
const { sendError } = require("../utils/response.js");

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return sendError(res, erros.array().map((e) => e.msg).join(", "), 400);
  }
  next();
};

const validateEditarUsuario = [
  body("nome").optional().trim().isLength({ min: 3 }).withMessage("Nome deve ter no minimo 3 caracteres"),
  body("email").optional().trim().isEmail().withMessage("Email invalido"),
  body("tipo").optional().isIn(["DONO", "CUIDADOR"]).withMessage("Tipo so pode ser DONO ou CUIDADOR"),
  body("telefone").optional({ nullable: true }).trim(),
  body("endereco").optional({ nullable: true }).trim(),
  body("ativo").optional().isBoolean().withMessage("Status ativo invalido"),
];

const validateAtualizarDenuncia = [
  body("status").notEmpty().withMessage("Status e obrigatorio").isIn(["PENDENTE", "EM_ANALISE", "RESOLVIDA", "REJEITADA"]).withMessage("Status invalido"),
  body("resolucao").optional({ nullable: true }).trim(),
];

const validateAtualizarConfig = [
  body("valor").notEmpty().withMessage("Valor e obrigatorio").isLength({ max: 1000 }).withMessage("Valor excede o limite"),
];

// Usuários
router.get("/usuarios", adminController.listarUsuarios);
router.get("/usuarios/:id", adminController.obterUsuario);
router.put("/usuarios/:id", validateEditarUsuario, handleValidationErrors, adminController.editarUsuario);
router.delete("/usuarios/:id", adminController.desativarUsuario);
router.patch("/usuarios/:id/ativar", adminController.ativarUsuario);

// Denúncias
router.get("/denuncias", adminController.listarDenuncias);
router.get("/denuncias/:id", adminController.obterDenuncia);
router.patch("/denuncias/:id", validateAtualizarDenuncia, handleValidationErrors, adminController.atualizarDenuncia);

// Dashboard
router.get("/dashboard", adminController.obterDashboard);

// Configurações
router.get("/configuracoes", adminController.listarConfiguracoes);
router.put("/configuracoes/:chave", validateAtualizarConfig, handleValidationErrors, adminController.atualizarConfiguracao);

// Logs
router.get("/logs", adminController.listarLogs);

module.exports = router;
