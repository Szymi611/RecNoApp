import React from "react";

const CircleButton = ({ onClick, children }) => {
  return (
    <div className="flex items-center justify-center m-4 w-24 h-24 bg-gray-600 rounded-full shadow-inner border-4 border-gray-400 transition-transform duration-1000 transform hover:rotate-[90deg] active:rotate-[70deg] hover:scale-110 hover:bg-gray-500">
      <button
        className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
        onClick={onClick}
      >
        <div className="flex items-center justify-center w-full h-full text-center">
          {children}
        </div>
      </button>
    </div>
  );
};

export default CircleButton;
