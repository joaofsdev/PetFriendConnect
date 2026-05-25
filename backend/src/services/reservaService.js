const { PrismaClient, Prisma, StatusReserva } = require("@prisma/client");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  ConflictError,
} = require("../utils/errors.js");

const prisma = new PrismaClient();

const MAX_RETRY = 3;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toPositiveInt = (value, fieldName) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} inválido`);
  }

  return parsed;
};

const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + Number(minutes));
  return result;
};

const mapReserva = (reserva) => {
  const dataInicio = reserva.agenda?.data || reserva.dataInicio || null;
  const duracao = reserva.servico?.duracao || 0;
  const dataFim = dataInicio
    ? addMinutes(dataInicio, duracao)
    : reserva.dataFim || null;

  return {
    id: reserva.id,
    agendaId: reserva.agendaId,
    donoId: reserva.donoId,
    cuidadorId: reserva.cuidadorId,
    petId: reserva.petId,
    servicoId: reserva.servicoId,
    status: reserva.status,
    dataInicio,
    dataFim,
    dataReserva: reserva.dataReserva,
    dataAtualizacao: reserva.dataAtualizacao,
    agenda: reserva.agenda
      ? {
          id: reserva.agenda.id,
          data: reserva.agenda.data,
          disponivel: reserva.agenda.disponivel,
          reservaId: reserva.agenda.reservaId || null,
        }
      : null,
    pet: reserva.pet || null,
    servico: reserva.servico || null,
    dono: reserva.dono || null,
    cuidador: reserva.cuidador || null,
    logs: reserva.logs || [],
  };
};

class ReservaService {
  static async executarTransacao(fn) {
    let ultimoErro = null;

    for (let tentativa = 1; tentativa <= MAX_RETRY; tentativa += 1) {
      try {
        return await prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (erro) {
        ultimoErro = erro;

        if (erro.code === "P2034" && tentativa < MAX_RETRY) {
          await wait(50 * tentativa);
          continue;
        }

        throw erro;
      }
    }

    throw ultimoErro;
  }

  static async listarReservas(usuarioId, tipoUsuario) {
    const where = {};

    if (tipoUsuario === "DONO") {
      where.donoId = usuarioId;
    } else if (tipoUsuario === "CUIDADOR") {
      where.cuidadorId = usuarioId;
    }

    const reservas = await prisma.reserva.findMany({
      where,
      include: {
        agenda: {
          select: {
            id: true,
            data: true,
            disponivel: true,
            reservaId: true,
          },
        },
        pet: {
          select: {
            id: true,
            nome: true,
            raca: true,
            idade: true,
            fotoPet: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao: true,
          },
        },
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        cuidador: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            fotoPerfil: true,
          },
        },
      },
      orderBy: {
        dataAtualizacao: "desc",
      },
    });

    return reservas.map(mapReserva);
  }

  static async obterReservaPorId(reservaId, usuario) {
    const id = toPositiveInt(reservaId, "ID da reserva");

    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        agenda: {
          select: {
            id: true,
            data: true,
            disponivel: true,
            reservaId: true,
          },
        },
        pet: {
          select: {
            id: true,
            nome: true,
            raca: true,
            idade: true,
            fotoPet: true,
            descricao: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            preco: true,
            duracao: true,
          },
        },
        dono: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        cuidador: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            fotoPerfil: true,
          },
        },
        logs: {
          orderBy: {
            dataLog: "desc",
          },
          select: {
            id: true,
            usuarioId: true,
            acao: true,
            descricao: true,
            dataLog: true,
          },
        },
      },
    });

    if (!reserva) {
      throw new NotFoundError("Reserva não encontrada");
    }

    if (
      usuario.tipo !== "ADMIN" &&
      reserva.donoId !== usuario.id &&
      reserva.cuidadorId !== usuario.id
    ) {
      throw new ForbiddenError(
        "Você não tem permissão para acessar esta reserva",
      );
    }

    return mapReserva(reserva);
  }

  static async criarReserva(dados, donoId) {
    const cuidadorId = toPositiveInt(dados.cuidadorId, "ID do cuidador");
    const petId = toPositiveInt(dados.petId, "ID do pet");
    const servicoId = toPositiveInt(dados.servicoId, "ID do serviço");
    const agendaId = toPositiveInt(dados.agendaId, "ID da agenda");
    const donoIdNumero = toPositiveInt(donoId, "ID do usuário logado");

    return this.executarTransacao(async (tx) => {
      const pet = await tx.pet.findFirst({
        where: {
          id: petId,
          donoId: donoIdNumero,
        },
        select: {
          id: true,
          nome: true,
          raca: true,
          idade: true,
          fotoPet: true,
        },
      });

      if (!pet) {
        throw new ForbiddenError(
          "O pet informado não pertence ao usuário logado",
        );
      }

      const servico = await tx.servico.findFirst({
        where: {
          id: servicoId,
          cuidadorId,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          descricao: true,
          preco: true,
          duracao: true,
          cuidadorId: true,
        },
      });

      if (!servico) {
        throw new NotFoundError("Serviço não encontrado para este cuidador");
      }

      const agenda = await tx.agenda.findFirst({
        where: {
          id: agendaId,
          cuidadorId,
          servicoId,
          disponivel: true,
        },
        select: {
          id: true,
          data: true,
          disponivel: true,
          reservaId: true,
        },
      });

      if (!agenda) {
        throw new ConflictError("Horário não disponível");
      }

      const reserva = await tx.reserva.create({
        data: {
          donoId: donoIdNumero,
          cuidadorId,
          petId,
          servicoId,
          agendaId,
          status: StatusReserva.CONFIRMADA,
        },
        include: {
          pet: {
            select: {
              id: true,
              nome: true,
              raca: true,
              idade: true,
              fotoPet: true,
            },
          },
          servico: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              preco: true,
              duracao: true,
            },
          },
          dono: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },
          cuidador: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              fotoPerfil: true,
            },
          },
        },
      });

      const agendaAtualizada = await tx.agenda.updateMany({
        where: {
          id: agenda.id,
          disponivel: true,
        },
        data: {
          disponivel: false,
          reservaId: reserva.id,
        },
      });

      if (agendaAtualizada.count === 0) {
        throw new ConflictError("Horário não disponível");
      }

      await tx.log.create({
        data: {
          usuarioId: donoIdNumero,
          acao: "RESERVA_CONFIRMADA",
          descricao: `Reserva #${reserva.id} confirmada`,
        },
      });

      return mapReserva({
        ...reserva,
        agenda: {
          ...agenda,
          disponivel: false,
          reservaId: reserva.id,
        },
      });
    });
  }

  static async cancelarReserva(reservaId, usuarioId) {
    const id = toPositiveInt(reservaId, "ID da reserva");
    const donoId = toPositiveInt(usuarioId, "ID do usuário logado");

    return this.executarTransacao(async (tx) => {
      const reserva = await tx.reserva.findUnique({
        where: { id },
        include: {
          agenda: {
            select: {
              id: true,
              data: true,
              disponivel: true,
              reservaId: true,
            },
          },
          servico: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              preco: true,
              duracao: true,
            },
          },
          pet: {
            select: {
              id: true,
              nome: true,
              raca: true,
              idade: true,
              fotoPet: true,
            },
          },
          dono: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },
          cuidador: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              fotoPerfil: true,
            },
          },
        },
      });

      if (!reserva) {
        throw new NotFoundError("Reserva não encontrada");
      }

      if (reserva.donoId !== donoId) {
        throw new ForbiddenError("Apenas o dono da reserva pode cancelá-la");
      }

      if (reserva.status === StatusReserva.CANCELADA) {
        throw new ConflictError("Reserva já está cancelada");
      }

      if (reserva.status === StatusReserva.CONCLUIDA) {
        throw new ConflictError(
          "Não é possível cancelar uma reserva concluída",
        );
      }

      const reservaAtualizada = await tx.reserva.update({
        where: { id },
        data: {
          status: StatusReserva.CANCELADA,
        },
        include: {
          pet: {
            select: {
              id: true,
              nome: true,
              raca: true,
              idade: true,
              fotoPet: true,
            },
          },
          servico: {
            select: {
              id: true,
              nome: true,
              descricao: true,
              preco: true,
              duracao: true,
            },
          },
          dono: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },
          cuidador: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              fotoPerfil: true,
            },
          },
        },
      });

      await tx.agenda.update({
        where: {
          id: reserva.agendaId,
        },
        data: {
          disponivel: true,
          reservaId: null,
        },
      });

      await tx.log.create({
        data: {
          usuarioId: donoId,
          acao: "RESERVA_CANCELADA",
          descricao: `Reserva #${reservaAtualizada.id} cancelada`,
        },
      });

      return mapReserva({
        ...reservaAtualizada,
        agenda: {
          ...reserva.agenda,
          disponivel: true,
          reservaId: null,
        },
      });
    });
  }
}

module.exports = ReservaService;
