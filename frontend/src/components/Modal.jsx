import { useState } from "react";

export default function Modal({ isOpen, onClose, jobId }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(value.includes('@') && value.length > 6);
  }

  const handleEmailSend = async () => {
    try {
      const response = await fetch("http://localhost:3000/submit-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, jobId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Email sent successfully");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage(data.message || "Error sending email");
      }
    } catch (error) {
      console.error("Error sending email", error);
      setMessage("Error sending email");
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-black p-6 rounded-lg shadow-xl">
        <p className="mb-4">Please enter email to receive the video and lecture transcript</p>
        
        <div className="mb-4">
          <label className="block mb-2" htmlFor="email">Email</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            value={email} 
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        {message && (
          <p className={`mb-4 ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>
            {message}
          </p>
        )}
        
        <div className="flex justify-end gap-2">
          {isValid && (
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleEmailSend}
            >
              Send
            </button>
          )}
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}