const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const validar = require('../middlewares/validar');
const { criarReservaValidator } = require('../validators/reservaValidator');

// GET /api/reservas - Listar reservas do usuário
router.get('/', reservaController.listar);

// GET /api/reservas/:id - Obter reserva específica
router.get('/:id', reservaController.obter);

// POST /api/reservas - Criar reserva (transação ACID)
router.post('/', criarReservaValidator, validar, reservaController.criar);

// PATCH /api/reservas/:id/cancelar - Cancelar reserva
router.patch('/:id/cancelar', reservaController.cancelar);

module.exports = router;
