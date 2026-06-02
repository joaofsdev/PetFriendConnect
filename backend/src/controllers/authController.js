const { body, validationResult } = require("express-validator");
const { sendSuccess, sendError } = require("../utils/response.js");
const AuthService = require("../services/authService.js");

const validateRegister = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("email").trim().isEmail().withMessage("Email inválido").normalizeEmail(),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
  body("tipo")
    .notEmpty()
    .withMessage("Tipo é obrigatório")
    .isIn(["DONO", "CUIDADOR"])
    .withMessage("Tipo deve ser: DONO ou CUIDADOR"),
  body("telefone").optional().trim(),
  body("endereco").optional().trim(),
];

const validateLogin = [
  body("email").trim().isEmail().withMessage("Email inválido").normalizeEmail(),
  body("senha").notEmpty().withMessage("Senha é obrigatória"),
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
    const { nome, email, senha, tipo, telefone, endereco } = req.body;

    const resultado = await AuthService.register({
      nome,
      email,
      senha,
      tipo,
      telefone,
      endereco,
    });

    return sendSuccess(
      res,
      {
        usuario: resultado.usuario,
        token: resultado.token,
      },
      "Usuário cadastrado com sucesso",
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

    return sendSuccess(res, usuario, "Dados do usuário obtidos com sucesso");
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
  iniciarOAuth,
  callbackOAuth,
  validateRegister,
  validateLogin,
  handleValidationErrors,
};
