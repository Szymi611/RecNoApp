export default function Modal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div>
      <p>Please enter email to receive the video and transcript to your email</p>
      <label htmlFor="email">Email</label>
      <input type="email" name="email" id="eamil" />
      <button onClick={onClose}>Close</button>
    </div>
  );
}
