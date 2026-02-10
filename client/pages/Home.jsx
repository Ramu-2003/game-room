import { useNavigate } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div style={{ marginBottom: '20px' }}>
        <FaUsers size={80} color="#4caf50" />
      </div>
      <h1>GAME-ROOM</h1>
      <p>Real-time Coding Battle</p>
      
      <div style={{ marginTop: '30px' }}>
        <button onClick={() => navigate('/settings')}>Create Room</button>
        <button onClick={() => navigate('/settings')}>Join Room</button>
      </div>
    </div>
  );
}

export default Home;