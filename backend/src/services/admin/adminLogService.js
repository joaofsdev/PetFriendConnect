const prisma = require('../../config/database');

async function listar({ pagina = 1, limite = 20, tipo, busca }) {
  const where = {};

  if (tipo) where.tipo = tipo;
  if (busca) {
    where.mensagem = { contains: busca };
  }

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: {
        reserva: {
          select: {
            id: true,
            status: true,
            dono: { select: { id: true, nome: true } },
            cuidador: { select: { id: true, nome: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.log.count({ where }),
  ]);

  return {
    logs,
    paginacao: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

async function obterPorId(id) {
  const log = await prisma.log.findUnique({
    where: { id },
    include: {
      reserva: {
        include: {
          dono: { select: { id: true, nome: true, email: true } },
          cuidador: { select: { id: true, nome: true, email: true } },
          pet: { select: { id: true, nome: true, especie: true } },
          servico: { select: { id: true, nome: true, preco: true } },
        },
      },
    },
  });

  if (!log) {
    throw new Error('Log não encontrado');
  }

  return log;
}

module.exports = { listar, obterPorId };
