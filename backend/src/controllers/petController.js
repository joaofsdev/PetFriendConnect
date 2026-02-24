const petService = require('../services/petService');

async function listar(req, res) {
  try {
    const pets = await petService.listar(req.usuario.id);
    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar pets' });
  }
}

async function obter(req, res) {
  try {
    const pet = await petService.obter(Number(req.params.id), req.usuario.id);
    res.json(pet);
  } catch (error) {
    if (error.message === 'Pet não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao obter pet' });
  }
}

async function criar(req, res) {
  try {
    const { nome, especie, raca, idade, observacoes } = req.body;

    const pet = await petService.criar({
      nome,
      especie,
      raca,
      idade,
      observacoes,
      donoId: req.usuario.id,
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao cadastrar pet' });
  }
}

async function atualizar(req, res) {
  try {
    const pet = await petService.atualizar(
      Number(req.params.id),
      req.usuario.id,
      req.body
    );
    res.json(pet);
  } catch (error) {
    if (error.message === 'Pet não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao atualizar pet' });
  }
}

async function remover(req, res) {
  try {
    await petService.remover(Number(req.params.id), req.usuario.id);
    res.json({ message: 'Pet removido com sucesso' });
  } catch (error) {
    if (error.message === 'Pet não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao remover pet' });
  }
}

module.exports = { listar, obter, criar, atualizar, remover };
