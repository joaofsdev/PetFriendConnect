const { PrismaClient } = require("@prisma/client");
const {
  NotFoundError,
  ValidationError,
  ForbiddenError,
} = require("../utils/errors.js");

const prisma = new PrismaClient();

class CuidadorService {
  // Listar todos os cuidadores com seus serviços básicos
  static async listarCuidadores() {
    const cuidadores = await prisma.usuario.findMany({
      where: { tipo: "CUIDADOR", ativo: true },
      select: {
        id: true,
        nome: true,
        telefone: true,
        endereco: true,
        descricao: true,
        fotoPerfil: true,
        dataCriacao: true,
        servicosCriados: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            descricao: true,
            preco: true,
            duracao: true,
          },
        },
      },
    });

    return cuidadores;
  }

  // Obter perfil completo de um cuidador
  static async obterPerfilCuidador(cuidadorId) {
    const cuidador = await prisma.usuario.findUnique({
      where: { id: cuidadorId, tipo: "CUIDADOR" },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        endereco: true,
        descricao: true,
        fotoPerfil: true,
        dataCriacao: true,
        dataAtualizacao: true,
        servicosCriados: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            descricao: true,
            preco: true,
            duracao: true,
            dataCriacao: true,
          },
        },
      },
    });

    if (!cuidador) {
      throw new NotFoundError("Cuidador não encontrado");
    }

    return cuidador;
  }

  // Obter agenda disponível de um cuidador (próximos dias)
  static async obterAgendaCuidador(cuidadorId, dias = 30) {
    const hoje = new Date();
    const dataFuturo = new Date();
    dataFuturo.setDate(dataFuturo.getDate() + dias);

    // Verificar se cuidador existe
    await prisma.usuario.findUniqueOrThrow({
      where: { id: cuidadorId, tipo: "CUIDADOR" },
    });

    const agenda = await prisma.agenda.findMany({
      where: {
        cuidadorId,
        data: {
          gte: hoje,
          lte: dataFuturo,
        },
        disponivel: true,
      },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao: true,
          },
        },
      },
      orderBy: { data: "asc" },
    });

    return agenda;
  }

  // Listar agenda completa do cuidador logado (todos os slots)
  static async listarMinhaAgenda(cuidadorId) {
    const agenda = await prisma.agenda.findMany({
      where: { cuidadorId },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao: true,
          },
        },
      },
      orderBy: { data: "asc" },
    });

    return agenda;
  }

  // Criar serviço para o cuidador
  static async criarServico(cuidadorId, dados) {
    const { nome, descricao, preco, duracao } = dados;

    // Validar dados
    if (!nome || nome.trim().length === 0) {
      throw new ValidationError("Nome do serviço é obrigatório");
    }

    if (!preco || preco <= 0) {
      throw new ValidationError("Preço deve ser maior que zero");
    }

    if (!duracao || duracao <= 0) {
      throw new ValidationError("Duração deve ser maior que zero (em minutos)");
    }

    // Verificar se cuidador existe
    const cuidador = await prisma.usuario.findUnique({
      where: { id: cuidadorId, tipo: "CUIDADOR" },
    });

    if (!cuidador) {
      throw new NotFoundError("Cuidador não encontrado");
    }

    const servico = await prisma.servico.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        preco: parseFloat(preco),
        duracao: parseInt(duracao),
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
        dataCriacao: true,
      },
    });

    return servico;
  }

  // Editar serviço (apenas o próprio cuidador)
  static async editarServico(servicoId, cuidadorId, dados) {
    const { nome, descricao, preco, duracao, ativo } = dados;

    // Verificar se serviço pertence ao cuidador
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico) {
      throw new NotFoundError("Serviço não encontrado");
    }

    if (servico.cuidadorId !== cuidadorId) {
      throw new ForbiddenError(
        "Você não tem permissão para editar este serviço",
      );
    }

    // Validar dados se informados
    if (nome !== undefined && (!nome || nome.trim().length === 0)) {
      throw new ValidationError("Nome do serviço é obrigatório");
    }

    if (preco !== undefined && preco <= 0) {
      throw new ValidationError("Preço deve ser maior que zero");
    }

    if (duracao !== undefined && duracao <= 0) {
      throw new ValidationError("Duração deve ser maior que zero (em minutos)");
    }

    const servicoAtualizado = await prisma.servico.update({
      where: { id: servicoId },
      data: {
        ...(nome && { nome: nome.trim() }),
        ...(descricao !== undefined && {
          descricao: descricao?.trim() || null,
        }),
        ...(preco && { preco: parseFloat(preco) }),
        ...(duracao && { duracao: parseInt(duracao) }),
        ...(ativo !== undefined && { ativo }),
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        preco: true,
        duracao: true,
        ativo: true,
        dataCriacao: true,
        dataAtualizacao: true,
      },
    });

    return servicoAtualizado;
  }

  // Adicionar slot de disponibilidade
  static async adicionarSlot(cuidadorId, dados) {
    const { servicoId, data } = dados;

    // Validar dados
    if (!servicoId) {
      throw new ValidationError("ID do serviço é obrigatório");
    }

    if (!data) {
      throw new ValidationError("Data é obrigatória");
    }

    const dataSlot = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSlot < hoje) {
      throw new ValidationError("Não é possível adicionar slots no passado");
    }

    // Verificar se serviço pertence ao cuidador
    const servico = await prisma.servico.findUnique({
      where: { id: servicoId },
    });

    if (!servico || servico.cuidadorId !== cuidadorId) {
      throw new ForbiddenError("Você não tem permissão para usar este serviço");
    }

    // Verificar se já existe slot nesta data
    const slotExistente = await prisma.agenda.findFirst({
      where: {
        cuidadorId,
        servicoId,
        data: dataSlot,
      },
    });

    if (slotExistente) {
      throw new ValidationError(
        "Já existe um slot para este serviço nesta data",
      );
    }

    const slot = await prisma.agenda.create({
      data: {
        cuidadorId,
        servicoId,
        data: dataSlot,
        disponivel: true,
      },
      include: {
        servico: {
          select: {
            id: true,
            nome: true,
            preco: true,
            duracao: true,
          },
        },
      },
    });

    return slot;
  }

  // Deletar slot (apenas se não reservado)
  static async deletarSlot(slotId, cuidadorId) {
    const slot = await prisma.agenda.findUnique({
      where: { id: slotId },
      include: { reservas: true },
    });

    if (!slot) {
      throw new NotFoundError("Slot não encontrado");
    }

    if (slot.cuidadorId !== cuidadorId) {
      throw new ForbiddenError("Você não tem permissão para deletar este slot");
    }

    if (slot.reservas.length > 0) {
      throw new ValidationError(
        "Não é possível deletar um slot que possui reservas",
      );
    }

    await prisma.agenda.delete({
      where: { id: slotId },
    });

    return { mensagem: "Slot deletado com sucesso" };
  }
}

module.exports = CuidadorService;
