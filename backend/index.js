require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");
const { Server } = require("socket.io");
const { auth } = require("./firebase");

const dashboardRoutes = require("./routes/dashboard");
const clientesRoutes = require("./routes/clientes");
const botsRoutes = require("./routes/bots");
const atividadesRoutes = require("./routes/atividades");
const financeiroRoutes = require("./routes/financeiro");
const usuariosRoutes = require("./routes/usuarios");
const ticketsRoutes = require("./routes/tickets");
const botTicketsRoutes = require("./routes/botTickets");
const authenticate = require("./middleware/auth");
const requireManagementAccess = require("./middleware/requireManagementAccess");

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.PANEL_ORIGIN
  ? process.env.PANEL_ORIGIN.split(",").map((origin) => origin.trim())
  : "*";
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"] },
});

io.use(async (socket, next) => {
  const apiKey = process.env.BOT_API_KEY?.trim();
  const providedApiKey = socket.handshake.auth?.apiKey;
  if (apiKey && typeof providedApiKey === "string") {
    const expected = Buffer.from(apiKey);
    const provided = Buffer.from(providedApiKey);
    if (
      expected.length === provided.length &&
      crypto.timingSafeEqual(expected, provided)
    ) {
      socket.data.isBot = true;
      return next();
    }
  }

  const token = socket.handshake.auth?.token;
  if (typeof token !== "string" || !token) {
    return next(new Error("Não autenticado"));
  }

  try {
    socket.data.user = await auth.verifyIdToken(token);
    return next();
  } catch (error) {
    console.error("Token Socket.IO inválido:", error.code || error.message);
    return next(new Error("Não autenticado"));
  }
});

io.on("connection", (socket) => socket.join("tickets"));
app.set("io", io);

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
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
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

app.use("/bot/tickets", botTicketsRoutes);

// ================================
// API
// ================================

app.use(authenticate);

app.use("/tickets", ticketsRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/clientes", clientesRoutes);
app.use("/bots", botsRoutes);
app.use("/atividades", atividadesRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/usuarios", requireManagementAccess, usuariosRoutes);

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

server.listen(PORT, "0.0.0.0", () => {
  console.log("=================================");
  console.log("        DvS API ONLINE");
  console.log("=================================");
  console.log(`Porta: ${PORT}`);
  console.log("URL: https://dvsweb.discloud.app");
  console.log("=================================");
});