// Local Web Audio synthesis: no files, streaming, or network audio dependencies.
export function createSoundEngine({contextFactory=()=>new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'}),onState=()=>{},enabled=true}={}){
  let ctx=null,master=null,noiseBuffer=null,unlocking=null;
  let active=enabled;
  function notify(){onState({enabled:active,state:ctx?.state||'waiting'});}
  function init(){if(ctx)return;ctx=contextFactory();master=ctx.createGain();master.gain.value=.7;const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-14;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.16;master.connect(compressor).connect(ctx.destination);
    noiseBuffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;ctx.onstatechange=notify;
  }
  async function unlock(){if(!active){notify();return false;}try{init();if(ctx.state==='suspended'){unlocking ||= ctx.resume().finally(()=>unlocking=null);await unlocking;}notify();return ctx.state==='running';}catch{onState({enabled:active,state:'unavailable'});return false;}}
  function tone(f0,f1,length,volume=.3,type='sine',delay=0){const t=ctx.currentTime+.008+delay,o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(f1,12),t+length);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+length);o.connect(g).connect(master);o.start(t);o.stop(t+length+.025);o.onended=()=>{o.disconnect();g.disconnect();};}
  function noise(length,volume=.3,freq=1600,type='bandpass',delay=0){const t=ctx.currentTime+.008+delay,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuffer;f.type=type;f.frequency.value=freq;f.Q.value=.8;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+length);s.connect(f).connect(g).connect(master);s.start(t);s.stop(t+length+.025);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();};}
  function schedule(kind,tool=0){
    if(kind==='swing'){noise(tool===1?.27:.12,.16,tool===2?2500:950,'bandpass');if(tool===5)tone(110,430,.3,.18,'triangle');return;}
    if(kind==='attach'){tone(480,110,.17,.35,'sine');noise(.16,.25,700,'lowpass');return;}
    if(kind==='coin'||kind==='unlock'){const notes=kind==='unlock'?[523,659,784,1047]:[1050,1580];notes.forEach((n,i)=>tone(n,n,.12,.14,'sine',i*.065));return;}
    if(kind==='super'){noise(.65,.5,1200,'lowpass');tone(130,35,.65,.7,'triangle');[392,523,659,784].forEach((n,i)=>tone(n,n,.24,.2,'triangle',.12+i*.1));return;}
    if(kind==='wall'||kind==='floor'){tone(kind==='wall'?100:75,28,.22,.45,'sine');noise(.11,.22,kind==='wall'?850:400,'lowpass');return;}
    if(kind==='throw'){noise(.25,.18,1700,'bandpass');tone(550,180,.22,.12,'sine');return;}
    switch(tool){
      case 0: noise(.07,.55,1500);tone(160,42,.14,.55);break;
      case 1: tone(105,28,.38,.8,'triangle');noise(.2,.65,650,'lowpass');tone(880,370,.31,.16,'sine');break;
      case 2: noise(.16,.6,2300);tone(420,80,.15,.38,'triangle');tone(180,320,.08,.22,'sine',.05);break;
      case 3: noise(.085,.8,2400,'highpass');tone(270,75,.11,.32,'triangle');break;
      case 4: tone(185,48,.24,.7);noise(.05,.23,900);tone(900,630,.06,.08);break;
      case 5: tone(650,70,.2,.65);noise(.08,.55,600,'lowpass');tone(160,500,.07,.2,'triangle');break;
    }
  }
  function play(kind,tool=0){if(!active)return Promise.resolve(false);if(ctx?.state==='running'){schedule(kind,tool);return Promise.resolve(true);}return unlock().then(ok=>{if(ok&&active)schedule(kind,tool);return ok;});}
  function setEnabled(value){active=Boolean(value);if(master&&ctx)master.gain.setValueAtTime(active?.7:0,ctx.currentTime);notify();if(active)return unlock();return Promise.resolve(false);}
  notify();return {unlock,play,setEnabled,get enabled(){return active;},get state(){return ctx?.state||'waiting';}};
}
