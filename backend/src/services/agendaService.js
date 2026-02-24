const prisma = require('../config/database');

async function criar({ cuidadorId, data, horaInicio, horaFim, disponivel }) {
  // Cria um novo horário na agenda
  return await prisma.agenda.create({
    data: {
      cuidadorId,
      data: new Date(data),
      horaInicio,
      horaFim,
      disponivel,
    },
  });
}

async function verificarConflito({ cuidadorId, data, horaInicio, horaFim }) {
  // Busca horários do cuidador na mesma data
  const horarios = await prisma.agenda.findMany({
    where: {
      cuidadorId,
      data: new Date(data),
    },
  });
  // Verifica se algum horário cadastrado conflita
  for (const h of horarios) {
    if (
      (horaInicio < h.horaFim && horaFim > h.horaInicio)
    ) {
      return true;
    }
  }
  return false;
}

module.exports = { criar, verificarConflito };
