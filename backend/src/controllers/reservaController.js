const reservaService = require('../services/reservaService');

async function listar(req, res) {
  try {
    const reservas = await reservaService.listar(req.usuario.id, req.usuario.tipo);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
}

async function obter(req, res) {
  try {
    const reserva = await reservaService.obter(Number(req.params.id), req.usuario.id);
    res.json(reserva);
  } catch (error) {
    if (error.message === 'Reserva não encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao obter reserva' });
  }
}

async function criar(req, res) {
  try {
    const { cuidadorId, petId, servicoId, dataInicio, dataFim } = req.body;

    const reserva = await reservaService.criar({
      donoId: req.usuario.id,
      cuidadorId,
      petId,
      servicoId,
      dataInicio,
      dataFim,
    });

    res.status(201).json(reserva);
  } catch (error) {
    const errosConhecidos = [
      'Pet não encontrado',
      'Cuidador não encontrado',
      'Serviço não encontrado',
      'Horário não disponível',
    ];

    if (errosConhecidos.includes(error.message)) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
}

async function cancelar(req, res) {
  try {
    const reserva = await reservaService.cancelar(Number(req.params.id), req.usuario.id);
    res.json({ message: 'Reserva cancelada com sucesso', reserva });
  } catch (error) {
    const errosConhecidos = [
      'Reserva não encontrada',
      'Reserva já está cancelada',
      'Não é possível cancelar uma reserva concluída',
    ];

    if (errosConhecidos.includes(error.message)) {
      const status = error.message === 'Reserva não encontrada' ? 404 : 400;
      return res.status(status).json({ error: error.message });
    }
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
}

module.exports = { listar, obter, criar, cancelar };
