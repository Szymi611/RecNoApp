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

export const stopScreenRecorder = () => {
  return new Promise((resolve, reject) => {
    if (!recorder) {
      console.log("No recording in progress");
      reject(new Error("No recording in progress"));
      return;
    }
    
    recorder.stop();
    console.log("Recorder stopped");

    recorder.onstop = async () => {
      try {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const file = new File([blob], "screen-recording.mp4", {
          type: "video/mp4",
        });

        const jobId = await sendRecordToBackend(file);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          stream = null;
        }

        chunks = [];
        recorder = null;

        console.log("Recording finalized");
        resolve(jobId);
      } catch (error) {
        console.error("Error finalizing recording:", error);
        reject(error);
      }
    };
  });
};

const sendRecordToBackend = async (file) => {
  const formData = new FormData();
  formData.append("video", file);
  console.log('Sending file:', file);

  try {
    const response = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || 'Failed to upload file');
    }

    const result = await response.json();
    console.log("File uploaded successfully:", result);
    
    if (!result.data?.jobId) {
      throw new Error('No jobId received from server');
    }
    
    return result.data.jobId;
  } catch (error) {
    console.error("Error during uploading file:", error);
    throw error;
  }
};
