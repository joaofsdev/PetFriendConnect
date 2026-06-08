const { body, validationResult } = require("express-validator");
const { sendSuccess, sendError } = require("../utils/response.js");
const AuthService = require("../services/authService.js");

const validateRegister = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome e obrigatorio")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no minimo 3 caracteres"),
  body("email").trim().isEmail().withMessage("Email invalido").normalizeEmail(),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no minimo 6 caracteres"),
  body("tipo")
    .notEmpty()
    .withMessage("Tipo e obrigatorio")
    .isIn(["DONO", "CUIDADOR"])
    .withMessage("Tipo deve ser: DONO ou CUIDADOR"),
  body("telefone").optional().trim(),
  body("endereco").optional().trim(),
  body("descricao").optional().trim(),
];

const validateLogin = [
  body("email").trim().isEmail().withMessage("Email invalido").normalizeEmail(),
  body("senha").notEmpty().withMessage("Senha e obrigatoria"),
];

const validateUpdateProfile = [
  body("nome")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no minimo 3 caracteres"),
  body("telefone").optional({ nullable: true }).trim(),
  body("endereco").optional({ nullable: true }).trim(),
  body("descricao").optional({ nullable: true }).trim(),
  body("notificacoesEmail")
    .optional()
    .isBoolean()
    .withMessage("Preferencia de email invalida"),
  body("notificacoesSms")
    .optional()
    .isBoolean()
    .withMessage("Preferencia de SMS invalida"),
  body("fotoPerfil")
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage("Foto de perfil deve ser uma URL valida"),
];

const validateChangePassword = [
  body("senhaAtual").notEmpty().withMessage("Senha atual e obrigatoria"),
  body("novaSenha")
    .isLength({ min: 8 })
    .withMessage("Nova senha deve ter no minimo 8 caracteres"),
];

const validateForgotPassword = [
  body("email").trim().isEmail().withMessage("Email invalido").normalizeEmail(),
];

const validateResetPassword = [
  body("token").notEmpty().withMessage("Token e obrigatorio"),
  body("novaSenha")
    .isLength({ min: 8 })
    .withMessage("Nova senha deve ter no minimo 8 caracteres"),
];

const handleValidationErrors = (req, res, next) => {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    return sendError(
      res,
      erros
        .array()
        .map((e) => e.msg)
        .join(", "),
      400,
    );
  }

  next();
};

const register = async (req, res, next) => {
  try {
    const { nome, email, senha, tipo, telefone, endereco, descricao } =
      req.body;

    const resultado = await AuthService.register({
      nome,
      email,
      senha,
      tipo,
      telefone,
      endereco,
      descricao,
    });

    return sendSuccess(
      res,
      {
        usuario: resultado.usuario,
        token: resultado.token,
      },
      "Usuario cadastrado com sucesso",
      201,
    );
  } catch (erro) {
    next(erro);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    const resultado = await AuthService.login(email, senha);

    return sendSuccess(
      res,
      {
        usuario: resultado.usuario,
        token: resultado.token,
      },
      "Login realizado com sucesso",
      200,
    );
  } catch (erro) {
    next(erro);
  }
};

const me = async (req, res, next) => {
  try {
    const usuario = await AuthService.obterUsuarioPorId(req.user.id);

    return sendSuccess(res, usuario, "Dados do usuario obtidos com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const atualizarPerfil = async (req, res, next) => {
  try {
    const usuario = await AuthService.atualizarPerfil(req.user.id, req.body);

    return sendSuccess(res, usuario, "Perfil atualizado com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const alterarSenha = async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    await AuthService.alterarSenha(req.user.id, senhaAtual, novaSenha);

    return sendSuccess(res, null, "Senha alterada com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const solicitarResetSenha = async (req, res, next) => {
  try {
    const resultado = await AuthService.solicitarResetSenha(req.body.email);

    return sendSuccess(
      res,
      resultado,
      "Se o email estiver cadastrado, enviaremos instrucoes para redefinir a senha",
    );
  } catch (erro) {
    next(erro);
  }
};

const resetarSenha = async (req, res, next) => {
  try {
    const { token, novaSenha } = req.body;

    await AuthService.resetarSenha(token, novaSenha);

    return sendSuccess(res, null, "Senha redefinida com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const iniciarOAuth = (provider) => (req, res, next) => {
  try {
    const tipo = req.query.tipo === "CUIDADOR" ? "CUIDADOR" : "DONO";
    const url = AuthService.gerarUrlOAuth(provider, tipo);

    return res.redirect(url);
  } catch (erro) {
    next(erro);
  }
};

const callbackOAuth = (provider) => async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  try {
    const resultado = await AuthService.loginOAuth(
      provider,
      req.query.code,
      req.query.state,
    );
    const payload = encodeURIComponent(JSON.stringify(resultado));

    return res.redirect(`${frontendUrl}/oauth/callback#data=${payload}`);
  } catch (erro) {
    const message = encodeURIComponent(
      erro.message || "Falha ao autenticar com provedor social",
    );

    return res.redirect(`${frontendUrl}/login?oauthError=${message}`);
  }
};

module.exports = {
  register,
  login,
  me,
  atualizarPerfil,
  alterarSenha,
  solicitarResetSenha,
  resetarSenha,
  iniciarOAuth,
  callbackOAuth,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors,
};
