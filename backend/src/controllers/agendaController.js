const agendaService = require('../services/agendaService');

async function criar(req, res) {
  try {
    // Só cuidadores podem cadastrar agenda
    if (req.usuario.tipo !== 'CUIDADOR') {
      return res.status(403).json({ error: 'Apenas cuidadores podem cadastrar horários.' });
    }

    const { data, horaInicio, horaFim, disponivel } = req.body;
    const cuidadorId = req.usuario.id;

    // Verifica conflito de horário
    const conflito = await agendaService.verificarConflito({
      cuidadorId,
      data,
      horaInicio,
      horaFim,
    });
    if (conflito) {
      return res.status(400).json({ error: 'Já existe horário cadastrado nesse período.' });
    }

    const agenda = await agendaService.criar({
      cuidadorId,
      data,
      horaInicio,
      horaFim,
      disponivel: disponivel !== false,
    });
    res.status(201).json(agenda);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agenda' });
  }
}

module.exports = { criar };
