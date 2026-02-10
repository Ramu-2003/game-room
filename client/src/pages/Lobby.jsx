import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import socket from '../socket';

function Lobby() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isHost = location.state?.isHost || false;
  const [password, setPassword] = useState(location.state?.password || '');
  const [playerCount, setPlayerCount] = useState(isHost ? 1 : 0);
  const [joined, setJoined] = useState(isHost);

  useEffect(() => {
    if (!isHost) {
       const pw = prompt("Enter Room Password");
       if(pw) {
           setPassword(pw);
           socket.emit("join_room", { roomId, password: pw });
       } else {
           navigate('/');
       }
    }
  }, [isHost, roomId, navigate]);

  useEffect(() => {
    socket.on("update_players", (data) => {
      setPlayerCount(data.count);
    });

    socket.on("error_message", (msg) => {
      alert(msg);
      navigate('/');
    });

    socket.on("game_started", () => {
      navigate(`/game/${roomId}`);
    });

    return () => {
      socket.off("update_players");
      socket.off("error_message");
      socket.off("game_started");
    };
  }, [roomId, navigate]);

  const handleStart = () => {
    socket.emit("start_game", roomId);
  };

  return (
    <div className="card">
      <h2>Lobby</h2>
      <div style={{ margin: '20px 0', backgroundColor: '#333', padding: '10px', borderRadius: '5px' }}>
        <p><strong>Room ID:</strong> {roomId}</p>
        <p><strong>Password:</strong> {password}</p>
      </div>
      
      <h3>Players Joined: {playerCount} / 2</h3>
      
      {playerCount < 2 ? (
        <p style={{color: '#ff9800'}}>Waiting for another player...</p>
      ) : (
        <p style={{color: '#4caf50'}}>Room is full!</p>
      )}

      {isHost && (
        <button disabled={playerCount < 2} onClick={handleStart}>
          Start Game
        </button>
      )}
    </div>
  );
}

export default Lobby;
