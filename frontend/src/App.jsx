import "./App.css";
import { screenRecorder } from "./utils/screenRecorder.js";
import Modal from "./components/Modal.jsx";
import { useState } from "react";

function App() {
  const handleStartRecording = () => {
    screenRecorder(5000);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="App">
      <h1>Screen Recorder Test</h1>
      <button onClick={handleStartRecording}>Start 5s Recording</button>
      <button onClick={handleOpenModal}>Send Video</button>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default App;
