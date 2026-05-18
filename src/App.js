import "./App.css";
import Main from "./components/main";
import Sql from "./components/MySQL";

import Dashboard from "./pages/Painel/Dashboard";
import Clientes from "./pages/Painel/Clientes";
import Bots from "./pages/Painel/Bots";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        {/* SITE */}
        <Route path="" element={<Main />} />
        <Route path="/contato" element={<Sql />} />

        {/* PAINEL */}
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/painel/clientes" element={<Clientes />} />
        <Route path="/painel/bots" element={<Bots />} />
      </Routes>
    </Router>
  );
}

export default App;

// npm start
// npm run build && npm run deploy