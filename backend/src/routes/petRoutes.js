const express = require("express");
const petController = require("../controllers/petController.js");
const { authenticate, authorize } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.use(authenticate, authorize(["DONO"]));

router.get("/", petController.listarPets);

router.get("/:id", petController.obterPet);

router.post(
  "/",
  petController.validatePetCreate,
  petController.handleValidationErrors,
  petController.criarPet,
);

router.put(
  "/:id",
  petController.validatePetUpdate,
  petController.handleValidationErrors,
  petController.atualizarPet,
);

router.delete("/:id", petController.removerPet);

module.exports = router;
