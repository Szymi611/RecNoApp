import { useState } from "react";
export default function Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    setIsValid(value.includes('@') && value.length>6);

    console.log("User entered email:", value)
  }

  const handleEmailSend = async () => {
    try{
      const response = await fetch("http://localhost:3000/submit-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json();

      if(response.ok){
        setMessage("Email sent successfully");
        onClose();
      }else{
        setMessage(data.error);
      }
    }
    catch(error){
      console.error("Error sending email", error);
    }
  }

  return (
    <div>
      <p className="p-2">Please enter email to receive the video and lecture transcript</p>
      <label  htmlFor="email">Email</label>
      <input type="email" name="email" id="email" value={email} onChange={handleInputChange} placeholder="Enter your email"/>

      {message && <p className="color-red">{message}</p>}
      
      {isValid && <button className="p-2" onClick={handleEmailSend}>Send</button>}
      <button className="p-2" onClick={onClose}>Close</button>
    </div>
  );
}
