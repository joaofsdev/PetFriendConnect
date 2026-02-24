const prisma = require('../../config/database');

async function listar({ pagina = 1, limite = 10, status, busca }) {
  const where = {};

  if (status) where.status = status;
  if (busca) {
    where.OR = [
      { motivo: { contains: busca } },
      { descricao: { contains: busca } },
      { autor: { nome: { contains: busca } } },
      { alvo: { nome: { contains: busca } } },
    ];
  }

  const [denuncias, total] = await Promise.all([
    prisma.denuncia.findMany({
      where,
      include: {
        autor: { select: { id: true, nome: true, email: true, tipo: true } },
        alvo: { select: { id: true, nome: true, email: true, tipo: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.denuncia.count({ where }),
  ]);

  return {
    denuncias,
    paginacao: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

async function obterPorId(id) {
  const denuncia = await prisma.denuncia.findUnique({
    where: { id },
    include: {
      autor: {
        select: { id: true, nome: true, email: true, tipo: true, telefone: true },
      },
      alvo: {
        select: { id: true, nome: true, email: true, tipo: true, telefone: true, ativo: true },
      },
    },
  });

  if (!denuncia) {
    throw new Error('Denúncia não encontrada');
  }

  return denuncia;
}

async function atualizarStatus(id, status) {
  const denuncia = await prisma.denuncia.findUnique({ where: { id } });

  if (!denuncia) {
    throw new Error('Denúncia não encontrada');
  }

  if (denuncia.status === 'RESOLVIDA' || denuncia.status === 'REJEITADA') {
    throw new Error('Denúncia já foi finalizada');
  }

  const atualizada = await prisma.denuncia.update({
    where: { id },
    data: { status },
    include: {
      autor: { select: { id: true, nome: true } },
      alvo: { select: { id: true, nome: true } },
    },
  });

  return atualizada;
}

async function adicionarParecer(id, parecer) {
  const denuncia = await prisma.denuncia.findUnique({ where: { id } });

  if (!denuncia) {
    throw new Error('Denúncia não encontrada');
  }

  const atualizada = await prisma.denuncia.update({
    where: { id },
    data: { parecer },
    include: {
      autor: { select: { id: true, nome: true } },
      alvo: { select: { id: true, nome: true } },
    },
  });

  return atualizada;
}

async function criar({ autorId, alvoId, motivo, descricao }) {
  // Verificar se o alvo existe
  const alvo = await prisma.usuario.findUnique({ where: { id: alvoId } });
  if (!alvo) {
    throw new Error('Usuário denunciado não encontrado');
  }

  // Não pode denunciar a si mesmo
  if (autorId === alvoId) {
    throw new Error('Não é possível denunciar a si mesmo');
  }

  const denuncia = await prisma.denuncia.create({
    data: { autorId, alvoId, motivo, descricao },
    include: {
      autor: { select: { id: true, nome: true } },
      alvo: { select: { id: true, nome: true } },
    },
  });

  return denuncia;
}

module.exports = { listar, obterPorId, atualizarStatus, adicionarParecer, criar };
