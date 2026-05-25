const { PrismaClient } = require("@prisma/client");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require("../utils/errors.js");

const prisma = new PrismaClient();

const toPositiveInt = (value, fieldName) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} inválido`);
  }

  return parsed;
};

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const mapPet = (pet) => ({
  id: pet.id,
  nome: pet.nome,
  especie: pet.raca,
  raca: pet.raca,
  idade: pet.idade,
  observacoes: pet.descricao,
  donoId: pet.donoId,
  createdAt: pet.dataCriacao,
  updatedAt: pet.dataAtualizacao,
  dataCriacao: pet.dataCriacao,
  dataAtualizacao: pet.dataAtualizacao,
  dono: pet.dono || null,
});

class PetService {
  static async listarPets(donoId) {
    const pets = await prisma.pet.findMany({
      where: { donoId: toPositiveInt(donoId, "ID do usuário logado") },
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: { dataCriacao: "desc" },
    });

    return pets.map(mapPet);
  }

  static async obterPetPorId(petId, donoId) {
    const id = toPositiveInt(petId, "ID do pet");
    const donoIdNumero = toPositiveInt(donoId, "ID do usuário logado");

    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!pet) {
      throw new NotFoundError("Pet não encontrado");
    }

    if (pet.donoId !== donoIdNumero) {
      throw new ForbiddenError("Você não tem permissão para acessar este pet");
    }

    return mapPet(pet);
  }

  static async criarPet(dados, donoId) {
    const donoIdNumero = toPositiveInt(donoId, "ID do usuário logado");
    const nome = normalizeString(dados.nome);
    const especie =
      normalizeString(dados.especie) || normalizeString(dados.raca);
    const observacoes =
      normalizeString(dados.observacoes) || normalizeString(dados.descricao);
    const idade = dados.idade;

    if (!nome) {
      throw new ValidationError("Nome é obrigatório");
    }

    if (!especie) {
      throw new ValidationError("Espécie é obrigatória");
    }

    if (idade !== undefined && idade !== null && idade !== "") {
      const idadeNumero = Number.parseInt(idade, 10);
      if (!Number.isInteger(idadeNumero) || idadeNumero < 0) {
        throw new ValidationError("Idade deve ser um número inteiro válido");
      }
    }

    const pet = await prisma.pet.create({
      data: {
        nome,
        raca: especie,
        idade:
          idade !== undefined && idade !== null && idade !== ""
            ? Number.parseInt(idade, 10)
            : null,
        descricao: observacoes,
        donoId: donoIdNumero,
      },
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return mapPet(pet);
  }

  static async atualizarPet(petId, donoId, dados) {
    const id = toPositiveInt(petId, "ID do pet");
    const donoIdNumero = toPositiveInt(donoId, "ID do usuário logado");

    const pet = await prisma.pet.findUnique({ where: { id } });

    if (!pet) {
      throw new NotFoundError("Pet não encontrado");
    }

    if (pet.donoId !== donoIdNumero) {
      throw new ForbiddenError("Você não tem permissão para editar este pet");
    }

    const atualizacao = {};

    if (dados.nome !== undefined) {
      const nome = normalizeString(dados.nome);
      if (!nome) {
        throw new ValidationError("Nome é obrigatório");
      }
      atualizacao.nome = nome;
    }

    if (dados.especie !== undefined || dados.raca !== undefined) {
      const especie =
        normalizeString(dados.especie) || normalizeString(dados.raca);
      if (!especie) {
        throw new ValidationError("Espécie é obrigatória");
      }
      atualizacao.raca = especie;
    }

    if (dados.idade !== undefined) {
      if (dados.idade === null || dados.idade === "") {
        atualizacao.idade = null;
      } else {
        const idadeNumero = Number.parseInt(dados.idade, 10);
        if (!Number.isInteger(idadeNumero) || idadeNumero < 0) {
          throw new ValidationError("Idade deve ser um número inteiro válido");
        }
        atualizacao.idade = idadeNumero;
      }
    }

    if (dados.observacoes !== undefined || dados.descricao !== undefined) {
      const observacoes =
        normalizeString(dados.observacoes) || normalizeString(dados.descricao);
      atualizacao.descricao = observacoes;
    }

    if (Object.keys(atualizacao).length === 0) {
      throw new ValidationError(
        "Nenhum dado válido foi informado para atualização",
      );
    }

    const petAtualizado = await prisma.pet.update({
      where: { id },
      data: atualizacao,
      include: {
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return mapPet(petAtualizado);
  }

  static async removerPet(petId, donoId) {
    const id = toPositiveInt(petId, "ID do pet");
    const donoIdNumero = toPositiveInt(donoId, "ID do usuário logado");

    const pet = await prisma.pet.findUnique({ where: { id } });

    if (!pet) {
      throw new NotFoundError("Pet não encontrado");
    }

    if (pet.donoId !== donoIdNumero) {
      throw new ForbiddenError("Você não tem permissão para excluir este pet");
    }

    await prisma.pet.delete({ where: { id } });

    return null;
  }
}

module.exports = PetService;
