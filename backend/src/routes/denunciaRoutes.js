const express = require('express');
const router = express.Router();
const denunciaController = require('../controllers/denunciaController');
const { criarDenunciaValidator } = require('../validators/admin/adminDenunciaValidator');
const validar = require('../middlewares/validar');

// POST /api/denuncias - Criar denúncia (qualquer usuário autenticado)
router.post('/', criarDenunciaValidator, validar, denunciaController.criar);

// GET /api/denuncias/minhas - Listar minhas denúncias
router.get('/minhas', denunciaController.minhasDenuncias);

module.exports = router;
