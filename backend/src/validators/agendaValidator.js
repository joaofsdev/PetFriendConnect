const { body } = require('express-validator');

const criarAgendaValidator = [
  body('data')
    .isISO8601().withMessage('Data deve estar no formato YYYY-MM-DD'),
  body('horaInicio')
    .matches(/^\d{2}:\d{2}$/).withMessage('Hora início deve estar no formato HH:mm'),
  body('horaFim')
    .matches(/^\d{2}:\d{2}$/).withMessage('Hora fim deve estar no formato HH:mm'),
  body('disponivel')
    .optional()
    .isBoolean().withMessage('Disponível deve ser boolean'),
];

module.exports = { criarAgendaValidator };
