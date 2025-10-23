import './App.css';
import Main from './components/main';
import Navbar from './components/navbar'; // ajuste o caminho conforme sua pasta
import Teste from './pages/Teste';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="" element={<Main />} />
        <Route path="/sobre" element={<Teste />} />
      </Routes>
    </Router>
  );
}

export default App;

// npm start
// npm run build && npm run deploy
