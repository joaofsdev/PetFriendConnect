require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index.js");
const { sendError } = require("./utils/response.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Rotas
app.use("/api", routes);

// Rota raiz
app.get("/", (req, res) => {
  res.json({ message: "PetFriend Connect API" });
});

// Handler global de erros
app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erro interno do servidor";

  sendError(res, message, statusCode);
});

// 404 handler
app.use((req, res) => {
  sendError(res, "Rota não encontrada", 404);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
