const adminDashboardService = require('../../services/admin/adminDashboardService');

async function dashboard(req, res) {
  try {
    const estatisticas = await adminDashboardService.obterEstatisticas();
    res.json(estatisticas);
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas do dashboard' });
  }
}

module.exports = { dashboard };
