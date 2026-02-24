const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { gerarToken } = require('../utils/jwt');

async function registrar({ nome, email, senha, tipo, telefone, endereco }) {
  // Verifica se email já existe
  const existe = await prisma.usuario.findUnique({ where: { email } });

  if (existe) {
    throw new Error('Email já cadastrado');
  }

  // Hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Cria o usuário
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaHash,
      tipo,
      telefone,
      endereco,
    },
  });

  const token = gerarToken({ id: usuario.id, tipo: usuario.tipo });

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    },
    token,
  };
}

async function login({ email, senha }) {
  // Busca usuário pelo email
  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario) {
    throw new Error('Email ou senha inválidos');
  }

  // Compara a senha
  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    throw new Error('Email ou senha inválidos');
  }

  const token = gerarToken({ id: usuario.id, tipo: usuario.tipo });

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    },
    token,
  };
}

async function obterPerfil(id) {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      tipo: true,
      telefone: true,
      endereco: true,
      createdAt: true,
    },
  });

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  return usuario;
}

module.exports = { registrar, login, obterPerfil };
