require("dotenv").config();

const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboard");
const clientesRoutes = require("./routes/clientes");
const botsRoutes = require("./routes/bots");
const atividadesRoutes = require("./routes/atividades");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://dvsweb.com.br",
    ],
  })
);

app.use("/dashboard", dashboardRoutes);
app.use("/clientes", clientesRoutes);
app.use("/bots", botsRoutes);
app.use("/atividades", atividadesRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("API ONLINE");
});