require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dashboardRoutes =
  require("./routes/dashboard");

const clientesRoutes =
  require("./routes/clientes");

const botsRoutes =
  require("./routes/bots");

const atividadesRoutes =
  require("./routes/atividades");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);

app.options("*", cors());

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "*"
  );

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );

  next();
});

app.get("/", (req, res) => {
  res.json({
    online: true,
  });
});

app.get("/dashboard/test", (req, res) => {
  res.json({ ok: true });
});

app.get("/ping", (req, res) => {
  res.json({
    message: "API OK",
    time: new Date(),
  });
});

app.use("/dashboard", dashboardRoutes);
app.use("/clientes", clientesRoutes);
app.use("/bots", botsRoutes);
app.use("/atividades", atividadesRoutes);

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("API ONLINE");
});