const { PrismaClient } = require("@prisma/client");
const {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = require("../utils/errors.js");

const prisma = new PrismaClient();

const TIPOS_EDITAVEIS = ["DONO", "CUIDADOR"];
const TIPOS_FILTRO = ["DONO", "CUIDADOR", "ADMIN"];
const STATUS_DENUNCIA = ["PENDENTE", "EM_ANALISE", "RESOLVIDA", "REJEITADA"];

const toPositiveInt = (value, fieldName) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ValidationError(`${fieldName} invalido`);
  }

  return parsed;
};

const parsePagination = ({ page = 1, limit = 20 } = {}) => {
  const pageNumber = Number.parseInt(page, 10);
  const limitNumber = Number.parseInt(limit, 10);

  if (!Number.isInteger(pageNumber) || pageNumber <= 0) {
    throw new ValidationError("Pagina invalida");
  }

  if (!Number.isInteger(limitNumber) || limitNumber <= 0 || limitNumber > 100) {
    throw new ValidationError("Limite invalido");
  }

  return {
    page: pageNumber,
    limit: limitNumber,
    skip: (pageNumber - 1) * limitNumber,
  };
};

const normalizeString = (value, fieldName, { required = false } = {}) => {
  if (value === undefined) return undefined;

  if (value === null) {
    if (required) throw new ValidationError(`${fieldName} e obrigatorio`);
    return null;
  }

  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} invalido`);
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new ValidationError(`${fieldName} e obrigatorio`);
  }

  return trimmed || null;
};

const selectUsuarioAdmin = {
  id: true,
  nome: true,
  email: true,
  tipo: true,
  telefone: true,
  ativo: true,
  dataCriacao: true,
  _count: {
    select: {
      pets: true,
      reservasFeitas: true,
      reservasRecebidas: true,
    },
  },
};

const listarUsuarios = async (filtros = {}) => {
  const { tipo, ativo, busca } = filtros;
  const { page, limit, skip } = parsePagination(filtros);
  const where = {};

  if (tipo) {
    if (!TIPOS_FILTRO.includes(tipo)) {
      throw new ValidationError("Tipo de usuario invalido");
    }
    where.tipo = tipo;
  }

  if (ativo !== undefined) {
    if (!["true", "false", true, false].includes(ativo)) {
      throw new ValidationError("Filtro ativo invalido");
    }
    where.ativo = ativo === true || ativo === "true";
  }

  const buscaNormalizada = normalizeString(busca, "Busca");
  if (buscaNormalizada) {
    where.OR = [
      { nome: { contains: buscaNormalizada } },
      { email: { contains: buscaNormalizada } },
    ];
  }

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      select: selectUsuarioAdmin,
      skip,
      take: limit,
      orderBy: { dataCriacao: "desc" },
    }),
    prisma.usuario.count({ where }),
  ]);

  return {
    usuarios,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const obterUsuario = async (id) => {
  const usuarioId = toPositiveInt(id, "ID do usuario");
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      telefone: true,
      endereco: true,
      descricao: true,
      ativo: true,
      dataCriacao: true,
      dataAtualizacao: true,
      _count: {
        select: {
          pets: true,
          reservasFeitas: true,
          reservasRecebidas: true,
        },
      },
    },
  });

  if (!usuario) throw new NotFoundError("Usuario nao encontrado");
  return usuario;
};

const editarUsuario = async (id, dados, adminId) => {
  const usuarioId = toPositiveInt(id, "ID do usuario");
  const usuarioAtual = await obterUsuario(usuarioId);
  const data = {};

  const nome = normalizeString(dados.nome, "Nome");
  if (nome !== undefined) {
    if (!nome || nome.length < 3) {
      throw new ValidationError("Nome deve ter no minimo 3 caracteres");
    }
    data.nome = nome;
  }

  const email = normalizeString(dados.email, "Email");
  if (email !== undefined) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ValidationError("Email invalido");
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente && existente.id !== usuarioId) {
      throw new ConflictError("Email ja cadastrado");
    }

    data.email = email;
  }

  if (dados.tipo !== undefined) {
    if (!TIPOS_EDITAVEIS.includes(dados.tipo)) {
      throw new ValidationError(
        "Tipo so pode ser alterado para DONO ou CUIDADOR",
      );
    }

    if (usuarioAtual.tipo === "ADMIN") {
      throw new ForbiddenError("Nao e permitido alterar o tipo de um admin");
    }

    data.tipo = dados.tipo;
  }

  const telefone = normalizeString(dados.telefone, "Telefone");
  if (telefone !== undefined) data.telefone = telefone;

  const endereco = normalizeString(dados.endereco, "Endereco");
  if (endereco !== undefined) data.endereco = endereco;

  if (dados.ativo !== undefined) {
    if (typeof dados.ativo !== "boolean") {
      throw new ValidationError("Status ativo invalido");
    }

    if (usuarioId === adminId && dados.ativo === false) {
      throw new ForbiddenError("Voce nao pode desativar a propria conta");
    }

    data.ativo = dados.ativo;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Nenhum dado valido foi informado");
  }

  return prisma.usuario.update({
    where: { id: usuarioId },
    data,
    select: selectUsuarioAdmin,
  });
};

const desativarUsuario = async (id, adminId) => {
  const usuarioId = toPositiveInt(id, "ID do usuario");

  if (usuarioId === adminId) {
    throw new ForbiddenError("Voce nao pode desativar a propria conta");
  }

  await obterUsuario(usuarioId);
  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { ativo: false },
    select: { id: true, nome: true, email: true, ativo: true },
  });
};

const ativarUsuario = async (id) => {
  const usuarioId = toPositiveInt(id, "ID do usuario");
  await obterUsuario(usuarioId);

  return prisma.usuario.update({
    where: { id: usuarioId },
    data: { ativo: true },
    select: { id: true, nome: true, email: true, ativo: true },
  });
};

const listarDenuncias = async (filtros = {}) => {
  const { status } = filtros;
  const { page, limit, skip } = parsePagination(filtros);
  const where = {};

  if (status) {
    if (!STATUS_DENUNCIA.includes(status)) {
      throw new ValidationError("Status de denuncia invalido");
    }
    where.status = status;
  }

  const [denuncias, total] = await Promise.all([
    prisma.denuncia.findMany({
      where,
      include: {
        denunciante: { select: { id: true, nome: true, email: true } },
        denunciado: { select: { id: true, nome: true, email: true } },
      },
      skip,
      take: limit,
      orderBy: { dataCriacao: "desc" },
    }),
    prisma.denuncia.count({ where }),
  ]);

  return {
    denuncias,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const obterDenuncia = async (id) => {
  const denunciaId = toPositiveInt(id, "ID da denuncia");
  const denuncia = await prisma.denuncia.findUnique({
    where: { id: denunciaId },
    include: {
      denunciante: { select: { id: true, nome: true, email: true, tipo: true } },
      denunciado: { select: { id: true, nome: true, email: true, tipo: true } },
    },
  });

  if (!denuncia) throw new NotFoundError("Denuncia nao encontrada");
  return denuncia;
};

const atualizarDenuncia = async (id, dados) => {
  const denunciaId = toPositiveInt(id, "ID da denuncia");
  await obterDenuncia(denunciaId);
  const { status } = dados;

  if (!STATUS_DENUNCIA.includes(status)) {
    throw new ValidationError("Status de denuncia invalido");
  }

  const resolucao = normalizeString(dados.resolucao, "Resolucao");

  return prisma.denuncia.update({
    where: { id: denunciaId },
    data: {
      status,
      ...(resolucao !== undefined && { resolucao }),
    },
  });
};

const obterDashboard = async () => {
  const [
    totalUsuarios,
    totalPets,
    totalReservas,
    totalCuidadores,
    totalDonos,
    reservasPorStatus,
    usuariosRecentes,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.pet.count(),
    prisma.reserva.count(),
    prisma.usuario.count({ where: { tipo: "CUIDADOR" } }),
    prisma.usuario.count({ where: { tipo: "DONO" } }),
    prisma.reserva.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.usuario.findMany({
      take: 5,
      orderBy: { dataCriacao: "desc" },
      select: { id: true, nome: true, email: true, tipo: true, dataCriacao: true },
    }),
  ]);

  return {
    totalUsuarios,
    totalPets,
    totalReservas,
    totalCuidadores,
    totalDonos,
    reservasPorStatus: reservasPorStatus.reduce((acc, r) => {
      acc[r.status] = r._count.id;
      return acc;
    }, {}),
    usuariosRecentes,
  };
};

const listarConfiguracoes = async () => {
  return prisma.configuracao.findMany({ orderBy: { chave: "asc" } });
};

const atualizarConfiguracao = async (chave, valor) => {
  const chaveNormalizada = normalizeString(chave, "Chave", { required: true });
  if (!/^[a-zA-Z0-9_.-]+$/.test(chaveNormalizada)) {
    throw new ValidationError("Chave de configuracao invalida");
  }

  if (valor === undefined || valor === null) {
    throw new ValidationError("Valor da configuracao e obrigatorio");
  }

  const valorNormalizado = String(valor).trim();
  if (valorNormalizado.length > 1000) {
    throw new ValidationError("Valor da configuracao excede o limite");
  }

  const config = await prisma.configuracao.findUnique({
    where: { chave: chaveNormalizada },
  });

  if (!config) throw new NotFoundError("Configuracao nao encontrada");

  return prisma.configuracao.update({
    where: { chave: chaveNormalizada },
    data: { valor: valorNormalizado },
  });
};

const listarLogs = async (filtros = {}) => {
  const { usuarioId, acao } = filtros;
  const { page, limit, skip } = parsePagination({ ...filtros, limit: filtros.limit || 50 });
  const where = {};

  if (usuarioId) where.usuarioId = toPositiveInt(usuarioId, "ID do usuario");

  const acaoNormalizada = normalizeString(acao, "Acao");
  if (acaoNormalizada) where.acao = { contains: acaoNormalizada };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: { usuario: { select: { id: true, nome: true, email: true } } },
      skip,
      take: limit,
      orderBy: { dataLog: "desc" },
    }),
    prisma.log.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

const registrarAcaoAdmin = async (usuarioId, acao, descricao) => {
  return prisma.log.create({
    data: { usuarioId, acao, descricao },
  });
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  editarUsuario,
  desativarUsuario,
  ativarUsuario,
  listarDenuncias,
  obterDenuncia,
  atualizarDenuncia,
  obterDashboard,
  listarConfiguracoes,
  atualizarConfiguracao,
  listarLogs,
  registrarAcaoAdmin,
};
