import "./App.css";
import Main from "./components/main";
import Sql from "./components/MySQL";

import Dashboard from "./pages/Painel/Dashboard";
import Clientes from "./pages/Painel/Clientes";
import Bots from "./pages/Painel/Bots";
import Financeiro from "./pages/Painel/Financeiro";
import Configuracoes from "./pages/Painel/Configuracoes";
import Login from "./pages/Login/Login";
import ProtectedRoute, { ManagementRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./services/AuthContext";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
        {/* SITE */}
        <Route path="" element={<Main />} />
        <Route path="/contato" element={<Sql />} />
        <Route path="/login" element={<Login />} />

        {/* PAINEL */}
        <Route element={<ProtectedRoute />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/painel/clientes" element={<Clientes />} />
          <Route path="/painel/bots" element={<Bots />} />
          <Route element={<ManagementRoute />}>
            <Route path="/painel/financeiro" element={<Financeiro />} />
            <Route path="/painel/configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

// npm start
// npm run build && npm run deploy