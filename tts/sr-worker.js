/* eSpeak NG voice engine loader (upstream: https://github.com/steveseguin/espeakng.js, GPL-3.0).
   Loads language data and script into this same-origin classic Worker.
   Mirrors avoid relying on deprecated Google Translate MP3 endpoints. */
(async function(){
  const bases=[
    'https://cdn.jsdelivr.net/gh/steveseguin/espeakng.js@master/js/',
    'https://raw.githubusercontent.com/steveseguin/espeakng.js/master/js/'
  ];
  let last=null;
  for(const base of bases){
    let dataURL=null;
    try {
      const response=await fetch(base+'espeakng.worker.data',{mode:'cors'});
      if(!response.ok)throw new Error('Voice data HTTP '+response.status);
      const bytes=await response.arrayBuffer();
      if(bytes.byteLength<100000)throw new Error('Voice data unexpectedly short');
      dataURL=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));
      self.Module={locateFile:function(filename){
        if(filename.endsWith('.data'))return dataURL;
        return base+filename;
      }};
      importScripts(base+'espeakng.worker.js');
      return;
    }catch(error){
      last=error;
      if(dataURL)URL.revokeObjectURL(dataURL);
    }
  }
  self.postMessage({type:'sr-tts-loader-error',message:String(last||'Сербский голос недоступен')});
})();