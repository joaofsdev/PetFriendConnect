const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} = require("../utils/errors.js");
const {
  isValidProfilePhoto,
  normalizeProfilePhoto,
} = require("../utils/profilePhoto.js");

const prisma = new PrismaClient();

const RESET_TOKEN_EXPIRATION_MINUTES = 30;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const buildFrontendUrl = (path) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}${path}`;
};

class AuthService {
  static async register(dados) {
    const { nome, email, senha, tipo, telefone, endereco, descricao } = dados;

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
        descricao: descricao || null,
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
        notificacoesEmail: true,
        notificacoesSms: true,
        ativo: true,
        dataCriacao: true,
        dataAtualizacao: true,
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

    const {
      senha: _,
      resetSenhaTokenHash: __,
      resetSenhaExpiraEm: ___,
      ...usuarioSemSenha
    } = usuario;

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
        notificacoesEmail: true,
        notificacoesSms: true,
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

  static async atualizarPerfil(usuarioId, dados) {
    const atualizacao = {};

    if (dados.nome !== undefined) {
      if (typeof dados.nome !== "string") {
        throw new ValidationError("Nome invalido");
      }

      const nome = dados.nome.trim();
      if (!nome) {
        throw new ValidationError("Nome e obrigatorio");
      }
      atualizacao.nome = nome;
    }

    if (dados.telefone !== undefined) {
      if (dados.telefone !== null && typeof dados.telefone !== "string") {
        throw new ValidationError("Telefone invalido");
      }

      atualizacao.telefone = dados.telefone?.trim() || null;
    }

    if (dados.endereco !== undefined) {
      if (dados.endereco !== null && typeof dados.endereco !== "string") {
        throw new ValidationError("Endereco invalido");
      }

      atualizacao.endereco = dados.endereco?.trim() || null;
    }

    if (dados.descricao !== undefined) {
      if (dados.descricao !== null && typeof dados.descricao !== "string") {
        throw new ValidationError("Descricao invalida");
      }

      atualizacao.descricao = dados.descricao?.trim() || null;
    }

    if (dados.fotoPerfil !== undefined) {
      if (!isValidProfilePhoto(dados.fotoPerfil)) {
        throw new ValidationError("Foto de perfil invalida");
      }

      atualizacao.fotoPerfil = normalizeProfilePhoto(dados.fotoPerfil);
    }

    if (dados.notificacoesEmail !== undefined) {
      if (typeof dados.notificacoesEmail !== "boolean") {
        throw new ValidationError("Preferencia de email invalida");
      }

      atualizacao.notificacoesEmail = dados.notificacoesEmail;
    }

    if (dados.notificacoesSms !== undefined) {
      if (typeof dados.notificacoesSms !== "boolean") {
        throw new ValidationError("Preferencia de SMS invalida");
      }

      atualizacao.notificacoesSms = dados.notificacoesSms;
    }

    if (Object.keys(atualizacao).length === 0) {
      throw new ValidationError("Nenhum dado valido foi informado");
    }

    const usuarioAtual = await this.obterUsuarioPorId(usuarioId);
    const telefoneFinal =
      atualizacao.telefone !== undefined
        ? atualizacao.telefone
        : usuarioAtual.telefone;
    const smsAtivoFinal =
      atualizacao.notificacoesSms !== undefined
        ? atualizacao.notificacoesSms
        : usuarioAtual.notificacoesSms;

    if (smsAtivoFinal && !telefoneFinal?.trim()) {
      throw new ValidationError(
        "Cadastre um telefone antes de ativar notificacoes por SMS",
      );
    }

    return prisma.usuario.update({
      where: { id: usuarioId },
      data: atualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        tipo: true,
        telefone: true,
        endereco: true,
        descricao: true,
        fotoPerfil: true,
        notificacoesEmail: true,
        notificacoesSms: true,
        ativo: true,
        dataCriacao: true,
        dataAtualizacao: true,
      },
    });
  }

  static async alterarSenha(usuarioId, senhaAtual, novaSenha) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        senha: true,
        ativo: true,
      },
    });

    if (!usuario) {
      throw new ValidationError("Usuario nao encontrado");
    }

    if (!usuario.ativo) {
      throw new UnauthorizedError("Usuario inativo");
    }

    const senhaAtualValida = await bcryptjs.compare(senhaAtual, usuario.senha);

    if (!senhaAtualValida) {
      throw new UnauthorizedError("Senha atual invalida");
    }

    const mesmaSenha = await bcryptjs.compare(novaSenha, usuario.senha);

    if (mesmaSenha) {
      throw new ValidationError("A nova senha deve ser diferente da atual");
    }

    const senhaHash = await bcryptjs.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: senhaHash },
    });

    return null;
  }

  static async solicitarResetSenha(email) {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        ativo: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return { resetUrl: null };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetSenhaTokenHash = hashToken(token);
    const resetSenhaExpiraEm = new Date();
    resetSenhaExpiraEm.setMinutes(
      resetSenhaExpiraEm.getMinutes() + RESET_TOKEN_EXPIRATION_MINUTES,
    );

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetSenhaTokenHash,
        resetSenhaExpiraEm,
      },
    });

    const resetUrl = buildFrontendUrl(
      `/redefinir-senha?token=${encodeURIComponent(token)}`,
    );

    if (
      process.env.NODE_ENV !== "production" &&
      process.env.NODE_ENV !== "test"
    ) {
      console.log(
        `Link de recuperacao de senha para ${usuario.email}: ${resetUrl}`,
      );
    }

    return {
      resetUrl: process.env.NODE_ENV === "production" ? null : resetUrl,
    };
  }

  static async resetarSenha(token, novaSenha) {
    const usuario = await prisma.usuario.findUnique({
      where: { resetSenhaTokenHash: hashToken(token) },
      select: {
        id: true,
        ativo: true,
        resetSenhaExpiraEm: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedError("Token de recuperacao invalido ou expirado");
    }

    if (!usuario.resetSenhaExpiraEm || usuario.resetSenhaExpiraEm < new Date()) {
      throw new UnauthorizedError("Token de recuperacao invalido ou expirado");
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: await bcryptjs.hash(novaSenha, 10),
        resetSenhaTokenHash: null,
        resetSenhaExpiraEm: null,
      },
    });

    return null;
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

      const {
        senha: _,
        resetSenhaTokenHash: __,
        resetSenhaExpiraEm: ___,
        ...usuarioSemSenha
      } = usuarioExistente;
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
        notificacoesEmail: true,
        notificacoesSms: true,
        ativo: true,
        dataCriacao: true,
        dataAtualizacao: true,
      },
    });
  }
}

module.exports = AuthService;
