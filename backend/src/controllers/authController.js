const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { nome, email, senha, tipo, telefone, endereco } = req.body;

    const resultado = await authService.registrar({
      nome,
      email,
      senha,
      tipo,
      telefone,
      endereco,
    });

    res.status(201).json(resultado);
  } catch (error) {
    if (error.message === 'Email já cadastrado') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const resultado = await authService.login({ email, senha });

    res.json(resultado);
  } catch (error) {
    if (error.message === 'Email ou senha inválidos') {
      return res.status(401).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

async function me(req, res) {
  try {
    const usuario = await authService.obterPerfil(req.usuario.id);

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter perfil' });
  }
}

module.exports = { register, login, me };
