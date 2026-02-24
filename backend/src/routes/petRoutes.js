const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const validar = require('../middlewares/validar');
const { criarPetValidator, atualizarPetValidator } = require('../validators/petValidator');

// GET /api/pets - Listar pets do usuário
router.get('/', petController.listar);

// GET /api/pets/:id - Obter pet específico
router.get('/:id', petController.obter);

// POST /api/pets - Cadastrar novo pet
router.post('/', criarPetValidator, validar, petController.criar);

// PUT /api/pets/:id - Atualizar pet
router.put('/:id', atualizarPetValidator, validar, petController.atualizar);

// DELETE /api/pets/:id - Remover pet
router.delete('/:id', petController.remover);

module.exports = router;
