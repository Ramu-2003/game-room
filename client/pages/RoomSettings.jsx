import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import socket from '../socket';

function RoomSettings() {
  const [timeLimit, setTimeLimit] = useState(3);
  const navigate = useNavigate();

  const handleConfirm = () => {
    const roomId = nanoid(4); // e.g., A7XQ
    const password = nanoid(6); // e.g., 12ab34
    
    // Listen for creation confirmation once
    socket.once("room_created", (data) => {
      navigate(`/lobby/${data.roomId}`, { state: { isHost: true, password: data.password, timeLimit } });
    });

    socket.emit("create_room", { roomId, password, timeLimit });
  };

  return (
    <div className="card">
      <h2>Room Settings</h2>
      
      <div style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px', marginTop: '20px', textAlign: 'left' }}>
        <h3>Challenge Preview:</h3>
        <p style={{ fontFamily: 'monospace', color: '#0f0' }}>
          Hello World<br/>
          This is my first program in Game-Room
        </p>
        <small>Players must print the above output exactly to win.</small>
      </div>

      <div style={{ marginTop: '20px' }}>
        <label>Time Limit (Minutes): </label>
        <select value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
        </select>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button onClick={handleConfirm}>Confirm</button>
        <button style={{backgroundColor: '#f44336'}} onClick={() => navigate('/')}>Decline</button>
      </div>
    </div>
  );
}

export default RoomSettings;