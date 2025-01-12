let recorder = null;
let chunks = [];
let stream = null;

export const startScreenRecorder = async () => {
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    recorder = new MediaRecorder(stream);
    chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.start();
    console.log("Recording started");
  } catch (err) {
    console.error("Error starting screen recording:", err);
  }
};

export const stopScreenRecorder = async () => {
  if (!recorder) {
    console.log("No recording in progress");
    return;
  }
  recorder.stop();
  console.log("Recorder stopped")

  recorder.onstop = async () => {
    try {
      const blob = new Blob(chunks, { type: "video/mp4" });
      const file = new File([blob], "screen-recording.mp4", {
        type: "video/mp4",
      });

      // Wysyłanie nagrania na backend
      await sendRecordToBackend(file);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }

      chunks = [];
      recorder = null;

      console.log("Recording finalized");
    } catch (error) {
      console.error("Error finilizing recording:", error);
    }
  };
};

const sendRecordToBackend = async (file) => {
  const formData = new FormData();
  formData.append("video", file);
  console.log(file)

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log("File uploaded successfully:", result);
    } else {
      console.error("Failed to upload file");
    }
  } catch (error) {
    console.error("Error during uploading file", error);
  }
};
