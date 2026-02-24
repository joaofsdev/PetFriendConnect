const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validar = require('../middlewares/validar');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// POST /api/auth/register - Cadastrar usuário
router.post('/register', registerValidator, validar, authController.register);

// POST /api/auth/login - Fazer login
router.post('/login', loginValidator, validar, authController.login);

// GET /api/auth/me - Obter usuário logado (requer autenticação)
router.get('/me', auth, authController.me);

module.exports = router;
