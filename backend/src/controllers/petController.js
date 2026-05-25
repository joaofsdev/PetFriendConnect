const { body, validationResult } = require("express-validator");
const { sendSuccess, sendError } = require("../utils/response.js");
const PetService = require("../services/petService.js");

const validatePetCreate = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 2 })
    .withMessage("Nome deve ter no mínimo 2 caracteres"),
  body("especie")
    .trim()
    .notEmpty()
    .withMessage("Espécie é obrigatória")
    .isLength({ min: 2 })
    .withMessage("Espécie deve ter no mínimo 2 caracteres"),
  body("raca").optional().trim(),
  body("idade")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Idade deve ser um número inteiro válido"),
  body("observacoes").optional({ nullable: true }).trim(),
];

const validatePetUpdate = [
  body("nome")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("Nome deve ter no mínimo 2 caracteres"),
  body("especie")
    .optional({ nullable: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("Espécie deve ter no mínimo 2 caracteres"),
  body("raca").optional({ nullable: true }).trim(),
  body("idade")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Idade deve ser um número inteiro válido"),
  body("observacoes").optional({ nullable: true }).trim(),
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

const listarPets = async (req, res, next) => {
  try {
    const pets = await PetService.listarPets(req.user.id);
    return sendSuccess(res, pets, "Pets listados com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const obterPet = async (req, res, next) => {
  try {
    const pet = await PetService.obterPetPorId(req.params.id, req.user.id);
    return sendSuccess(res, pet, "Pet obtido com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const criarPet = async (req, res, next) => {
  try {
    const pet = await PetService.criarPet(req.body, req.user.id);
    return sendSuccess(res, pet, "Pet criado com sucesso", 201);
  } catch (erro) {
    next(erro);
  }
};

const atualizarPet = async (req, res, next) => {
  try {
    const pet = await PetService.atualizarPet(
      req.params.id,
      req.user.id,
      req.body,
    );
    return sendSuccess(res, pet, "Pet atualizado com sucesso");
  } catch (erro) {
    next(erro);
  }
};

const removerPet = async (req, res, next) => {
  try {
    await PetService.removerPet(req.params.id, req.user.id);
    return res.status(204).send();
  } catch (erro) {
    next(erro);
  }
};

module.exports = {
  validatePetCreate,
  validatePetUpdate,
  handleValidationErrors,
  listarPets,
  obterPet,
  criarPet,
  atualizarPet,
  removerPet,
};
