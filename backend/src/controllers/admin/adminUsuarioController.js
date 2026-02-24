const adminUsuarioService = require('../../services/admin/adminUsuarioService');

async function listar(req, res) {
  try {
    const { pagina, limite, tipo, ativo, busca } = req.query;
    const resultado = await adminUsuarioService.listar({
      pagina: pagina ? parseInt(pagina) : 1,
      limite: limite ? parseInt(limite) : 10,
      tipo,
      ativo,
      busca,
    });
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
}

async function obterPorId(req, res) {
  try {
    const usuario = await adminUsuarioService.obterPorId(parseInt(req.params.id));
    res.json(usuario);
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ error: 'Erro ao obter usuário' });
  }
}

async function atualizar(req, res) {
  try {
    const usuario = await adminUsuarioService.atualizar(parseInt(req.params.id), req.body);
    res.json(usuario);
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Email já está em uso') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

async function desativar(req, res) {
  try {
    const usuario = await adminUsuarioService.desativar(parseInt(req.params.id));
    res.json({ message: 'Usuário desativado com sucesso', usuario });
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Usuário já está desativado') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erro ao desativar usuário:', error);
    res.status(500).json({ error: 'Erro ao desativar usuário' });
  }
}

async function ativar(req, res) {
  try {
    const usuario = await adminUsuarioService.ativar(parseInt(req.params.id));
    res.json({ message: 'Usuário reativado com sucesso', usuario });
  } catch (error) {
    if (error.message === 'Usuário não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Usuário já está ativo') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erro ao ativar usuário:', error);
    res.status(500).json({ error: 'Erro ao ativar usuário' });
  }
}

module.exports = { listar, obterPorId, atualizar, desativar, ativar };
