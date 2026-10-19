import * as THREE from './vendor/three.module.js';
import {createSandbox} from './sandbox.js?v=weapons-4';
import {createSoundEngine} from './sound.js?v=weapons-4';
import {WEAPONS,createWeaponTimeline} from './weapons.js?v=weapons-4';

const $ = id => document.getElementById(id);
const canvas = $('game'), arena = $('arena');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false}); }
catch { $('loading').innerHTML='这个浏览器暂时无法开启 3D<span>请开启硬件加速，或换一个支持 WebGL 的浏览器。</span>'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0xc5cbb5);
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xc5cbb5,18,34);
const camera=new THREE.OrthographicCamera(-6,6,3.5,-3.5,.1,60);
camera.position.set(5.8,4.5,10);camera.lookAt(0,1.7,0);
scene.add(new THREE.HemisphereLight(0xfff8e7,0x6f795d,2.7));
const sun=new THREE.DirectionalLight(0xffefcd,4);sun.position.set(-3,8,6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10});sun.shadow.normalBias=.035;scene.add(sun);
const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
const m={floor:mat('#b9c1a4'),wall:mat('#cbd0b9'),wall2:mat('#b3bea5'),cream:mat('#efeddb'),wood:mat('#b38d5e'),woodLight:mat('#d2b07c'),dark:mat('#424f41'),green:mat('#647458'),leaf:mat('#5d794a'),pot:mat('#d5b28c'),orange:mat('#ee8050'),suit:mat('#686e67'),pants:mat('#444e47'),shoe:mat('#303c33'),skin:mat('#d8ac83'),white:mat('#f0f0de'),black:mat('#29372e')};
const bands=new THREE.DataTexture(new Uint8Array([90,175,255]),3,1,THREE.RedFormat);bands.minFilter=THREE.NearestFilter;bands.magFilter=THREE.NearestFilter;bands.needsUpdate=true;
const toon=color=>new THREE.MeshToonMaterial({color,gradientMap:bands});
m.suit=toon('#66a4c3');m.pants=toon('#426a90');m.shoe=toon('#344253');m.skin=toon('#f4bc88');m.white=toon('#fff5db');
function box(w,h,d,material,x=0,y=0,z=0,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ball(r,material,x,y,z,parent=scene,sx=1,sy=1,sz=1){const o=new THREE.Mesh(new THREE.SphereGeometry(r,24,18),material);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(rt,rb,h,material,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,20),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function label(text,w,h,bg,fg,size=36){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,256);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${size}px Arial, sans-serif`;text.split('\n').forEach((s,i,a)=>ctx.fillText(s,256,128+(i-(a.length-1)/2)*55));const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));}
box(22,.18,18,m.floor,0,-.12,0);
box(19,7,.18,m.wall,0,3.4,-3.5);
box(.18,7,13,m.wall2,-7.2,3.4,2.9);
box(19,.12,.12,m.cream,0,.08,-3.35);
// Quiet grid tiles and warm late-afternoon office light.
const grid=new THREE.GridHelper(22,22,0xa3ae92,0xaab59a);grid.position.y=-.018;grid.material.transparent=true;grid.material.opacity=.35;scene.add(grid);
const win=new THREE.Group();win.position.set(3.2,3.45,-3.36);scene.add(win);
box(4.3,3.6,.11,m.cream,0,0,0,win);
const sky=mat('#dce5ce');box(4.02,3.3,.12,sky,0,0,.02,win);
for(let i=0;i<9;i++){const h=.4+((i*7)%5)*.25;box(.4,h,.02,mat(i%2?'#c3d1bb':'#b9c8b2'),-1.8+i*.45,-1.6+h/2,.1,win);}
for(const x of [-1.38,0,1.38]) box(.055,3.3,.12,m.cream,x,0,.13,win);
box(4.2,.06,.15,m.cream,0,0,.15,win);box(4.5,.13,.4,m.cream,0,-1.8,.12,win);
for(let i=0;i<6;i++)box(4.4,.04,.1,mat('#b9bd9e'),0,1.7-i*.13,.19,win);
const poster=label('REGION NOT\nSUPPORTED',1.75,1.35,'#f5dfca','#a15138',36);poster.position.set(-2.5,3.2,-3.36);scene.add(poster);
box(1.88,1.47,.08,m.wood,-2.5,3.2,-3.43);
const clockFace=label('AFTER\nHOURS',.72,.72,'#e7e8d6','#617154',40);clockFace.position.set(.3,4,-3.36);scene.add(clockFace);
// Credenza, books, and a tiny office succulent.
box(2.9,1.25,.85,m.green,-4.15,.63,-2.7);box(3.04,.12,1,m.woodLight,-4.15,1.31,-2.7);
for(const x of [-4.85,-3.45]){box(1.3,1,.02,m.green,x,.68,-2.26);box(.21,.045,.07,m.cream,x,.78,-2.2);}
for(let i=0;i<6;i++)box(.14,.38+(i%3)*.1,.34,[m.orange,m.cream,m.dark][i%3],-4.8+i*.17,1.55+(i%3)*.05,-2.7);
function plant(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);cylinder(.34,.25,.6,m.pot,0,.3,0,g);cylinder(.29,.29,.04,m.dark,0,.61,0,g);for(let i=0;i<9;i++){const a=i*2.4,r=.2+(i%3)*.12,h=.9+(i%4)*.23;const leaf=ball(.25,m.leaf,Math.cos(a)*r,h,Math.sin(a)*r,g,.5,2.1,.45);leaf.rotation.z=-Math.cos(a)*.65;const stem=cylinder(.018,.018,h-.55,m.leaf,Math.cos(a)*r/2,(h+.55)/2,Math.sin(a)*r/2,g);stem.rotation.z=-Math.cos(a)*.2;}return g;}
plant(-5.9,-1.4,1.4);const tiny=plant(-3.4,-2.7,.45);tiny.position.y=1.37;
// Desk with monitor, keyboard, mug, lamp, and overdue paperwork.
const desk=new THREE.Group();desk.position.set(3.25,0,-.7);scene.add(desk);
box(3.15,.16,1.65,m.woodLight,0,1.38,0,desk);for(const x of [-1.27,1.27])for(const z of [-.56,.56])box(.09,1.3,.09,m.dark,x,.68,z,desk);
box(.5,.05,.35,m.dark,0,1.5,-.3,desk);box(.08,.42,.08,m.dark,0,1.69,-.4,desk);box(1.36,.9,.09,m.dark,0,2.15,-.45,desk);
const screen=label('ERROR 403\nACCESS DENIED',1.21,.75,'#432b28','#ffb68c',32);screen.position.set(0,2.15,-.394);desk.add(screen);
// A fictional access gate opens for the charged special move.
const gate=new THREE.Group();gate.position.set(.15,1.65,-3.18);scene.add(gate);
const gateLeft=box(.62,2.7,.1,m.green,-.33,0,0,gate),gateRight=box(.62,2.7,.1,m.green,.33,0,0,gate);
for(let i=0;i<5;i++){box(.62,.07,.12,m.orange,0,-.9+i*.43,.08,gateLeft);box(.62,.07,.12,m.orange,0,-.9+i*.43,.08,gateRight);}
const gateSign=label('403',.72,.4,'#f5dfca','#a15138',72);gateSign.position.set(0,.3,.16);gate.add(gateSign);
box(.8,.05,.29,m.cream,0,1.51,.39,desk);for(let i=0;i<3;i++)box(.55,.035,.7,m.white,-.98,1.52+i*.04,.1,desk);
cylinder(.13,.12,.28,m.orange,.95,1.6,.4,desk);const handle=new THREE.Mesh(new THREE.TorusGeometry(.11,.03,8,16),m.orange);handle.position.set(1.1,1.62,.4);desk.add(handle);
cylinder(.23,.23,.04,m.dark,1.05,1.51,-.48,desk);const pole=cylinder(.025,.025,.65,m.dark,1.05,1.85,-.48,desk);pole.rotation.z=-.25;const shade=new THREE.Mesh(new THREE.ConeGeometry(.3,.27,20,1,true),m.green);shade.position.set(.95,2.2,-.48);desk.add(shade);
// Office chair, slightly abandoned.
const chair=new THREE.Group();chair.position.set(3.1,0,1);scene.add(chair);box(.88,.15,.85,m.dark,0,.72,0,chair);box(.88,.82,.14,m.green,0,1.15,.36,chair);cylinder(.07,.07,.65,m.dark,0,.35,0,chair);for(let i=0;i<5;i++){const a=i*Math.PI*.4;const leg=box(.7,.06,.06,m.dark,Math.cos(a)*.23,.09,Math.sin(a)*.23,chair);leg.rotation.y=-a;ball(.07,m.black,Math.cos(a)*.55,.08,Math.sin(a)*.55,chair);}
// Comic stand-in: small body, deliberately oversized photographic head.
const person=new THREE.Group();person.position.set(-.65,0,.35);scene.add(person);
const hitMeshes=[];
for(const x of [-.23,.23]){const limb=new THREE.Group();limb.position.set(x,.9,0);limb.userData.limb=true;person.add(limb);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.48,6,12),m.pants);leg.position.set(0,-.38,0);leg.castShadow=true;limb.add(leg);ball(.22,m.shoe,0,-.73,.15,limb,1.05,.7,1.65);}
const torso=ball(.6,m.suit,0,1.35,0,person,.88,1.08,.6);hitMeshes.push(torso);
const shirt=box(.27,.78,.07,m.white,0,1.4,.34,person);const tie=box(.1,.48,.06,m.orange,0,1.42,.39,person);tie.rotation.z=-.08;
for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.48,1.68,0);arm.userData.limb=true;person.add(arm);const sleeve=ball(.19,m.suit,side*.08,-.3,.01,arm,.85,2,.85);sleeve.rotation.z=side*.15;ball(.16,m.skin,side*.13,-.67,.04,arm,.8,1.15,.9);}
const head=new THREE.Group();head.position.set(0,2.62,0);person.add(head);head.quaternion.copy(camera.quaternion);
const headBack=ball(.72,m.skin,0,0,-.06,head,.95,1.18,.45);hitMeshes.push(headBack);
headBack.visible=false;
const faceCanvas=document.createElement('canvas');faceCanvas.width=512;faceCanvas.height=512;const ctx=faceCanvas.getContext('2d');
ctx.fillStyle='#d8ac83';ctx.beginPath();ctx.ellipse(256,320,246,312,0,0,Math.PI*2);ctx.fill();
const faceTexture=new THREE.CanvasTexture(faceCanvas);faceTexture.colorSpace=THREE.SRGBColorSpace;
const face=new THREE.Mesh(new THREE.PlaneGeometry(2.05,2.05),new THREE.MeshBasicMaterial({map:faceTexture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));face.position.z=.28;head.add(face);hitMeshes.push(face);
const portrait=new Image();portrait.onload=()=>{ctx.clearRect(0,0,512,512);ctx.drawImage(portrait,0,0,512,512);faceTexture.needsUpdate=true;};portrait.onerror=()=>{ctx.fillStyle='#393e37';ctx.font='bold 50px Arial';ctx.textAlign='center';ctx.fillText('DARIO',256,240);ctx.fillText('◉  ◉',256,320);faceTexture.needsUpdate=true;};portrait.src='./assets/dario-cartoon-v2.png';
const outlineMat=new THREE.MeshBasicMaterial({color:'#293c42',side:THREE.BackSide});
const bodyMeshes=[];person.traverse(o=>{if(o.isMesh&&o!==face&&o!==headBack)bodyMeshes.push(o);});
for(const mesh of bodyMeshes){const outline=new THREE.Mesh(mesh.geometry,outlineMat);outline.scale.setScalar(1.07);mesh.add(outline);}
const dizzy=new THREE.Group();person.add(dizzy);dizzy.position.y=3.57;dizzy.visible=false;
for(let i=0;i<5;i++){const shape=new THREE.Shape();for(let j=0;j<10;j++){const a=j*Math.PI/5+Math.PI/2,r=j%2?.055:.13;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(j===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();const star=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:'#ffcb45',side:THREE.DoubleSide}));const a=i*Math.PI*.4;star.position.set(Math.cos(a)*.68,Math.sin(a)*.04,Math.sin(a)*.32);star.quaternion.copy(camera.quaternion);dizzy.add(star);}
const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.018,8,64),m.cream);ring.rotation.x=-Math.PI/2;ring.position.set(-.65,.015,.35);scene.add(ring);
// Animated toy props are placed in the camera's plane.
const toy=new THREE.Group();scene.add(toy);const props=[];
const glove=new THREE.Group();ball(.38,m.orange,0,0,0,glove,1,1.1,.85);ball(.19,m.orange,-.29,-.08,.03,glove,.8,1.1,1);box(.43,.24,.37,m.cream,0,-.35,0,glove);box(.35,.12,.39,m.orange,0,-.42,0,glove);props.push(glove);
const hammer=new THREE.Group();cylinder(.07,.07,1.1,m.woodLight,0,-.35,0,hammer);const hammerHead=cylinder(.28,.28,.95,m.orange,0,.2,0,hammer);hammerHead.rotation.z=Math.PI/2;for(const x of [-.5,.5]){const cap=cylinder(.32,.32,.09,m.cream,x,.2,0,hammer);cap.rotation.z=Math.PI/2;}props.push(hammer);
const fish=new THREE.Group();ball(.28,mat('#84b7ac'),0,0,0,fish,1.6,.65,.55);const tail=new THREE.Mesh(new THREE.ConeGeometry(.25,.4,3),mat('#6a9d91'));tail.rotation.z=-Math.PI/2;tail.position.x=-.53;fish.add(tail);ball(.045,m.black,.28,.07,.15,fish);props.push(fish);
const slipper=new THREE.Group();ball(.3,toon('#efb48f'),0,0,0,slipper,.85,1.7,.28);const strap=ball(.24,toon('#e76f51'),0,.17,.07,slipper,1,1,.6);props.push(slipper);
const basketball=new THREE.Group();ball(.4,m.orange,0,0,0,basketball);for(const a of [0,Math.PI/2]){const seam=new THREE.Mesh(new THREE.TorusGeometry(.403,.014,6,32),m.dark);seam.rotation.y=a;basketball.add(seam);}props.push(basketball);
const plunger=new THREE.Group();cylinder(.045,.045,1.05,m.woodLight,0,-.23,0,plunger);const cup=new THREE.Mesh(new THREE.SphereGeometry(.34,20,12,0,Math.PI*2,0,Math.PI/2),toon('#d86b54'));cup.position.y=.25;plunger.add(cup);props.push(plunger);
props.forEach(p=>{p.visible=false;toy.add(p);});toy.visible=false;
const spareGlove=glove.clone();toy.add(spareGlove);spareGlove.visible=false;
const fx=[];
const tether=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:'#cc99ff',dashSize:.09,gapSize:.06}));scene.add(tether);tether.visible=false;
const weaponRight=new THREE.Vector3(),weaponUp=new THREE.Vector3(),weaponNormal=new THREE.Vector3();let trailClock=0;
function effectRing(pos,color,ground=false){const mesh=new THREE.Mesh(new THREE.TorusGeometry(.35,.028,6,40),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false}));mesh.position.copy(pos);if(ground){mesh.position.y=.04;mesh.rotation.x=-Math.PI/2;}else mesh.quaternion.copy(camera.quaternion);scene.add(mesh);fx.push({mesh,age:0,life:.48,expand:true});}
function impactFx(id){const pos=sandbox.anchor(id===1?.4:2.4);effectRing(pos,WEAPONS[id].color,id===1||id===4);if(id===2){for(let i=0;i<14;i++){const mesh=ball(.055,mat('#72dbe0'),pos.x,pos.y,pos.z);fx.push({mesh,age:0,life:.5,velocity:new THREE.Vector3((Math.random()-.5)*5,Math.random()*3,(Math.random()-.5)*3)});}}}
let squash=0,squashTool=0;

let score=0,hits=0,combo=0,lastHit=-100,tool=0,charge=0,hitAge=10,hitDirection=1,shake=0,superAge=10,elapsed=0,rafTime=0;
let soundEnabled=true;try{soundEnabled=localStorage.getItem('dario-audio-enabled')!=='false';}catch{}
const sfx=createSoundEngine({enabled:soundEnabled,onState:({enabled,state})=>{const b=$('sound');b.innerHTML='♪ <span>'+(!enabled?'静音':state==='running'?'ON':state==='unavailable'?'不支持':'点击启用')+'</span>';b.setAttribute('aria-label',enabled?'静音游戏音效':'开启游戏音效');b.setAttribute('aria-pressed',String(enabled));b.dataset.audioState=state;b.title=!enabled?'点击开启音效':state==='running'?'游戏音效已开启':'首次操作游戏后开启声音';}});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#sound'))sfx.unlock();},{capture:true});
window.addEventListener('keydown',e=>{if(['Space','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','KeyF'].includes(e.code))sfx.unlock();},{capture:true});
let best=0;try{best=Number(localStorage.getItem('dario-arcade-best'))||0;}catch{}$('best').textContent=best;
const toolNames=['申诉拳套','反馈锤','咸鱼通行证','拖鞋申诉','反馈弹力球','疏通访问'],costs=[0,0,0,60,120,180],strengths=[1,1.8,.7,1.4,2.1,2.8];
let coins=0,unlocked=[0,1,2],wallHits=0,powerUses=0,peakCombo=0,gateOpen=0;const earned=new Set();
try{const saved=JSON.parse(localStorage.getItem('dario-feedback-save')||'{}');coins=Number.isFinite(saved.coins)?Math.max(0,Math.floor(saved.coins)):0;if(Array.isArray(saved.unlocked))unlocked=[...new Set([0,1,2,...saved.unlocked.filter(i=>Number.isInteger(i)&&i>=0&&i<6)])];}catch{}
function saveProgress(){try{localStorage.setItem('dario-feedback-save',JSON.stringify({coins,unlocked}));}catch{}}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const particles=[],raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const lines=['“ 这条反馈，确实很有分量。”','“ 地区限制？这下收到反馈了。”','“ 申诉通道，这回没堵住。”','“ 我的上下文里全是你的反馈！”','“ 能不能把这封申诉轻一点寄？”','“ 这次不是自动回复了……”','“ 不支持的地区，支持的拳头。”','“ 先把门打开，再谈愿景。”'];
const words=[['申诉已送达！','不支持？接招！','反馈 +1'],['敲开访问！','BONK!','拒绝被拒绝'],['咸鱼也要通行','啪叽！','FISH!'],['拖鞋申诉！','啪！','人工反馈'],['反馈反弹！','BOING!','已读请回'],['疏通访问！','啵！','开门！']];
const sandbox=createSandbox({scene,person,head,camera,canvas,onClick:()=>hit(),onImpact:wallImpact,onThrow:speed=>{if(speed>2){sfx.play('throw');const p=project(sandbox.anchor());floatText('申诉已甩出！',p.x,p.y);}},onGrab:()=>{weapons.cancel();$('hint').style.opacity=0;$('mode-label').textContent='抓住了！松手把反馈甩出去';$('bubble').textContent='“ 等等，反馈不需要这么亲自送……”';}});
const weapons=createWeaponTimeline({onImpact:applyHit,onStart:id=>{sfx.play('swing',id);$('weapon-status').textContent=WEAPONS[id].description;},onAttach:id=>sfx.play('attach',id)});
function project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*arena.clientWidth,y:(-.5*p.y+.5)*arena.clientHeight};}
function floatText(text,x,y,scoreStyle=false){const el=document.createElement('div');el.className='floater'+(scoreStyle?' score-float':'');el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';$('floaters').append(el);setTimeout(()=>el.remove(),900);}
function updateHUD(){ $('score').textContent=String(score).padStart(4,'0');$('best').textContent=best;$('coins').textContent=coins;$('meter').style.width=(charge*10)+'%';$('power').classList.toggle('ready',charge>=10);$('power-text').textContent=charge>=10?'开门能量已满 · 按 F':`再击中 ${10-charge} 次充能`;$('rank').textContent=score>=3000?'反馈传说':score>=1000?'申诉达人':score>=300?'强烈反馈':'准备反馈';$('equipped-name').textContent=toolNames[tool];$('equipped-detail').textContent=WEAPONS[tool].description;document.querySelectorAll('.tool').forEach((b,i)=>{const locked=!unlocked.includes(i);b.classList.toggle('locked',locked);b.classList.toggle('active',i===tool);b.querySelector('small').textContent=locked?`解锁 · ${costs[i]} 反馈币`:WEAPONS[i].description;});}
function award(points,reward=0){score+=points;coins+=reward;if(score>best){best=score;try{localStorage.setItem('dario-arcade-best',best);}catch{}}saveProgress();}
function missions(){const tasks=[['wall',wallHits,3,'撞墙反馈'],['combo',peakCombo,10,'连续申诉'],['power',powerUses,1,'打开大门']];for(const [key,n,max,name]of tasks){const complete=n>=max;if(complete&&!earned.has(key)){earned.add(key);award(0,30);sfx.play('coin');const p=project(sandbox.anchor());floatText('任务完成 +30 币',p.x,p.y+40,true);}const el=$('mission-'+key);el.classList.toggle('done',complete);el.replaceChildren(document.createTextNode(name+' '));const b=document.createElement('b');b.textContent=complete?'✓':`${Math.min(n,max)}/${max}`;el.append(b);}}
function wallImpact(speed,surface){if(sandbox.state.drag)return;hitAge=0;shake=reduced?0:.08;award(Math.round(speed*8),3);if(surface==='wall')wallHits++;const p=project(sandbox.anchor(1.8));floatText(surface==='wall'?'反馈有回响！':surface==='ceiling'?'顶格申诉！':'落地有声！',p.x,p.y);sfx.play(surface==='wall'?'wall':'floor');addParticles();missions();updateHUD();arena.classList.add('impact');setTimeout(()=>arena.classList.remove('impact'),150);}
function addParticles(big=false){const pos=sandbox.anchor();for(let i=0;i<(big?45:10);i++){const mesh=box(.07,.07,.07,[m.orange,m.cream,m.green][i%3],pos.x,pos.y,pos.z);const v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*4+1,(Math.random()-.5)*4);particles.push({mesh,v,life:.6+Math.random()*.5});}}
function hit(big=false){if(sandbox.state.drag)return;sfx.unlock();if(big){weapons.cancel();applyHit({tool,index:0,direction:hits%2?1:-1,big:true});}else weapons.start(tool,hits%2?1:-1);}
function applyHit({tool:id,index=0,direction=1,impulse,big=false}){if(sandbox.state.drag)return;const now=performance.now()/1000;combo=now-lastHit<1.5?combo+1:1;peakCombo=Math.max(peakCombo,combo);lastHit=now;hits++;charge=Math.min(10,charge+1);const points=Math.round(strengths[id]*10)*Math.min(combo,10)*(big?5:1);award(points,big?15:5);if(big)sandbox.kick(2.8,direction,true);else sandbox.impulse(impulse,id);
hitAge=0;hitDirection=direction;shake=reduced?0:big?.26:id===1?.15:.045;sfx.play(big?'super':'impact',id);impactFx(id);squash=.22;squashTool=id;addParticles(big);$('hint').style.opacity=0;$('combo').classList.toggle('show',combo>1);$('combo').querySelector('strong').textContent=combo;$('bubble').textContent=lines[(hits-1)%lines.length];
const p=project(sandbox.anchor());floatText(big?'打！开！大！门！':id===4?`弹跳 ${index+1}/3` :id===3?(index===0?'拖鞋出击！':'回旋再来！'):words[id][Math.floor(Math.random()*3)],p.x+(Math.random()-.5)*80,p.y-20);floatText('+'+points+` · +${big?15:5} 币`,p.x+60,p.y+60,true);missions();updateHUD();}
function superHit(){if(sandbox.state.drag)return;if(charge<10){$('power-text').textContent=`还差 ${10-charge} 次，继续反馈！`;return;}superAge=0;hit(true);charge=0;gateOpen=4;powerUses++;missions();updateHUD();$('bubble').textContent='“ 游戏里的门开了！这条反馈够响亮。”';}
function selectTool(index){if(!unlocked.includes(index)){if(coins<costs[index]){const p=project(sandbox.anchor());floatText(`还差 ${costs[index]-coins} 反馈币`,p.x,p.y,true);$('bubble').textContent='点击或甩飞角色赚反馈币，解锁搞怪道具。';return;}coins-=costs[index];unlocked.push(index);saveProgress();sfx.play('unlock');const p=project(sandbox.anchor());floatText(toolNames[index]+' 已解锁！',p.x,p.y);}tool=index;updateHUD();}
document.querySelectorAll('.tool').forEach(b=>b.addEventListener('click',()=>selectTool(Number(b.dataset.tool))));
$('power').addEventListener('click',superHit);
$('sound').addEventListener('click',async()=>{const enabled=!sfx.enabled;try{localStorage.setItem('dario-audio-enabled',String(enabled));}catch{}await sfx.setEnabled(enabled);if(enabled)sfx.play('impact',tool);});
$('sound-test').addEventListener('click',async()=>{try{localStorage.setItem('dario-audio-enabled','true');}catch{}await sfx.setEnabled(true);await sfx.play('impact',tool);});
function reset(){weapons.cancel();score=0;hits=0;combo=0;charge=0;wallHits=0;powerUses=0;peakCombo=0;gateOpen=0;earned.clear();hitAge=10;superAge=10;lastHit=-100;shake=0;toy.visible=false;sandbox.reset();particles.forEach(p=>{scene.remove(p.mesh);p.mesh.geometry.dispose();});particles.length=0;$('floaters').replaceChildren();$('combo').classList.remove('show');$('hint').style.opacity=1;$('bubble').textContent='“ 地区不支持？你的反馈我收到了。”';missions();updateHUD();}
$('reset').addEventListener('click',reset);
$('recall').addEventListener('click',()=>{weapons.cancel();sandbox.reset();hitAge=10;toy.visible=false;$('mode-label').textContent='点击出拳 · 拖拽甩飞';$('bubble').textContent='“ 我回来了。还有什么反馈？”';});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();hit();}else if(['1','2','3','4','5','6'].includes(e.key))selectTool(Number(e.key)-1);else if(e.key.toLowerCase()==='f')superHit();else if(e.key.toLowerCase()==='r'){$('recall').click();}});
const baseCamera=camera.position.clone();
function resize(){const w=arena.clientWidth,h=arena.clientHeight,aspect=w/h;const vertical=aspect<1?5.8:6.2;camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;if(aspect<1){camera.position.set(3.3,3.5,11);camera.lookAt(-.65,1.65,.35);}else{camera.position.copy(baseCamera);camera.lookAt(0,1.7,0);}camera.updateProjectionMatrix();head.quaternion.copy(camera.quaternion);renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(arena);resize();
function tick(ms){const dt=Math.min((ms-rafTime)/1000||.016,.04);rafTime=ms;elapsed=ms/1000;hitAge+=dt;superAge+=dt;
head.quaternion.copy(camera.quaternion);sandbox.update(dt,elapsed,reduced);const feet=sandbox.anchor(0);ring.position.set(feet.x,.015,feet.z);ring.scale.setScalar(1+Math.sin(elapsed*2)*.035);ring.material.transparent=true;ring.material.opacity=Math.max(.15,1-sandbox.state.y*.15);
gateOpen=Math.max(0,gateOpen-dt);const open=gateOpen>0?Math.min(1,gateOpen):0;gateLeft.position.x=THREE.MathUtils.lerp(gateLeft.position.x,-.33-open*.8,dt*6);gateRight.position.x=THREE.MathUtils.lerp(gateRight.position.x,.33+open*.8,dt*6);gateSign.visible=!open;
if(!sandbox.state.drag)$('mode-label').textContent='点击出拳 · 拖拽甩飞';
dizzy.visible=hitAge<1.25;dizzy.rotation.y=reduced?0:elapsed*3;
const attack=weapons.update(elapsed);const displayed=attack?.tool??tool;props.forEach((p,i)=>p.visible=i===displayed);toy.visible=!sandbox.state.drag;
weaponRight.setFromMatrixColumn(camera.matrixWorld,0);weaponUp.setFromMatrixColumn(camera.matrixWorld,1);weaponNormal.setFromMatrixColumn(camera.matrixWorld,2);
toy.quaternion.copy(camera.quaternion);spareGlove.visible=displayed===0;spareGlove.position.set(-.85,-.12,-.2);spareGlove.scale.setScalar(.8);
head.scale.set(1,1,1);tether.visible=false;
if(attack){const pose=attack.pose,center=sandbox.anchor(2.4);toy.position.copy(center).addScaledVector(weaponRight,pose.x).addScaledVector(weaponUp,pose.y).addScaledVector(weaponNormal,pose.z);toy.rotateZ(reduced?pose.angle*.15:pose.angle);toy.scale.setScalar(pose.scale);
  if(displayed===0){spareGlove.position.x=attack.age<.14?-1:1;spareGlove.scale.setScalar(attack.age<.14?.7:1);}
  if(displayed===5&&attack.age>.23&&attack.age<.95){const pull=(attack.age-.23)/.72;head.scale.set(1+pull*.3,1-pull*.1,1);sandbox.state.vx*=.9;sandbox.state.vy*=.9;const points=tether.geometry.attributes.position;points.setXYZ(0,center.x,center.y,center.z);points.setXYZ(1,toy.position.x,toy.position.y,toy.position.z);points.needsUpdate=true;tether.computeLineDistances();tether.visible=true;}
  if(displayed===3){trailClock+=dt;if(trailClock>.05){trailClock=0;const dot=ball(.055,m.orange,toy.position.x,toy.position.y,toy.position.z);fx.push({mesh:dot,age:0,life:.2});}}
  $('weapon-status').textContent=displayed===5&&attack.age>.23&&attack.age<.95?'吸住了…蓄力拔出！':displayed===1&&attack.age<.44?'蓄力重砸…':WEAPONS[displayed].description;
}else{const mobile=arena.clientWidth/arena.clientHeight<1;toy.position.set(mobile?-.65:0,1.4,mobile?.35:0);toy.position.addScaledVector(weaponRight,camera.right*.73).addScaledVector(weaponUp,-1.25).addScaledVector(weaponNormal,2);toy.rotateZ(-.22+Math.sin(elapsed*1.8)*.06);toy.scale.setScalar(mobile?.78:.94);$('weapon-status').textContent='就绪 · 点击角色或按空格';}
$('weapon-cooldown').style.width=(100*(1-Math.min(1,weapons.remaining/WEAPONS[displayed].cooldown)))+'%';
squash=Math.max(0,squash-dt);if(squash>0&&!reduced){const amount=Math.sin(squash/.22*Math.PI);if(squashTool===1)person.scale.set(1+amount*.18,1-amount*.24,1);if(squashTool===4)person.scale.set(1-amount*.1,1+amount*.16,1);if(squashTool===2)head.rotation.z+=amount*.2;}
for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.age+=dt;const p=f.age/f.life;if(f.expand){f.mesh.scale.setScalar(1+p*4);f.mesh.material.opacity=(1-p)*.8;}else{f.mesh.scale.setScalar(Math.max(.01,1-p));if(f.velocity){f.velocity.y-=dt*7;f.mesh.position.addScaledVector(f.velocity,dt);}}if(p>=1){scene.remove(f.mesh);f.mesh.geometry.dispose();if(f.expand||f.velocity)f.mesh.material.dispose();fx.splice(i,1);}}
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=9*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=dt*5;p.mesh.rotation.z+=dt*3;p.mesh.scale.setScalar(Math.min(1,p.life*3));if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();particles.splice(i,1);}}
if(combo&&elapsed-lastHit>1.3){combo=0;$('combo').classList.remove('show');}
if(shake>.002){camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;shake*=.83;}else{const mobile=arena.clientWidth/arena.clientHeight<1;camera.position.lerp(mobile?new THREE.Vector3(3.3,3.5,11):baseCamera,.15);}
renderer.render(scene,camera);requestAnimationFrame(tick);
}
missions();updateHUD();renderer.render(scene,camera);$('loading').remove();requestAnimationFrame(tick);
// Compact diagnostics for checking a deployed build without exposing game state globally.
window.addEventListener('error',()=>document.body.dataset.gameError='true');
