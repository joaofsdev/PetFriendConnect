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
    .isIn(["DONO", "CUIDADOR", "ADMIN"])
    .withMessage("Tipo deve ser: DONO, CUIDADOR ou ADMIN"),
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

module.exports = {
  register,
  login,
  me,
  validateRegister,
  validateLogin,
  handleValidationErrors,
};
