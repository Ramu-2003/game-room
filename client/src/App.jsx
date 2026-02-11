import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import RoomSettings from './pages/RoomSettings';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<RoomSettings />} />
          <Route path="/lobby/:roomId" element={<Lobby />} />
          <Route path="/game/:roomId" element={<GameRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
