import * as THREE from './vendor/three.module.js';

const $ = id => document.getElementById(id);
const canvas = $('game'), arena = $('arena');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:false}); }
catch { $('loading').innerHTML='这个浏览器暂时无法开启 3D<span>请开启硬件加速，或换一个支持 WebGL 的浏览器。</span>'; throw new Error('WebGL unavailable'); }
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
const poster=label('THINK LESS.\nLIVE MORE.',1.75,1.35,'#e9e4cf','#5c684e',36);poster.position.set(-2.5,3.2,-3.36);scene.add(poster);
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
const screen=label('ALL SYSTEMS\nON A BREAK',1.21,.75,'#263f35','#b6d4a4',32);screen.position.set(0,2.15,-.394);desk.add(screen);
box(.8,.05,.29,m.cream,0,1.51,.39,desk);for(let i=0;i<3;i++)box(.55,.035,.7,m.white,-.98,1.52+i*.04,.1,desk);
cylinder(.13,.12,.28,m.orange,.95,1.6,.4,desk);const handle=new THREE.Mesh(new THREE.TorusGeometry(.11,.03,8,16),m.orange);handle.position.set(1.1,1.62,.4);desk.add(handle);
cylinder(.23,.23,.04,m.dark,1.05,1.51,-.48,desk);const pole=cylinder(.025,.025,.65,m.dark,1.05,1.85,-.48,desk);pole.rotation.z=-.25;const shade=new THREE.Mesh(new THREE.ConeGeometry(.3,.27,20,1,true),m.green);shade.position.set(.95,2.2,-.48);desk.add(shade);
// Office chair, slightly abandoned.
const chair=new THREE.Group();chair.position.set(3.1,0,1);scene.add(chair);box(.88,.15,.85,m.dark,0,.72,0,chair);box(.88,.82,.14,m.green,0,1.15,.36,chair);cylinder(.07,.07,.65,m.dark,0,.35,0,chair);for(let i=0;i<5;i++){const a=i*Math.PI*.4;const leg=box(.7,.06,.06,m.dark,Math.cos(a)*.23,.09,Math.sin(a)*.23,chair);leg.rotation.y=-a;ball(.07,m.black,Math.cos(a)*.55,.08,Math.sin(a)*.55,chair);}
// Comic stand-in: small body, deliberately oversized photographic head.
const person=new THREE.Group();person.position.set(-.65,0,.35);scene.add(person);
const hitMeshes=[];
for(const x of [-.23,.23]){box(.29,.76,.34,m.pants,x,.52,0,person);ball(.2,m.shoe,x,.17,.13,person,1, .65,1.6);}
const torso=ball(.6,m.suit,0,1.35,0,person,.88,1.08,.6);hitMeshes.push(torso);
const shirt=box(.27,.78,.07,m.white,0,1.4,.34,person);const tie=box(.1,.48,.06,m.orange,0,1.42,.39,person);tie.rotation.z=-.08;
for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.48,1.68,0);person.add(arm);const sleeve=ball(.19,m.suit,side*.08,-.3,.01,arm,.85,2,.85);sleeve.rotation.z=side*.15;ball(.16,m.skin,side*.13,-.67,.04,arm,.8,1.15,.9);}
const head=new THREE.Group();head.position.set(0,2.62,0);person.add(head);head.quaternion.copy(camera.quaternion);
const headBack=ball(.72,m.skin,0,0,-.06,head,.95,1.18,.45);hitMeshes.push(headBack);
const faceCanvas=document.createElement('canvas');faceCanvas.width=512;faceCanvas.height=640;const ctx=faceCanvas.getContext('2d');
ctx.fillStyle='#d8ac83';ctx.beginPath();ctx.ellipse(256,320,246,312,0,0,Math.PI*2);ctx.fill();
const faceTexture=new THREE.CanvasTexture(faceCanvas);faceTexture.colorSpace=THREE.SRGBColorSpace;
const face=new THREE.Mesh(new THREE.PlaneGeometry(1.48,1.85),new THREE.MeshBasicMaterial({map:faceTexture,transparent:true,side:THREE.DoubleSide}));face.position.z=.28;head.add(face);hitMeshes.push(face);
const portrait=new Image();portrait.onload=()=>{ctx.clearRect(0,0,512,640);ctx.save();ctx.beginPath();ctx.ellipse(256,320,246,311,0,0,Math.PI*2);ctx.clip();ctx.drawImage(portrait,137,20,313,434,0,0,512,640);ctx.restore();faceTexture.needsUpdate=true;};portrait.onerror=()=>{ctx.fillStyle='#393e37';ctx.font='bold 50px Arial';ctx.textAlign='center';ctx.fillText('DARIO',256,280);ctx.fillText('◉  ◉',256,360);faceTexture.needsUpdate=true;};portrait.src='./assets/dario.webp';
const ring=new THREE.Mesh(new THREE.TorusGeometry(.72,.018,8,64),m.cream);ring.rotation.x=-Math.PI/2;ring.position.set(-.65,.015,.35);scene.add(ring);
// Animated toy props are placed in the camera's plane.
const toy=new THREE.Group();scene.add(toy);const props=[];
const glove=new THREE.Group();ball(.38,m.orange,0,0,0,glove,1,1.1,.85);ball(.19,m.orange,-.29,-.08,.03,glove,.8,1.1,1);box(.43,.24,.37,m.cream,0,-.35,0,glove);box(.35,.12,.39,m.orange,0,-.42,0,glove);props.push(glove);
const hammer=new THREE.Group();cylinder(.07,.07,1.1,m.woodLight,0,-.35,0,hammer);const hammerHead=cylinder(.28,.28,.95,m.orange,0,.2,0,hammer);hammerHead.rotation.z=Math.PI/2;for(const x of [-.5,.5]){const cap=cylinder(.32,.32,.09,m.cream,x,.2,0,hammer);cap.rotation.z=Math.PI/2;}props.push(hammer);
const fish=new THREE.Group();ball(.28,mat('#84b7ac'),0,0,0,fish,1.6,.65,.55);const tail=new THREE.Mesh(new THREE.ConeGeometry(.25,.4,3),mat('#6a9d91'));tail.rotation.z=-Math.PI/2;tail.position.x=-.53;fish.add(tail);ball(.045,m.black,.28,.07,.15,fish);props.push(fish);
props.forEach(p=>{p.visible=false;toy.add(p);});toy.visible=false;

let score=0,hits=0,combo=0,lastHit=-100,tool=0,charge=0,sound=false,audio=null,hitAge=10,hitDirection=1,shake=0,superAge=10,elapsed=0,rafTime=0;
let best=0;try{best=Number(localStorage.getItem('dario-arcade-best'))||0;}catch{}$('best').textContent=best;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const particles=[],raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const lines=['“ 这拳……需要更多算力。”','“ 我们可以先对齐一下吗？”','“ 好的，今天不加班。”','“ 等一下，我的上下文满了！”','“ 我宣布：现在就下班。”','“ 这也在缩放定律里吗？”','“ 请给我一个撤回按钮。”','“ 你已达到今日快乐上限……骗你的。”'];
const words=[['POW!','快乐 +1','下班！'],['BONK!','班味 -1','敲开心'],['摸鱼成功','啪叽！','FISH!']];
function audioReady(){if(!audio)try{audio=new (window.AudioContext||window.webkitAudioContext)();}catch{}if(audio?.state==='suspended')audio.resume().catch(()=>{});}
function beep(big=false){if(!sound)return;audioReady();if(!audio)return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type=tool===2?'sine':'triangle';osc.frequency.setValueAtTime(big?160:tool===1?220:340,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(big?35:65,audio.currentTime+.17);gain.gain.setValueAtTime(.16,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.22);}
function project(v){const p=v.clone().project(camera);return {x:(p.x*.5+.5)*arena.clientWidth,y:(-.5*p.y+.5)*arena.clientHeight};}
function floatText(text,x,y,scoreStyle=false){const el=document.createElement('div');el.className='floater'+(scoreStyle?' score-float':'');el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';$('floaters').append(el);setTimeout(()=>el.remove(),900);}
function updateHUD(){ $('score').textContent=String(score).padStart(4,'0');$('best').textContent=best;$('meter').style.width=(charge*10)+'%';$('power').classList.toggle('ready',charge>=10);$('power-text').textContent=charge>=10?'能量已满 · 按 F 释放':`再击中 ${10-charge} 次充能`;$('rank').textContent=score>=3000?'下班传说':score>=1000?'解压大师':score>=300?'摸鱼达人':'初来乍到';}
function addParticles(big=false){for(let i=0;i<(big?55:12);i++){const mesh=box(.07,.07,.07,[m.orange,m.cream,m.green][i%3],person.position.x,2.5,.65);const v=new THREE.Vector3((Math.random()-.5)*5,Math.random()*4+1,(Math.random()-.5)*4);particles.push({mesh,v,life:.6+Math.random()*.5});}}
function hit(big=false){const now=performance.now()/1000;if(!big&&now-lastHit<.115)return;combo=now-lastHit<1.3?combo+1:1;lastHit=now;hits++;charge=Math.min(10,charge+1);const points=(tool+1)*10*Math.min(combo,10)*(big?5:1);score+=points;if(score>best){best=score;try{localStorage.setItem('dario-arcade-best',best);}catch{}}
hitAge=0;hitDirection=hits%2?1:-1;shake=reduced?0:big?.26:.065;toy.visible=true;props.forEach((p,i)=>p.visible=i===tool);beep(big);addParticles(big);$('hint').style.opacity=0;$('combo').classList.toggle('show',combo>1);$('combo').querySelector('strong').textContent=combo;$('bubble').textContent=lines[(hits-1)%lines.length];
const p=project(new THREE.Vector3(person.position.x,2.7,.6));floatText(big?'下！班！啦！':words[tool][Math.floor(Math.random()*3)],p.x+(Math.random()-.5)*110,p.y-20);floatText('+'+points,p.x+85,p.y+60,true);updateHUD();}
function superHit(){if(charge<10){$('power-text').textContent=`还差 ${10-charge} 次，继续出拳！`;return;}superAge=0;hit(true);charge=0;updateHUD();$('bubble').textContent='“ 今天的会议取消。全员下班！”';}
function selectTool(index){tool=index;document.querySelectorAll('.tool').forEach((b,i)=>b.classList.toggle('active',i===index));}
document.querySelectorAll('.tool').forEach(b=>b.addEventListener('click',()=>selectTool(Number(b.dataset.tool))));
$('power').addEventListener('click',superHit);
$('sound').addEventListener('click',()=>{sound=!sound;if(sound)audioReady();$('sound').innerHTML='♪ <span>'+(sound?'ON':'OFF')+'</span>';$('sound').setAttribute('aria-label',sound?'关闭音效':'打开音效');if(sound)beep();});
function reset(){score=0;hits=0;combo=0;charge=0;hitAge=10;superAge=10;lastHit=-100;shake=0;toy.visible=false;particles.forEach(p=>{scene.remove(p.mesh);p.mesh.geometry.dispose();});particles.length=0;$('floaters').replaceChildren();$('combo').classList.remove('show');$('hint').style.opacity=1;$('bubble').textContent='“ 我有一个关于 AI 的小想法……”';person.rotation.set(0,0,0);person.position.set(-.65,0,.35);updateHUD();}
$('reset').addEventListener('click',reset);
canvas.addEventListener('pointerdown',e=>{canvas.focus({preventScroll:true});const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);if(raycaster.intersectObjects(person.children,true).length)hit();else{const p=project(new THREE.Vector3(person.position.x,2,.35));floatText('瞄准中间的大头！',p.x,p.y,true);}});
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();hit();}else if(['1','2','3'].includes(e.key))selectTool(Number(e.key)-1);else if(e.key.toLowerCase()==='f')superHit();});
const baseCamera=camera.position.clone();
function resize(){const w=arena.clientWidth,h=arena.clientHeight,aspect=w/h;const vertical=aspect<1?5.8:6.2;camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;if(aspect<1){camera.position.set(3.3,3.5,11);camera.lookAt(-.65,1.65,.35);}else{camera.position.copy(baseCamera);camera.lookAt(0,1.7,0);}camera.updateProjectionMatrix();head.quaternion.copy(camera.quaternion);renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(arena);resize();
function tick(ms){const dt=Math.min((ms-rafTime)/1000||.016,.04);rafTime=ms;elapsed=ms/1000;hitAge+=dt;superAge+=dt;const k=Math.exp(-hitAge*6),s=Math.sin(hitAge*27);const power=superAge<1.2?Math.sin(superAge*Math.PI/1.2):0;
person.position.y=reduced?0:Math.abs(Math.sin(hitAge*15))*k*.28+power*1.6;person.rotation.z=reduced?0:hitDirection*s*k*.35+power*Math.PI*2;person.rotation.x=reduced?0:s*k*.17;person.rotation.y=reduced?0:Math.sin(elapsed*.7)*.055;head.rotation.z=reduced?0:Math.sin(elapsed*1.5)*.025+s*k*.1;
ring.scale.setScalar(1+Math.sin(elapsed*2)*.035);
if(hitAge<.4){const p=person.position.clone().add(new THREE.Vector3(.5,2.2,1.2));toy.position.copy(p);toy.quaternion.copy(camera.quaternion);const a=Math.sin(Math.min(hitAge/.27,1)*Math.PI);toy.translateX((1-a)*1.9);toy.translateY(-.3+(1-a)*-.8);toy.rotation.z=-.4+a*.8;toy.scale.setScalar(tool===1?1.1:1);}else toy.visible=false;
for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.v.y-=9*dt;p.mesh.position.addScaledVector(p.v,dt);p.mesh.rotation.x+=dt*5;p.mesh.rotation.z+=dt*3;p.mesh.scale.setScalar(Math.min(1,p.life*3));if(p.life<=0){scene.remove(p.mesh);p.mesh.geometry.dispose();particles.splice(i,1);}}
if(combo&&elapsed-lastHit>1.3){combo=0;$('combo').classList.remove('show');}
if(shake>.002){camera.position.x+=(Math.random()-.5)*shake;camera.position.y+=(Math.random()-.5)*shake;shake*=.83;}else{const mobile=arena.clientWidth/arena.clientHeight<1;camera.position.lerp(mobile?new THREE.Vector3(3.3,3.5,11):baseCamera,.15);}
renderer.render(scene,camera);requestAnimationFrame(tick);
}
updateHUD();renderer.render(scene,camera);$('loading').remove();requestAnimationFrame(tick);
// Compact diagnostics for checking a deployed build without exposing game state globally.
window.addEventListener('error',()=>document.body.dataset.gameError='true');
