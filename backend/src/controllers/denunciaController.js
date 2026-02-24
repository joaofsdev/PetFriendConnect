const adminDenunciaService = require('../services/admin/adminDenunciaService');

async function criar(req, res) {
  try {
    const denuncia = await adminDenunciaService.criar({
      autorId: req.usuario.id,
      alvoId: parseInt(req.body.alvoId),
      motivo: req.body.motivo,
      descricao: req.body.descricao,
    });
    res.status(201).json(denuncia);
  } catch (error) {
    if (error.message === 'Usuário denunciado não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Não é possível denunciar a si mesmo') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Erro ao criar denúncia:', error);
    res.status(500).json({ error: 'Erro ao criar denúncia' });
  }
}

async function minhasDenuncias(req, res) {
  try {
    const { pagina, limite } = req.query;
    const resultado = await adminDenunciaService.listar({
      pagina: pagina ? parseInt(pagina) : 1,
      limite: limite ? parseInt(limite) : 10,
    });

    // Filtrar apenas denúncias do usuário logado
    const minhas = resultado.denuncias.filter(d => d.autorId === req.usuario.id);
    res.json({ denuncias: minhas });
  } catch (error) {
    console.error('Erro ao listar denúncias:', error);
    res.status(500).json({ error: 'Erro ao listar denúncias' });
  }
}

module.exports = { criar, minhasDenuncias };
