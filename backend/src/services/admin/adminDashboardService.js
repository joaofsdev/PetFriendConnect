const prisma = require('../../config/database');

async function obterEstatisticas() {
  const [
    totalUsuarios,
    totalDonos,
    totalCuidadores,
    totalAdmins,
    totalPets,
    totalServicos,
    totalReservas,
    reservasPendentes,
    reservasConfirmadas,
    reservasCanceladas,
    reservasConcluidas,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { tipo: 'DONO' } }),
    prisma.usuario.count({ where: { tipo: 'CUIDADOR' } }),
    prisma.usuario.count({ where: { tipo: 'ADMIN' } }),
    prisma.pet.count(),
    prisma.servico.count(),
    prisma.reserva.count(),
    prisma.reserva.count({ where: { status: 'PENDENTE' } }),
    prisma.reserva.count({ where: { status: 'CONFIRMADA' } }),
    prisma.reserva.count({ where: { status: 'CANCELADA' } }),
    prisma.reserva.count({ where: { status: 'CONCLUIDA' } }),
  ]);

  // Últimos 5 usuários cadastrados
  const ultimosUsuarios = await prisma.usuario.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      createdAt: true,
    },
  });

  // Últimas 5 reservas
  const ultimasReservas = await prisma.reserva.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      dono: { select: { id: true, nome: true } },
      cuidador: { select: { id: true, nome: true } },
      pet: { select: { id: true, nome: true } },
      servico: { select: { id: true, nome: true } },
    },
  });

  return {
    usuarios: {
      total: totalUsuarios,
      donos: totalDonos,
      cuidadores: totalCuidadores,
      admins: totalAdmins,
    },
    pets: {
      total: totalPets,
    },
    servicos: {
      total: totalServicos,
    },
    reservas: {
      total: totalReservas,
      pendentes: reservasPendentes,
      confirmadas: reservasConfirmadas,
      canceladas: reservasCanceladas,
      concluidas: reservasConcluidas,
    },
    recentes: {
      usuarios: ultimosUsuarios,
      reservas: ultimasReservas,
    },
  };
}

module.exports = { obterEstatisticas };
