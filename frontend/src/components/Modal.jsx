import { useState } from "react";
export default function Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    setIsValid(value.includes('@') && value.length>6);
  }

  return (
    <div>
      <p className="p-2">Please enter email to receive the video and lecture transcript</p>
      <label  htmlFor="email">Email</label>
      <input type="email" name="email" id="email" value={email} onChange={handleInputChange} placeholder="Enter your email"/>

      {isValid && <button className="p-2" onClick={onClose}>Send</button>}
      <button className="p-2" onClick={onClose}>Close</button>
    </div>
  );
}
