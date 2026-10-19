import * as THREE from './vendor/three.module.js';

// A camera-plane toy simulation: gravity, bounded throws, spring limbs and restitution.
// The character remains reusable after every impact; no injury states are modeled.
export function createSandbox({scene,person,head,camera,canvas,onClick,onImpact,onThrow,onGrab}) {
  const home=new THREE.Vector3(-.65,1.4,.35),pivot=new THREE.Group();
  scene.add(pivot);pivot.add(person);person.position.set(0,-1.4,0);
  const right=new THREE.Vector3(),normal=new THREE.Vector3(),plane=new THREE.Plane();
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),point=new THREE.Vector3();
  const state={x:0,y:1.4,vx:0,vy:0,angle:0,omega:0,drag:false};
  let press=null,targetX=0,targetY=1.4,cooldown=0,sleep=0;
  const limbs=person.children.filter(o=>o.userData.limb),jointState=limbs.map(()=>({angle:0,v:0}));
  function axes(){right.setFromMatrixColumn(camera.matrixWorld,0).normalize();normal.setFromMatrixColumn(camera.matrixWorld,2).normalize();}
  function limits(){return Math.max(.32,(camera.right-camera.left)/2-.93);}
  function locate(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,1-(e.clientY-r.top)/r.height*2);ray.setFromCamera(mouse,camera);return ray.ray.intersectPlane(plane,point);}
  function begin(e){if(press)return;axes();plane.setFromNormalAndCoplanarPoint(normal,pivot.position);locate(e);ray.setFromCamera(mouse,camera);if(!ray.intersectObjects(person.children,true).length)return;
    canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);press={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),point:point.clone(),baseX:state.x,baseY:state.y,lastT:performance.now(),lastX:state.x,lastY:state.y};sleep=0;
  }
  function move(e){if(!press||e.pointerId!==press.id)return;const moved=Math.hypot(e.clientX-press.x,e.clientY-press.y);if(!state.drag&&moved>7){state.drag=true;canvas.classList.add('grabbing');onGrab();}
    if(!state.drag||!locate(e))return;const delta=point.clone().sub(press.point);targetX=THREE.MathUtils.clamp(press.baseX+delta.dot(right),-limits(),limits());targetY=THREE.MathUtils.clamp(press.baseY+delta.y,.75,3.4);
    const now=performance.now(),dt=Math.max((now-press.lastT)/1000,.016);state.vx=THREE.MathUtils.clamp((targetX-press.lastX)/dt,-14,14);state.vy=THREE.MathUtils.clamp((targetY-press.lastY)/dt,-12,14);press.lastX=targetX;press.lastY=targetY;press.lastT=now;
  }
  function end(e,cancel=false){if(!press||e.pointerId!==press.id)return;const wasDrag=state.drag;if(wasDrag){state.omega=THREE.MathUtils.clamp(-state.vx*.65,-9,9);if(performance.now()-press.lastT>140){state.vx=0;state.vy=0;}if(!cancel)onThrow(Math.hypot(state.vx,state.vy));}else if(!cancel)onClick();
    press=null;state.drag=false;canvas.classList.remove('grabbing');if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  }
  canvas.addEventListener('pointerdown',begin);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',e=>end(e));canvas.addEventListener('pointercancel',e=>end(e,true));
  canvas.addEventListener('lostpointercapture',e=>end(e,true));
  function kick(strength=1,direction=1,launch=false){if(state.drag)return;sleep=0;state.vx+=direction*strength*2.5;state.vy=Math.max(state.vy,launch?8.5:1.9+strength);state.omega+=direction*strength*2.7;for(const j of jointState)j.v+=(Math.random()-.5)*strength*18;}
  function impact(speed,wall){if(speed<2.2||cooldown>0)return;cooldown=.2;onImpact(speed,wall);for(const j of jointState)j.v+=(Math.random()-.5)*speed*3;}
  function reset(){Object.assign(state,{x:0,y:1.4,vx:0,vy:0,angle:0,omega:0,drag:false});press=null;sleep=0;canvas.classList.remove('grabbing');jointState.forEach(j=>{j.angle=0;j.v=0;});}
  function update(dt,time,reduced){axes();cooldown=Math.max(0,cooldown-dt);const bound=limits();if(state.drag){state.x=THREE.MathUtils.lerp(state.x,targetX,Math.min(1,dt*35));state.y=THREE.MathUtils.lerp(state.y,targetY,Math.min(1,dt*35));state.angle=THREE.MathUtils.lerp(state.angle,THREE.MathUtils.clamp(-state.vx*.08,-.6,.6),dt*10);}
    else{const steps=3,h=dt/steps;for(let s=0;s<steps;s++){state.vy-=12*h;state.x+=state.vx*h;state.y+=state.vy*h;state.angle+=state.omega*h;
      // Support distance changes as the plush character rolls on its side.
      const floor=.68+.72*Math.abs(Math.cos(state.angle));
      if(state.y<floor){const speed=Math.abs(state.vy);state.y=floor;if(state.vy<0){state.vy=-state.vy*.48;state.vx*=.8;state.omega*=.72;impact(speed,'floor');}if(speed<.5)state.vy=0;}
      if(state.y>3.5){state.y=3.5;state.vy=-Math.abs(state.vy)*.55;impact(Math.abs(state.vy)*2,'ceiling');}
      if(Math.abs(state.x)>bound){const speed=Math.abs(state.vx);state.x=Math.sign(state.x)*bound;state.vx*=-.7;state.omega+=state.vx*.3;impact(speed,'wall');}
      state.vx*=Math.exp(-h*.6);state.omega*=Math.exp(-h*1.4);
      if(state.y<1.5&&Math.abs(state.vy)<.8){sleep+=h;if(sleep>.6){state.angle=THREE.MathUtils.lerp(state.angle,Math.round(state.angle/(Math.PI*2))*Math.PI*2,h*4);state.y=THREE.MathUtils.lerp(state.y,1.4,h*4);}}else sleep=0;
    }}
    pivot.position.copy(home).addScaledVector(right,state.x);pivot.position.y=state.y;
    pivot.quaternion.setFromAxisAngle(normal,reduced?state.angle*.15:state.angle);
    person.rotation.set(0,0,0);person.scale.set(1,1,1);
    for(let i=0;i<limbs.length;i++){const j=jointState[i],rest=state.drag?Math.sin(time*5+i)*.3:Math.sin(time*2+i)*.035;const force=(rest-j.angle)*55-j.v*7-state.vx*.4;j.v+=force*dt;j.angle+=j.v*dt;limbs[i].rotation.z=THREE.MathUtils.clamp(j.angle,-1.1,1.1);}
    head.rotation.z+=THREE.MathUtils.clamp(-state.vx*.012,-.12,.12);
  }
  function anchor(y=2.5){return person.localToWorld(new THREE.Vector3(0,y,0));}
  return {state,kick,reset,update,anchor};
}
