export const screenRecorder = async () => {
  try{
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true});
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if(event.data.size > 0){
        chunks.push(event.data);
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(chunks, {type: 'video/mp4'})

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screen-recording.mp4';
      a.click();
      URL.revokeObjectURL(url);

      //Wysłanie nagrania na backend
    }

    recorder.start();
    console.log('Recording started');

    setTimeout(() => {
      recorder.stop();
      console.log('Recording stopped');
    }, 5000);
  }
  catch(err){
    console.error(err)
  }
}