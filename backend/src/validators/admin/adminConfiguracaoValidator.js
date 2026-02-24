const { body } = require('express-validator');

const atualizarConfiguracaoValidator = [
  body('valor')
    .exists({ checkNull: true })
    .withMessage('Valor é obrigatório')
    .isString()
    .withMessage('Valor deve ser uma string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Valor deve ter no máximo 500 caracteres'),
];

module.exports = { atualizarConfiguracaoValidator };
