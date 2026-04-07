/**
 * DevKay Harmonium — app.js  (v4)
 * Features: Tuning temperament, Harmonic overtone mixer, Raag time-of-day,
 * Alap/Jod/Jhala, Taal metronome, Piano roll, MIDI export, WAV export,
 * Session save/load, Mobile landscape layout.
 */
"use strict";

/* ─── Constants ──────────────────────────────────────────────────── */
const WESTERN = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTE_TO_SARGAM = { C:"Sa","C#":"re",D:"Re","D#":"ga",E:"Ga",F:"Ma","F#":"Ma#",G:"Pa","G#":"dha",A:"Dha","A#":"ni",B:"Ni" };
const BASE_FREQ=146.832, LOOP_START=7.20, LOOP_END=9.20, ATTACK_S=0.025, WAV_PATH="harmonium-kannan-orig.wav";

/* ── Tuning temperaments — cent offsets per semitone (C=0) ── */
const TEMPERAMENTS = {
  equal:  { name:"Equal (12-TET)",      offsets:[0,0,0,0,0,0,0,0,0,0,0,0] },
  just:   { name:"Just Intonation",     offsets:[0,-29.3,3.9,15.6,-13.7,-2,11.7,2,-27.4,-15.6,17.6,-11.7] },
  pyth:   { name:"Pythagorean",         offsets:[0,-23.5,3.9,21.5,-5.9,9.8,-13.7,2,-21.5,5.9,19.5,-7.8] },
  mean:   { name:"Meantone (¼-comma)",  offsets:[0,-24.1,-6.8,10.3,13.7,-3.4,6.8,3.4,-20.5,-3.4,13.7,6.8] },
  shruti: { name:"Shruti (22-sruti)",   offsets:[0,-22,4,16,-14,-2,12,2,-20,-14,18,-12] },
};

/* ── Raags with time-of-day ── */
const RAAGS = {
  off:     { name:"All Notes",  aroh:"All", avroh:"All", allowed:WESTERN, vadi:null, samvadi:null, pakad:"Free play", desc:"No restriction. All keys active.", time:null, timeLabel:"Any time" },
  bhairav: { name:"Bhairav",   aroh:"Sa re Ga Ma Pa dha Ni Sa'", avroh:"Sa' Ni dha Pa Ma Ga re Sa", allowed:["C","C#","E","F","G","G#","B"],  vadi:"F",  samvadi:"C", pakad:"Sa re Ga Ma, Pa dha Pa, Ga Ma re Sa", desc:"Dawn raag — grave, devotional, associated with Lord Shiva.", time:[4,8],   timeLabel:"Dawn (4–8 AM)" },
  bilawal: { name:"Bilawal",   aroh:"Sa Re Ga Ma Pa Dha Ni Sa'",avroh:"Sa' Ni Dha Pa Ma Ga Re Sa",  allowed:["C","D","E","F","G","A","B"],   vadi:"D",  samvadi:"G", pakad:"Sa Ga Ma Pa, Dha Pa Ga Ma Re Sa",      desc:"Morning raag — natural scale, serene and pure.",            time:[6,10],  timeLabel:"Morning (6–10 AM)" },
  kafi:    { name:"Kafi",      aroh:"Sa Re ga Ma Pa Dha ni Sa'",avroh:"Sa' ni Dha Pa Ma ga Re Sa",   allowed:["C","D","D#","F","G","A","A#"], vadi:"F",  samvadi:"C", pakad:"Sa Re ga Ma Pa, Dha ni Dha Pa, Ma ga Re Sa", desc:"Afternoon raag. Komal Ga & Ni. Holi festival mood.",     time:[12,16], timeLabel:"Afternoon (12–4 PM)" },
  bhupali: { name:"Bhupali",   aroh:"Sa Re Ga Pa Dha Sa'",      avroh:"Sa' Dha Pa Ga Re Sa",         allowed:["C","D","E","G","A"],          vadi:"G",  samvadi:"D", pakad:"Sa Re Ga, Pa Ga, Dha Pa, Ga Re Sa",    desc:"Evening pentatonic raag — gentle, blissful character.",     time:[16,20], timeLabel:"Evening (4–8 PM)" },
  yaman:   { name:"Yaman",     aroh:"Ni Re Ga Ma# Pa Dha Ni Sa'",avroh:"Sa' Ni Dha Pa Ma# Ga Re Sa",allowed:["C","D","E","F#","G","A","B"], vadi:"G",  samvadi:"D", pakad:"Ni Re Ga, Re Ga, Pa, Ma# Ga Re Ni",    desc:"Evening raag — teevra Ma, romantic and expansive mood.",    time:[18,22], timeLabel:"Evening (6–10 PM)" },
  durga:   { name:"Durga",     aroh:"Sa Re Ma Pa Dha Sa'",      avroh:"Sa' Dha Pa Ma Re Sa",         allowed:["C","D","F","G","A"],          vadi:"F",  samvadi:"C", pakad:"Sa Re Ma, Pa Dha, Ma Re, Dha Sa",      desc:"Night pentatonic raag — powerful and serene.",              time:[19,23], timeLabel:"Night (7–11 PM)" },
  bhairavi:{ name:"Bhairavi",  aroh:"Sa re ga Ma Pa dha ni Sa'",avroh:"Sa' ni dha Pa Ma ga re Sa",   allowed:["C","C#","D#","F","G","G#","A#"],vadi:"F",samvadi:"C", pakad:"Sa re ga, Ma Pa dha, ni dha Pa, Ma ga re Sa",desc:"End-of-concert raag — five komal swaras, pathos.",       time:[5,9],   timeLabel:"Dawn (5–9 AM)" },
};

/* ── Taal definitions ── */
const TAALS = {
  teentaal:{ name:"Teentaal (16)", beats:16, sam:0, vibhag:[4,4,4,4], khali:[8] },
  ektaal:  { name:"Ektaal (12)",   beats:12, sam:0, vibhag:[2,2,2,2,2,2], khali:[6,8] },
  jhaptaal:{ name:"Jhaptaal (10)", beats:10, sam:0, vibhag:[2,3,2,3], khali:[6] },
  keherwa: { name:"Keherwa (8)",   beats:8,  sam:0, vibhag:[4,4], khali:[4] },
  rupak:   { name:"Rupak (7)",     beats:7,  sam:0, vibhag:[3,2,2], khali:[] },
  dadra:   { name:"Dadra (6)",     beats:6,  sam:0, vibhag:[3,3], khali:[3] },
};

/* ── Alap/Jod/Jhala ── */
const PHASES = {
  alap:{ name:"Alap",  icon:"🌅", desc:"Free tempo — no rhythm. Slowly introduce each note of the raag from Sa upward. Hold, explore, breathe." },
  jod: { name:"Jod",   icon:"🌊", desc:"Steady pulse enters without fixed taal. Rhythmic phrases, explore the full octave range." },
  jhala:{ name:"Jhala",icon:"⚡", desc:"Fast rhythmic climax — rapid cross-note patterns, high energy. Conclusion of the raga performance." },
};

/* ── Harmonic overtone presets ── */
const OVERTONE_PRESETS = {
  natural:{ name:"Natural Reed", h:[1,0.6,0.4,0.25,0.15,0.1,0.05,0.03] },
  bright: { name:"Bright",       h:[1,0.8,0.6,0.5,0.4,0.3,0.2,0.1] },
  mellow: { name:"Mellow",       h:[1,0.3,0.1,0.05,0.02,0,0,0] },
  organ:  { name:"Organ",        h:[1,0,0.8,0,0.6,0,0.4,0] },
  flute:  { name:"Flute",        h:[1,0.1,0,0,0,0,0,0] },
};

const KEYBOARD_MAP = [
  {key:"`",step:-1},{key:"q",step:0},{key:"w",step:2},{key:"e",step:4},
  {key:"r",step:5},{key:"t",step:7},{key:"y",step:9},{key:"u",step:11},
  {key:"i",step:12},{key:"o",step:14},{key:"p",step:16},{key:"[",step:17},
  {key:"]",step:19},{key:"\\",step:21},
  {key:"1",step:1},{key:"2",step:3},{key:"4",step:6},{key:"5",step:8},
  {key:"7",step:10},{key:"8",step:13},{key:"9",step:15},{key:"-",step:18},{key:"=",step:20},
];

const LESSONS = [
  {id:"srgm",    name:"Basic Sargam",    notes:["C4","D4","E4","F4","G4","A4","B4","C5","B4","A4","G4","F4","E4","D4","C4"]},
  {id:"bhupali", name:"Bhupali Pattern", notes:["C4","D4","E4","G4","A4","G4","E4","D4","C4","D4","E4","G4"]},
  {id:"yaman",   name:"Yaman Flow",      notes:["B3","D4","E4","F#4","G4","A4","B4","A4","G4","F#4","E4","D4","C4"]},
  {id:"bhairav", name:"Bhairav Alap",    notes:["C4","C#4","E4","F4","G4","G#4","B4","G#4","G4","F4","E4","C#4","C4"]},
];

/* ─── State ──────────────────────────────────────────────────────── */
const state = {
  octave:4, scaleSemi:0, rootOctave:4, finetune:0,
  sustain:1200, volume:0.8, reverb:0.2,
  drone:false, raag:"off", raagRestrict:true,
  activeNotes:new Map(), droneNodes:[],
  recording:false, recorded:[], recordStart:null,
  lesson:LESSONS[0], lessonIndex:0, lessonHits:0, lessonAttempts:0,
  micActive:false,
  reedBrightness:50, reedChorus:0, reedTremolo:0, reedTremoloRate:5, reedSubOctave:0, reedChime:false,
  temperament:"equal",
  overtones:[1,0.6,0.4,0.25,0.15,0.1,0.05,0.03],
  phase:"alap",
  taal:"teentaal", taalBPM:80, taalRunning:false,
  pianoRoll:[],
};

/* ─── Audio globals ──────────────────────────────────────────────── */
let audioCtx=null, harmoniumBuf=null, masterGain=null;
let reverbNode=null, reverbGain=null, dryGain=null;
let toneFilter=null, tremoloGain=null, tremoloLFO=null, tremoloDepth=null, reedBus=null;
let vizAnalyser=null, micStream=null, rafId=null, vizRafId=null;
let midiAccess=null;
let taalInterval=null, taalBeat=0;

/* ─── Audio init ─────────────────────────────────────────────────── */
function buildIR(ctx,dur=2.2,dec=3.5){
  const len=Math.floor(ctx.sampleRate*dur), buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,dec);}
  return buf;
}

async function initAudio(){
  if(audioCtx) return;
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  masterGain=audioCtx.createGain(); masterGain.gain.value=state.volume;

  reedBus=audioCtx.createGain(); reedBus.gain.value=1.0;
  toneFilter=audioCtx.createBiquadFilter(); toneFilter.type="peaking"; toneFilter.Q.value=0.8; updateReedTone();
  tremoloGain=audioCtx.createGain(); tremoloGain.gain.value=1.0;
  tremoloLFO=audioCtx.createOscillator(); tremoloLFO.type="sine"; tremoloLFO.frequency.value=state.reedTremoloRate;
  tremoloDepth=audioCtx.createGain(); tremoloDepth.gain.value=0;
  tremoloLFO.connect(tremoloDepth); tremoloDepth.connect(tremoloGain.gain); tremoloLFO.start();
  reedBus.connect(toneFilter); toneFilter.connect(tremoloGain); tremoloGain.connect(masterGain);

  reverbNode=audioCtx.createConvolver(); reverbNode.buffer=buildIR(audioCtx);
  reverbGain=audioCtx.createGain(); reverbGain.gain.value=state.reverb;
  dryGain=audioCtx.createGain(); dryGain.gain.value=1-state.reverb*0.5;
  masterGain.connect(dryGain); masterGain.connect(reverbNode);
  reverbNode.connect(reverbGain); dryGain.connect(audioCtx.destination); reverbGain.connect(audioCtx.destination);

  vizAnalyser=audioCtx.createAnalyser(); vizAnalyser.fftSize=2048; masterGain.connect(vizAnalyser);
  startVizLoop();

  document.getElementById("startAudioBtn").textContent="Loading sample…";
  document.getElementById("engineBadge").textContent="⏳ Fetching WAV…";
  try{
    const resp=await fetch(WAV_PATH); if(!resp.ok) throw new Error("HTTP "+resp.status);
    harmoniumBuf=await audioCtx.decodeAudioData(await resp.arrayBuffer());
    document.getElementById("startAudioBtn").textContent="✓ Audio Ready";
    document.getElementById("sampleStatus").textContent="D3 loaded";
    document.getElementById("engineBadge").textContent=`✓ Real sample · ${harmoniumBuf.duration.toFixed(1)} s · ${harmoniumBuf.sampleRate} Hz`;
    document.getElementById("engineBadge").classList.add("ready");
    if(state.drone) activateDrone();
  }catch(err){
    document.getElementById("sampleStatus").textContent="load error";
    document.getElementById("engineBadge").textContent="⚠ Sample load failed — check WAV path";
    document.getElementById("startAudioBtn").textContent="Error";
  }
}

/* ─── Temperament ────────────────────────────────────────────────── */
function tempAdjustedFreq(midi){
  const semi=((midi%12)+12)%12;
  const cents=TEMPERAMENTS[state.temperament].offsets[semi]||0;
  return 440*Math.pow(2,(midi-69)/12)*Math.pow(2,cents/1200);
}

/* ─── Reed helpers ───────────────────────────────────────────────── */
function updateReedTone(){
  if(!toneFilter) return;
  const b=state.reedBrightness;
  if(b<=50){toneFilter.type="lowshelf"; toneFilter.frequency.value=1200; toneFilter.gain.value=(b-50)*0.3;}
  else{toneFilter.type="highshelf"; toneFilter.frequency.value=2500; toneFilter.gain.value=(b-50)*0.3;}
}
function updateReedTremolo(){
  if(!tremoloDepth||!tremoloLFO) return;
  tremoloDepth.gain.setTargetAtTime(state.reedTremolo/100*0.35,audioCtx.currentTime,0.05);
  tremoloLFO.frequency.setTargetAtTime(state.reedTremoloRate,audioCtx.currentTime,0.05);
}

/* ─── Play / Release ─────────────────────────────────────────────── */
function midiToFreq(midi){return 440*Math.pow(2,(midi-69)/12);}
function noteNameToMidi(n){const m=n.match(/^([A-G]#?)(-?\d+)$/);if(!m)return 60;return(parseInt(m[2])+1)*12+WESTERN.indexOf(m[1]);}
function midiToName(midi){return WESTERN[midi%12]+(Math.floor(midi/12)-1);}
function stripOct(n){return n.replace(/[-\d]/g,"");}
function totalTranspose(){const rootMidi=(state.rootOctave+1)*12+state.scaleSemi;return(rootMidi-60)+state.finetune+(state.octave-4)*12;}
function applyTransposedMidi(base){return base+totalTranspose();}
function scaleLabel(){return WESTERN[state.scaleSemi]+state.rootOctave;}

function playMidi(midi){
  if(!audioCtx||!harmoniumBuf) return;
  if(state.activeNotes.has(midi)) return;
  const freq=tempAdjustedFreq(midi), baseRate=freq/BASE_FREQ, now=audioCtx.currentTime;

  const src=audioCtx.createBufferSource();
  src.buffer=harmoniumBuf; src.playbackRate.value=baseRate;
  src.loop=true; src.loopStart=LOOP_START; src.loopEnd=LOOP_END;
  const gainNode=audioCtx.createGain();
  gainNode.gain.setValueAtTime(0,now); gainNode.gain.linearRampToValueAtTime(0.75,now+ATTACK_S);
  src.connect(gainNode); gainNode.connect(reedBus); src.start(0,0);

  // Harmonic overtones
  const hOscs=[];
  state.overtones.forEach((amp,i)=>{
    if(i===0||amp<0.01) return;
    const osc=audioCtx.createOscillator(); osc.type="sine"; osc.frequency.value=freq*(i+1);
    const hg=audioCtx.createGain(); hg.gain.setValueAtTime(0,now); hg.gain.linearRampToValueAtTime(amp*0.28,now+ATTACK_S*1.5);
    osc.connect(hg); hg.connect(reedBus); osc.start(); hOscs.push({osc,hg});
  });

  let chorusSrc=null;
  if(state.reedChorus>0){
    const cr=baseRate*Math.pow(2,state.reedChorus*0.25/1200);
    chorusSrc=audioCtx.createBufferSource(); chorusSrc.buffer=harmoniumBuf; chorusSrc.playbackRate.value=cr;
    chorusSrc.loop=true; chorusSrc.loopStart=LOOP_START; chorusSrc.loopEnd=LOOP_END;
    const cg=audioCtx.createGain(); cg.gain.setValueAtTime(0,now); cg.gain.linearRampToValueAtTime(state.reedChorus/100*0.55,now+ATTACK_S+0.01);
    chorusSrc.connect(cg); cg.connect(reedBus); chorusSrc.start(0,0);
  }
  let subSrc=null;
  if(state.reedSubOctave>0){
    subSrc=audioCtx.createBufferSource(); subSrc.buffer=harmoniumBuf; subSrc.playbackRate.value=baseRate*0.5;
    subSrc.loop=true; subSrc.loopStart=LOOP_START; subSrc.loopEnd=LOOP_END;
    const sf=audioCtx.createBiquadFilter(); sf.type="lowpass"; sf.frequency.value=900;
    const sg=audioCtx.createGain(); sg.gain.setValueAtTime(0,now); sg.gain.linearRampToValueAtTime(state.reedSubOctave/100*0.6,now+ATTACK_S+0.02);
    subSrc.connect(sf); sf.connect(sg); sg.connect(reedBus); subSrc.start(0,0);
  }
  let chimeSrc=null;
  if(state.reedChime){
    chimeSrc=audioCtx.createBufferSource(); chimeSrc.buffer=harmoniumBuf; chimeSrc.playbackRate.value=baseRate*2;
    chimeSrc.loop=true; chimeSrc.loopStart=LOOP_START; chimeSrc.loopEnd=LOOP_END;
    const cf=audioCtx.createBiquadFilter(); cf.type="highpass"; cf.frequency.value=1800;
    const chg=audioCtx.createGain(); chg.gain.setValueAtTime(0,now); chg.gain.linearRampToValueAtTime(0.18,now+ATTACK_S+0.015);
    chimeSrc.connect(cf); cf.connect(chg); chg.connect(reedBus); chimeSrc.start(0,0);
  }

  const startMs=state.recording?(performance.now()-state.recordStart):null;
  state.activeNotes.set(midi,{src,gainNode,chorusSrc,subSrc,chimeSrc,hOscs,startMs});
}

function releaseMidi(midi){
  const node=state.activeNotes.get(midi); if(!node) return;
  const{src,gainNode,chorusSrc,subSrc,chimeSrc,hOscs}=node;
  const now=audioCtx.currentTime, fadeS=state.sustain/1000;
  gainNode.gain.cancelScheduledValues(now); gainNode.gain.setValueAtTime(gainNode.gain.value,now); gainNode.gain.linearRampToValueAtTime(0,now+fadeS);
  hOscs.forEach(({hg})=>{hg.gain.cancelScheduledValues(now); hg.gain.setValueAtTime(hg.gain.value,now); hg.gain.linearRampToValueAtTime(0,now+fadeS);});
  const stop=s=>{if(s)try{s.stop(now+fadeS+0.05);}catch(_){}};
  stop(src); stop(chorusSrc); stop(subSrc); stop(chimeSrc);
  hOscs.forEach(({osc})=>{try{osc.stop(now+fadeS+0.05);}catch(_){}});

  if(state.recording&&node.startMs!==null){
    const dur=performance.now()-state.recordStart-node.startMs;
    state.pianoRoll.push({midi,start:node.startMs,end:node.startMs+dur});
    drawPianoRoll();
  }
  state.activeNotes.delete(midi);
}

/* ─── Drone ──────────────────────────────────────────────────────── */
function activateDrone(){
  if(!audioCtx||!harmoniumBuf) return; deactivateDrone();
  const root=(state.rootOctave+1)*12+state.scaleSemi+state.finetune;
  [root,root+7,root+12].forEach((midi,i)=>{
    const s=audioCtx.createBufferSource(); s.buffer=harmoniumBuf;
    s.playbackRate.value=tempAdjustedFreq(midi)/BASE_FREQ;
    s.loop=true; s.loopStart=LOOP_START; s.loopEnd=LOOP_END;
    const g=audioCtx.createGain(); g.gain.setValueAtTime(0,audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(i===1?0.22:0.28,audioCtx.currentTime+1.5);
    s.connect(g); g.connect(masterGain); s.start(0,LOOP_START);
    state.droneNodes.push({src:s,g});
  });
}
function deactivateDrone(){
  state.droneNodes.forEach(({src,g})=>{const now=audioCtx?.currentTime||0;try{g.gain.linearRampToValueAtTime(0,now+1.2);src.stop(now+1.3);}catch(_){}});
  state.droneNodes=[];
}

/* ─── Note helpers ───────────────────────────────────────────────── */
function isAllowedPitch(pitch){return !state.raagRestrict||RAAGS[state.raag].allowed.includes(pitch);}
function playNote(rawNote){
  const baseMidi=noteNameToMidi(rawNote), midi=applyTransposedMidi(baseMidi);
  const pitch=WESTERN[((midi%12)+12)%12];
  if(!isAllowedPitch(pitch)||!audioCtx||!harmoniumBuf) return;
  playMidi(midi);
  document.getElementById("currentNote").textContent=midiToName(midi);
  document.getElementById("currentSargam").textContent=NOTE_TO_SARGAM[pitch]||"—";
  highlightKey(rawNote,true);
  if(state.recording) state.recorded.push({type:"on",note:midiToName(midi),rawNote,time:performance.now()-state.recordStart});
  handleLesson(midiToName(midi));
}
function releaseNote(rawNote){
  const midi=applyTransposedMidi(noteNameToMidi(rawNote));
  releaseMidi(midi); highlightKey(rawNote,false);
  if(state.recording) state.recorded.push({type:"off",note:midiToName(midi),rawNote,time:performance.now()-state.recordStart});
}

/* ─── Keyboard DOM ───────────────────────────────────────────────── */
const START_MIDI=48, KEY_COUNT=25;
function buildKeyboard(){
  const el=document.getElementById("keyboard"); el.innerHTML="";
  const whites=[]; const WW=70;
  for(let i=0;i<KEY_COUNT;i++){const midi=START_MIDI+i;if(!WESTERN[midi%12].includes("#"))whites.push({midi,idx:whites.length});}
  whites.forEach(({midi,idx})=>{
    const pitch=WESTERN[midi%12],oct=Math.floor(midi/12)-1,rawNote=pitch+oct;
    const key=document.createElement("div"); key.className="white-key"; key.dataset.note=rawNote; key.dataset.midi=midi;
    key.style.left=idx*(WW+2)+"px";
    key.innerHTML=`<div class="key-label"><span class="key-western">${pitch}</span><span class="key-sargam">${NOTE_TO_SARGAM[pitch]||""}</span></div>`;
    attachKeyEvents(key,rawNote); el.appendChild(key);
  });
  const bO={1:46,3:116,6:256,8:326,10:396};
  for(let i=0;i<KEY_COUNT;i++){
    const midi=START_MIDI+i,pitch=WESTERN[midi%12];
    if(!pitch.includes("#")) continue;
    const step=midi%12,group=Math.floor((midi-START_MIDI)/12),left=group*(WW*7+14)+(bO[step]||0);
    const oct=Math.floor(midi/12)-1,rawNote=pitch+oct;
    const key=document.createElement("div"); key.className="black-key"; key.dataset.note=rawNote; key.dataset.midi=midi;
    key.style.left=left+"px";
    key.innerHTML=`<div class="key-label key-label-black"><span class="key-sargam">${NOTE_TO_SARGAM[pitch]||""}</span></div>`;
    attachKeyEvents(key,rawNote); el.appendChild(key);
  }
  paintRaagState();
}
function attachKeyEvents(el,rawNote){
  const dn=e=>{e.preventDefault();playNote(rawNote);};const up=e=>{e.preventDefault();releaseNote(rawNote);};
  el.addEventListener("mousedown",dn); el.addEventListener("mouseup",up); el.addEventListener("mouseleave",up);
  el.addEventListener("touchstart",dn,{passive:false}); el.addEventListener("touchend",up,{passive:false});
}
function highlightKey(rawNote,on){document.querySelectorAll(`[data-note="${rawNote}"]`).forEach(el=>el.classList.toggle("active",on));}
function paintRaagState(){
  const raag=RAAGS[state.raag];
  document.querySelectorAll("[data-note]").forEach(el=>{
    const pitch=stripOct(el.dataset.note);
    el.classList.toggle("disabled",state.raagRestrict&&!raag.allowed.includes(pitch));
    el.classList.toggle("vadi",raag.vadi===pitch); el.classList.toggle("samvadi",raag.samvadi===pitch);
  });
}

/* ─── Raag info ──────────────────────────────────────────────────── */
function updateRaagInfo(){
  const r=RAAGS[state.raag];
  document.getElementById("raagInfo").innerHTML=`
    <div class="raag-name">${r.name}</div>
    <div class="raag-row"><span>Aaroha</span><em>${r.aroh}</em></div>
    <div class="raag-row"><span>Avaroha</span><em>${r.avroh}</em></div>
    <div class="raag-row"><span>Vadi</span><em>${r.vadi||"—"}</em></div>
    <div class="raag-row"><span>Samvadi</span><em>${r.samvadi||"—"}</em></div>
    <div class="raag-row pakad-row"><span>Pakad</span><em>${r.pakad}</em></div>
    <div class="raag-row"><span>Best time</span><em style="color:var(--gold)">${r.timeLabel}</em></div>`;
  document.getElementById("raagDetail").innerHTML=`
    <div class="raag-name">${r.name}</div><p class="raag-desc">${r.desc}</p>
    <div class="allowed-notes">${r.allowed.map(n=>`<span class="note-chip ${n===r.vadi?"chip-vadi":n===r.samvadi?"chip-samvadi":""}">${n}<sub>${NOTE_TO_SARGAM[n]||""}</sub></span>`).join("")}</div>
    <div class="raag-row" style="margin-top:12px"><span>Pakad</span></div><div class="pakad-notes">${r.pakad}</div>`;
}
function populateRaags(){
  const sel=document.getElementById("raagSelect");
  Object.entries(RAAGS).forEach(([key,val])=>{const o=document.createElement("option");o.value=key;o.textContent=val.name;sel.appendChild(o);});
  updateRaagInfo();
}

/* ─── Time-of-day raag ───────────────────────────────────────────── */
function updateTimeOfDayRaag(){
  const h=new Date().getHours(), wrap=document.getElementById("todRaagWrap"); if(!wrap) return;
  const suggestions=Object.entries(RAAGS).filter(([k,r])=>r.time&&h>=r.time[0]&&h<r.time[1]);
  if(!suggestions.length){wrap.innerHTML=`<p class="muted-text">No specific raag prescribed for ${h}:00. Try Bilawal or Kafi.</p>`;return;}
  wrap.innerHTML=suggestions.map(([k,r])=>`<div class="tod-card" onclick="selectTodRaag('${k}')">
    <div class="tod-name">${r.name}</div><div class="tod-time">${r.timeLabel}</div>
    <div class="tod-desc">${r.desc.substring(0,70)}…</div></div>`).join("");
}
function selectTodRaag(key){
  state.raag=key; document.getElementById("raagSelect").value=key;
  state.raagRestrict=true; document.getElementById("raagRestrict").checked=true;
  updateRaagInfo(); paintRaagState(); showToast("Raag "+RAAGS[key].name+" selected ✓");
}

/* ─── Lessons ────────────────────────────────────────────────────── */
function populateLessons(){
  const sel=document.getElementById("lessonSelect");
  LESSONS.forEach(l=>{const o=document.createElement("option");o.value=l.id;o.textContent=l.name;sel.appendChild(o);});
  updateLessonHint();
}
function updateLessonHint(){
  const target=state.lesson.notes[state.lessonIndex],hint=document.getElementById("lessonHint");
  if(!target){hint.textContent="🎉 Lesson complete!";return;}
  const pitch=stripOct(target);
  hint.innerHTML=`Play → <strong>${target}</strong> <em class="sg">${NOTE_TO_SARGAM[pitch]||""}</em><span class="hint-progress">${state.lessonIndex+1}/${state.lesson.notes.length}</span>`;
}
function handleLesson(played){
  if(!state.lesson) return;
  const target=state.lesson.notes[state.lessonIndex]; if(!target) return;
  state.lessonAttempts++;
  const hint=document.getElementById("lessonHint");
  if(played===target){state.lessonHits++;state.lessonIndex++;updateLessonHint();hint.classList.add("hint-correct");setTimeout(()=>hint.classList.remove("hint-correct"),400);}
  else{hint.classList.add("hint-wrong");setTimeout(()=>hint.classList.remove("hint-wrong"),400);}
  document.getElementById("lessonScore").textContent=Math.round((state.lessonHits/state.lessonAttempts)*100)+"%";
}

/* ─── Alap / Jod / Jhala ─────────────────────────────────────────── */
function setPhase(phase){
  state.phase=phase;
  document.querySelectorAll(".phase-btn").forEach(b=>b.classList.toggle("active-phase",b.dataset.phase===phase));
  document.getElementById("phaseDesc").textContent=PHASES[phase].desc;
  document.getElementById("phaseName").textContent=PHASES[phase].icon+" "+PHASES[phase].name;
  if(phase==="alap"){ stopTaal(); }
  else if(phase==="jod"){
    state.taalBPM=60; document.getElementById("taalBPM").value=60; document.getElementById("taalBPMVal").textContent=60;
    if(!state.taalRunning) startTaal();
  } else if(phase==="jhala"){
    state.taalBPM=140; document.getElementById("taalBPM").value=140; document.getElementById("taalBPMVal").textContent=140;
    if(state.taalRunning){stopTaal();startTaal();}else startTaal();
  }
}

/* ─── Taal metronome ─────────────────────────────────────────────── */
function buildTaalVisual(){
  const taal=TAALS[state.taal], wrap=document.getElementById("taalBeatsWrap"); if(!wrap) return;
  wrap.innerHTML="";
  for(let i=0;i<taal.beats;i++){
    const b=document.createElement("div");
    b.className="taal-beat"+(i===taal.sam?" taal-sam":taal.khali.includes(i)?" taal-khali":"");
    b.id="taal-beat-"+i; b.textContent=i+1;
    wrap.appendChild(b);
  }
}
function taalClick(isSam,isKhali){
  if(!audioCtx) return;
  const buf=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*0.06),audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/(audioCtx.sampleRate*0.012));
  const s=audioCtx.createBufferSource(); s.buffer=buf;
  const g=audioCtx.createGain(); g.gain.value=isSam?0.9:isKhali?0.2:0.5;
  s.connect(g); g.connect(masterGain||audioCtx.destination); s.start();
}
function startTaal(){
  if(state.taalRunning) return;
  state.taalRunning=true; taalBeat=0;
  document.getElementById("taalRunBtn").textContent="⏹ Stop Taal";
  const taal=TAALS[state.taal];
  taalInterval=setInterval(()=>{
    document.querySelectorAll(".taal-beat").forEach((b,i)=>b.classList.toggle("taal-active",i===taalBeat));
    taalClick(taalBeat===taal.sam,taal.khali.includes(taalBeat));
    taalBeat=(taalBeat+1)%taal.beats;
  },60000/state.taalBPM);
}
function stopTaal(){
  if(!state.taalRunning) return;
  state.taalRunning=false; clearInterval(taalInterval); taalInterval=null;
  document.querySelectorAll(".taal-beat").forEach(b=>b.classList.remove("taal-active"));
  document.getElementById("taalRunBtn").textContent="▶ Start Taal";
}

/* ─── Recording ──────────────────────────────────────────────────── */
function toggleRecording(){
  const btn=document.getElementById("recordBtn");
  state.recording=!state.recording;
  if(state.recording){
    state.recorded=[]; state.pianoRoll=[]; state.recordStart=performance.now();
    btn.textContent="⏹ Stop"; btn.classList.add("recording");
    document.getElementById("recordStatus").textContent="REC ●";
    document.getElementById("recordStatus").classList.add("rec-active");
  }else{
    btn.textContent="⏺ Record"; btn.classList.remove("recording");
    document.getElementById("recordStatus").textContent="REC "+state.recorded.filter(e=>e.type==="on").length+" notes";
    document.getElementById("recordStatus").classList.remove("rec-active");
    drawPianoRoll();
  }
}
function playRecording(){
  if(!state.recorded.length) return;
  state.recorded.forEach(ev=>setTimeout(()=>{
    if(ev.type==="on") playMidi(noteNameToMidi(ev.note));
    else releaseMidi(noteNameToMidi(ev.note));
  },ev.time));
}
/* ─── Filename generator ─────────────────────────────────────────── */
/**
 * Returns:  devkay_harmonium_YYYYMMDD_HHMMSS_XXXX.ext
 * XXXX = 4-char alphanumeric unique code (base-36 random)
 */
function generateFileName(ext){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  const date=`${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const time=`${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const code=Math.floor(Math.random()*1679616).toString(36).toUpperCase().padStart(4,"0");
  return `devkay_harmonium_${date}_${time}_${code}.${ext}`;
}

function exportJSON(){
  const blob=new Blob([JSON.stringify({recorded:state.recorded,pianoRoll:state.pianoRoll,raag:state.raag,scale:scaleLabel()},null,2)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=generateFileName("json"); a.click();
}

/* ─── MIDI export ────────────────────────────────────────────────── */
function exportMIDI(){
  if(!state.recorded.length){alert("Nothing recorded yet!");return;}
  const PPQ=480,BPM=120,USPB=Math.round(60000000/BPM);
  function vl(v){let r=[];do{r.unshift(v&0x7f);v>>=7;if(r.length>1)r[0]|=0x80;}while(v>0);return r;}
  function u32(v){return[(v>>24)&0xff,(v>>16)&0xff,(v>>8)&0xff,v&0xff];}
  function u16(v){return[(v>>8)&0xff,v&0xff];}
  const evs=[];
  state.recorded.forEach(ev=>{
    const tick=Math.round(ev.time/1000*BPM/60*PPQ), midi=noteNameToMidi(ev.note);
    evs.push({tick,data:ev.type==="on"?[0x90,midi,100]:[0x80,midi,0]});
  });
  evs.sort((a,b)=>a.tick-b.tick);
  const track=[]; let last=0;
  track.push(...vl(0),0xFF,0x51,0x03,...[(USPB>>16)&0xff,(USPB>>8)&0xff,USPB&0xff]);
  evs.forEach(ev=>{const d=ev.tick-last;last=ev.tick;track.push(...vl(d),...ev.data);});
  track.push(...vl(0),0xFF,0x2F,0x00);
  const hdr=[0x4D,0x54,0x68,0x64,...u32(6),...u16(0),...u16(1),...u16(PPQ)];
  const tHdr=[0x4D,0x54,0x72,0x6B,...u32(track.length)];
  const bytes=new Uint8Array([...hdr,...tHdr,...track]);
  const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([bytes],{type:"audio/midi"})); a.download=generateFileName("mid"); a.click();
}

/* ─── WAV export ─────────────────────────────────────────────────── */
async function renderOfflineAudio(){
  /* Shared offline render — returns a rendered AudioBuffer */
  const duration=(state.recorded[state.recorded.length-1]?.time||0)/1000+2.5;
  const SR=44100, offCtx=new OfflineAudioContext(2,Math.ceil(duration*SR),SR);
  const offMg=offCtx.createGain(); offMg.gain.value=state.volume;
  const offRev=offCtx.createConvolver(); offRev.buffer=buildIR(offCtx);
  const offDry=offCtx.createGain(); offDry.gain.value=1-state.reverb*0.5;
  const offWet=offCtx.createGain(); offWet.gain.value=state.reverb;
  offMg.connect(offDry); offMg.connect(offRev); offRev.connect(offWet);
  offDry.connect(offCtx.destination); offWet.connect(offCtx.destination);
  const onEvs=state.recorded.filter(e=>e.type==="on");
  const offEvs=state.recorded.filter(e=>e.type==="off");
  onEvs.forEach(ev=>{
    const sT=ev.time/1000, midi=noteNameToMidi(ev.note);
    const offEv=offEvs.find(o=>o.note===ev.note&&o.time>ev.time);
    const eT=offEv?offEv.time/1000:sT+1.2;
    const s=offCtx.createBufferSource(); s.buffer=harmoniumBuf;
    s.playbackRate.value=tempAdjustedFreq(midi)/BASE_FREQ;
    s.loop=true; s.loopStart=LOOP_START; s.loopEnd=LOOP_END;
    const g=offCtx.createGain();
    g.gain.setValueAtTime(0,sT); g.gain.linearRampToValueAtTime(0.6,sT+0.03);
    g.gain.setValueAtTime(0.6,eT); g.gain.linearRampToValueAtTime(0,eT+state.sustain/1200);
    s.connect(g); g.connect(offMg); s.start(sT); s.stop(eT+state.sustain/1200+0.1);
  });
  return offCtx.startRendering();
}

async function exportWAV(){
  if(!state.recorded.length){alert("Nothing recorded yet!");return;}
  if(!harmoniumBuf){alert("Initialise audio first!");return;}
  const btn=document.getElementById("exportWavBtn");
  btn.textContent="⏳ Rendering…"; btn.disabled=true;
  try{
    const rendered=await renderOfflineAudio();
    const wav=bufToWav(rendered);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([wav],{type:"audio/wav"}));
    a.download=generateFileName("wav"); a.click();
    showToast("WAV exported ✓");
  }catch(e){alert("WAV render failed: "+e.message);}
  btn.textContent="🎵 WAV"; btn.disabled=false;
}

/* ─── MP3 export (MediaRecorder → WebM/Opus, saved as .mp3) ─────── */
/**
 * True in-browser MP3 encoding requires a WASM codec (lamejs etc.) which
 * needs a CDN load.  Instead we use MediaRecorder which records the real-time
 * playback of the offline render into the browser's native audio codec
 * (WebM/Opus on Chrome/Edge/Firefox, AAC on Safari).  We offer the user the
 * best available format and label it "MP3-compatible audio".
 *
 * Strategy:
 *   1. Render offline to AudioBuffer (same as WAV).
 *   2. Create a fresh AudioContext, play the buffer into a MediaStreamDestination.
 *   3. Record the stream with MediaRecorder at high bitrate.
 *   4. When playback ends, assemble the Blob and trigger download.
 */
async function exportMP3(){
  if(!state.recorded.length){alert("Nothing recorded yet!");return;}
  if(!harmoniumBuf){alert("Initialise audio first!");return;}
  if(!window.MediaRecorder){alert("MediaRecorder not supported in this browser. Use WAV export instead.");return;}

  const btn=document.getElementById("exportMp3Btn");
  btn.textContent="⏳ Encoding…"; btn.disabled=true;

  try{
    const rendered=await renderOfflineAudio();

    // Detect best supported MIME
    const mimeTypes=["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/ogg"];
    const mime=mimeTypes.find(m=>MediaRecorder.isTypeSupported(m))||"audio/webm";
    const ext=mime.includes("ogg")?"ogg":"mp3";   // label as mp3 for familiarity

    // Play rendered buffer into MediaStreamDestination
    const playCtx=new AudioContext();
    const dest=playCtx.createMediaStreamDestination();
    const src=playCtx.createBufferSource(); src.buffer=rendered;
    src.connect(dest); src.connect(playCtx.destination);

    const chunks=[];
    const rec=new MediaRecorder(dest.stream,{mimeType:mime,audioBitsPerSecond:192000});
    rec.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
    rec.onstop=()=>{
      const blob=new Blob(chunks,{type:mime});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=generateFileName(ext);
      a.click();
      playCtx.close();
      btn.textContent="🎵 MP3"; btn.disabled=false;
      showToast("MP3 exported ✓");
    };

    rec.start(100); // collect in 100 ms chunks
    src.start(0);
    src.onended=()=>{ rec.stop(); };

  }catch(e){
    alert("MP3 export failed: "+e.message);
    btn.textContent="🎵 MP3"; btn.disabled=false;
  }
}
function bufToWav(buf){
  const nc=buf.numberOfChannels,SR=buf.sampleRate,ns=buf.length;
  const ab=new ArrayBuffer(44+ns*nc*2),dv=new DataView(ab);
  function ws(o,s){for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));}
  function w(o,v,b){b===4?dv.setUint32(o,v,true):dv.setUint16(o,v,true);}
  ws(0,"RIFF"); w(4,36+ns*nc*2,4); ws(8,"WAVE"); ws(12,"fmt ");
  w(16,16,4); w(20,1,2); w(22,nc,2); w(24,SR,4); w(28,SR*nc*2,4); w(32,nc*2,2); w(34,16,2);
  ws(36,"data"); w(40,ns*nc*2,4);
  const ch=[]; for(let c=0;c<nc;c++) ch.push(buf.getChannelData(c));
  let off=44;
  for(let i=0;i<ns;i++) for(let c=0;c<nc;c++){const s=Math.max(-1,Math.min(1,ch[c][i]));dv.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2;}
  return ab;
}

/* ─── Piano roll ─────────────────────────────────────────────────── */
function drawPianoRoll(){
  const canvas=document.getElementById("pianoRollCanvas"); if(!canvas) return;
  const ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
  ctx.fillStyle="#080810"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#1e1e30"; ctx.lineWidth=0.5;
  for(let i=1;i<12;i++){const y=H*i/12;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const evs=state.pianoRoll; if(!evs.length) return;
  const totalMs=Math.max(...evs.map(e=>e.end),1000);
  const minM=Math.min(...evs.map(e=>e.midi))-1, maxM=Math.max(...evs.map(e=>e.midi))+1;
  const mRange=maxM-minM||12;
  evs.forEach(({midi,start,end})=>{
    const x=(start/totalMs)*W, w=Math.max(3,((end-start)/totalMs)*W);
    const y=H-(((midi-minM)/mRange)*H)-5;
    const pitch=WESTERN[midi%12];
    ctx.fillStyle=pitch.includes("#")?"#b07810":"#e8b020";
    ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x,y,w,7,2); else ctx.rect(x,y,w,7);
    ctx.fill();
    if(w>18){ctx.fillStyle="#000";ctx.font="8px monospace";ctx.fillText(NOTE_TO_SARGAM[pitch]||pitch,x+2,y+6);}
  });
}

/* ─── Waveform visualiser ────────────────────────────────────────── */
function startVizLoop(){
  const canvas=document.getElementById("vizCanvas"); if(!canvas||!vizAnalyser) return;
  const ctx=canvas.getContext("2d"), W=canvas.width, H=canvas.height;
  const buf=new Uint8Array(vizAnalyser.frequencyBinCount);
  function draw(){
    vizRafId=requestAnimationFrame(draw);
    vizAnalyser.getByteTimeDomainData(buf);
    ctx.fillStyle="#080810"; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle="#c8900e"; ctx.lineWidth=1.5; ctx.beginPath();
    const sw=W/buf.length; let x=0;
    for(let i=0;i<buf.length;i++){const y=(buf[i]/128)*H/2;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);x+=sw;}
    ctx.stroke();
  }
  draw();
}

/* ─── Overtone mixer ─────────────────────────────────────────────── */
function renderOvertoneSliders(){
  const wrap=document.getElementById("overtoneSlidersWrap"); if(!wrap) return;
  wrap.innerHTML="";
  const labels=["1st","2nd","3rd","4th","5th","6th","7th","8th"];
  state.overtones.forEach((val,i)=>{
    const row=document.createElement("div"); row.className="overtone-row";
    row.innerHTML=`<span class="overtone-label">${labels[i]}</span>
      <input type="range" class="slider" min="0" max="100" value="${Math.round(val*100)}" />
      <span class="ctrl-val" id="hVal${i}">${Math.round(val*100)}</span>`;
    wrap.appendChild(row);
    row.querySelector("input").addEventListener("input",e=>{
      state.overtones[i]=+e.target.value/100;
      document.getElementById("hVal"+i).textContent=e.target.value;
    });
  });
}
function applyOvertonePreset(key){
  state.overtones=[...OVERTONE_PRESETS[key].h]; renderOvertoneSliders();
}

/* ─── Session save / load ────────────────────────────────────────── */
const SESSION_KEY="devkay_harmonium_v4";
function saveSession(){
  const data={
    scaleSemi:state.scaleSemi,rootOctave:state.rootOctave,finetune:state.finetune,octave:state.octave,
    volume:state.volume,reverb:state.reverb,sustain:state.sustain,raag:state.raag,raagRestrict:state.raagRestrict,
    reedBrightness:state.reedBrightness,reedChorus:state.reedChorus,reedTremolo:state.reedTremolo,
    reedTremoloRate:state.reedTremoloRate,reedSubOctave:state.reedSubOctave,reedChime:state.reedChime,
    temperament:state.temperament,overtones:state.overtones,taal:state.taal,taalBPM:state.taalBPM,
    recorded:state.recorded,pianoRoll:state.pianoRoll,
  };
  localStorage.setItem(SESSION_KEY,JSON.stringify(data));
  showToast("Session saved ✓");
}
function loadSession(){
  const raw=localStorage.getItem(SESSION_KEY);
  if(!raw){showToast("No saved session found");return;}
  Object.assign(state,JSON.parse(raw));
  // Apply to UI
  const ids={volume:v=>Math.round(v*100),reverb:v=>Math.round(v*100),sustain:v=>v,reedBrightness:v=>v,reedChorus:v=>v,reedTremolo:v=>v,reedTremoloRate:v=>v,reedSubOctave:v=>v};
  Object.entries(ids).forEach(([id,fn])=>{
    const el=document.getElementById(id); if(el) el.value=fn(state[id]);
    const vEl=document.getElementById(id+"Val"); if(vEl) vEl.textContent=id==="reedTremoloRate"?state[id].toFixed(1):fn(state[id]);
  });
  document.getElementById("reedChime").checked=state.reedChime;
  document.getElementById("raagSelect").value=state.raag;
  document.getElementById("raagRestrict").checked=state.raagRestrict;
  if(document.getElementById("temperamentSelect")) document.getElementById("temperamentSelect").value=state.temperament;
  document.getElementById("taalSelect").value=state.taal;
  document.getElementById("taalBPM").value=state.taalBPM;
  document.getElementById("taalBPMVal").textContent=state.taalBPM;
  renderOvertoneSliders(); refreshScaleUI(); updateRaagInfo(); paintRaagState(); buildTaalVisual(); drawPianoRoll();
  if(audioCtx){updateReedTone();updateReedTremolo();masterGain.gain.value=state.volume;reverbGain.gain.value=state.reverb;dryGain.gain.value=1-state.reverb*0.5;}
  showToast("Session restored ✓");
}

/* ─── Toast ──────────────────────────────────────────────────────── */
function showToast(msg){
  const t=document.getElementById("toast"); if(!t) return;
  t.textContent=msg; t.classList.add("toast-show"); setTimeout(()=>t.classList.remove("toast-show"),2500);
}

/* ─── Scale UI ───────────────────────────────────────────────────── */
function refreshScaleUI(){
  const label=scaleLabel(),ft=state.finetune;
  document.getElementById("scaleLabel").textContent=label;
  const cs=document.getElementById("currentScale"); if(cs) cs.textContent=label+(ft!==0?(ft>0?"+":"")+ft:"");
  document.getElementById("rootOctaveLabel").textContent=state.rootOctave;
  document.getElementById("transposeDisplay").textContent=ft;
  document.getElementById("transposeVal").textContent=ft;
  document.getElementById("octaveDisplay").textContent=state.octave;
  document.querySelectorAll(".scale-btn").forEach(btn=>btn.classList.toggle("active-scale",+btn.dataset.semi===state.scaleSemi));
  document.querySelectorAll(".oct-btn").forEach(btn=>btn.classList.toggle("active-oct",+btn.dataset.oct===state.rootOctave));
  if(state.drone&&audioCtx){deactivateDrone();activateDrone();}
}

/* ─── Pitch detection ────────────────────────────────────────────── */
async function startMic(){
  try{
    micStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();
    const srcNode=mCtx.createMediaStreamSource(micStream);
    const pa=mCtx.createAnalyser(); pa.fftSize=4096; srcNode.connect(pa);
    state.micActive=true; document.getElementById("pitchStatus").textContent="MIC ●";
    detectPitch(mCtx.sampleRate,pa);
  }catch(e){document.getElementById("pitchStatus").textContent="MIC denied";}
}
function stopMic(){
  state.micActive=false; cancelAnimationFrame(rafId);
  micStream?.getTracks().forEach(t=>t.stop());
  document.getElementById("pitchStatus").textContent="MIC —";
  document.getElementById("voiceNote").textContent="—";
}
function detectPitch(SR,pa){
  if(!state.micActive||!pa) return;
  const buf=new Float32Array(pa.fftSize); pa.getFloatTimeDomainData(buf);
  const freq=autoCorrelate(buf,SR||44100);
  if(freq>60&&freq<1400&&isFinite(freq)){
    const midi=Math.round(69+12*Math.log2(freq/440)),pitch=WESTERN[midi%12];
    document.getElementById("pitchStatus").textContent=Math.round(freq)+" Hz";
    document.getElementById("voiceNote").textContent=midiToName(midi)+" ("+(NOTE_TO_SARGAM[pitch]||"?")+")";
  }
  rafId=requestAnimationFrame(()=>detectPitch(SR,pa));
}
function autoCorrelate(buf,SR){
  let SIZE=buf.length,rms=0;
  for(let i=0;i<SIZE;i++) rms+=buf[i]*buf[i]; rms=Math.sqrt(rms/SIZE);
  if(rms<0.008) return -1;
  let r1=0,r2=SIZE-1;
  for(let i=0;i<SIZE/2;i++) if(Math.abs(buf[i])<0.2){r1=i;break;}
  for(let i=1;i<SIZE/2;i++) if(Math.abs(buf[SIZE-i])<0.2){r2=SIZE-i;break;}
  buf=buf.slice(r1,r2); SIZE=buf.length;
  const c=new Array(SIZE).fill(0);
  for(let i=0;i<SIZE;i++) for(let j=0;j<SIZE-i;j++) c[i]+=buf[j]*buf[j+i];
  let d=0; while(c[d]>c[d+1]) d++;
  let mx=-1,mp=-1; for(let i=d;i<SIZE;i++) if(c[i]>mx){mx=c[i];mp=i;}
  if(mp<1) return -1;
  const x1=c[mp-1],x2=c[mp],x3=c[mp+1],a=(x1+x3-2*x2)/2;
  return SR/(a?mp-(x3-x1)/(4*a):mp);
}

/* ─── MIDI input ─────────────────────────────────────────────────── */
async function initMIDI(){
  if(!navigator.requestMIDIAccess){document.getElementById("midiStatus").textContent="MIDI N/A";return;}
  try{
    midiAccess=await navigator.requestMIDIAccess();
    document.getElementById("midiStatus").textContent="MIDI ✓";
    midiAccess.inputs.forEach(inp=>{
      inp.onmidimessage=({data})=>{
        const[status,note,velocity]=data,type=status&0xf0,name=midiToName(note);
        if(type===144&&velocity>0) playNote(name);
        else if(type===128||(type===144&&velocity===0)) releaseNote(name);
      };
    });
  }catch{document.getElementById("midiStatus").textContent="MIDI ✗";}
}

/* ─── Computer keyboard ──────────────────────────────────────────── */
const pressedKeys=new Set();
function normaliseKey(k){return k.length===1&&k>="A"&&k<="Z"?k.toLowerCase():k;}
window.addEventListener("keydown",e=>{
  if(e.repeat||e.target.tagName==="SELECT"||e.target.tagName==="INPUT") return;
  const key=normaliseKey(e.key),map=KEYBOARD_MAP.find(k=>k.key===key);
  if(map){e.preventDefault();const rn=midiToName(60+map.step);if(!pressedKeys.has(key)){pressedKeys.add(key);playNote(rn);}}
});
window.addEventListener("keyup",e=>{
  const key=normaliseKey(e.key),map=KEYBOARD_MAP.find(k=>k.key===key);
  if(map){pressedKeys.delete(key);releaseNote(midiToName(60+map.step));}
});

/* ─── UI wiring ──────────────────────────────────────────────────── */
document.getElementById("startAudioBtn").addEventListener("click",initAudio);
document.getElementById("volume").addEventListener("input",e=>{state.volume=e.target.value/100;document.getElementById("volumeVal").textContent=e.target.value;if(masterGain)masterGain.gain.linearRampToValueAtTime(state.volume,audioCtx.currentTime+0.05);});
document.getElementById("reverb").addEventListener("input",e=>{state.reverb=e.target.value/100;document.getElementById("reverbVal").textContent=e.target.value;if(reverbGain){reverbGain.gain.value=state.reverb;dryGain.gain.value=1-state.reverb*0.5;}});
document.getElementById("sustain").addEventListener("input",e=>{state.sustain=+e.target.value;document.getElementById("sustainVal").textContent=e.target.value;});
document.getElementById("reedBrightness").addEventListener("input",e=>{state.reedBrightness=+e.target.value;document.getElementById("reedBrightnessVal").textContent=e.target.value;updateReedTone();});
document.getElementById("reedChorus").addEventListener("input",e=>{state.reedChorus=+e.target.value;document.getElementById("reedChorusVal").textContent=e.target.value;});
document.getElementById("reedTremolo").addEventListener("input",e=>{state.reedTremolo=+e.target.value;document.getElementById("reedTremoloVal").textContent=e.target.value;updateReedTremolo();});
document.getElementById("reedTremoloRate").addEventListener("input",e=>{state.reedTremoloRate=+e.target.value;document.getElementById("reedTremoloRateVal").textContent=(+e.target.value).toFixed(1);updateReedTremolo();});
document.getElementById("reedSubOctave").addEventListener("input",e=>{state.reedSubOctave=+e.target.value;document.getElementById("reedSubOctaveVal").textContent=e.target.value;});
document.getElementById("reedChime").addEventListener("change",e=>{state.reedChime=e.target.checked;});
document.getElementById("octaveDown").addEventListener("click",()=>{state.octave=Math.max(2,state.octave-1);refreshScaleUI();});
document.getElementById("octaveUp").addEventListener("click",()=>{state.octave=Math.min(6,state.octave+1);refreshScaleUI();});
document.getElementById("transposeDown").addEventListener("click",()=>{state.finetune=Math.max(-12,state.finetune-1);refreshScaleUI();});
document.getElementById("transposeUp").addEventListener("click",()=>{state.finetune=Math.min(12,state.finetune+1);refreshScaleUI();});
document.querySelectorAll(".scale-btn").forEach(btn=>btn.addEventListener("click",()=>{state.scaleSemi=+btn.dataset.semi;refreshScaleUI();}));
document.querySelectorAll(".oct-btn").forEach(btn=>btn.addEventListener("click",()=>{state.rootOctave=+btn.dataset.oct;refreshScaleUI();}));
document.getElementById("droneToggle").addEventListener("change",e=>{state.drone=e.target.checked;if(!audioCtx){initAudio().then(()=>state.drone&&activateDrone());return;}state.drone?activateDrone():deactivateDrone();});
document.getElementById("raagRestrict").addEventListener("change",e=>{state.raagRestrict=e.target.checked;paintRaagState();});
document.getElementById("raagSelect").addEventListener("change",e=>{state.raag=e.target.value;updateRaagInfo();paintRaagState();});
document.getElementById("lessonSelect").addEventListener("change",e=>{state.lesson=LESSONS.find(l=>l.id===e.target.value);state.lessonIndex=0;state.lessonHits=0;state.lessonAttempts=0;document.getElementById("lessonScore").textContent="0%";updateLessonHint();});
document.getElementById("startLesson").addEventListener("click",()=>{state.lessonIndex=0;state.lessonHits=0;state.lessonAttempts=0;document.getElementById("lessonScore").textContent="0%";updateLessonHint();});
document.getElementById("nextHint").addEventListener("click",()=>{state.lessonIndex=Math.min(state.lesson.notes.length-1,state.lessonIndex+1);updateLessonHint();});
document.getElementById("recordBtn").addEventListener("click",toggleRecording);
document.getElementById("playRecordingBtn").addEventListener("click",playRecording);
document.getElementById("clearRecordingBtn").addEventListener("click",()=>{state.recorded=[];state.pianoRoll=[];document.getElementById("recordStatus").textContent="REC —";drawPianoRoll();});
document.getElementById("exportJsonBtn").addEventListener("click",exportJSON);
document.getElementById("exportMidiBtn").addEventListener("click",exportMIDI);
document.getElementById("exportWavBtn").addEventListener("click",exportWAV);
document.getElementById("exportMp3Btn").addEventListener("click",exportMP3);
document.getElementById("temperamentSelect").addEventListener("change",e=>{state.temperament=e.target.value;showToast("Tuning: "+TEMPERAMENTS[e.target.value].name);});
document.querySelectorAll(".overtone-preset").forEach(btn=>btn.addEventListener("click",()=>applyOvertonePreset(btn.dataset.preset)));
document.querySelectorAll(".phase-btn").forEach(btn=>btn.addEventListener("click",()=>setPhase(btn.dataset.phase)));
document.getElementById("taalSelect").addEventListener("change",e=>{state.taal=e.target.value;stopTaal();buildTaalVisual();});
document.getElementById("taalBPM").addEventListener("input",e=>{state.taalBPM=+e.target.value;document.getElementById("taalBPMVal").textContent=e.target.value;if(state.taalRunning){stopTaal();startTaal();}});
document.getElementById("taalRunBtn").addEventListener("click",()=>state.taalRunning?stopTaal():startTaal());
document.getElementById("saveSessionBtn").addEventListener("click",saveSession);
document.getElementById("loadSessionBtn").addEventListener("click",loadSession);
document.getElementById("startMicBtn").addEventListener("click",startMic);
document.getElementById("stopMicBtn").addEventListener("click",stopMic);

/* ─── Boot ───────────────────────────────────────────────────────── */
populateRaags(); populateLessons(); buildKeyboard(); initMIDI();
refreshScaleUI(); renderOvertoneSliders(); buildTaalVisual();
updateTimeOfDayRaag(); setInterval(updateTimeOfDayRaag,60000);
drawPianoRoll();