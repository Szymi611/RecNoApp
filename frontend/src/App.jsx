import "./App.css";
import { screenRecorder  } from "./utils/screenRecorder.js";



function App() {
  const handleStartRecording = () => {
    screenRecorder (5000);
  };

  return (
    <>
      <div className="App">
        <h1>Screen Recorder Test</h1>
        <button onClick={handleStartRecording}>Start 5s Recording</button>
      </div>
    </>
  );
}

export default App;
