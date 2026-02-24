const prisma = require('../config/database');

async function listar() {
  return await prisma.usuario.findMany({
    where: { tipo: 'CUIDADOR' },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      endereco: true,
      createdAt: true,
      servicos: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
        },
      },
    },
    orderBy: { nome: 'asc' },
  });
}

async function obterPerfil(id) {
  const cuidador = await prisma.usuario.findFirst({
    where: { id, tipo: 'CUIDADOR' },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      endereco: true,
      createdAt: true,
      servicos: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
        },
      },
    },
  });

  if (!cuidador) {
    throw new Error('Cuidador não encontrado');
  }

  return cuidador;
}

async function verAgenda(cuidadorId) {
  // Verifica se o cuidador existe
  const cuidador = await prisma.usuario.findFirst({
    where: { id: cuidadorId, tipo: 'CUIDADOR' },
  });

  if (!cuidador) {
    throw new Error('Cuidador não encontrado');
  }

  return await prisma.agenda.findMany({
    where: {
      cuidadorId,
      disponivel: true,
      data: { gte: new Date() },
    },
    orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
  });
}

module.exports = { listar, obterPerfil, verAgenda };
