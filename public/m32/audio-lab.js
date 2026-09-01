(()=>{"use strict";
const $=id=>document.getElementById(id);
let ctx,sourceNode,mediaSourceNode,micStream,micNode;
let inputAnalyser,gateAnalyser,compAnalyser,dryAnalyser,fxAnalyser,mainAnalyser;
let gateGain,eq=[],comp,makeupGain,faderGain,sendGain,busGain,convolver,returnGain,mainMix,processedGain,rawGain,master;
let postTap=true,monitorProcessed=true,raf=0,impulseKey="",sourceKind="";
const player=$("player");
const dbToGain=db=>db<=-60?0:Math.pow(10,db/20);
const fmtDb=v=>Number(v).toFixed(Number(v)%1?1:0)+" dB";
const setText=(id,v)=>{$(id).textContent=v};
function ensureCtx(){
 if(ctx)return;
 ctx=new (window.AudioContext||window.webkitAudioContext)();
 inputAnalyser=ctx.createAnalyser();gateAnalyser=ctx.createAnalyser();compAnalyser=ctx.createAnalyser();dryAnalyser=ctx.createAnalyser();fxAnalyser=ctx.createAnalyser();mainAnalyser=ctx.createAnalyser();
 [inputAnalyser,gateAnalyser,compAnalyser,dryAnalyser,fxAnalyser,mainAnalyser].forEach(a=>{a.fftSize=1024;a.smoothingTimeConstant=.75});
 gateGain=ctx.createGain();
 eq=[0,1,2,3].map(()=>ctx.createBiquadFilter());
 eq.forEach(f=>f.type="peaking");
 comp=ctx.createDynamicsCompressor();
 makeupGain=ctx.createGain();faderGain=ctx.createGain();sendGain=ctx.createGain();busGain=ctx.createGain();convolver=ctx.createConvolver();returnGain=ctx.createGain();mainMix=ctx.createGain();processedGain=ctx.createGain();rawGain=ctx.createGain();master=ctx.createGain();
 master.gain.value=.65;
 gateAnalyser.connect(gateGain);
 gateGain.connect(eq[0]);eq[0].connect(eq[1]);eq[1].connect(eq[2]);eq[2].connect(eq[3]);eq[3].connect(comp);comp.connect(compAnalyser);compAnalyser.connect(makeupGain);makeupGain.connect(faderGain);faderGain.connect(dryAnalyser);dryAnalyser.connect(mainMix);
 sendGain.connect(busGain);busGain.connect(convolver);convolver.connect(returnGain);returnGain.connect(fxAnalyser);fxAnalyser.connect(mainMix);
 mainMix.connect(mainAnalyser);mainAnalyser.connect(processedGain);processedGain.connect(master);rawGain.connect(master);master.connect(ctx.destination);
 rebuildTap();updateAll();startMeters();
}
function connectSource(node){
 ensureCtx();
 if(sourceNode){try{sourceNode.disconnect()}catch(e){}}
 sourceNode=node;
 sourceNode.connect(inputAnalyser);
 sourceNode.connect(rawGain);
 sourceKind=node===micNode?"mic":"file";
 updateMonitor();
}
function useFile(file){
 ensureCtx();
 if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null;micNode=null}
 if(!mediaSourceNode)mediaSourceNode=ctx.createMediaElementSource(player);
 const url=URL.createObjectURL(file);
 if(player.dataset.url)URL.revokeObjectURL(player.dataset.url);
 player.dataset.url=url;player.src=url;player.loop=true;
 connectSource(mediaSourceNode);
 setText("fileName",file.name);
 $("playBtn").disabled=false;$("pauseBtn").disabled=false;
}
async function useMic(){
 ensureCtx();
 try{
  if(micStream)micStream.getTracks().forEach(t=>t.stop());
  micStream=await navigator.mediaDevices.getUserMedia({audio:true});
  micNode=ctx.createMediaStreamSource(micStream);
  connectSource(micNode);
  player.pause();$("playBtn").disabled=true;$("pauseBtn").disabled=true;
  setText("fileName","마이크 입력 사용 중");
  $("micBtn").classList.add("active");
 }catch(e){alert("마이크 권한을 사용할 수 없습니다. 브라우저 권한과 HTTPS 상태를 확인하세요.");}
}
function rebuildTap(){
 if(!ctx)return;
 try{faderGain.disconnect(sendGain)}catch(e){}
 try{compAnalyser.disconnect(sendGain)}catch(e){}
 if(postTap)faderGain.connect(sendGain);else compAnalyser.connect(sendGain);
 sendGain.connect(busGain);
 $("tapBtn").textContent="FX Tap: "+(postTap?"POST-FADER":"PRE-FADER");
 $("tapExplain").innerHTML=postTap?"<b>POST-FADER:</b> Channel Fader를 내리면 Dry와 FX Send가 함께 감소합니다. 일반적인 Reverb/Delay Send의 기본적인 사고방식입니다.":"<b>PRE-FADER:</b> Channel Fader와 무관하게 FX Send가 유지됩니다. 모니터에는 유용하지만 일반 FX에서는 잔향만 남는 상황을 직접 확인해보세요.";
}
function updateMonitor(){
 if(!ctx)return;
 processedGain.gain.setTargetAtTime(monitorProcessed?1:0,ctx.currentTime,.01);
 rawGain.gain.setTargetAtTime(monitorProcessed?0:1,ctx.currentTime,.01);
 $("bypassBtn").textContent="Monitor: "+(monitorProcessed?"PROCESSED":"ORIGINAL");
 $("bypassBtn").classList.toggle("active",!monitorProcessed);
}
function makeImpulse(decay,preset){
 const rate=ctx.sampleRate,len=Math.max(1,Math.floor(rate*decay)),buf=ctx.createBuffer(2,len,rate);
 let shape=preset==="plate"?1.7:preset==="room"?3.4:2.2;
 for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++){const t=i/len;d[i]=(Math.random()*2-1)*Math.pow(1-t,shape)*(preset==="plate"?.85:1)}}
 convolver.buffer=buf;
}
function ensureImpulse(){
 if(!ctx)return;
 const key=$("verbPreset").value+":"+$("decay").value;
 if(key===impulseKey)return;impulseKey=key;makeImpulse(+$("decay").value,$("verbPreset").value);
}
function updateEq(){
 if(!ctx)return;
 [1,2,3,4].forEach((n,i)=>{
  const f=+$("eq"+n+"f").value,g=+$("eq"+n+"g").value,q=+$("eq"+n+"q").value;
  eq[i].frequency.setTargetAtTime(f,ctx.currentTime,.01);eq[i].gain.setTargetAtTime(g,ctx.currentTime,.01);eq[i].Q.setTargetAtTime(q,ctx.currentTime,.01);
  setText("eq"+n+"fV",Math.round(f)+" Hz");setText("eq"+n+"gV",fmtDb(g));setText("eq"+n+"qV",q.toFixed(1));
 });
}
function updateComp(){
 if(!ctx)return;
 const th=+$("compTh").value,ra=+$("compRatio").value,at=+$("compAttack").value/1000,re=+$("compRelease").value/1000,kn=+$("compKnee").value,mu=+$("makeup").value;
 comp.threshold.setTargetAtTime(th,ctx.currentTime,.01);comp.ratio.setTargetAtTime(ra,ctx.currentTime,.01);comp.attack.setTargetAtTime(at,ctx.currentTime,.01);comp.release.setTargetAtTime(re,ctx.currentTime,.01);comp.knee.setTargetAtTime(kn,ctx.currentTime,.01);makeupGain.gain.setTargetAtTime(dbToGain(mu),ctx.currentTime,.01);
 setText("compThV",fmtDb(th));setText("compRatioV",ra.toFixed(1)+":1");setText("compAttackV",Math.round(at*1000)+" ms");setText("compReleaseV",Math.round(re*1000)+" ms");setText("compKneeV",kn.toFixed(0)+" dB");setText("makeupV",fmtDb(mu));
}
function updateLevels(){
 if(!ctx)return;
 const f=+$("fader").value,s=+$("send").value,b=+$("bus").value,r=+$("ret").value;
 faderGain.gain.setTargetAtTime(dbToGain(f),ctx.currentTime,.01);sendGain.gain.setTargetAtTime(dbToGain(s),ctx.currentTime,.01);busGain.gain.setTargetAtTime(dbToGain(b),ctx.currentTime,.01);returnGain.gain.setTargetAtTime(dbToGain(r),ctx.currentTime,.01);
 setText("faderV",fmtDb(f));setText("sendV",fmtDb(s));setText("busV",fmtDb(b));setText("retV",fmtDb(r));
}
function updateGateLabels(){
 setText("gateThV",fmtDb($("gateTh").value));setText("gateRangeV",fmtDb($("gateRange").value));setText("gateAttackV",$("gateAttack").value+" ms");setText("gateReleaseV",$("gateRelease").value+" ms");
}
function updateVerb(){setText("decayV",Number($("decay").value).toFixed(1)+" s");ensureImpulse()}
function updateAll(){updateEq();updateComp();updateLevels();updateGateLabels();updateVerb();rebuildTap();updateMonitor()}
function rmsDb(analyser){
 const a=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(a);let sum=0;for(const v of a)sum+=v*v;const rms=Math.sqrt(sum/a.length);return rms>0?20*Math.log10(rms):-100;
}
function meter(id,db){$(id).style.width=Math.max(0,Math.min(100,(db+60)/60*100))+"%"}
function startMeters(){
 const tick=()=>{
  if(!ctx){raf=requestAnimationFrame(tick);return}
  const inDb=rmsDb(inputAnalyser),th=+$("gateTh").value,range=+$("gateRange").value;
  const target=inDb>=th?1:dbToGain(range);
  const tc=(target>gateGain.gain.value?+$("gateAttack").value:+$("gateRelease").value)/1000;
  gateGain.gain.setTargetAtTime(target,ctx.currentTime,Math.max(.002,tc/4));
  meter("mInput",inDb);meter("mGate",rmsDb(gateAnalyser));meter("mComp",rmsDb(compAnalyser));meter("mDry",rmsDb(dryAnalyser));meter("mFx",rmsDb(fxAnalyser));meter("mMain",rmsDb(mainAnalyser));
  setText("grV",(comp.reduction||0).toFixed(1)+" dB");
  raf=requestAnimationFrame(tick);
 };tick();
}
$("fileInput").addEventListener("change",e=>{const f=e.target.files&&e.target.files[0];if(f)useFile(f)});
$("micBtn").onclick=useMic;
$("playBtn").onclick=async()=>{ensureCtx();await ctx.resume();player.play()};
$("pauseBtn").onclick=()=>player.pause();
$("loopBtn").onclick=()=>{player.loop=!player.loop;$("loopBtn").textContent="Loop: "+(player.loop?"ON":"OFF")};
$("bypassBtn").onclick=()=>{monitorProcessed=!monitorProcessed;updateMonitor()};
$("tapBtn").onclick=()=>{postTap=!postTap;rebuildTap()};
["gateTh","gateRange","gateAttack","gateRelease"].forEach(id=>$(id).oninput=updateGateLabels);
["compTh","compRatio","compAttack","compRelease","compKnee","makeup"].forEach(id=>$(id).oninput=()=>{ensureCtx();updateComp()});
[1,2,3,4].forEach(n=>["f","g","q"].forEach(s=>$("eq"+n+s).oninput=()=>{ensureCtx();updateEq()}));
["fader","send","bus","ret"].forEach(id=>$(id).oninput=()=>{ensureCtx();updateLevels()});
$("decay").oninput=()=>{ensureCtx();impulseKey="";updateVerb()};$("verbPreset").onchange=()=>{ensureCtx();impulseKey="";updateVerb()};
function preset(vals){Object.entries(vals).forEach(([id,v])=>$(id).value=v);ensureCtx();updateEq()}
$("eqFlat").onclick=()=>preset({eq1g:0,eq2g:0,eq3g:0,eq4g:0});
$("vocalPreset").onclick=()=>preset({eq1f:120,eq1g:-2,eq1q:.8,eq2f:300,eq2g:-3,eq2q:1.4,eq3f:3000,eq3g:2,eq3q:1.1,eq4f:9000,eq4g:1.5,eq4q:.8});
$("mudPreset").onclick=()=>preset({eq2f:320,eq2g:-5,eq2q:1.8});
$("presencePreset").onclick=()=>preset({eq3f:3200,eq3g:3,eq3q:1.2});
player.loop=true;updateGateLabels();
[1,2,3,4].forEach(n=>{setText("eq"+n+"fV",$("eq"+n+"f").value+" Hz");setText("eq"+n+"gV",fmtDb($("eq"+n+"g").value));setText("eq"+n+"qV",Number($("eq"+n+"q").value).toFixed(1))});
["compTh","makeup"].forEach(id=>{});setText("compThV",fmtDb($("compTh").value));setText("compRatioV",Number($("compRatio").value).toFixed(1)+":1");setText("compAttackV",$("compAttack").value+" ms");setText("compReleaseV",$("compRelease").value+" ms");setText("compKneeV",$("compKnee").value+" dB");setText("makeupV",fmtDb($("makeup").value));setText("faderV",fmtDb($("fader").value));setText("sendV",fmtDb($("send").value));setText("busV",fmtDb($("bus").value));setText("retV",fmtDb($("ret").value));setText("decayV",Number($("decay").value).toFixed(1)+" s");
})();