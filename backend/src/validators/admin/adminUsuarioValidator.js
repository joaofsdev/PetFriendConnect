const { body } = require('express-validator');

const atualizarUsuarioValidator = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),

  body('tipo')
    .optional()
    .isIn(['DONO', 'CUIDADOR', 'ADMIN'])
    .withMessage('Tipo deve ser DONO, CUIDADOR ou ADMIN'),

  body('telefone')
    .optional({ values: 'null' })
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Telefone deve ter entre 8 e 20 caracteres'),

  body('endereco')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 255 })
    .withMessage('Endereço deve ter no máximo 255 caracteres'),
];

module.exports = { atualizarUsuarioValidator };
