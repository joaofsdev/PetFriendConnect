const express = require("express");
const authRoutes = require("./authRoutes.js");
const cuidadorRoutes = require("./cuidadorRoutes.js");
const reservaRoutes = require("./reservaRoutes.js");
const petRoutes = require("./petRoutes.js");
const { authenticate, authorize } = require("../middlewares/authMiddleware.js");
const cuidadorController = require("../controllers/cuidadorController.js");

const router = express.Router();

// Rotas de exemplo
router.get("/health", (req, res) => {
  res.json({ status: "API está funcionando!" });
});

// Rotas de autenticação
router.use("/auth", authRoutes);

// Rotas de cuidadores (listagem e perfil)
router.use("/cuidadores", cuidadorRoutes);

// Rotas de serviços (CRUD do cuidador)
router.post(
  "/servicos",
  authenticate,
  authorize(["CUIDADOR"]),
  cuidadorController.validateServico,
  cuidadorController.handleValidationErrors,
  cuidadorController.criarServico,
);
router.put(
  "/servicos/:id",
  authenticate,
  authorize(["CUIDADOR"]),
  cuidadorController.editarServico,
);

// Rotas de agenda (CRUD do cuidador)
router.get(
  "/agenda",
  authenticate,
  authorize(["CUIDADOR"]),
  cuidadorController.listarMinhaAgenda,
);
router.post(
  "/agenda",
  authenticate,
  authorize(["CUIDADOR"]),
  cuidadorController.validateSlot,
  cuidadorController.handleValidationErrors,
  cuidadorController.adicionarSlot,
);
router.delete(
  "/agenda/:id",
  authenticate,
  authorize(["CUIDADOR"]),
  cuidadorController.deletarSlot,
);

router.use("/reservas", reservaRoutes);
router.use("/pets", petRoutes);

module.exports = router;
