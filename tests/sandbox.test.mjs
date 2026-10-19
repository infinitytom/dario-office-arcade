import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createSandbox} from '../sandbox.js';

function fixture(){
  class Canvas extends EventTarget {
    classList={add(){},remove(){}};
    getBoundingClientRect(){return {left:0,top:0,width:400,height:400};}
    setPointerCapture(){} hasPointerCapture(){return false;} focus(){}
  }
  const scene=new THREE.Scene(),person=new THREE.Group(),head=new THREE.Group();
  const body=new THREE.Mesh(new THREE.BoxGeometry(1,3.3,.8));body.position.y=1.4;person.add(body,head);head.position.y=2.6;
  const camera=new THREE.OrthographicCamera(-3,3,3,-3,.1,50);camera.position.set(0,1.4,10);camera.lookAt(0,1.4,0);camera.updateMatrixWorld();
  const canvas=new Canvas(),impacts=[];let clicks=0,throws=0;
  const sandbox=createSandbox({scene,person,head,camera,canvas,onClick:()=>clicks++,onImpact:(speed,surface)=>impacts.push({speed,surface}),onThrow:()=>throws++,onGrab(){}});
  sandbox.update(1/60,0,false);scene.updateMatrixWorld(true);
  function dispatch(type,x,y){const e=new Event(type);Object.assign(e,{pointerId:1,clientX:x,clientY:y});canvas.dispatchEvent(e);}
  return {sandbox,scene,impacts,dispatch,get clicks(){return clicks;},get throws(){return throws;}};
}

test('strong throw hits boundaries, remains finite and returns to rest',()=>{
  const {sandbox,impacts}=fixture();sandbox.kick(4,1,true);
  for(let i=0;i<1200;i++){sandbox.update(1/60,i/60,false);for(const value of Object.values(sandbox.state))if(typeof value==='number')assert.ok(Number.isFinite(value));assert.ok(Math.abs(sandbox.state.x)<=2.071);assert.ok(sandbox.state.y>=.67);}
  assert.ok(impacts.some(i=>i.surface==='wall'));
  assert.ok(impacts.some(i=>i.surface==='floor'));
  assert.ok(Math.abs(sandbox.state.vx)<.01);
});

test('pointer click and drag are distinct; cancellation releases the puppet',()=>{
  const f=fixture();f.dispatch('pointerdown',157,200);f.dispatch('pointerup',157,200);assert.equal(f.clicks,1);
  f.dispatch('pointerdown',157,200);f.dispatch('pointermove',270,110);assert.equal(f.sandbox.state.drag,true);
  f.sandbox.update(1/60,1,false);assert.ok(f.sandbox.state.x>0);
  f.dispatch('pointerup',270,110);assert.equal(f.sandbox.state.drag,false);assert.equal(f.throws,1);assert.equal(f.clicks,1);
  f.sandbox.reset();f.sandbox.update(1/60,2,false);f.scene.updateMatrixWorld(true);
  f.dispatch('pointerdown',157,200);f.dispatch('pointermove',260,100);f.dispatch('pointercancel',260,100);assert.equal(f.sandbox.state.drag,false);assert.equal(f.throws,1);
});

test('recall clears flight velocity and spin',()=>{
  const {sandbox}=fixture();sandbox.kick(5,-1,true);sandbox.update(.04,1,false);sandbox.reset();
  assert.deepEqual(sandbox.state,{x:0,y:1.4,vx:0,vy:0,angle:0,omega:0,drag:false});
});
