const { body, validationResult } = require("express-validator");
const { sendSuccess, sendError } = require("../utils/response.js");
const CuidadorService = require("../services/cuidadorService.js");

// Validar criação de serviço
const validateServico = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome do serviço é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("descricao").optional().trim(),
  body("preco")
    .notEmpty()
    .withMessage("Preço é obrigatório")
    .isFloat({ min: 0.01 })
    .withMessage("Preço deve ser um valor válido"),
  body("duracao")
    .notEmpty()
    .withMessage("Duração é obrigatória")
    .isInt({ min: 1 })
    .withMessage("Duração deve ser um inteiro maior que zero"),
];

// Validar adição de slot
const validateSlot = [
  body("servicoId").isInt({ min: 1 }).withMessage("ID do serviço inválido"),
  body("data")
    .notEmpty()
    .withMessage("Data é obrigatória")
    .isISO8601()
    .withMessage("Data deve estar em formato ISO8601 (YYYY-MM-DD)"),
];

// Middleware para verificar erros de validação
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

// GET /api/cuidadores
const listarCuidadores = async (req, res, next) => {
  try {
    const cuidadores = await CuidadorService.listarCuidadores();

    return sendSuccess(res, cuidadores, "Cuidadores listados com sucesso");
  } catch (erro) {
    next(erro);
  }
};

// GET /api/cuidadores/:id
const obterPerfilCuidador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cuidador = await CuidadorService.obterPerfilCuidador(parseInt(id));

    return sendSuccess(res, cuidador, "Perfil do cuidador obtido com sucesso");
  } catch (erro) {
    next(erro);
  }
};

// GET /api/agenda (cuidador's own agenda)
const listarMinhaAgenda = async (req, res, next) => {
  try {
    const agenda = await CuidadorService.listarMinhaAgenda(req.user.id);
    return sendSuccess(res, agenda, "Agenda obtida com sucesso");
  } catch (erro) {
    next(erro);
  }
};

// GET /api/cuidadores/:id/agenda
const obterAgendaCuidador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dias } = req.query;

    const agenda = await CuidadorService.obterAgendaCuidador(
      parseInt(id),
      dias ? parseInt(dias) : 30,
    );

    return sendSuccess(res, agenda, "Agenda obtida com sucesso");
  } catch (erro) {
    next(erro);
  }
};

// POST /api/servicos
const criarServico = async (req, res, next) => {
  try {
    const { nome, descricao, preco, duracao } = req.body;

    const servico = await CuidadorService.criarServico(req.user.id, {
      nome,
      descricao,
      preco,
      duracao,
    });

    return sendSuccess(res, servico, "Serviço criado com sucesso", 201);
  } catch (erro) {
    next(erro);
  }
};

// PUT /api/servicos/:id
const editarServico = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, duracao, ativo } = req.body;

    const servico = await CuidadorService.editarServico(
      parseInt(id),
      req.user.id,
      {
        nome,
        descricao,
        preco,
        duracao,
        ativo,
      },
    );

    return sendSuccess(res, servico, "Serviço atualizado com sucesso");
  } catch (erro) {
    next(erro);
  }
};

// POST /api/agenda
const adicionarSlot = async (req, res, next) => {
  try {
    const { servicoId, data } = req.body;

    const slot = await CuidadorService.adicionarSlot(req.user.id, {
      servicoId,
      data,
    });

    return sendSuccess(
      res,
      slot,
      "Slot de disponibilidade adicionado com sucesso",
      201,
    );
  } catch (erro) {
    next(erro);
  }
};

// DELETE /api/agenda/:id
const deletarSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resultado = await CuidadorService.deletarSlot(
      parseInt(id),
      req.user.id,
    );

    return sendSuccess(res, resultado, "Slot deletado com sucesso");
  } catch (erro) {
    next(erro);
  }
};

module.exports = {
  listarCuidadores,
  obterPerfilCuidador,
  obterAgendaCuidador,
  listarMinhaAgenda,
  criarServico,
  editarServico,
  adicionarSlot,
  deletarSlot,
  validateServico,
  validateSlot,
  handleValidationErrors,
};
