const { body } = require('express-validator');

const atualizarStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status é obrigatório')
    .isIn(['ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'REJEITADA'])
    .withMessage('Status deve ser ABERTA, EM_ANALISE, RESOLVIDA ou REJEITADA'),
];

const adicionarParecerValidator = [
  body('parecer')
    .notEmpty()
    .withMessage('Parecer é obrigatório')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Parecer deve ter entre 10 e 2000 caracteres'),
];

const criarDenunciaValidator = [
  body('alvoId')
    .notEmpty()
    .withMessage('ID do usuário denunciado é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do usuário denunciado deve ser um número válido'),

  body('motivo')
    .notEmpty()
    .withMessage('Motivo é obrigatório')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Motivo deve ter entre 3 e 100 caracteres'),

  body('descricao')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
];

module.exports = { atualizarStatusValidator, adicionarParecerValidator, criarDenunciaValidator };
