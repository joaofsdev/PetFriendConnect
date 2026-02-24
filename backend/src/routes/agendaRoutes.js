const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const validar = require('../middlewares/validar');
const { criarAgendaValidator } = require('../validators/agendaValidator');

// POST /api/agendas - Cadastrar horário disponível
router.post('/', criarAgendaValidator, validar, agendaController.criar);

module.exports = router;
