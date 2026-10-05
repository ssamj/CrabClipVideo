// Original crab rig + original window proportions. New holiday editing choreography.
// Every state is a pure function of seconds. No simulation or random render history.
'use strict';
const FPS=60,DUR=46.6,MONTAGE_START=28.1,MONTAGE_DURATION=10.5;
// Real edit time -> authored animation time. Dialogue remains at its natural speed.
// V3 keeps the fast work sequence, selecting 16 pictures for a 10.5s montage.
const EDIT_MAP=[[0,0],[5.4,6.4],[7.5,8.9],[10,14],[12,20],[14.25,25],[16.5,30],[18.75,35],[21,39.7],[22.8,42],[25.8,45.3],[26.9,46.4],[28.1,48],[38.6,62],[46.6,70]];
function storyTime(t){return keys(t,EDIT_MAP,u=>u)}
function editTime(t){return keys(t,EDIT_MAP.map(([a,b])=>[b,a]),u=>u)}
const EDIT_ORDER=[0,14,1,20,2,21,3,6,22,5,19,17,16,12,15,18,7,4,8,9,23,13,10];
const clipPos=i=>({x:474+(i%12)*69,y:814+Math.floor(i/12)*45});
window.STAGE={w:W,h:H,fps:FPS};
const WIN={x:40,y:24,w:1840,h:1032},LEFT={x:68,y:120,w:340,h:910},TERM={x:432,y:120,w:904,h:572},TEST={x:432,y:720,w:904,h:310},BOARD={x:1360,y:120,w:492,h:428},PREV={x:1360,y:572,w:492,h:458};
const CAM=[
 [0,[884,407,1.72]],[1.8,[884,407,1.72]],[3.1,[960,540,1.01]],
 [4.3,[960,540,1.01]],[5.2,[891,560,1.8]],[6.8,[891,560,1.8]],
 [7.65,[1510,349,1.95]],[8.7,[1510,349,1.95]],[9.45,[395,536,1.60]],
 [12.0,[395,536,1.60]],[12.8,[433,645,1.66]],[14.0,[575,694,1.4]],
 [15,[879,798,1.55]],[19.5,[879,798,1.55]],[20.2,[873,442,1.67]],
 [24.6,[873,442,1.67]],[25.1,[918,432,1.63]],[29.8,[918,432,1.63]],
 [30.3,[867,442,1.67]],[34.8,[867,442,1.67]],[35.3,[885,442,1.62]],
 [39.3,[885,442,1.62]],[40.2,[962,530,1.06]],[42.5,[962,530,1.06]],
 [43.3,[1190,492,1.72]],[45.8,[1190,492,1.72]],[46.7,[1330,674,1.45]],
 [47.5,[1330,674,1.45]],[62.4,[1330,674,1.45]],[63.2,[1025,470,1.6]],
 [64.2,[1025,470,1.6]],[64.5,[1090,490,1.9]],[66.3,[1090,490,1.9]],
 [67.4,[1090,490,1.9]],[69,[1020,500,1.5]],[70,[1020,500,1.5]]
];
function camera(t){let [x,y,z]=keys(t,CAM);let rot=0;for(const [at,amp,d] of [[2.15,7,.35],[4.25,10,.35],[12.9,8,.3],[39.9,10,.4],[43.8,6,.2],[64.15,4,.25]]){let u=inv(at,at+d,t);if(within(t,at,at+d)){x+=Math.sin(t*85)*amp*(1-u);y+=Math.cos(t*69)*amp*.7*(1-u)}}if(within(t,39.8,42)){rot=Math.sin((t-39.8)*12)*.025*inv(39.8,40.8,t)}return {x,y,z,rot}}
function toLocal(o,wx,wy){const dx=wx-o.x,dy=wy-o.y+(o.lift||0),a=-(o.rot||0);return {x:(dx*Math.cos(a)-dy*Math.sin(a))/(o.s||1)/(o.sx||1),y:(dx*Math.sin(a)+dy*Math.cos(a))/(o.s||1)/(o.sy||1)}}
function blink(t){let d=(t+1.4)%3.3;return d<.14?Math.sin(d/.14*Math.PI):0}
function sq(t,at,amp=.24){let d=Math.max(0,t-at),v=t<at?0:Math.cos(d*27)*Math.exp(-d*8)*amp;return {sx:1+v*.8,sy:1-v}}
function pin(x,y,col=C.red){ellipse(x,y,8,8,col,true,3);ellipse(x-2,y-2,2.5,2.5,'#FFF9DC',false)}
function phase(t){return t<6.4?'导入国庆相册':t<14?'整理素材':t<20?'铺好时间线':t<25?'甩镜转场':t<30?'圆形匹配':t<35?'折纸转场':t<40?'旋转匹配':t<45.5?'转场强度过高':t<48?'准备播放':t<62?'正在播放':t<64.1?'导出完成':'追加一张照片'}
function drawDesk(cam){ctx.fillStyle=C.bg;ctx.fillRect(-1500,-1500,5000,4500);ctx.fillStyle=C.bgDot;for(let x=-500;x<2450;x+=48)for(let y=-500;y<1700;y+=48){circle(x,y,3);ctx.fill()}}
function drawWindow(t){
 panel(WIN.x,WIN.y,WIN.w,WIN.h,{fill:C.win,r:28,lw:5});line([[44,98],[1876,98]],C.line,3.5);
 [C.red,C.yellow,C.green].forEach((c,i)=>ellipse(82+i*34,61,10,10,c,true,3.5));
 txt('小螃蟹剪辑台  —  国庆相册',960,62,{size:28,align:'center',color:C.inkSoft});
 txt('剪辑进度',1588,62,{size:25,align:'right',color:C.inkSoft});box(1612,48,200,26,'#FFFDF5',13,3.5);
 const k=keys(t,[[0,0],[6.4,.06],[14,.18],[20,.32],[39.5,.88],[45.5,.94],[61.8,1]]);
 ctx.save();rr(1615,51,194,20,10);ctx.clip();ctx.fillStyle=C.mint;ctx.fillRect(1615,51,k*194,20);ctx.restore();txt(`${Math.round(k*100)}%`,1825,62,{size:23,color:C.inkSoft});
}
const DRAWERS=[{y:170,h:98,label:'吃的',n:'216 张',col:C.sky,photo:2},{y:279,h:98,label:'喝的',n:'87 张',col:C.lav,photo:3},{y:390,h:242,label:'自拍',n:'连拍 × 99',col:C.gray,fat:true,photo:10},{y:647,h:105,label:'玩的',n:'312 张',col:C.mint,photo:6},{y:765,h:100,label:'夜景',n:'186 张',col:C.pink,photo:9}];
function drawLeft(t){
 panel(LEFT.x,LEFT.y,LEFT.w,LEFT.h,{fill:'#FFF8EC'});txt('国庆相册',95,147,{size:26,color:C.inkSoft});
 DRAWERS.forEach((d,i)=>{
  let open=within(t,9,12)?Math.max(0,Math.sin((t-9)*TAU*.9-i*.7))*.12:0;
  if(d.fat)open=keys(t,[[0,0],[12,0],[12.4,1],[13.7,1],[14.2,0]]);
  const x=90+(d.fat?noise1(t*11,5)*2:0),y=d.y+open*18,w=296;
  if(open>.01)box(x+5,d.y-8,w-10,30*open,'#4A3A30',5,3);
  ctx.save();ctx.translate(x+w/2,y+d.h/2);ctx.scale(1+open*.06,1+open*.025);ctx.translate(-x-w/2,-y-d.h/2);
  if(d.fat){
   for(let j=0;j<6;j++)photo(10,x+35+j*44,d.y+2,48,-.3+hash(j)*.6,false);
   ctx.beginPath();ctx.moveTo(x,y+10);ctx.quadraticCurveTo(x+w/2,y-12,x+w,y+10);ctx.quadraticCurveTo(x+w+18,y+d.h/2,x+w,y+d.h-6);ctx.quadraticCurveTo(x+w/2,y+d.h+12,x,y+d.h-6);ctx.quadraticCurveTo(x-18,y+d.h/2,x,y+10);fillStroke('#E9E1D5',4.5);
   for(let j=1;j<4;j++)line([[x+14,y+d.h*j/4],[x+w-14,y+d.h*j/4+4]],'#B4A591',2);
   box(x+40,y+78,218,87,'#FFFDF7',11,3.5);txt('自拍 / 一张就好',x+w/2,y+104,{size:25,align:'center'});txt(d.n,x+w/2,y+140,{size:24,align:'center',color:C.inkSoft});
  }else{
   box(x,y,w,d.h,d.col,12,4.5);box(x+8,y+7,w-16,10,'#FFFFFF55',5,0);box(x+17,y+d.h/2-22,122,44,'#FFFDF7',8,3.5);txt(d.label,x+79,y+d.h/2,{size:27,align:'center'});box(x+w-78,y+d.h/2-9,52,18,'#FFFDF7',9,3.5);txt(d.n,x+157,y+d.h/2,{size:19,color:C.inkSoft});
  }ctx.restore();
 });
 photo(12,153,931,112,-.07);photo(13,298,943,122,.1);txt('共 827 张  /  原图已保留',234,1000,{size:19,align:'center',color:C.inkSoft});
}
function drawBoard(t){
 panel(BOARD.x,BOARD.y,BOARD.w,BOARD.h,{fill:C.cork});ctx.save();rr(BOARD.x,BOARD.y,BOARD.w,BOARD.h,22);ctx.clip();for(let i=0;i<90;i++)ellipse(1360+hash(i)*492,120+hash(i+50)*428,2+hash(i+9)*2,2+hash(i+9)*2,C.corkD,false);ctx.restore();
 photo(13,1438,254,122,-.08);pin(1438,190);
 ctx.save();ctx.translate(1440,441);ctx.rotate(.06);box(-61,-47,122,94,C.pink,3,4);txt('假期结束',0,-13,{size:24,align:'center'});txt('快乐存档！',0,18,{size:21,align:'center'});pin(0,-40,C.sky);ctx.restore();
 if(t>7.5){let u=eback(inv(7.5,7.8,t));ctx.save();ctx.translate(1674,180);ctx.rotate(.035+Math.sin((t-7.5)*27)*.09*Math.exp(-Math.max(0,t-7.5)*8));ctx.scale(u,u);ctx.fillStyle=C.shadow;ctx.fillRect(-140+6,8,280,240);box(-140,0,280,240,C.note,0,4);box(-138,2,276,26,C.noteD,0,0);pin(0,14);txt('剪辑要求',-116,57,{size:32});
  ['国庆出游','吃喝玩乐','转场酷一点'].forEach((s,i)=>{if(t<7.8+i*.2)return;let y=107+i*46;box(-111,y-12,24,24,'#FFECAA',4,3);txt(s,-75,y,{size:28});if(t>[14,20,45.5][i])line([[-108,y],[-100,y+8],[-83,y-13]],C.redD,5)});ctx.restore();
 }
}
function drawTimeline(t){
 panel(TEST.x,TEST.y,TEST.w,TEST.h,{fill:'#FFF8ED'});txt('剪辑时间线',457,750,{size:25,color:C.inkSoft});txt(t<48?'精选 16 张 / 10.5s':'已完成 / 10.5s',1120,750,{size:21,color:C.inkSoft});
 line([[458,783],[1310,783]],C.line,3);
 for(let i=0;i<16;i++){let x=477+i*53;line([[x,783],[x,792]],C.inkSoft,2);if(i%2===0)txt(`0:${String(i).padStart(2,'0')}`,x,804,{size:15,align:'center',color:C.inkSoft})}
 const n=Math.floor(keys(t,[[0,0],[14.2,0],[18.2,23],[70,23]]));
 for(let i=0;i<23;i++){
  const {x,y}=clipPos(i);box(x,y,64,41,i<n?'#FEF4D9':'#F0E8DB',4,2);
  if(i<n){imageFit(EDIT_ORDER[i],x+2,y+2,60,37);if(i>0&&t>20+(i%4)*5)box(x-5,y+15,10,13,[C.sky,C.yellow,C.pink,C.mint][i%4],2,1.5)}
 }
 if(t>=14){let u=eout(inv(14,15.4,t));box(474,916,828*u,48,'#C0E2CC',7,3);ctx.save();ctx.beginPath();ctx.rect(474,916,828*u,48);ctx.clip();for(let i=0;i<200;i++){let h=3+(Math.sin(i*.34)*.5+.5)*(6+hash(i)*14);line([[480+i*4.1,940-h],[480+i*4.1,940+h]],'#4D967B',2)}ctx.restore();txt('♪  假日好心情',485,985,{size:20,color:C.inkSoft})}
 if(t>=15){let x=keys(t,[[15,481],[19.8,1284],[20,481],[39,1284],[46.4,481],[48,481],[62,1294]]);line([[x,812],[x,970]],C.red,3);poly([[x-7,809],[x+7,809],[x,819]],C.red,false)}
 if(t>45.7){box(1149,974,153,34,C.mint,8,3);txt(t<62?'▶ 播放':'✓ 已导出',1224,991,{size:20,align:'center'})}
}
function mainPhoto(t){return t<9?0:t<10?20:t<11?21:t<12?12:t<14?13:t<20?EDIT_ORDER[Math.min(22,Math.floor((t-14)*23/6))]:t<22.6?1:t<25?2:t<28?3:t<30?6:t<33?5:t<35?12:t<37.5?6:t<39?4:t<46?9:t<64.1?13:11}
function paperPlane(x,y,s,rot=0,id=5){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);poly([[-120,-52],[142,0],[-122,62],[-53,3]],'#FFF7E4',true,4);ctx.save();ctx.beginPath();ctx.moveTo(-120,-52);ctx.lineTo(142,0);ctx.lineTo(-50,-8);ctx.closePath();ctx.clip();ctx.globalAlpha*=.6;ctx.drawImage(PHOTOS[id],-120,-52,260,114);ctx.restore();line([[-120,-52],[-50,-8],[142,0],[-53,3],[-67,64],[-50,-8]],C.ink,3);ctx.restore()}
function transition(type,u,a,b,x,y,w,h){
 u=clamp(u);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 if(type==='whip'){
  let p=eio(u);imageFit(a,x-w*p,y,w,h,1.03);imageFit(b,x+w*(1-p),y,w,h,1.03);
  if(u>.12&&u<.88){withAlpha(Math.sin(u*Math.PI)*.55,()=>{for(let i=0;i<12;i++)line([[x+hash(i)*w,y+hash(i+21)*h],[x+hash(i)*w-w*.24,y+hash(i+21)*h]],'#FFF1CE',3+hash(i)*6)})}
 }else if(type==='circle'){
  imageFit(a,x,y,w,h,1+u*.35);ctx.save();circle(x+w*.5,y+h*.46,Math.hypot(w,h)*eio(u)*.6);ctx.clip();imageFit(b,x,y,w,h,1.15-.15*u);ctx.restore();
  if(u>.04&&u<.9){circle(x+w*.5,y+h*.46,Math.hypot(w,h)*eio(u)*.6);ink(Math.max(3,w*.014),'#FFF4DC');ctx.stroke()}
 }else if(type==='plane'){
  imageFit(b,x,y,w,h,1.04-.04*u);if(u<.5){ctx.save();ctx.translate(x+w/2,y+h/2);ctx.rotate(-u*.14);ctx.scale(1-u*1.75,1-u*.9);imageFit(a,-w/2,-h/2,w,h);ctx.restore()}
  if(u>.17&&u<.95){let q=inv(.17,.95,u);paperPlane(x+w*(.5+q*.8),y+h*(.52-q*.5),w/400*(1-q*.8),-.2-q*.3,a)}
 }else if(type==='spin'){
  ctx.fillStyle='#EFD7AF';ctx.fillRect(x,y,w,h);ctx.save();ctx.translate(x+w*.5,y+h*.5);ctx.rotate(eio(u)*TAU);let sc=1+.15*Math.sin(u*Math.PI);ctx.scale(sc,sc);imageFit(u<.5?a:b,-w/2,-h/2,w,h,1.12);ctx.restore();
  if(u>.35&&u<.65)withAlpha(Math.sin(inv(.35,.65,u)*Math.PI)*.65,()=>{ctx.fillStyle='#F8E8C6';ctx.fillRect(x,y,w,h)})
 }else if(type==='wave'){
  imageFit(a,x,y,w,h,1.02);ctx.save();ctx.beginPath();ctx.moveTo(x,y+h);for(let j=0;j<=30;j++){let xx=x+j*w/30,yy=y+h*(1-u)+Math.sin(j*.36-u*5)*h*.06;ctx.lineTo(xx,yy)}ctx.lineTo(x+w,y+h);ctx.closePath();ctx.clip();imageFit(b,x,y,w,h);ctx.restore();ctx.beginPath();for(let j=0;j<=30;j++){let xx=x+j*w/30,yy=y+h*(1-u)+Math.sin(j*.36-u*5)*h*.06;ctx[j?'lineTo':'moveTo'](xx,yy)}ink(w*.013,'#FFF3D5');ctx.stroke();
 }else if(type==='steam'){
  imageFit(u<.5?a:b,x,y,w,h,1.04);let cover=Math.sin(u*Math.PI);withAlpha(cover,()=>{ctx.fillStyle='#FFF4DC';ctx.fillRect(x,y,w,h);for(let i=0;i<9;i++)cloud(x+w*(i/8),y+h*.7-u*h,w/410,'#FFF9E9')});
 }else{
  imageFit(a,x,y,w,h,1.02);ctx.save();ctx.beginPath();ctx.rect(x,y,w*eio(u),h);ctx.clip();imageFit(b,x,y,w,h);ctx.restore();
 }ctx.restore();
}
function drawStage(t){
 panel(TERM.x,TERM.y,TERM.w,TERM.h,{fill:C.term,r:22});ctx.save();rr(TERM.x,TERM.y,TERM.w,TERM.h,22);ctx.clip();ctx.fillStyle=C.termHead;ctx.fillRect(TERM.x,TERM.y,TERM.w,46);ctx.restore();
 [C.red,C.yellow,C.green].forEach((c,i)=>ellipse(459+i*24,143,6,6,c,false));txt('国庆相册 / 剪辑台',566,144,{size:24,color:C.termText});txt(phase(t),1308,145,{size:21,align:'right',color:C.mint});
 for(let x=469;x<1310;x+=42)for(let y=192;y<630;y+=42){ellipse(x,y,1.5,1.5,'#544337',false)}
 if(t<2){
  let u=eout(inv(.1,.6,t));withAlpha(u,()=>{box(553,264,667,174,'#FCF5E8',15,4);txt('国庆拍了八百多张',588,306,{size:37});txt('帮我剪个视频，转场酷一点。',588,363,{size:31});txt('附件：国庆相册.zip  /  827 张',588,405,{size:22,color:C.inkSoft})});
 }else if(t<6.2){
  let u=inv(2,2.25,t);ctx.save();ctx.translate(875,445);ctx.rotate(Math.sin(t*30)*.025*(1-u));box(-171,-104,160,49,C.yellow,8,4);box(-190,-76,380,231,C.yellow,14,5);box(-180,-63,360,18,'#FFE8A3',7,0);txt('国庆相册',0,10,{size:42,align:'center'});txt('827 张',0,70,{size:27,align:'center',color:C.inkSoft});ctx.restore();
 }else if(t<20){
  photo(mainPhoto(t),890,410,600,Math.sin(t*.6)*.012);
 }else if(t<25){
  if(t<22.4){let pull=keys(t,[[20,0],[20.7,0],[22.0,1],[22.4,1]]);photo(1,890+pull*99,410,605,-pull*.05)}
  else{box(570,198,650,419,'#FFFAE9',4,3);transition('whip',inv(22.4,23.1,t),1,2,581,209,628,397)}
 }else if(t<30){
  box(570,198,650,419,'#FFFAE9',4,3);transition('circle',inv(27.3,28.4,t),3,6,581,209,628,397);
  if(t<28.2){let k=keys(t,[[25,0],[25.6,.4],[26.4,.55],[27.2,.8],[27.8,1.65],[28.2,0]]);if(k>0)teaCup(888,439,k,Math.sin(t*5)*.05)}
 }else if(t<35){
  if(t<32){let k=inv(31,32,t);ctx.save();ctx.translate(890,405);ctx.scale(1-k*.78,1-k*.45);photo(5,0,0,606,-k*.1);ctx.restore();line([[890,212],[890,583]],'#FFF3DA',3)}
  else{box(570,198,650,419,'#FFFAE9',4,3);imageFit(12,581,209,628,397);if(t<33.8){let u=inv(32,33.8,t);paperPlane(lerp(900,1420,eio(u)),410-Math.sin(u*Math.PI*.7)*300,1.15*(1-u*.7),-.2-u*.4)}}
 }else if(t<39.7){box(570,198,650,419,'#FFFAE9',4,3);if(t<38.3)transition('spin',inv(36.6,37.65,t),6,4,581,209,628,397);else transition('steam',inv(38.3,39.1,t),4,9,581,209,628,397)}
 else if(t<45.2){let angle=keys(t,[[39.7,0],[41.9,TAU*3.5],[43.8,TAU*6],[44.8,TAU*6.3],[45.2,TAU*6]]);photo(9,890,410,618,angle)}
 else if(t<62.4){photo(10,890,410,608,0);if(t>46)ribbon('剪好啦！',885,593,254)}
 else if(t<64.1){photo(10,890,410,608,0)}
 else{
  let u=eback(inv(64.1,64.5,t));photo(11,775,409,370*u,-.07);if(t>64.7)txt('…',900,244,{size:60,color:C.termText,align:'center'});
 }
 txt(t<64.1?'素材保留原图  ·  1920 × 1080  ·  60 fps':'新素材：今晚加餐.jpg',454,666,{size:19,color:C.termDim});
 if(within(t,20,39.6)){let i=Math.floor((t-20)/5);let labels=['拉一下，甩过去','杯口 → 摩天轮','折起来，飞过去','圆的，都能接'];box(963,620,347,49,'#4D4134',9,2);txt(labels[Math.min(3,i)],1135,645,{size:25,align:'center',color:C.termText})}
}
const MONTAGE=[
 {at:0,id:0,type:'whip'},{at:.5,id:1,type:'whip'},{at:1,id:2,type:'whip'},
 {at:1.5,id:3,type:'circle'},{at:2,id:6,type:'circle'},{at:2.5,id:5,type:'whip'},
 {at:3,id:19,type:'plane'},{at:3.5,id:17,type:'circle'},
 {at:4,id:12,type:'wave'},{at:5,id:18,type:'whip'},{at:5.5,id:7,type:'plane'},
 {at:6,id:4,type:'spin'},{at:7,id:8,type:'steam'},{at:7.5,id:23,type:'circle'},
 {at:8,id:13,type:'whip'},{at:9,id:10,type:'whip'}
];
function drawMontage(t,x,y,w,h){
 const local=clamp(editTime(t)-MONTAGE_START,0,MONTAGE_DURATION-.001);let i=0;for(let j=0;j<MONTAGE.length;j++)if(local>=MONTAGE[j].at)i=j;
 const m=MONTAGE[i],u=inv(m.at,m.at+(m.type==='spin'||m.type==='plane'?.22:.16),local);
 if(i&&u<1)transition(m.type,u,MONTAGE[i-1].id,m.id,x,y,w,h);else imageFit(m.id,x,y,w,h,1+Math.max(0,local-m.at)*.012);
 if(local>9.4){let a=inv(9.4,9.7,local);withAlpha(a,()=>{ctx.save();ctx.translate(x+w*.52,y+h*.83);ctx.rotate(-.018);poly([[-w*.205,-h*.059],[w*.205,-h*.059],[w*.218,h*.067],[-w*.21,h*.067]],'#FFF0D4',true,w*.0024);txt('国庆快乐',0,0,{size:w*.046,align:'center'});ctx.restore()})}
 if(w>900){const a=1-inv(9,9.6,local);withAlpha(a,()=>{ctx.save();ctx.translate(x+w*.06,y+h*.075);ctx.rotate(-.035);box(0,0,w*.19,h*.079,'#FFF4DC',3,w*.002);txt('十月 · 快乐存档',w*.095,h*.04,{size:w*.022,align:'center'});ctx.restore()});}
}
function drawPreview(t){
 panel(PREV.x,PREV.y,PREV.w,PREV.h,{fill:'#FFF8EF'});txt('成片预览',1386,601,{size:25,color:C.inkSoft});box(1382,630,448,282,'#DDD1BD',8,3);
 ctx.save();rr(1385,633,442,276,5);ctx.clip();
 if(t>=48)drawMontage(t,1385,633,442,276);
 else if(t>=20&&t<40){let k=Math.floor((t-20)/5),u=inv([22.4,27.3,32,36.6][k],[23.1,28.4,33.4,37.65][k],t);transition(['whip','circle','plane','spin'][k],u,[1,3,5,6][k],[2,6,12,4][k],1385,633,442,276)}
 else if(t>=39.7&&t<45.2){ctx.translate(1606,771);ctx.rotate((t-39.7)*11);imageFit(9,-320,-230,640,460)}
 else imageFit(t<6?0:t<14?mainPhoto(t):10,1385,633,442,276);
 ctx.restore();box(1392,934,245,14,'#DED4C2',7,2);box(1393,935,Math.max(9,241*inv(48,62,t)),12,C.orange,6,0);ellipse(1678,946,20,20,C.mint,true,3);poly([[1673,936],[1688,946],[1673,956]],C.ink,false);
 txt(t<48?'等待播放':t<62?'播放中':'✓ 已导出',1723,946,{size:23,color:C.inkSoft});txt('国庆出游.mp4',1606,992,{size:23,align:'center'});
}
function baseCrab(t){
 let o={x:884,y:692,s:1.05,t,blink:blink(t),mouth:'smile',eyes:'n'};
 if(t<2.1){o.x=1221;o.y=618;o.s=.72;o.lookX=-1;o.tap=Math.sin(t*8)*3;if(t>1.55){const j=jump(t,1.55,2.1,[1221,618],[884,700],120);Object.assign(o,j);o.s=lerp(.72,1.1,j.u);o.eyes='wide'}return o}
 if(t<5.4){o.x=884;o.y=700;o.s=1.1;o.eyes='wide';o.mouth='o';o.sweat=.5;Object.assign(o,sq(t,4.25,.45));if(t>4.8){o.lift=Math.sin(inv(4.8,5.4,t)*Math.PI)*108}return o}
 if(t<7.1){o.y=700;o.eyes='happy';o.mouth=within(t,6.65,8.71)?'open':'smile';o.armR={x:105,y:-133};Object.assign(o,sq(t,5.4));return o}
 if(t<7.55){let j=jump(t,7.1,7.55,[884,700],[1540,524],220);Object.assign(o,j);o.rot=-.12*Math.sin(j.u*Math.PI);o.armR={x:100,y:-190};return o}
 if(t<8.9){o.x=1540;o.y=524;o.s=.92;o.lookY=-1;o.armR=toLocal(o,1680,218+Math.max(0,t-7.8)*118);o.armL=toLocal(o,1550,276);o.armR.prop='pencil';Object.assign(o,sq(t,7.55));return o}
 if(t<9.5){let j=jump(t,8.9,9.5,[1540,524],[462,728],255);Object.assign(o,j);o.rot=-.18*Math.sin(j.u*Math.PI);o.eyes='squint';return o}
 if(t<12.2){o.x=467;o.y=728;o.s=.98;o.lookX=-1;let d=(t-9.5)%1;let ty=[219,328,696][Math.floor((t-9.5)%2.7)];o.armL=toLocal(o,292,ty);o.armR=toLocal(o,690+Math.sin(d*TAU)*140,423);o.walk=t*13;Object.assign(o,sq(t,9.5));return o}
 if(t<14){let u=inv(12.4,13.5,t);o.x=462+eout(u)*184;o.y=728;o.s=1.02;o.rot=u*.16;o.eyes='wide';o.mouth='O';o.sweat=1;o.armL=toLocal(o,340+u*150,575);o.armR={x:110,y:-135};return o}
 if(t<15){let j=jump(t,14,14.6,[646,728],[544,970],100);Object.assign(o,j);o.armR={x:160,y:-80};return o}
 if(t<20){o.x=keys(t,[[15,540],[18.4,1134],[19.3,1134],[20,680]]);o.y=972;o.s=.9;o.walk=t*15;o.eyes=t>18.4?'happy':'n';o.mouth='smile';let i=Math.min(22,Math.max(0,Math.floor((t-14.2)*5.75))),p=clipPos(i);o.armR=toLocal(o,p.x+31,p.y+20);o.armL=toLocal(o,keys(t,[[14,500],[18.2,1255]]),942);if(t>19.3){o.y=lerp(972,692,eout(inv(19.3,20,t)));o.lift=Math.sin(inv(19.3,20,t)*Math.PI)*130}return o}
 if(t<25){o.x=619;o.y=692;o.s=1.02;let p=keys(t,[[20,0],[20.7,0],[22,1],[22.4,1],[22.6,0]]);o.x-=p*67;o.rot=-p*.13;o.eyes=p>.4?'squint':'n';const gx=890+p*99-302.5*Math.cos(-p*.05),gy=410-302.5*Math.sin(-p*.05);o.armR=toLocal(o,t<22.4?gx:keys(t,[[22.4,gx],[22.75,1256],[23.1,905],[24.4,723]]),t<22.4?gy:414);o.armL={x:-100,y:-39};if(t>22.4){Object.assign(o,sq(t,22.5,.32));o.eyes='happy'}return o}
 if(t<30){o.x=1190;o.y=692;o.s=1.02;o.lookX=-1;o.armL=toLocal(o,888,keys(t,[[25,533],[26.2,453],[27.5,395],[28.3,448],[29,584]]));o.armR={x:110,y:-95};o.eyes=t>28.3?'happy':'n';return o}
 if(t<35){o.x=619;o.y=692;o.s=1.02;o.lookX=1;let k=inv(31,32,t);o.armR=toLocal(o,lerp(1180,972,k),368);o.armL=toLocal(o,lerp(595,806,k),414);if(t>32){o.armR=toLocal(o,keys(t,[[32,960],[32.35,1070],[33,1260],[33.6,740]]),keys(t,[[32,430],[33.6,563]]));o.armL={x:-99,y:-53};o.mouth=within(t,32,32.5)?'o':'smile';o.eyes='happy'}return o}
 if(t<39.7){o.x=1190;o.y=692;o.s=1.02;o.lookX=-1;let a=inv(35.8,37.6,t)*TAU*2;o.armL=toLocal(o,1040+Math.cos(a)*105,398+Math.sin(a)*105);o.armR={x:113,y:-90};o.eyes=t>37.8?'happy':'n';return o}
 if(t<43){let u=inv(39.7,41,t),a=(t-39.7)*7.5;o.x=890+Math.sin(a)*270*u;o.y=560+Math.cos(a)*140*u;o.s=1;o.rot=a*u;o.eyes='swirl';o.mouth='O';o.sweat=1;o.armL={x:-145,y:-138};o.armR={x:155,y:-160};return o}
 if(t<45.3){let u=eout(inv(43,43.35,t));o.x=lerp(1060,1210,u);o.y=lerp(500,685,u);o.s=1.0;o.rot=lerp(-.4,0,u);o.eyes='swirl';o.mouth='wave';o.sweat=1;o.armR=toLocal(o,1324,183);o.armL=toLocal(o,keys(t,[[43,1180],[43.7,1200],[44.25,1032],[44.8,1032]]),535);return o}
 if(t<46.2){o.x=1210;o.y=685;o.s=1;o.eyes='dot';o.mouth=within(t,45.5,46.4)?'open':'flat';o.armR={x:103,y:-75};o.armL={x:-96,y:-90};Object.assign(o,sq(t,45.3,.15));return o}
 if(t<47){let j=jump(t,46.2,46.85,[1210,685],[1510,1030],135);Object.assign(o,j);o.s=.9;return o}
 if(t<62.4){o.x=1510;o.y=1030;o.s=.9;o.eyes='happy';o.mouth='smile';o.armR=toLocal(o,1678,946);o.armL={x:-95,y:-104};Object.assign(o,sq(t,46.85));return o}
 if(t<63.1){let j=jump(t,62.4,63.1,[1510,1030],[1117,684],140);Object.assign(o,j);o.s=1.08;return o}
 o.x=1117;o.y=684;o.s=1.08;o.lookX=-1;Object.assign(o,sq(t,63.1));
 if(t<64.15){o.eyes='happy';o.armL={x:-110,y:-92};o.armR={x:107,y:-85}}
 else if(t<66.25){o.eyes='wide';o.mouth='flat';o.blink=0;o.sweat=inv(64.6,65.3,t);o.armL={x:-96,y:-68};o.armR={x:104,y:-68};o.lookX=t<65?-1:t<65.8?0:-1;if(t>64.15&&t<64.6){o.sx=1.07;o.sy=.94}}
 else{o.hat='headset';o.eyes='happy';o.mouth=within(t,66.35,68.88)?'open':'smile';o.sweat=0;o.armL={x:-100,y:-75};o.armR=toLocal(o,1258,lerp(323,630,inv(67.4,68.8,t)))}
 return o;
}
function crab(t){
 let o=baseCrab(t);
 // Cross-workbench travel is a real elastic jump, including the camera-followed hands.
 for(const [a,b] of [[24.35,25.05],[29.35,30.05],[34.35,35.05]]){
  if(within(t,a,b)){const from=baseCrab(a),to=baseCrab(b),j=jump(t,a,b,[from.x,from.y],[to.x,to.y],170);o={...o,...j,s:1.02,rot:Math.sin(j.u*Math.PI)*.12,armL:{x:-110,y:-150},armR:{x:110,y:-155},eyes:'happy',mouth:'smile'}}
 }
 const saying=window.DIALOGUE.find(l=>l.id[0]==='c'&&window.PLAYBACK_TIME>=l.start&&window.PLAYBACK_TIME<l.end);
 if(saying)o.mouth=Math.sin(window.PLAYBACK_TIME*23)>.1?'open':'smile';
 return o;
}
function drawLoose(t){
 if(t>2.1&&t<6.4){
  for(let i=0;i<27;i++){
   let start=2.1+i*.04,u=inv(start,start+1.3,t),endX=556+hash(i+14)*681,endY=640+hash(i+66)*68;
   if(t<start)continue;let x=lerp(876,endX,eout(u)),y=lerp(435,endY,u)-Math.sin(u*Math.PI)*(160+hash(i)*220),ang=(hash(i+17)-.5)*1.1*u;
   if(t>5.55){let q=inv(5.55,6.4,t);x=lerp(x,234,eio(q));y=lerp(y,350,eio(q));ang+=q*2}
   photo(EDIT_ORDER[i%23],x,y,106+hash(i+11)*77,ang);
  }
 }
 if(within(t,9.5,12.2)){
  for(let j=0;j<8;j++){let u=((t-9.5)*1.8+j*.12)%1,x=lerp(850,247,u),y=lerp(387,[219,328,696][j%3],u)-Math.sin(u*Math.PI)*85;photo([20,21,12,16,17,18,22,23][j],x,y,122,(u-.5)*.4)}
 }
 if(within(t,12.15,14.6)){
  for(let i=0;i<12;i++){let u=inv(12.15+i*.035,13.2+i*.035,t);if(t<12.15+i*.035)continue;let x=lerp(244,671+hash(i)*270,eout(u)),y=lerp(500,733+hash(i+6)*78,u)-Math.sin(u*Math.PI)*120;let a=1-inv(14,14.6,t);withAlpha(a,()=>photo(10,x,y,148,(hash(i+3)-.5)*.65))}
 }
 if(within(t,14.6,18.3)){
  const i=Math.min(22,Math.floor((t-14.6)/.16)),u=((t-14.6)/.16)%1,p=clipPos(i);let x=lerp(330,p.x+32,eio(u)),y=lerp(550,p.y+20,u)-Math.sin(u*Math.PI)*180;photo(EDIT_ORDER[i],x,y,lerp(159,62,u),Math.sin(u*Math.PI)*.25)
 }
 if(within(t,39.7,45.3)){
  let inK=inv(39.7,40.5,t),out=inv(44.4,45.3,t);
  for(let i=0;i<18;i++){let a=(t-39.7)*(4+i*.035)+i*TAU/18,r=(208+i%3*58)*inK*(1-out);let x=890+Math.cos(a)*r*1.5,y=447+Math.sin(a)*r*.8;photo(EDIT_ORDER[i],x,y,110+hash(i)*55,a*.7)}
  for(let i=0;i<7;i++){let a=t*8+i*.3;ctx.beginPath();ctx.ellipse(890,450,(340+i*10)*inK*(1-out),(174+i*9)*inK*(1-out),0,a,a+1.1);ink(3,'#BD9272');ctx.stroke()}
 }
}
function effectMarks(t,o){
 for(const at of [5.4,7.55,9.5,14.6,19.95,22.5,32.1,45.3,46.85,63.1])dust(o.x,o.y,t,at,Math.floor(at*10));
 if(within(t,6.65,8.0))popText('简单剪一下！',887,508,t,6.65,7.08,{size:43,color:C.orange});
 if(within(t,12.7,14)){popText('这叫“一张”？！',680,483,t,12.7,13.8,{size:32,color:C.red});impactStars(475,627,t,12.9,5,57)}
 if(within(t,18.5,19.5)){for(let i=0;i<3;i++)sparkle(1170+i*37,781+(i%2)*24,11,C.yellow,t);}
 if(within(t,22.4,23))speedLines(1050,425,1,t,1,9,220);
 for(const at of [23.2,28.5,33.9,39.15])if(within(t,at,at+.6)){
  sparkle(1229,262,24*Math.sin(inv(at,at+.6,t)*Math.PI),C.yellow,.1);popText('漂亮！',1110,243,t,at,at+.7,{size:28,color:C.mint});
 }
 if(within(t,39.4,45.2)){
  let a=eback(inv(39.4,39.7,t));ctx.save();ctx.translate(1110,507);ctx.scale(a,a);panel(-204,-83,408,140,{fill:C.note,r:10,lw:4});txt('转场强度',-181,-53,{size:25});let v=keys(t,[[39.4,1],[40,3],[43.7,3],[44.25,1]]);txt(`${Math.round(v*100)}%`,172,-51,{size:28,align:'right',color:v>1.1?C.red:C.greenD});line([[-170,28],[150,28]],'#B69E73',10);line([[-170,28],[-170+v/3*320,28]],v>1.1?C.red:C.green,10);ellipse(-170+v/3*320,28,15,15,'#FFF8E7',true,4);ctx.restore();
 }
 if(within(t,45.25,46.2)){puff(1165,578,t,45.25,5,62,7);popText('100% 就够了',986,375,t,45.4,46.15,{size:28,color:C.mint})}
 if(within(t,46.9,47.5)){clickRing(1678,946,t,47.08);confetti(1498,857,t,47.1,18,-Math.PI/2,.9,220,43)}
 if(within(t,62.05,63.2)){confetti(1483,805,t,62.05,36,-Math.PI/2,1.2,280,17)}
 if(within(t,64.15,66.2)){
  for(let i=0;i<3;i++)line([[1050+i*29,488],[1044+i*33,458-i%2*13]],C.ink,4);
  if(t>65.1)popText('……同事？',1108,466,t,65.1,66.1,{size:27,color:C.termText});
 }
}
function curtain(t){
 if(t<67.55)return;let u=eio(inv(67.55,69.05,t)),x=598,y=191,w=707,h=480*u;
 line([[587,188],[1320,188]],C.ink,9);
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();box(x,y,w,480,'#D79069',0,4);
 for(let i=0;i<14;i++){let xx=x+i*54;ctx.fillStyle=i%2?'#D08A65':'#E0A27E';ctx.fillRect(xx,y,27,480);line([[xx,y],[xx+4,y+480]],'#B97655',2)}
 ctx.restore();line([[598,y+h],[1305,y+h]],C.ink,6);
 if(u>.73){let v=eback(inv(.73,1,u));ctx.save();ctx.translate(951,410);ctx.rotate(-.045);ctx.scale(v,v);panel(-188,-53,376,108,{fill:'#FFF1D4',r:9,lw:4});txt('剪辑师已下班',0,-8,{size:37,align:'center'});txt('此素材暂不支持处理',0,30,{size:21,align:'center',color:C.inkSoft});ctx.restore()}
}
function subtitles(t){const l=window.DIALOGUE.find(l=>t>=l.start&&t<l.end+.1);if(!l)return;const size=36,w=tw(l.text,size)+72;panel((W-w)/2,975,w,69,{fill:'#FFF7E6',r:14,lw:3});txt(l.text,W/2,1010,{size,align:'center'});ellipse((W-w)/2+15,1009,4,4,l.id[0]==='p'?C.sky:C.orange,false)}
function fullPreview(t,cam){
 if(t<47.6||t>62.4)return;
 let k=t<48?eio(inv(47.6,48,t)):t>62?1-eio(inv(62,62.4,t)):1;
 let x0=W/2+(1385-cam.x)*cam.z,y0=H/2+(633-cam.y)*cam.z,w0=442*cam.z,h0=276*cam.z;
 let x=lerp(x0,0,k),y=lerp(y0,0,k),w=lerp(w0,W,k),h=lerp(h0,H,k);
 ctx.fillStyle='#FFF3DD';ctx.fillRect(x-8*(1-k),y-8*(1-k),w+16*(1-k),h+16*(1-k));drawMontage(t,x,y,w,h);
}
function render(realTime){
 window.PLAYBACK_TIME=realTime;const t=storyTime(realTime);
 const cam=camera(t);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
 ctx.translate(W/2,H/2);ctx.rotate(cam.rot);ctx.scale(cam.z,cam.z);ctx.translate(-cam.x,-cam.y);
 drawDesk(cam);drawWindow(t);drawLeft(t);drawTimeline(t);drawStage(t);drawBoard(t);drawPreview(t);
 const o=crab(t);
 if(t<5.4){drawClawd(o);drawLoose(t);if(t>4.4){withAlpha(inv(4.4,4.8,t),()=>{ctx.save();ctx.beginPath();ctx.rect(785,553,201,85);ctx.clip();drawClawd({...o,y:693,eyes:'wide',blink:0});ctx.restore()})}}
 else{drawLoose(t);drawClawd(o)}
 effectMarks(t,o);curtain(t);
 ctx.setTransform(1,0,0,1,0,0);fullPreview(t,cam);
 const g=ctx.createRadialGradient(W/2,H/2,H*.48,W/2,H/2,H*1.06);g.addColorStop(0,'rgba(60,35,20,0)');g.addColorStop(1,'rgba(60,35,20,.12)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 subtitles(realTime);
}
function buildSfx(){let e=[];const add=(kind,t,extra={})=>e.push({kind,t,...extra});
 add('paper',1.9);add('boom',2.15,{g:.6});for(let i=0;i<21;i++)add('paper',2.2+i*.09,{g:.26});add('thud',4.25);add('boing',5.15);add('whoosh',7.12);add('slap',7.55);add('scribble',7.8,{d:.8});add('whoosh',8.9);
 for(let i=0;i<6;i++){add('paper',9.55+i*.4,{g:.65});add('blip',9.7+i*.4,{i,g:.3})}
 add('drawer',12.1);add('boing',12.5);for(let i=0;i<8;i++)add('paper',12.4+i*.13,{g:.6});add('whoosh',14.05);
 for(let i=0;i<23;i++){add('tap',14.65+i*.16,{g:.38});if(i%3===0)add('note',14.65+i*.16,{i,g:.32})}
 add('whoosh',19.3);add('creak',21.2,{g:.6});add('whoosh',22.4,{g:1.4});add('boing',22.6,{g:.55});add('shimmer',23.2,{g:.5});add('bubble',25.9);add('whoosh',27.25);add('shimmer',28.4,{g:.5});
 add('paper',30.7);add('paper',31.15);add('paper',31.6);add('whoosh',32.2);add('shimmer',33.65,{g:.5});add('ratchet',35.8);add('whoosh',36.55);add('hiss',38.3,{g:.45});add('alarm',39.85,{g:.5});
 for(let i=0;i<4;i++)add('whoosh',40+i*.62,{g:.7});add('scratch',41.88);add('dizzy',42);add('creak',43.1);add('click',44.2);add('boing',45.25,{g:.6});add('whoosh',46.2);add('click',47.08);add('popper',47.3,{g:.4});
 for(let i=1;i<MONTAGE.length;i++)add(MONTAGE[i].type==='steam'?'hiss':'whoosh',storyTime(MONTAGE_START+MONTAGE[i].at),{g:.27});
 add('shimmer',61.2,{g:.5});add('popper',62.05,{g:.4});add('paper',63.95);add('scratch',64.14);add('dingdong',66.1);add('paper',67.6,{g:.7});add('thud',69.03,{g:.6});return e.map(v=>({...v,t:editTime(v.t),...(v.d?{d:editTime(v.t+v.d)-editTime(v.t)}:{})})).sort((a,b)=>a.t-b.t)
}
window.renderAt=t=>render(clamp(t,0,DUR));
window.ready=(async()=>{await Promise.all([document.fonts.load('700 40px Hannotate','国庆快乐'),document.fonts.load('400 40px Hannotate','国庆'),document.fonts.load('40px Wawa','开工')]);await document.fonts.ready;initPhotos();window.SFX=buildSfx();window.EDIT_INFO={duration:DUR,map:EDIT_MAP,photo_count:PHOTOS.length,montage:MONTAGE.map((m,i)=>({...m,start:MONTAGE_START+m.at,end:MONTAGE_START+(MONTAGE[i+1]?.at??MONTAGE_DURATION)})),montage_start:MONTAGE_START,montage_end:MONTAGE_START+MONTAGE_DURATION,beat_seconds:.5};render(0);return true})();
// Deterministic rendering is disabled only for interactive playback. Click to pause/resume.
if(!new URLSearchParams(location.search).has('render'))window.ready.then(()=>{let base=performance.now(),paused=false,at=0;cv.addEventListener('click',()=>{if(paused){base=performance.now()-at*1000}else at=(performance.now()-base)/1000%DUR;paused=!paused});function tick(){if(!paused)render((performance.now()-base)/1000%DUR);requestAnimationFrame(tick)}requestAnimationFrame(tick)});
