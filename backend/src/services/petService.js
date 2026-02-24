const prisma = require('../config/database');

async function listar(donoId) {
  return await prisma.pet.findMany({
    where: { donoId },
    orderBy: { createdAt: 'desc' },
  });
}

async function obter(id, donoId) {
  const pet = await prisma.pet.findFirst({
    where: { id, donoId },
  });

  if (!pet) {
    throw new Error('Pet não encontrado');
  }

  return pet;
}

async function criar({ nome, especie, raca, idade, observacoes, donoId }) {
  return await prisma.pet.create({
    data: {
      nome,
      especie,
      raca,
      idade,
      observacoes,
      donoId,
    },
  });
}

async function atualizar(id, donoId, dados) {
  // Verifica se o pet pertence ao dono
  const pet = await prisma.pet.findFirst({
    where: { id, donoId },
  });

  if (!pet) {
    throw new Error('Pet não encontrado');
  }

  return await prisma.pet.update({
    where: { id },
    data: {
      nome: dados.nome,
      especie: dados.especie,
      raca: dados.raca,
      idade: dados.idade,
      observacoes: dados.observacoes,
    },
  });
}

async function remover(id, donoId) {
  const pet = await prisma.pet.findFirst({
    where: { id, donoId },
  });

  if (!pet) {
    throw new Error('Pet não encontrado');
  }

  return await prisma.pet.delete({
    where: { id },
  });
}

module.exports = { listar, obter, criar, atualizar, remover };
