const adminConfiguracaoService = require('../../services/admin/adminConfiguracaoService');

async function listar(req, res) {
  try {
    const configuracoes = await adminConfiguracaoService.listar();
    res.json(configuracoes);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ error: 'Erro ao listar configurações' });
  }
}

async function atualizar(req, res) {
  try {
    const config = await adminConfiguracaoService.atualizar(req.params.chave, req.body.valor);
    res.json(config);
  } catch (error) {
    if (error.message === 'Configuração não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Erro ao atualizar configuração:', error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
}

module.exports = { listar, atualizar };
