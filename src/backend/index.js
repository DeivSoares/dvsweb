const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // seu usuário do MySQL
  password: '@DvSWeb9947#',       // sua senha do MySQL
  database: 'teste'   // seu banco de dados
});

// Testar conexão
db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao MySQL!');
});

// Endpoint para listar todas as tabelas
app.get("/tabelas", (req, res) => {
  const query = `SHOW TABLES`; // Lista todas as tabelas do banco "teste"
  db.query(query, (err, results) => {
    if (err) return res.status(500).json(err);

    // results = [{ 'Tables_in_teste': 'mortes' }, {...}]
    const tabelas = results.map(row => Object.values(row)[0]);
    res.json(tabelas);
  });
});

// Endpoint dinâmico para buscar dados de uma tabela específica
app.get("/logs/:tabela", (req, res) => {
  const tabela = req.params.tabela;

  if (!/^[a-zA-Z0-9_]+$/.test(tabela)) {
    return res.status(400).json({ error: "Tabela inválida" });
  }

  const query = `SELECT * FROM \`${tabela}\``;

  db.query(query, (err, results) => {
    if (err) {
      if (err.code === "ER_NO_SUCH_TABLE") {
        return res.status(400).json({ error: "Tabela inválida" });
      }
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

app.listen(3001, () => console.log("Servidor rodando na porta 3001"));