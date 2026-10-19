import test from 'node:test';
import assert from 'node:assert/strict';
import {WEAPONS,createWeaponTimeline,impulseFor,weaponPose} from '../weapons.js';

test('each weapon completes its own hit pattern, even when frames are skipped',()=>{
  for(let tool=0;tool<6;tool++){
    let time=0;const events=[],attachments=[];
    const timeline=createWeaponTimeline({now:()=>time,onImpact:e=>events.push(e),onAttach:()=>attachments.push(time)});
    assert.equal(timeline.start(tool),true);time=.02;assert.equal(timeline.start(tool),false);
    time=WEAPONS[tool].duration+.1;timeline.update();timeline.update();
    assert.equal(events.length,[2,1,1,2,3,1][tool]);
    assert.deepEqual(events.map(e=>e.index),WEAPONS[tool].events.map((_,i)=>i));
    assert.equal(attachments.length,tool===5?1:0);assert.equal(timeline.busy,false);
  }
});

test('weapons produce different physical outcomes',()=>{
  const fist=impulseFor(0,0,1),hammer=impulseFor(1,0,1),fish=impulseFor(2,0,1),ball=impulseFor(4,2,1);
  assert.ok(hammer.y<0);assert.ok(fist.y>0);assert.ok(Math.abs(fish.spin)>Math.abs(fist.spin)*5);
  assert.equal(ball.spin,0);assert.ok(ball.y>fist.y*2);
  assert.ok(impulseFor(3,0,1).x*impulseFor(3,1,1).x<0);
  assert.ok(impulseFor(5,0,1).x<0);
});

test('basketball visibly touches its target for every scheduled bounce',()=>{
  for(const age of WEAPONS[4].events)assert.equal(weaponPose(4,age).y,-.3);
});

test('recall cancels pending impacts and enables the next attack',()=>{
  let time=0;const events=[];const timeline=createWeaponTimeline({now:()=>time,onImpact:e=>events.push(e)});
  timeline.start(5);time=.4;timeline.update();timeline.cancel();time=2;timeline.update();assert.equal(events.length,0);assert.equal(timeline.start(1),true);
});
