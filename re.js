const player = document.querySelector(".audio-player");

const recorder = {
  videoSrc: null,
  stream:null,
  chunks:[],
  recorder:null,
  callback:null,
  voiceLength:0,
  isAutoStart:false,
  camera:{
    audio: {
      noiseSuppression: true, // 降噪
      echoCancellation: true // 回音消除
    },
    // 摄像头
    // video : {
    //   height:300,
    //   width:300,
    //   facingMode: "user" // 前置摄像头
    //   // facingMode: { exact: "environment" } // 后置摄像头
    // }
  },
  sourceType:{type:"audio/ogg; codecs=opus"},
  init: async () => {
    if(!recorder.stream) return;
    recorder.recorder = new MediaRecorder(recorder.stream);
    // 录制结束执行
    recorder.recorder.ondataavailable = (e) => {
      recorder.chunks = [e.data];
      recorder.callback && recorder.callback()
    }
    recorder.recorder.onstop = () => {
      let blob = new Blob(recorder.chunks,recorder.sourceType);
      recorder.chunks = [];
      let audioURL = window.URL.createObjectURL(blob);
      recorder.videoSrc = audioURL
      console.log(`audioURL===>`, audioURL)
      player.src = audioURL;
    };
  },
  start: async () => {
    if(!recorder.recorder){
      setTimeout(()=>{
        recorder.init()
        recorder.recorder &&  recorder.recorder.start()
      },500)
      return;
    }
    if(recorder.recorder.state === "recording"){
      recorder.stop(()=>{
        recorder.recorder.start()
      })
      console.log("录音结束");
      return;
    }
    console.log("录音中...");
    recorder.recorder.start()
  },
  stop: async (callback,voiceLength) => {
    recorder.callback = callback
    recorder.voiceLength = voiceLength
    recorder.recorder &&  recorder.recorder.stop()
  },
  upload: async (name) => {
    let blob = recorder.videoSrc;
    let data = new FormData()
    data.append("file",blob)
    data.append("name",name)
    let result = ''
    // let result = await axios.post(urls.uploads.video,data,{ "login-company-id":'2',})
    let url = result ? result.url || "" : ""
    return {
      resUrl: blob,
      url,
      voiceLength:recorder.voiceLength
    }
  },
  mediaSuccess: async (stream) => {
    recorder.stream = stream;
    recorder.init()
  },
  mediaError: async (error) => {
    let content = `访问用户媒体设备失败${error.name}, ${error.message}`
    alert(content)
  },
  getUserMedia: async (callback) => {
    let func = (stream)=>{
      recorder.mediaSuccess(stream)
      callback&&callback(stream)
    }
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
      navigator.mediaDevices.getUserMedia(recorder.camera).then(func).catch(recorder.mediaError);
      return;
    }

    let execFun = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia
    console.log(`execFun===>`, execFun)
    if(execFun){
      execFun(recorder.camera, func, recorder.mediaError)
    }else{
      alert('当前浏览器不支持访问用户媒体')
    }
  }
}

export default recorder
