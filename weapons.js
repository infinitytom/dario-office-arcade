export const WEAPONS=[
  {name:'申诉拳套',description:'左右双拳 · 快速连打',duration:.34,cooldown:.29,events:[.065,.19],color:'#ff754d'},
  {name:'反馈锤',description:'蓄力下砸 · 地面冲击',duration:1.05,cooldown:1.05,events:[.44],color:'#ffbd53'},
  {name:'咸鱼通行证',description:'咸鱼横扫 · 旋转甩飞',duration:.75,cooldown:.7,events:[.25],color:'#5dccda'},
  {name:'拖鞋申诉',description:'回旋拖鞋 · 来回两击',duration:1.05,cooldown:1.05,events:[.23,.77],color:'#fa9d8e'},
  {name:'反馈弹力球',description:'弹跳三连 · 上下颠飞',duration:1.3,cooldown:1.3,events:[.18,.56,.96],color:'#f5a53e'},
  {name:'疏通访问',description:'吸住蓄力 · 拔出弹飞',duration:1.5,cooldown:1.5,events:[.95],color:'#bc94ee'}
];

// The same timeline drives the visible prop, physical impulse, and impact sound.
export function impulseFor(tool,index,direction){switch(tool){
  case 0:return {x:(index===0?direction:-direction)*2.8,y:2.1,spin:(index===0?1:-1)*.6};
  case 1:return {x:direction*.5,y:-8,spin:direction*.8};
  case 2:return {x:direction*7.4,y:1.2,spin:direction*10};
  case 3:return {x:(index===0?direction:-direction)*5.5,y:index===0?3.1:5.3,spin:(index===0?direction:-direction)*5};
  case 4:return {x:direction*.4,y:[4.8,5.8,7.4][index],spin:0};
  case 5:return {x:-direction*7,y:7.5,spin:-direction*4.5};
}}
export function weaponPose(tool,age,direction=1){const c=WEAPONS[tool],p=Math.max(0,Math.min(1,age/c.duration));let x=0,y=0,z=1.2,angle=0,scale=1.35;
  switch(tool){
    case 0:{const phase=(age<.14?age/.14:(age-.14)/.2);x=(age<.14?direction:-direction)*(1.65-Math.sin(Math.min(1,phase)*Math.PI)*1.45);y=-.12;angle=-x*.4;scale=1.4;break;}
    case 1:if(age<.44){const a=age/.44;x=direction*(1.25-a);y=1.75-2.3*a*a;angle=direction*(-.8+a*1.1);}else{x=direction*.2;y=-.55+(age-.44)*1.9;angle=direction*.35;}scale=1.7;break;
    case 2:x=direction*(1.9-4.5*p);y=Math.sin(p*Math.PI)*.3;angle=direction*(-.7+p*2);scale=1.8;break;
    case 3:x=direction*Math.cos(p*Math.PI*2)*2;y=Math.sin(p*Math.PI*2)*.75;angle=direction*p*Math.PI*8;scale=1.7;break;
    case 4:{const distance=Math.min(...c.events.map(t=>Math.abs(age-t)));y=-.3+Math.min(1.9,distance*9);x=direction*.25;angle=p*7;scale=1.35;break;}
    case 5:if(age<.23){x=direction*(1.8-age/.23*1.65);}else if(age<.95){x=direction*(.15+(age-.23)*.9);y=Math.sin(age*50)*.025;}else{x=direction*(.8+(age-.95)*2.7);y=(age-.95)*.8;}angle=direction*Math.PI/2;scale=1.5;break;
  }
  return {x,y,z,angle,scale};
}
export function createWeaponTimeline({onImpact,onStart=()=>{},onAttach=()=>{},now=()=>performance.now()/1000}){
  let attack=null,nextAt=0,serial=0;
  function start(tool,direction=1){const time=now();if(time<nextAt)return false;update(time);const cfg=WEAPONS[tool];attack={tool,direction,start:time,index:0,attached:false,id:++serial};nextAt=time+cfg.cooldown;onStart(tool);return true;}
  function update(time=now()){
    if(!attack)return null;const a=attack,cfg=WEAPONS[a.tool],age=Math.max(0,time-a.start);
    if(a.tool===5&&age>=.23&&!a.attached){a.attached=true;onAttach(a.tool);}
    while(a.index<cfg.events.length&&age>=cfg.events[a.index]){const index=a.index++;onImpact({tool:a.tool,index,direction:a.direction,id:a.id,impulse:impulseFor(a.tool,index,a.direction)});}
    if(age>cfg.duration){attack=null;return null;}return {...a,age,pose:weaponPose(a.tool,age,a.direction),remaining:Math.max(0,nextAt-time)};
  }
  return {start,update,cancel(){attack=null;nextAt=0;},get busy(){return attack!==null;},get remaining(){return Math.max(0,nextAt-now());}};
}
