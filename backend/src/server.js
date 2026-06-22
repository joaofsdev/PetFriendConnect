require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes/index.js");
const { sendError } = require("./utils/response.js");

const app = express();
const PORT = process.env.PORT || 3001;

app.disable("x-powered-by");

// Middlewares
app.use(helmet());

const corsOptions = {
  origin: process.env.NODE_ENV === "production"
    ? (process.env.FRONTEND_URL || "").split(",")
    : true,
  credentials: true,
};
app.use(cors(corsOptions));

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
const WEAK_SECRETS = ["change_me_for_production", "troque_esta_chave_em_producao", ""];
if (!process.env.JWT_SECRET || (process.env.NODE_ENV === "production" && WEAK_SECRETS.includes(process.env.JWT_SECRET))) {
  console.error("ERRO FATAL: JWT_SECRET nao definido ou inseguro. Defina um valor forte antes de iniciar em producao.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
