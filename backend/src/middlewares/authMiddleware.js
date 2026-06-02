const { sendError } = require("../utils/response.js");
const { UnauthorizedError, ForbiddenError } = require("../utils/errors.js");
const AuthService = require("../services/authService.js");

// Middleware de autenticação - valida o token JWT
const authenticate = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendError(res, "Token não fornecido", 401);
    }

    // Esperado formato: "Bearer <token>"
    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return sendError(res, "Formato de token inválido", 401);
    }

    const token = partes[1];

    // Validar token
    const decoded = await AuthService.validarToken(token);
    const usuario = await AuthService.obterUsuarioPorId(decoded.id);

    if (!usuario.ativo) {
      throw new UnauthorizedError("Usuário inativo");
    }

    // Injetar dados do usuário na requisição
    req.user = {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
    };

    next();
  } catch (erro) {
    const statusCode = erro.statusCode || 401;
    return sendError(res, erro.message, statusCode);
  }
};

// Middleware de autorização - valida o tipo de usuário
const authorize = (tiposPermitidos = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, "Usuário não autenticado", 401);
      }

      if (!tiposPermitidos.includes(req.user.tipo)) {
        return sendError(res, "Acesso proibido para este tipo de usuário", 403);
      }

      next();
    } catch (erro) {
      return sendError(res, "Erro na autorização", 403);
    }
  };
};

module.exports = {
  authenticate,
  authorize,
};
