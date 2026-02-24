const adminLogService = require('../../services/admin/adminLogService');

async function listar(req, res) {
  try {
    const { pagina, limite, tipo, busca } = req.query;
    const resultado = await adminLogService.listar({
      pagina: pagina ? parseInt(pagina) : 1,
      limite: limite ? parseInt(limite) : 20,
      tipo,
      busca,
    });
    res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar logs:', error);
    res.status(500).json({ error: 'Erro ao listar logs' });
  }
}

async function obterPorId(req, res) {
  try {
    const log = await adminLogService.obterPorId(parseInt(req.params.id));
    res.json(log);
  } catch (error) {
    if (error.message === 'Log não encontrado') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Erro ao obter log:', error);
    res.status(500).json({ error: 'Erro ao obter log' });
  }
}

module.exports = { listar, obterPorId };
