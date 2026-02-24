const express = require('express');
const router = express.Router();
const adminDashboardController = require('../../controllers/admin/adminDashboardController');
const adminUsuarioController = require('../../controllers/admin/adminUsuarioController');
const adminDenunciaController = require('../../controllers/admin/adminDenunciaController');
const adminConfiguracaoController = require('../../controllers/admin/adminConfiguracaoController');
const adminLogController = require('../../controllers/admin/adminLogController');
const { atualizarUsuarioValidator } = require('../../validators/admin/adminUsuarioValidator');
const { atualizarStatusValidator, adicionarParecerValidator } = require('../../validators/admin/adminDenunciaValidator');
const { atualizarConfiguracaoValidator } = require('../../validators/admin/adminConfiguracaoValidator');
const validar = require('../../middlewares/validar');

// GET /api/admin/dashboard
router.get('/dashboard', adminDashboardController.dashboard);

// Gestão de Usuários
router.get('/usuarios', adminUsuarioController.listar);
router.get('/usuarios/:id', adminUsuarioController.obterPorId);
router.put('/usuarios/:id', atualizarUsuarioValidator, validar, adminUsuarioController.atualizar);
router.delete('/usuarios/:id', adminUsuarioController.desativar);
router.patch('/usuarios/:id/ativar', adminUsuarioController.ativar);

// Gestão de Denúncias
router.get('/denuncias', adminDenunciaController.listar);
router.get('/denuncias/:id', adminDenunciaController.obterPorId);
router.patch('/denuncias/:id', atualizarStatusValidator, validar, adminDenunciaController.atualizarStatus);
router.post('/denuncias/:id/parecer', adicionarParecerValidator, validar, adminDenunciaController.adicionarParecer);

// Configurações do Sistema
router.get('/configuracoes', adminConfiguracaoController.listar);
router.put('/configuracoes/:chave', atualizarConfiguracaoValidator, validar, adminConfiguracaoController.atualizar);

// Logs de Auditoria
router.get('/logs', adminLogController.listar);
router.get('/logs/:id', adminLogController.obterPorId);

module.exports = router;
