const prisma = require('../config/database');

async function listar(usuarioId, tipoUsuario) {
  const where = tipoUsuario === 'CUIDADOR'
    ? { cuidadorId: usuarioId }
    : { donoId: usuarioId };

  return await prisma.reserva.findMany({
    where,
    include: {
      pet: { select: { id: true, nome: true, especie: true } },
      dono: { select: { id: true, nome: true, email: true } },
      cuidador: { select: { id: true, nome: true, email: true } },
      servico: { select: { id: true, nome: true, preco: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function obter(id, usuarioId) {
  const reserva = await prisma.reserva.findFirst({
    where: {
      id,
      OR: [{ donoId: usuarioId }, { cuidadorId: usuarioId }],
    },
    include: {
      pet: true,
      dono: { select: { id: true, nome: true, email: true, telefone: true } },
      cuidador: { select: { id: true, nome: true, email: true, telefone: true } },
      servico: true,
      agenda: true,
      logs: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!reserva) {
    throw new Error('Reserva não encontrada');
  }

  return reserva;
}

async function criar({ donoId, cuidadorId, petId, servicoId, dataInicio, dataFim }) {
  // Valida que o pet pertence ao dono
  const pet = await prisma.pet.findFirst({
    where: { id: petId, donoId },
  });

  if (!pet) {
    throw new Error('Pet não encontrado');
  }

  // Valida que o cuidador existe
  const cuidador = await prisma.usuario.findFirst({
    where: { id: cuidadorId, tipo: 'CUIDADOR' },
  });

  if (!cuidador) {
    throw new Error('Cuidador não encontrado');
  }

  // Valida que o serviço pertence ao cuidador
  const servico = await prisma.servico.findFirst({
    where: { id: servicoId, cuidadorId },
  });

  if (!servico) {
    throw new Error('Serviço não encontrado');
  }

  // TRANSAÇÃO ATÔMICA
  return await prisma.$transaction(async (tx) => {
    // 1. Verifica disponibilidade na agenda (com lock implícito da transação)
    // Extrai apenas a data (sem hora) para comparar com campo @db.Date
    const dataAgenda = new Date(dataInicio);
    dataAgenda.setUTCHours(0, 0, 0, 0);

    const agenda = await tx.agenda.findFirst({
      where: {
        cuidadorId,
        data: dataAgenda,
        disponivel: true,
      },
    });

    if (!agenda) {
      throw new Error('Horário não disponível');
    }

    // 2. Cria a reserva
    const reserva = await tx.reserva.create({
      data: {
        donoId,
        cuidadorId,
        petId,
        servicoId,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        status: 'CONFIRMADA',
      },
    });

    // 3. Bloqueia o horário na agenda
    await tx.agenda.update({
      where: { id: agenda.id },
      data: {
        disponivel: false,
        reservaId: reserva.id,
      },
    });

    // 4. Registra log de confirmação
    await tx.log.create({
      data: {
        tipo: 'RESERVA_CONFIRMADA',
        reservaId: reserva.id,
        mensagem: `Reserva #${reserva.id} confirmada - Dono: ${donoId}, Cuidador: ${cuidadorId}, Pet: ${petId}`,
      },
    });

    return reserva;
  });
}

async function cancelar(id, usuarioId) {
  const reserva = await prisma.reserva.findFirst({
    where: {
      id,
      OR: [{ donoId: usuarioId }, { cuidadorId: usuarioId }],
    },
  });

  if (!reserva) {
    throw new Error('Reserva não encontrada');
  }

  if (reserva.status === 'CANCELADA') {
    throw new Error('Reserva já está cancelada');
  }

  if (reserva.status === 'CONCLUIDA') {
    throw new Error('Não é possível cancelar uma reserva concluída');
  }

  // TRANSAÇÃO ATÔMICA para cancelar
  return await prisma.$transaction(async (tx) => {
    // 1. Atualiza status da reserva
    const reservaAtualizada = await tx.reserva.update({
      where: { id },
      data: { status: 'CANCELADA' },
    });

    // 2. Libera o horário na agenda
    await tx.agenda.updateMany({
      where: { reservaId: id },
      data: {
        disponivel: true,
        reservaId: null,
      },
    });

    // 3. Registra log
    await tx.log.create({
      data: {
        tipo: 'RESERVA_CANCELADA',
        reservaId: id,
        mensagem: `Reserva #${id} cancelada pelo usuário ${usuarioId}`,
      },
    });

    return reservaAtualizada;
  });
}

module.exports = { listar, obter, criar, cancelar };
