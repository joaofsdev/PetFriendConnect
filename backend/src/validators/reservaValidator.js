const { body } = require('express-validator');

const criarReservaValidator = [
  body('cuidadorId')
    .notEmpty().withMessage('ID do cuidador é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do cuidador inválido'),

  body('petId')
    .notEmpty().withMessage('ID do pet é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do pet inválido'),

  body('servicoId')
    .notEmpty().withMessage('ID do serviço é obrigatório')
    .isInt({ min: 1 }).withMessage('ID do serviço inválido'),

  body('dataInicio')
    .notEmpty().withMessage('Data de início é obrigatória')
    .isISO8601().withMessage('Data de início deve ser uma data válida'),

  body('dataFim')
    .notEmpty().withMessage('Data de fim é obrigatória')
    .isISO8601().withMessage('Data de fim deve ser uma data válida'),
];

module.exports = { criarReservaValidator };
