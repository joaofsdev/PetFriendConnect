const { body } = require('express-validator');

const criarPetValidator = [
  body('nome')
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 2 }).withMessage('Nome deve ter no mínimo 2 caracteres'),

  body('especie')
    .notEmpty().withMessage('Espécie é obrigatória')
    .isIn(['Cachorro', 'Gato', 'Pássaro', 'Peixe', 'Roedor', 'Réptil', 'Outro'])
    .withMessage('Espécie inválida'),

  body('raca')
    .optional()
    .isLength({ min: 2 }).withMessage('Raça deve ter no mínimo 2 caracteres'),

  body('idade')
    .optional()
    .isInt({ min: 0, max: 30 }).withMessage('Idade deve ser entre 0 e 30'),

  body('observacoes')
    .optional()
    .isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
];

const atualizarPetValidator = [
  body('nome')
    .optional()
    .isLength({ min: 2 }).withMessage('Nome deve ter no mínimo 2 caracteres'),

  body('especie')
    .optional()
    .isIn(['Cachorro', 'Gato', 'Pássaro', 'Peixe', 'Roedor', 'Réptil', 'Outro'])
    .withMessage('Espécie inválida'),

  body('raca')
    .optional()
    .isLength({ min: 2 }).withMessage('Raça deve ter no mínimo 2 caracteres'),

  body('idade')
    .optional()
    .isInt({ min: 0, max: 30 }).withMessage('Idade deve ser entre 0 e 30'),

  body('observacoes')
    .optional()
    .isLength({ max: 500 }).withMessage('Observações devem ter no máximo 500 caracteres'),
];

module.exports = { criarPetValidator, atualizarPetValidator };
