const express = require("express");
const petController = require("../controllers/petController.js");
const { authenticate } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/", authenticate, petController.listarPets);

router.get("/:id", authenticate, petController.obterPet);

router.post(
  "/",
  authenticate,
  petController.validatePetCreate,
  petController.handleValidationErrors,
  petController.criarPet,
);

router.put(
  "/:id",
  authenticate,
  petController.validatePetUpdate,
  petController.handleValidationErrors,
  petController.atualizarPet,
);

router.delete("/:id", authenticate, petController.removerPet);

module.exports = router;
