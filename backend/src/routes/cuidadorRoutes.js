const express = require('express');
const router = express.Router();
const cuidadorController = require('../controllers/cuidadorController');

// GET /api/cuidadores - Listar cuidadores
router.get('/', cuidadorController.listar);

// GET /api/cuidadores/:id - Obter perfil do cuidador
router.get('/:id', cuidadorController.obterPerfil);

// GET /api/cuidadores/:id/agenda - Ver disponibilidade
router.get('/:id/agenda', cuidadorController.verAgenda);

module.exports = router;
