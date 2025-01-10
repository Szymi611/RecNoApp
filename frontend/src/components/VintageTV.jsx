import React from "react";
import { screenRecorder } from "../utils/screenRecorder.js";
import Modal from "../components/Modal.jsx";
import CircleButton from "./CircleButton.jsx";
import { useState } from "react";
import "../App.css";

const divs = [];
const recordTime = 300000;

for (let i = 0; i < 6; i++) {
  divs.push(
    <div
      key={i}
      className="bg-wood bg-cover bg-center shadow-inner-lg w-[100px] h-[502px] "
    ></div>
  );
}

const VintageTV = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartRecording = () => {
    screenRecorder(recordTime);
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    screenRecorder
  }

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="absolute top-[100px] left-[850px] w-[220px] h-[2px] bg-gray-500 transform rotate-45"></div>
      <div className="absolute top-[100px] left-[915px] w-[180px] h-[2px] bg-gray-500 transform rotate-[-45deg]"></div>
      <div className="flex border-4 border-black rounded shadow-lg relative">
        <div className="flex border-2 border-black border-r-4">{divs}</div>

        <div className="shadow-inner">
          <div className="bg-nosignal w-[500px] h-[400px] absolute inset-0 transform translate-x-[50px] translate-y-[50px] rounded-lg border-4 border-black"></div>
        </div>

        <div className="bg-coalBlack shadow w-[200px] h-[505px] flex flex-col items-center justify-center">
          {isRecording ? (
            <CircleButton onClick={handleStartRecording}>Stop</CircleButton>
          ) : (
            <CircleButton onClick={handleStartRecording}>Start</CircleButton>
          )}

          <CircleButton onClick={handleOpenModal}>Send Video</CircleButton>
          <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
        </div>
      </div>
    </div>
  );
};

export default VintageTV;
