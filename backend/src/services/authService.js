const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors.js");

const prisma = new PrismaClient();

class AuthService {
  static async register(dados) {
    const { nome, email, senha, tipo, telefone, endereco } = dados;

    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      throw new ConflictError("Email já cadastrado");
    }

    const tiposValidos = ["DONO", "CUIDADOR", "ADMIN"];
    if (!tiposValidos.includes(tipo)) {
      throw new ValidationError(
        "Tipo de usuário inválido. Deve ser: DONO, CUIDADOR ou ADMIN",
      );
    }

    const senhaHash = await bcryptjs.hash(senha, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        tipo,
        telefone: telefone || null,
        endereco: endereco || null,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        endereco: true,
        dataCriacao: true,
      },
    });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return {
      usuario,
      token,
    };
  }

  static async login(email, senha) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    // Validar senha
    const senhaValida = await bcryptjs.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedError("Email ou senha inválidos");
    }

    if (!usuario.ativo) {
      throw new UnauthorizedError("Usuário inativo");
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      usuario: usuarioSemSenha,
      token,
    };
  }

  static async validarToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (erro) {
      if (erro.name === "TokenExpiredError") {
        throw new UnauthorizedError("Token expirado");
      }
      if (erro.name === "JsonWebTokenError") {
        throw new UnauthorizedError("Token inválido");
      }
      throw new UnauthorizedError("Erro ao validar token");
    }
  }

  static async obterUsuarioPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        endereco: true,
        descricao: true,
        fotoPerfil: true,
        ativo: true,
        dataCriacao: true,
        dataAtualizacao: true,
      },
    });

    if (!usuario) {
      throw new ValidationError("Usuário não encontrado");
    }

    return usuario;
  }
}

module.exports = AuthService;
