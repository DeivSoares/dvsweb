const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({ origin: "https://localhost:3000" }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@DvSWeb9947#',
  database: 'dvsweb'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao MySQL!');
});

// Lista todas as tabelas
app.get("/tabelas", (req, res) => {
  db.query("SHOW TABLES", (err, results) => {
    if (err) return res.status(500).json(err);
    const tabelas = results.map(row => Object.values(row)[0]);
    if (!tabelas.length) return res.status(404).json({ error: "Nenhuma tabela encontrada" });
    res.json(tabelas);
  });
});

// Buscar dados de uma tabela específica
app.get("/logs/:tabela", (req, res) => {
  const tabela = req.params.tabela;
  if (!/^[a-zA-Z0-9_]+$/.test(tabela)) return res.status(400).json({ error: "Tabela inválida" });
  db.query(`SELECT * FROM \`${tabela}\``, (err, results) => {
    if (err) {
      if (err.code === "ER_NO_SUCH_TABLE") return res.status(400).json({ error: "Tabela inválida" });
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));
