const prisma = require('../../config/database');

async function listar({ pagina = 1, limite = 10, tipo, ativo, busca }) {
  const where = {};

  if (tipo) where.tipo = tipo;
  if (ativo !== undefined) where.ativo = ativo === 'true';
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
        endereco: true,
        ativo: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            pets: true,
            reservasDono: true,
            reservasCuidador: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.usuario.count({ where }),
  ]);

  return {
    usuarios,
    paginacao: {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    },
  };
}

async function obterPorId(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      telefone: true,
      endereco: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
      pets: {
        select: { id: true, nome: true, especie: true, raca: true },
      },
      reservasDono: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          dataInicio: true,
          dataFim: true,
          createdAt: true,
          cuidador: { select: { id: true, nome: true } },
          pet: { select: { id: true, nome: true } },
          servico: { select: { id: true, nome: true } },
        },
      },
      reservasCuidador: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          dataInicio: true,
          dataFim: true,
          createdAt: true,
          dono: { select: { id: true, nome: true } },
          pet: { select: { id: true, nome: true } },
          servico: { select: { id: true, nome: true } },
        },
      },
      servicos: {
        select: { id: true, nome: true, preco: true },
      },
    },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  return usuario;
}

async function atualizar(id, dados) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // Campos permitidos para admin editar
  const dadosPermitidos = {};
  if (dados.nome) dadosPermitidos.nome = dados.nome;
  if (dados.email) dadosPermitidos.email = dados.email;
  if (dados.tipo) dadosPermitidos.tipo = dados.tipo;
  if (dados.telefone !== undefined) dadosPermitidos.telefone = dados.telefone;
  if (dados.endereco !== undefined) dadosPermitidos.endereco = dados.endereco;

  // Verificar email único se estiver alterando
  if (dados.email && dados.email !== usuario.email) {
    const emailExiste = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });
    if (emailExiste) {
      throw new Error('Email já está em uso');
    }
  }

  const atualizado = await prisma.usuario.update({
    where: { id },
    data: dadosPermitidos,
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      telefone: true,
      endereco: true,
      ativo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return atualizado;
}

async function desativar(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  if (!usuario.ativo) {
    throw new Error('Usuário já está desativado');
  }

  const desativado = await prisma.usuario.update({
    where: { id },
    data: { ativo: false },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      ativo: true,
    },
  });

  return desativado;
}

async function ativar(id) {
  const usuario = await prisma.usuario.findUnique({ where: { id } });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  if (usuario.ativo) {
    throw new Error('Usuário já está ativo');
  }

  const ativado = await prisma.usuario.update({
    where: { id },
    data: { ativo: true },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      ativo: true,
    },
  });

  return ativado;
}

module.exports = { listar, obterPorId, atualizar, desativar, ativar };
