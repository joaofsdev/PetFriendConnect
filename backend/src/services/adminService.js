const { PrismaClient } = require("@prisma/client");
const { NotFoundError, ValidationError } = require("../utils/errors.js");

const prisma = new PrismaClient();

// ===== USUÁRIOS =====

const listarUsuarios = async (filtros = {}) => {
  const { tipo, ativo, busca, page = 1, limit = 20 } = filtros;
  const where = {};

  if (tipo) where.tipo = tipo;
  if (ativo !== undefined) where.ativo = ativo === "true";
  if (busca) {
    where.OR = [
      { nome: { contains: busca } },
      { email: { contains: busca } },
    ];
  }

  const [usuarios, total] = await Promise.all([
    prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        ativo: true,
        dataCriacao: true,
        _count: { select: { pets: true, reservasFeitas: true, reservasRecebidas: true } },
      },
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { dataCriacao: "desc" },
    }),
    prisma.usuario.count({ where }),
  ]);

  return { usuarios, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const obterUsuario = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id: Number(id) },
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
      _count: { select: { pets: true, reservasFeitas: true, reservasRecebidas: true } },
    },
  });

  if (!usuario) throw new NotFoundError("Usuário não encontrado");
  return usuario;
};

const editarUsuario = async (id, dados) => {
  await obterUsuario(id);
  const { nome, email, tipo, telefone, endereco, ativo } = dados;

  return prisma.usuario.update({
    where: { id: Number(id) },
    data: { ...(nome && { nome }), ...(email && { email }), ...(tipo && { tipo }), ...(telefone !== undefined && { telefone }), ...(endereco !== undefined && { endereco }), ...(ativo !== undefined && { ativo }) },
    select: { id: true, nome: true, email: true, tipo: true, ativo: true },
  });
};

const desativarUsuario = async (id) => {
  await obterUsuario(id);
  return prisma.usuario.update({
    where: { id: Number(id) },
    data: { ativo: false },
    select: { id: true, nome: true, email: true, ativo: true },
  });
};

const ativarUsuario = async (id) => {
  await obterUsuario(id);
  return prisma.usuario.update({
    where: { id: Number(id) },
    data: { ativo: true },
    select: { id: true, nome: true, email: true, ativo: true },
  });
};

// ===== DENÚNCIAS =====

const listarDenuncias = async (filtros = {}) => {
  const { status, page = 1, limit = 20 } = filtros;
  const where = {};
  if (status) where.status = status;

  const [denuncias, total] = await Promise.all([
    prisma.denuncia.findMany({
      where,
      include: {
        denunciante: { select: { id: true, nome: true, email: true } },
        denunciado: { select: { id: true, nome: true, email: true } },
      },
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { dataCriacao: "desc" },
    }),
    prisma.denuncia.count({ where }),
  ]);

  return { denuncias, total, page: Number(page), totalPages: Math.ceil(total / limit) };
};

const obterDenuncia = async (id) => {
  const denuncia = await prisma.denuncia.findUnique({
    where: { id: Number(id) },
    include: {
      denunciante: { select: { id: true, nome: true, email: true, tipo: true } },
      denunciado: { select: { id: true, nome: true, email: true, tipo: true } },
    },
  });

  if (!denuncia) throw new NotFoundError("Denúncia não encontrada");
  return denuncia;
};

const atualizarDenuncia = async (id, dados) => {
  await obterDenuncia(id);
  const { status, resolucao } = dados;

  if (!status) throw new ValidationError("Status é obrigatório");

  return prisma.denuncia.update({
    where: { id: Number(id) },
    data: { status, ...(resolucao && { resolucao }) },
  });
};

// ===== DASHBOARD =====

const obterDashboard = async () => {
  const [totalUsuarios, totalPets, totalReservas, totalCuidadores, totalDonos, reservasPorStatus, usuariosRecentes] = await Promise.all([
    prisma.usuario.count(),
    prisma.pet.count(),
    prisma.reserva.count(),
    prisma.usuario.count({ where: { tipo: "CUIDADOR" } }),
    prisma.usuario.count({ where: { tipo: "DONO" } }),
    prisma.reserva.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.usuario.findMany({ take: 5, orderBy: { dataCriacao: "desc" }, select: { id: true, nome: true, email: true, tipo: true, dataCriacao: true } }),
  ]);

  return {
    totalUsuarios,
    totalPets,
    totalReservas,
    totalCuidadores,
    totalDonos,
    reservasPorStatus: reservasPorStatus.reduce((acc, r) => { acc[r.status] = r._count.id; return acc; }, {}),
    usuariosRecentes,
  };
};

// ===== CONFIGURAÇÕES =====

const listarConfiguracoes = async () => {
  return prisma.configuracao.findMany({ orderBy: { chave: "asc" } });
};

const atualizarConfiguracao = async (chave, valor) => {
  const config = await prisma.configuracao.findUnique({ where: { chave } });

  if (!config) throw new NotFoundError("Configuração não encontrada");

  return prisma.configuracao.update({
    where: { chave },
    data: { valor: String(valor) },
  });
};

// ===== LOGS =====

const listarLogs = async (filtros = {}) => {
  const { usuarioId, acao, page = 1, limit = 50 } = filtros;
  const where = {};
  if (usuarioId) where.usuarioId = Number(usuarioId);
  if (acao) where.acao = { contains: acao };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({
      where,
      include: { usuario: { select: { id: true, nome: true, email: true } } },
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { dataLog: "desc" },
    }),
    prisma.log.count({ where }),
  ]);

  return { logs, total, page: Number(page), totalPages: Math.ceil(total / limit) };
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
