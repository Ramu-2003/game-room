import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';

function GameRoom() {
  const { roomId } = useParams();
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(180);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameStatus, setGameStatus] = useState("playing");
  const [myId, setMyId] = useState(socket.id);
  
  const expectedOutput = "Hello World\nThis is my first program in Game-Room";

  useEffect(() => {
    setMyId(socket.id);

    socket.on("game_over", ({ winnerId }) => {
      if (winnerId === 'tie') {
        setGameStatus("tie");
      } else if (winnerId === socket.id) {
        setGameStatus("won");
      } else {
        setGameStatus("lost");
      }
    });

    socket.on("code_correct", (status) => {
      setIsCorrect(status);
    });
    
    return () => {
      socket.off("game_over");
      socket.off("code_correct");
    };
  }, []);

  useEffect(() => {
    if (gameStatus !== "playing") return;
    if (timeLeft <= 0) {
        setGameStatus("lost");
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameStatus]);

  const handleCompile = () => {
    if(code.trim() === expectedOutput) {
        setIsCorrect(true);
    } else {
        setIsCorrect(false);
    }
  };

  const handleSubmit = () => {
    socket.emit("submit_code", { roomId, code });
  };

  if (gameStatus === "won") return <div className="card"><h1>🎉 You Win!</h1></div>;
  if (gameStatus === "lost") return <div className="card"><h1>😢 You Lost!</h1></div>;
  if (gameStatus === "tie") return <div className="card"><h1>🤝 It's a Tie!</h1></div>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', padding: '10px', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, margin: '5px', background: '#2d2d2d', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h3>Player A (You)</h3>
            <h3 style={{color: '#4caf50'}}>⏱ {formatTime(timeLeft)}</h3>
        </div>
        
        <div style={{ background: '#1e1e1e', padding: '10px', borderRadius: '5px', marginBottom: '10px', textAlign: 'left' }}>
          <small style={{color: '#aaa'}}>Challenge: Print the text exactly.</small>
        </div>

        <textarea 
          style={{ flex: 1, width: '100%', background: '#1e1e1e', color: '#fff', border: '1px solid #444', padding: '10px', resize: 'none', fontSize: '16px' }}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your HTML/Text here..."
        />

        <div style={{ marginTop: '10px' }}>
            <button onClick={() => alert(expectedOutput)}>Preview Expected</button>
            <button onClick={handleCompile} style={{backgroundColor: '#2196f3'}}>Compile</button>
            
            {isCorrect === true && <span style={{color: '#4caf50', marginLeft: '10px'}}>✔ Correct!</span>}
            {isCorrect === false && <span style={{color: '#f44336', marginLeft: '10px'}}>✘ Wrong Output</span>}
            
            <br/>
            <button 
                onClick={handleSubmit} 
                disabled={!isCorrect} 
                style={{backgroundColor: isCorrect ? '#ff9800' : '#555', marginTop: '10px', fontSize: '20px', padding: '15px', width: '100%'}}
            >
                SUBMIT
            </button>
        </div>
      </div>

      <div style={{ flex: 1, margin: '5px', background: '#222', padding: '20px', borderRadius: '10px', opacity: 0.7 }}>
        <h3>Player B</h3>
        <div style={{ background: '#1a1a1a', height: '80%', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{color: '#555'}}>Opponent Coding Area</span>
        </div>
      </div>
    </div>
  );
}

export default GameRoom;
