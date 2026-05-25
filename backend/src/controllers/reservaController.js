const { body, validationResult } = require("express-validator");
const { sendSuccess, sendError } = require("../utils/response.js");
const ReservaService = require("../services/reservaService.js");

const validateCriarReserva = [
  body("cuidadorId").isInt({ min: 1 }).withMessage("ID do cuidador inválido"),
  body("petId").isInt({ min: 1 }).withMessage("ID do pet inválido"),
  body("servicoId").isInt({ min: 1 }).withMessage("ID do serviço inválido"),
  body("agendaId").isInt({ min: 1 }).withMessage("ID da agenda inválido"),
];

const handleValidationErrors = (req, res, next) => {
  const erros = validationResult(req);

  if (!erros.isEmpty()) {
    return sendError(
      res,
      erros
        .array()
        .map((erro) => erro.msg)
        .join(", "),
      400,
    );
  }

  next();
};

const listarReservas = async (req, res, next) => {
  try {
    const reservas = await ReservaService.listarReservas(
      req.user.id,
      req.user.tipo,
    );

    return sendSuccess(res, reservas, "Reservas listadas com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const obterReserva = async (req, res, next) => {
  try {
    const reserva = await ReservaService.obterReservaPorId(
      req.params.id,
      req.user,
    );

    return sendSuccess(res, reserva, "Reserva obtida com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const criarReserva = async (req, res, next) => {
  try {
    const reserva = await ReservaService.criarReserva(req.body, req.user.id);

    return sendSuccess(res, reserva, "Reserva confirmada com sucesso", 201);
  } catch (erro) {
    next(erro);
  }
};

const cancelarReserva = async (req, res, next) => {
  try {
    const reserva = await ReservaService.cancelarReserva(
      req.params.id,
      req.user.id,
    );

    return sendSuccess(res, reserva, "Reserva cancelada com sucesso");
  } catch (erro) {
    next(erro);
  }
};

module.exports = {
  validateCriarReserva,
  handleValidationErrors,
  listarReservas,
  obterReserva,
  criarReserva,
  cancelarReserva,
};
