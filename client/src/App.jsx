import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from '.src/pages/Home';
import RoomSettings from '.src/pages/RoomSettings';
import Lobby from '.src/pages/Lobby';
import GameRoom from '.src/pages/GameRoom';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="src/" element={<Home />} />
          <Route path="src/settings" element={<RoomSettings />} />
          <Route path="src/lobby/:roomId" element={<Lobby />} />
          <Route path="src/game/:roomId" element={<GameRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
