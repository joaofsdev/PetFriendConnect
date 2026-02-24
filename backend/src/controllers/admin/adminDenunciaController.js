const adminDenunciaService = require('../../services/admin/adminDenunciaService');

async function listar(req, res) {
  try {
    const { pagina, limite, status, busca } = req.query;
    const resultado = await adminDenunciaService.listar({
      pagina: pagina ? parseInt(pagina) : 1,
      limite: limite ? parseInt(limite) : 10,
      status,
      busca,
    });
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar denúncias:', error);
    res.status(500).json({ error: 'Erro ao listar denúncias' });
  }
}

async function obterPorId(req, res) {
  try {
    const denuncia = await adminDenunciaService.obterPorId(parseInt(req.params.id));
    res.json(denuncia);
  } catch (error) {
    if (error.message === 'Denúncia não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Erro ao obter denúncia:', error);
    res.status(500).json({ error: 'Erro ao obter denúncia' });
  }
}

async function atualizarStatus(req, res) {
  try {
    const denuncia = await adminDenunciaService.atualizarStatus(
      parseInt(req.params.id),
      req.body.status
    );
    res.json(denuncia);
  } catch (error) {
    if (error.message === 'Denúncia não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Denúncia já foi finalizada') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erro ao atualizar denúncia:', error);
    res.status(500).json({ error: 'Erro ao atualizar status da denúncia' });
  }
}

async function adicionarParecer(req, res) {
  try {
    const denuncia = await adminDenunciaService.adicionarParecer(
      parseInt(req.params.id),
      req.body.parecer
    );
    res.json(denuncia);
  } catch (error) {
    if (error.message === 'Denúncia não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Erro ao adicionar parecer:', error);
    res.status(500).json({ error: 'Erro ao adicionar parecer' });
  }
}

module.exports = { listar, obterPorId, atualizarStatus, adicionarParecer };
