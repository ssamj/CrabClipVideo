// Original holiday illustrations. Same brown ink and paper palette as the crab.
// Draw once at 2x resolution; all moving postcards reuse these deterministic paintings.
const PHOTO_NAMES=['出发啦','逛吃逛吃','热乎的烤串','快乐碰杯','人间烟火','草地放空','坐一次摩天轮','等一场落日','夜市不打烊','把夜色带回家','国庆快乐','今晚加餐'];
const PHOTO_DATE=['10.01','10.01','10.02','10.02','10.03','10.03','10.04','10.04','10.05','10.05','10.06','10.06'];
const PHOTOS=[];
function line(points,col=C.ink,width=4){ink(width,col);ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.stroke()}
function poly(points,col,stroke=true,width=4){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.closePath();ctx.fillStyle=col;ctx.fill();if(stroke){ink(width);ctx.stroke()}}
function ellipse(x,y,rx,ry,col,stroke=true,width=4){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fillStyle=col;ctx.fill();if(stroke){ink(width);ctx.stroke()}}
function box(x,y,w,h,col,r=8,lw=4){rr(x,y,w,h,r);ctx.fillStyle=col;ctx.fill();if(lw){ink(lw);ctx.stroke()}}
function cloud(x,y,s=1,col='#FFF9E9'){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(-66,16);ctx.bezierCurveTo(-86,-10,-46,-38,-27,-20);ctx.bezierCurveTo(-10,-65,40,-53,45,-20);ctx.bezierCurveTo(77,-28,94,14,60,22);ctx.closePath();ctx.fillStyle=col;ctx.fill();ink(3,'#A9906D');ctx.stroke();ctx.restore()}
function tree(x,y,s=1,autumn=false){ctx.save();ctx.translate(x,y);ctx.scale(s,s);line([[0,0],[0,-110]],'#806342',14);line([[0,-70],[-34,-105],[0,-82],[38,-124]],'#806342',8);for(const [xx,yy,r] of [[-40,-139,44],[39,-146,43],[0,-183,48],[0,-130,51]]){ellipse(xx,yy,r,r*.86,autumn?C.yellow:'#A5B98A',true,3)}line([[-25,-164],[-10,-176]],'#DDD8A8',5);ctx.restore()}
function bush(x,y,w,col='#8FAE80'){for(let i=0;i<5;i++)ellipse(x+i*w/5,y-8-hash(i+7)*13,w/7,22,col,true,2)}
function person(x,y,s=1,color=C.sky,pose='stand',hair=0){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);
 ellipse(0,0,28,7,'#6C583333',false);
 line([[-12,-37],[-15,-4],[-24,-4]],C.ink,9);line([[12,-37],[16,-4],[24,-4]],C.ink,9);
 poly([[-25,-92],[21,-92],[29,-38],[-30,-38]],color,true,3);
 if(pose==='cheer'){line([[-22,-83],[-45,-113],[-48,-142]],C.ink,10);line([[22,-83],[44,-120],[43,-149]],C.ink,10);ellipse(-48,-145,8,8,'#F5C8A1',true,3);ellipse(43,-153,8,8,'#F5C8A1',true,3)}
 else if(pose==='camera'){line([[-24,-78],[-42,-102],[-8,-108]],C.ink,8);line([[24,-78],[41,-100],[8,-108]],C.ink,8)}
 else{line([[-25,-82],[-37,-48]],color,14);line([[25,-82],[36,-48]],color,14);ellipse(-37,-44,7,8,'#F5C8A1',true,2);ellipse(36,-44,7,8,'#F5C8A1',true,2)}
 ellipse(0,-118,31,35,'#F8D7B3',true,3);
 ctx.beginPath();ctx.moveTo(-31,-117);ctx.bezierCurveTo(-43,-163,28,-179,34,-119);ctx.lineTo(22,-136);ctx.quadraticCurveTo(2,-134,-12,-149);ctx.quadraticCurveTo(-16,-128,-31,-117);ctx.fillStyle=hair?'#6C4B35':'#47362C';ctx.fill();ink(3);ctx.stroke();
 ellipse(-11,-119,2.5,4,C.ink,false);ellipse(11,-119,2.5,4,C.ink,false);line([[-6,-106],[0,-103],[7,-107]],C.ink,2.5);
 ellipse(-22,-110,5,3,'#EC9B8B',false);ellipse(22,-110,5,3,'#EC9B8B',false);
 if(pose==='camera'){box(-22,-118,45,29,'#4F5C5A',5,3);ellipse(2,-104,11,11,C.sky,true,3);ellipse(3,-106,5,5,'#FAF6E7',false)}
 ctx.restore();
}
function flag(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);line([[0,0],[0,93]],C.ink,4);poly([[0,0],[64,5],[64,46],[0,41]],'#D85C4A',true,2);star(13,14,7,0,5,.45);ctx.fillStyle='#FFDE7F';ctx.fill();for(const [xx,yy] of [[25,9],[30,16],[29,25],[24,31]]){star(xx,yy,2.3);ctx.fill()}ctx.restore()}
function cityBack(night=false){const colors=night?['#424458','#565263','#555A6B']:['#C5B8AA','#C6CDC6','#D7CDB5'];for(let i=0;i<16;i++){const h=50+hash(i+92)*145;box(i*68-30,310-h,57,h,colors[i%3],3,2);for(let y=325-h;y<290;y+=21)for(let x=i*68-20;x<i*68+17;x+=16)box(x,y,6,9,night?'#E9BF73':'#ECE5D3',1,0)}}
function ribbon(s,x,y,w=250){ctx.save();ctx.translate(x,y);poly([[-w/2,-25],[w/2,-25],[w/2+13,19],[-w/2-9,23]],'#FFF3D7',true,3);txt(s,0,0,{size:26,align:'center'});ctx.restore()}
function sky(col='#B9D8D9'){ctx.fillStyle=col;ctx.fillRect(0,0,960,600);cloud(120,95,.8);cloud(745,88,1.2);ellipse(812,98,42,42,'#F8CF78',false)}
function bunting(y=80){ctx.beginPath();ctx.moveTo(-20,y-30);ctx.quadraticCurveTo(450,y+75,985,y-15);ink(3);ctx.stroke();for(let i=0;i<13;i++){let x=i*81,y0=y+29*Math.sin(i/12*Math.PI);poly([[x,y0],[x+28,y0+4],[x+10,y0+39]],[C.red,C.yellow,C.sky][i%3],true,2)}}
function travel(){
 ctx.fillStyle='#E6CFAB';ctx.fillRect(0,0,960,600);
 box(43,30,874,441,'#FFF9E9',45,8);ctx.save();rr(66,52,828,397,32);ctx.clip();sky('#B8D4D7');
 poly([[0,300],[150,196],[260,270],[399,130],[563,273],[692,164],[970,290],[980,600],[0,600]],'#9FAF91',false);
 poly([[0,375],[240,305],[470,347],[700,270],[980,343],[980,600],[0,600]],'#C5C18E',false);
 for(let i=0;i<9;i++){tree(i*133-60,440,.52,i%3===0)}
 cityBack();poly([[0,492],[960,383],[960,600],[0,600]],'#D5BB8F',false);line([[0,520],[960,410]],'#877966',8);line([[0,548],[960,438]],'#FFF3D6',6);ctx.restore();
 box(54,466,853,20,'#9E7553',9,4);line([[494,41],[494,465]],'#F8EDDA',12);line([[499,42],[499,465]],C.ink,4);
 box(35,519,365,130,C.orange,22,5);box(156,498,122,28,'#DCA86E',7,4);for(let i=0;i<4;i++)line([[94+i*75,535],[94+i*75,599]],'#B56447',4);
 ctx.save();ctx.translate(657,518);ctx.rotate(-.12);box(-132,-33,265,102,'#FFF7DF',8,3);txt('出发！去放个假',0,0,{size:29,align:'center'});line([[-102,25],[102,25]],'#D5C6AB',2);txt('10.01  /  好心情一份',0,48,{size:18,align:'center',color:C.inkSoft});ctx.restore();flag(815,467,.8);
}
function street(night=false){
 sky(night?'#4F5065':'#BFDAD6');poly([[0,244],[960,244],[960,600],[0,600]],night?'#BD9A7C':'#DFCFAD',false);
 poly([[390,249],[569,249],[774,600],[125,600]],night?'#BAAA9B':'#F3E5C9',false);
 for(let side=0;side<2;side++)for(let j=0;j<3;j++){
  const x=side?590+j*132:-28+j*128,y=130+j*28,w=141,h=227-j*25;
  box(x,y,w,h,['#E8C09B','#D9CAB0','#EBD7B4'][j],4,4);
  poly([[x-15,y+2],[x+18,y-30],[x+w-10,y-24],[x+w+15,y+3]],night?'#72594D':'#7D8880',true,4);
  box(x+17,y+27,w-34,50,night?'#F3D082':'#C89665',3,3);txt(['食光','小吃','茶铺'][j],x+w/2,y+52,{size:24,align:'center'});
  box(x+16,y+115,w-33,96,night?'#FFDC96':'#776A58',2,3);
  for(let k=0;k<5;k++)poly([[x-7+k*31,y+90],[x+24+k*31,y+90],[x+36+k*31,y+121],[x+2+k*31,y+121]],k%2?'#FFF4D2':C.orange,true,2);
  line([[x+8,y+124],[x+8,y+h+10]],C.ink,4);line([[x+w,y+122],[x+w,y+h+10]],C.ink,4);
  if(!night)flag(x+w-11,y+7,.4);
 }
 bunting(71);
 for(let i=0;i<9;i++){const x=350+hash(i+33)*310,y=318+hash(i+71)*182;person(x,y,.32+(y-300)/570,[C.pink,C.mint,C.sky,C.yellow][i%4],'stand',i%2)}
 person(260,575,1.2,C.sky,'camera');person(722,567,1.15,C.pink,'cheer',1);
 for(let i=0;i<11;i++){const x=i*97,y=90+Math.sin(i*.3)*22;line([[x,y-20],[x,y+21]],C.ink,2);ellipse(x,y+30,15,18,night?'#FFE291':'#E8785E',true,2);if(night){withAlpha(.14,()=>ellipse(x,y+30,39,39,'#FFE5A5',false))}}
 if(night){box(33,393,153,88,'#F3CE8C',4,4);txt('再吃一口',110,426,{size:24,align:'center'});txt('¥ 10',110,461,{size:22,align:'center'});ellipse(77,530,49,15,'#F5E4C1',true,3);for(let j=0;j<4;j++){line([[47+j*20,495],[66+j*20,553]],'#945C38',3);ellipse(55+j*20,515,9,16,C.orange,true,2)}}
}
function steam(x,y,s=1,alpha=.5){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ink(7,'#FFF8E6');ctx.globalAlpha*=alpha;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-35+i*35,0);ctx.bezierCurveTo(-80+i*35,-43,15+i*35,-56,-24+i*35,-98);ctx.stroke()}ctx.restore()}
function skewers(){
 ctx.fillStyle='#E7CCA0';ctx.fillRect(0,0,960,600);for(let y=30;y<600;y+=80)line([[0,y],[960,y-7]],'#C7A778',3);
 ellipse(468,345,353,165,'#998065',false);ellipse(468,327,353,166,'#F8EED7',true,6);ellipse(468,327,308,132,'#E6D5B2',true,2);
 for(let i=0;i<6;i++){
  ctx.save();ctx.translate(257+i*74,292+(i%2)*29);ctx.rotate(-.48+i*.14);
  line([[0,-150],[0,190]],'#876035',8);
  for(let j=0;j<4;j++){box(-26,-133+j*56,53,44,j%2?'#D9944B':'#BE6D3A',12,4);line([[-17,-120+j*56],[14,-111+j*56]],'#813F2A',4);ellipse(-10,-125+j*56,6,3,'#F4CB77',false);for(let k=0;k<4;k++)ellipse(-16+hash(j*5+k)*33,-127+j*56+hash(k+6)*28,1.8,2.5,'#F8E5AD',false)}ctx.restore();
 }
 for(let i=0;i<13;i++){ctx.save();ctx.translate(254+hash(i+14)*420,409+hash(i+24)*24);ctx.rotate(hash(i)*3);poly([[-14,0],[0,-8],[14,0],[0,9]],'#7D9D62',true,2);ctx.restore()}
 steam(407,168,1,.7);ellipse(804,130,72,51,'#F4E8CF',true,4);ellipse(804,130,48,31,'#C85539',true,3);for(let i=0;i<10;i++)ellipse(780+hash(i)*52,116+hash(i+20)*26,3,2,'#F5D190',false);
 ctx.save();ctx.translate(177,94);ctx.rotate(-.14);ribbon('第一口，假期开始',0,0,286);ctx.restore();
 line([[679,532],[902,423]],'#7D4D2E',8);line([[693,547],[917,440]],'#7D4D2E',8);
}
function teaCup(x,y,s=1,rot=0,held=false,mirrorLabel=false){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(s,s);
 if(held){poly([[-90,200],[-70,116],[-23,103],[37,138],[19,200]],'#F4CEAD',true,5);poly([[-110,198],[15,192],[43,315],[-146,315]],C.sky,true,5)}
 poly([[-67,-92],[68,-92],[52,128],[-51,128]],'#CFAB7E',true,5);poly([[-58,-22],[59,-22],[48,119],[-46,119]],'#E8C699',false);
 for(let i=0;i<21;i++){ellipse(-37+(i%7)*12,88+Math.floor(i/7)*12+hash(i)*5,5,5,'#614332',false)}
 box(-35,-28,72,96,'#FFF5DF',13,3);ctx.save();if(mirrorLabel)ctx.scale(-1,1);txt('假',0,3,{size:31,align:'center'});txt('期',0,40,{size:31,align:'center'});ctx.restore();
 ellipse(0,-96,76,20,'#FAF0DD',true,4);ellipse(0,-100,65,13,'#A37558',true,3);
 line([[17,-108],[31,-220]],'#9BBDB7',14);line([[19,-112],[33,-218]],C.ink,3);
 line([[-48,-66],[-40,51]],'#FFEDC7',5);ctx.restore()}
function tea(){sky('#C8DDD8');cityBack();bush(0,455,960,'#A5B183');poly([[0,485],[960,448],[960,600],[0,600]],'#E9CFA9',false);teaCup(357,299,1.35,-.17,true);ctx.save();ctx.translate(960,0);ctx.scale(-1,1);teaCup(315,302,1.35,-.17,true,true);ctx.restore();for(let i=0;i<3;i++)line([[466+i*28,77],[463+i*38,50]],C.ink,4);sparkle(494,151,23,C.yellow);ribbon('干杯！快乐双倍',770,72,251)}
function hotpot(){
 ctx.fillStyle='#D7B18C';ctx.fillRect(0,0,960,600);for(let i=0;i<14;i++)line([[i*91,0],[i*91-130,600]],'#C29570',2);
 for(const [x,y,col] of [[155,135,'#93AA78'],[810,157,'#EDB2A0'],[147,456,'#F7E6B5'],[807,476,'#A9BF7B']]){
  ellipse(x,y,112,81,'#F8EDD5',true,4);ellipse(x,y,93,65,'#E4D2B2',false);
  for(let i=0;i<9;i++){ctx.save();ctx.translate(x-65+(i%3)*59,y-40+Math.floor(i/3)*38);ctx.rotate(hash(i)*.8);ellipse(0,0,28,16,col,true,2);line([[-15,1],[15,-1]],'#9E8C6555',2);ctx.restore()}
 }
 box(192,274,93,42,'#646B64',14,4);box(674,273,96,42,'#646B64',14,4);
 ellipse(477,321,235,221,'#7B8077',true,6);ellipse(477,298,235,220,'#B7BCAB',true,5);ellipse(477,296,210,196,'#BD6340',true,5);
 ctx.save();ctx.beginPath();ctx.ellipse(477,296,206,192,0,0,TAU);ctx.clip();ctx.beginPath();ctx.moveTo(472,102);ctx.bezierCurveTo(695,240,251,308,479,493);ctx.lineTo(722,489);ctx.lineTo(722,100);ctx.closePath();ctx.fillStyle='#E4C588';ctx.fill();
 for(let i=0;i<39;i++){let x=286+hash(i+2)*400,y=133+hash(i+60)*329;ellipse(x,y,6+hash(i)*7,4+hash(i+7)*5,i%3===0?'#7D913F':i%3===1?'#DDA367':'#F5D7A0',true,1.5)}
 ctx.beginPath();ctx.moveTo(472,102);ctx.bezierCurveTo(695,240,251,308,479,493);ink(9,'#9A9B8A');ctx.stroke();ink(3);ctx.stroke();ctx.restore();
 steam(451,205,1.4,.7);line([[656,67],[534,267]],'#72482E',7);line([[676,79],[555,279]],'#72482E',7);ribbon('这一锅，都是快乐',496,560,280);
}
function picnic(){sky();poly([[0,296],[960,270],[960,600],[0,600]],'#B2C293',false);poly([[0,380],[960,440],[960,600],[0,600]],'#9FB582',false);tree(111,357,1.7,true);tree(830,345,1.4);tree(751,313,.65,true);
 for(let i=0;i<70;i++){const x=hash(i+2)*960,y=310+hash(i+99)*290;line([[x-4,y+6],[x,y-5],[x+4,y+4]],'#80966C',2)}
 ctx.save();ctx.translate(450,438);ctx.rotate(-.07);poly([[-203,-55],[164,-57],[229,92],[-258,83]],'#F4D5B7',true,4);for(let i=-3;i<4;i++){line([[i*55,-48],[i*69,78]],'#D59685',15)}for(let y=-30;y<80;y+=35)line([[-196-y*.5,y],[179+y*.4,y]],'#E8AF9C',10);ctx.restore();
 person(659,461,1.3,C.yellow,'cheer',1);person(280,460,1.12,C.sky,'camera');
 box(392,405,126,73,'#C5A276',8,4);for(let i=0;i<7;i++)line([[400+i*17,410],[400+i*17,473]],'#9F7C54',2);line([[414,405],[414,382],[493,382],[493,405]],C.ink,5);
 ellipse(553,489,66,25,'#F5EDDC',true,3);poly([[516,481],[539,445],[563,484]],'#F2D190',true,3);poly([[559,489],[582,453],[608,493]],'#E4B575',true,3);teaCup(377,492,.28,-.08);
 for(const [x,y] of [[728,186],[463,115],[539,155]]){line([[x-10,y+4],[x,y],[x+9,y+5]],C.ink,3)}
}
function wheelArt(x,y,r,rot=0){line([[x,y],[x-r*.55,y+r*1.55]],'#78635D',13);line([[x,y],[x+r*.55,y+r*1.55]],'#78635D',13);ellipse(x,y,r,r,'#FFF1D025',true,7);ellipse(x,y,r*.82,r*.82,'#FFFFFF00',true,3);for(let i=0;i<12;i++){let a=i*TAU/12+rot,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;line([[x,y],[xx,yy]],'#A47A63',3);line([[xx,yy],[xx,yy+12]],C.ink,3);box(xx-18,yy+10,36,31,[C.orange,C.sky,C.yellow,C.mint][i%4],7,3);box(xx-11,yy+14,22,12,'#FDF2D5',3,1.5)}ellipse(x,y,17,17,C.yellow,true,4)}
function wheel(){sky('#EDD0B3');ellipse(200,160,66,66,'#F4AF73',false);poly([[0,418],[960,371],[960,600],[0,600]],'#AEB390',false);cityBack();wheelArt(559,240,184,-.15);for(let i=0;i<5;i++)tree(65+i*46,390,.57,i%2===0);poly([[0,539],[960,420],[960,600],[0,600]],'#DDC09D',false);bunting(50);person(180,551,1.2,C.pink,'cheer',1);person(280,553,1.18,C.sky,'stand');flag(312,362,.7);box(791,393,122,62,'#FFF0D6',5,3);txt('下一站',852,414,{size:20,align:'center'});txt('摩天轮 →',852,441,{size:21,align:'center'})}
function sunset(night=false){
 ctx.fillStyle=night?'#41495D':'#EAC4A8';ctx.fillRect(0,0,960,600);ellipse(648,172,night?34:75,night?34:75,night?'#FFF0BF':'#F9B776',false);
 if(night)for(let i=0;i<33;i++){ellipse(hash(i+51)*960,hash(i+12)*230,1.4+hash(i)*1.4,1.4+hash(i)*1.4,'#F8E9C4',false)}else{cloud(150,89,1.2,'#F6D9BF');cloud(840,150,.65,'#F8D5B3')}
 cityBack(night);poly([[0,310],[960,310],[960,600],[0,600]],night?'#616E7C':'#C6B9A4',false);
 for(let i=0;i<65;i++){let y=327+hash(i+25)*245,x=hash(i+89)*960;line([[x,y],[x+20+hash(i)*55,y]],night?'#CDBB9477':'#F8DAB3',2+hash(i+7)*2)}
 for(let i=0;i<20;i++){const y=316+i*11,w=20+i*6;line([[648-w*.5-hash(i)*23,y],[648+w*.5+hash(i+4)*30,y]],night?'#D9CCAC':'#F5C488',3)}
 poly([[413,351],[549,351],[529,371],[439,371]],'#795C47',true,3);line([[481,352],[481,303]],C.ink,3);poly([[478,303],[478,345],[435,345]],'#F6ECD3',true,2);
 poly([[0,529],[960,482],[960,600],[0,600]],'#B49E85',false);for(let i=0;i<9;i++)line([[i*131-20,495-i*5],[i*131-20,593]],'#695D52',7);line([[0,487],[960,448]],'#695D52',11);line([[0,521],[960,482]],'#695D52',5);
 person(245,577,1.02,C.sky,'camera');person(346,576,1.04,C.pink,'stand',1);
 if(night){line([[862,476],[862,181]],'#665A51',8);ctx.beginPath();ctx.moveTo(862,181);ctx.quadraticCurveTo(862,135,814,153);ink(8);ctx.stroke();ellipse(805,170,25,17,'#F3D295',true,4);withAlpha(.13,()=>ellipse(805,170,64,64,'#FFEBAF',false))}
}
function together(){
 sky('#C3DBD5');cityBack();poly([[0,348],[960,322],[960,600],[0,600]],'#BECA9E',false);tree(77,414,1.3,true);tree(887,409,1.4,true);bunting(62);
 person(330,551,2.1,C.sky,'cheer');person(535,557,2.2,C.pink,'cheer',1);person(738,553,1.75,C.yellow,'camera');flag(252,215,1.0);
 ctx.save();ctx.translate(737,149);ctx.rotate(.08);ribbon('国庆快乐',0,0,249);ctx.restore();
 for(let i=0;i<14;i++){const x=92+hash(i+2)*785,y=140+hash(i+54)*180;withAlpha(.85,()=>{star(x,y,5+hash(i)*5,.3);ctx.fillStyle=[C.orange,C.yellow,C.pink][i%3];ctx.fill()})}
}
function dinner(){
 ctx.fillStyle='#DCC099';ctx.fillRect(0,0,960,600);for(let y=18;y<600;y+=72)line([[0,y],[960,y+17]],'#BB9874',3);
 ellipse(482,340,327,198,'#BCA385',false);ellipse(482,315,331,193,'#F8EDD4',true,6);ellipse(482,315,295,156,'#D2D6B9',true,3);
 for(const [x,y,s,r] of [[367,299,1.2,-.18],[585,318,1.25,.21]]){
  ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.scale(s,s);
  for(let i=0;i<4;i++)for(let side of [-1,1])line([[side*54,-27+i*22],[side*(96+i*5),-59+i*32],[side*(112+i*4),-40+i*34]],'#B55C3F',10);
  ellipse(0,0,70,54,C.orange,true,5);ellipse(-15,-13,32,21,'#EF9E6D',false);
  for(const side of [-1,1]){line([[side*53,-27],[side*97,-72]],C.orangeD,15);ellipse(side*101,-80,25,30,C.orange,true,4);poly([[side*96,-98],[side*106,-79],[side*115,-102]],'#F8EDD4',true,3)}
  ellipse(-24,-44,5,6,C.ink,false);ellipse(24,-44,5,6,C.ink,false);ctx.restore();
 }
 steam(443,184,1.3,.7);ellipse(831,97,71,47,'#F8EDD4',true,4);ellipse(831,97,48,27,'#664430',true,3);line([[135,80],[321,201]],'#775038',7);line([[121,95],[305,218]],'#775038',7);ribbon('压轴大餐！',466,70,258);
}
const PAINTERS=[travel,()=>street(false),skewers,tea,hotpot,picnic,wheel,()=>sunset(false),()=>street(true),()=>sunset(true),together,dinner];
function initPhotos(){
 const main=ctx;
 for(let i=0;i<PAINTERS.length;i++){
  const c=document.createElement('canvas');c.width=1920;c.height=1200;ctx=c.getContext('2d');ctx.scale(2,2);ctx.lineCap='round';ctx.lineJoin='round';
  PAINTERS[i]();
  // Stable paper grain and a few imperfect pencil accents, not an animated noise overlay.
  for(let n=0;n<4600;n++){ctx.fillStyle=n%2?'rgba(83,55,27,.045)':'rgba(255,249,222,.08)';ctx.fillRect(hash(n+i*901)*960,hash(n+741+i*91)*600,.7+hash(n+33)*1.4,.7+hash(n+58)*1.4)}
  PHOTOS.push(c);
 }
 ctx=main;
}
function photo(id,x,y,w=220,rot=0,caption=true){
 const h=w*(caption?.755:.647);ctx.save();ctx.translate(x,y);ctx.rotate(rot);
 ctx.fillStyle='rgba(66,43,24,.21)';ctx.fillRect(-w/2+6,-h/2+9,w,h);
 box(-w/2,-h/2,w,h,'#FFFAEB',3,3);
 const pad=w*.038,iw=w-pad*2,ih=iw*.625;
 ctx.drawImage(PHOTOS[id%PHOTOS.length],-w/2+pad,-h/2+pad,iw,ih);
 if(caption){txt(PHOTO_NAMES[id%PHOTOS.length],0,h/2-w*.061,{size:w*.076,align:'center'});txt(PHOTO_DATE[id%PHOTOS.length],w/2-pad,-h/2+ih,{size:w*.035,align:'right',color:'#FFF8E5',stroke:'#4F3B2B88',lw:2})}
 ctx.restore();
}
function imageFit(id,x,y,w,h,zoom=1,dx=0,dy=0){
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();const s=Math.max(w/960,h/600)*zoom;
 ctx.drawImage(PHOTOS[id%PHOTOS.length],x+w/2-480*s+dx,y+h/2-300*s+dy,960*s,600*s);ctx.restore();
}
