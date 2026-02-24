const cuidadorService = require('../services/cuidadorService');

async function listar(req, res) {
  try {
    const cuidadores = await cuidadorService.listar();
    res.json(cuidadores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar cuidadores' });
  }
}

async function obterPerfil(req, res) {
  try {
    const cuidador = await cuidadorService.obterPerfil(Number(req.params.id));
    res.json(cuidador);
  } catch (error) {
    if (error.message === 'Cuidador não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao obter perfil do cuidador' });
  }
}

async function verAgenda(req, res) {
  try {
    const agenda = await cuidadorService.verAgenda(Number(req.params.id));
    res.json(agenda);
  } catch (error) {
    if (error.message === 'Cuidador não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao obter agenda do cuidador' });
  }
}

module.exports = { listar, obterPerfil, verAgenda };
