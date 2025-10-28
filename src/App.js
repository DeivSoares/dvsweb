import "./App.css";
// import Analytics from "./Analytics";
import Main from "./components/main";
import Navbar from "./components/navbar";
import Teste from "./pages/Flow/Teste";
import Sql from "./components/MySQL";
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      {/* <Analytics /> */}
      {/* Descomentar pra continuar codando */}
      <Navbar />
      <Routes>
        <Route path="" element={<Main />} />
        <Route path="/sobre" element={<Teste />} />
        <Route path="/contato" element={<Sql />} />
      </Routes>
    </Router>
  );
}

export default App;

// npm start
// npm run build && npm run deploy
