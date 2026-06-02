const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
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

    // Validar tipo de usuário
    const tiposValidos = ["DONO", "CUIDADOR"];
    if (!tiposValidos.includes(tipo)) {
      throw new ValidationError(
        "Tipo de usuário inválido. Deve ser: DONO ou CUIDADOR",
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

  static gerarUrlOAuth(provider, tipo = "DONO") {
    const tipoUsuario = this.validarTipoOAuth(tipo);
    const config = this.obterConfigOAuth(provider);
    const state = jwt.sign(
      {
        provider,
        tipo: tipoUsuario,
        purpose: "oauth-login",
      },
      process.env.JWT_SECRET,
      { expiresIn: "10m" },
    );

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: "code",
      state,
      scope: config.scope,
    });

    if (provider === "google") {
      params.set("access_type", "offline");
      params.set("prompt", "select_account");
    }

    return `${config.authorizationUrl}?${params.toString()}`;
  }

  static async loginOAuth(provider, code, state) {
    if (!code || !state) {
      throw new UnauthorizedError("Resposta OAuth inválida");
    }

    const stateData = this.validarStateOAuth(provider, state);
    const config = this.obterConfigOAuth(provider);
    const accessToken = await this.obterAccessTokenOAuth(provider, config, code);
    const perfil = await this.obterPerfilOAuth(provider, accessToken);

    if (!perfil.email) {
      throw new UnauthorizedError(
        "Não foi possível obter o email da conta social",
      );
    }

    if (perfil.emailVerified === false) {
      throw new UnauthorizedError("Email da conta social não verificado");
    }

    const usuario = await this.obterOuCriarUsuarioOAuth(perfil, stateData.tipo);
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

  static validarTipoOAuth(tipo) {
    return tipo === "CUIDADOR" ? "CUIDADOR" : "DONO";
  }

  static validarStateOAuth(provider, state) {
    try {
      const decoded = jwt.verify(state, process.env.JWT_SECRET);

      if (
        decoded.provider !== provider ||
        decoded.purpose !== "oauth-login" ||
        !["DONO", "CUIDADOR"].includes(decoded.tipo)
      ) {
        throw new UnauthorizedError("State OAuth inválido");
      }

      return decoded;
    } catch {
      throw new UnauthorizedError("State OAuth inválido ou expirado");
    }
  }

  static obterConfigOAuth(provider) {
    const apiUrl = process.env.API_URL || "http://localhost:3001";

    if (provider === "google") {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new ValidationError("OAuth Google não configurado");
      }

      return {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri:
          process.env.GOOGLE_REDIRECT_URI ||
          `${apiUrl}/api/auth/google/callback`,
        authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
        scope: "openid email profile",
      };
    }

    if (provider === "facebook") {
      if (
        !process.env.FACEBOOK_CLIENT_ID ||
        !process.env.FACEBOOK_CLIENT_SECRET
      ) {
        throw new ValidationError("OAuth Facebook não configurado");
      }

      const graphVersion = process.env.FACEBOOK_GRAPH_VERSION || "v20.0";

      return {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        redirectUri:
          process.env.FACEBOOK_REDIRECT_URI ||
          `${apiUrl}/api/auth/facebook/callback`,
        authorizationUrl: `https://www.facebook.com/${graphVersion}/dialog/oauth`,
        tokenUrl: `https://graph.facebook.com/${graphVersion}/oauth/access_token`,
        userInfoUrl: `https://graph.facebook.com/${graphVersion}/me`,
        scope: "email,public_profile",
      };
    }

    throw new ValidationError("Provider OAuth inválido");
  }

  static async obterAccessTokenOAuth(provider, config, code) {
    if (provider === "google") {
      const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.access_token) {
        throw new UnauthorizedError("Falha ao autenticar com Google");
      }

      return data.access_token;
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code,
    });

    const response = await fetch(`${config.tokenUrl}?${params.toString()}`);
    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new UnauthorizedError("Falha ao autenticar com Facebook");
    }

    return data.access_token;
  }

  static async obterPerfilOAuth(provider, accessToken) {
    if (provider === "google") {
      const response = await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new UnauthorizedError("Falha ao obter perfil do Google");
      }

      return {
        provider,
        providerId: data.sub,
        email: data.email,
        emailVerified: data.email_verified,
        nome: data.name || data.email,
        fotoPerfil: data.picture || null,
      };
    }

    const params = new URLSearchParams({
      fields: "id,name,email,picture.type(large)",
      access_token: accessToken,
    });
    const response = await fetch(
      `https://graph.facebook.com/me?${params.toString()}`,
    );
    const data = await response.json();

    if (!response.ok) {
      throw new UnauthorizedError("Falha ao obter perfil do Facebook");
    }

    return {
      provider,
      providerId: data.id,
      email: data.email,
      emailVerified: true,
      nome: data.name || data.email,
      fotoPerfil: data.picture?.data?.url || null,
    };
  }

  static async obterOuCriarUsuarioOAuth(perfil, tipo) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: perfil.email },
    });

    if (usuarioExistente) {
      if (!usuarioExistente.ativo) {
        throw new UnauthorizedError("Usuário inativo");
      }

      const { senha: _, ...usuarioSemSenha } = usuarioExistente;
      return usuarioSemSenha;
    }

    const senhaAleatoria = crypto.randomBytes(32).toString("hex");

    return prisma.usuario.create({
      data: {
        nome: perfil.nome,
        email: perfil.email,
        senha: await bcryptjs.hash(senhaAleatoria, 10),
        tipo,
        fotoPerfil: perfil.fotoPerfil,
        ativo: true,
      },
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
  }
}

module.exports = AuthService;
