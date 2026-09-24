require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard");
const clientesRoutes = require("./routes/clientes");
const botsRoutes = require("./routes/bots");
const atividadesRoutes = require("./routes/atividades");
const financeiroRoutes = require("./routes/financeiro");
const authenticate = require("./middleware/auth");

const app = express();

// ================================
// CONFIGURAÇÕES
// ================================

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// CORS
// ================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================================
// ROTAS
// ================================

app.get("/", (req, res) => {
  res.json({
    online: true,
    name: "DvS API",
    version: "1.0.0",
    url: "https://dvsweb.discloud.app",
  });
});

app.get("/ping", (req, res) => {
  res.json({
    message: "API OK",
    time: new Date().toISOString(),
  });
});

app.get("/dashboard/test", (req, res) => {
  res.json({
    ok: true,
  });
});

// ================================
// API
// ================================

app.use(authenticate);

app.use("/dashboard", dashboardRoutes);
app.use("/clientes", clientesRoutes);
app.use("/bots", botsRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/financeiro", financeiroRoutes);

// ================================
// TRATAMENTO DE ERROS
// ================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint não encontrado",
    path: req.originalUrl,
  });
});

// Erros internos
app.use((err, req, res, next) => {
  console.error("Erro na API:", err);

  res.status(500).json({
    error: true,
    message: "Erro interno do servidor",
  });
});

// ================================
// SERVIDOR
// ================================

const PORT = Number(process.env.PORT) || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("        DvS API ONLINE");
  console.log("=================================");
  console.log(`Porta: ${PORT}`);
  console.log("URL: https://dvsweb.discloud.app");
  console.log("=================================");
});