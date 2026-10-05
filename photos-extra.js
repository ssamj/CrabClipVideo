// Twelve additional photographs, authored as illustrations rather than title cards.
function seaBase(sunset=false){
 ctx.fillStyle=sunset?'#EBC4A5':'#B8DCE1';ctx.fillRect(0,0,960,600);
 ellipse(759,99,49,49,sunset?'#F1AB77':'#F7D88E',false);cloud(155,87,.9);cloud(540,57,.58);
 ctx.fillStyle=sunset?'#A6B6B6':'#76B7C4';ctx.fillRect(0,198,960,402);line([[0,198],[960,198]],'#6E9497',3);
 for(let i=0;i<44;i++){let x=hash(i+401)*960,y=220+hash(i+211)*330;line([[x,y],[x+23+hash(i)*55,y-2]],i%3?'#B9E0DD':'#F4F0D6',2.5)}
 for(const [x,y] of [[327,104],[388,125],[432,77]]){line([[x-11,y+4],[x,y],[x+12,y+4]],C.ink,3)}
}
function palm(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(30,-112,2,-224);ink(20,'#B58B5D');ctx.stroke();ink(4);ctx.stroke();for(let i=0;i<8;i++)line([[4+i*.6,-18-i*24],[20,-26-i*24]],'#805E3E',3);
 for(let i=0;i<6;i++){let a=-Math.PI+i*Math.PI/5;ctx.save();ctx.translate(2,-223);ctx.rotate(a);poly([[0,0],[41,-24],[92,-4],[128,38],[67,9]],'#83A273',true,3);line([[0,0],[118,33]],'#587953',3);ctx.restore()}ellipse(1,-210,13,16,'#9C7854',true,3);ellipse(23,-213,13,16,'#9C7854',true,3);ctx.restore()}
function beach(){
 seaBase();ctx.beginPath();ctx.moveTo(-10,382);ctx.bezierCurveTo(232,442,512,259,980,329);ctx.lineTo(980,620);ctx.lineTo(-10,620);ctx.closePath();ctx.fillStyle='#E9D3A8';ctx.fill();
 ctx.beginPath();ctx.moveTo(-10,368);ctx.bezierCurveTo(244,431,510,242,980,314);ink(22,'#FFF2D8');ctx.stroke();ink(3,'#D8E4D4');ctx.stroke();
 ctx.beginPath();ctx.moveTo(-10,339);ctx.bezierCurveTo(260,391,546,230,975,287);ink(8,'#D3E9DB');ctx.stroke();
 palm(104,518,1.3);line([[750,334],[750,546]],'#A27B51',7);
 for(let i=0;i<4;i++)poly([[750,238],[605+i*72,342],[677+i*72,342]],[C.orange,'#F8E7BC'][i%2],true,3);
 line([[605,342],[893,342]],C.ink,4);poly([[695,456],[811,456],[844,539],[719,539]],'#FAE7C3',true,4);for(let i=0;i<5;i++)line([[705+i*21,464],[729+i*22,532]],C.orange,9);
 person(458,491,1.3,C.pink,'cheer',1);person(568,500,1.24,C.sky,'camera');
 ellipse(351,478,30,30,C.yellow,true,3);poly([[343,450],[360,452],[370,498],[350,506]],C.orange,true,2);
 for(let i=0;i<9;i++){let x=253+i*39,y=543+Math.sin(i)*16;ellipse(x,y,5,2.5,'#C7A675',false)}
 ctx.save();ctx.translate(774,537);ctx.rotate(.1);star(0,0,17,.4,5,.6);ctx.fillStyle='#D29476';ctx.fill();ink(3);ctx.stroke();ctx.restore();
}
function holidayGate(){
 sky('#C7DBD8');cityBack();ctx.fillStyle='#D3D4AC';ctx.fillRect(0,320,960,280);poly([[330,346],[626,346],[858,600],[98,600]],'#EBD8B2',false);
 tree(58,450,1.13,true);tree(902,438,1.1,true);bunting(49);
 for(const x of [157,807]){box(x-15,128,30,313,'#C69D77',7,4);ellipse(x,128,22,22,C.yellow,true,3);flag(x-37,71,.67)}
 ctx.save();ctx.translate(480,214);ctx.rotate(-.014);poly([[-326,-65],[325,-61],[313,72],[-319,66]],'#D57960',true,5);line([[-308,-48],[302,-45]],'#EFB394',3);txt('国庆快乐',0,3,{size:79,align:'center',color:'#FFF0CF'});ctx.restore();
 for(let i=0;i<6;i++){let x=86+i%2*781,y=223+Math.floor(i/2)*47;line([[x,y],[x+12,443]],'#8B795C',2);ellipse(x,y,22,29,[C.sky,C.yellow,C.pink][Math.floor(i/2)],true,3)}
 person(327,555,1.58,C.sky,'cheer');person(516,562,1.62,C.pink,'cheer',1);person(687,560,1.28,C.yellow,'camera');
 for(let i=0;i<29;i++){let x=224+hash(i+502)*529,y=315+hash(i+61)*104;ctx.save();ctx.translate(x,y);ctx.rotate(i);box(-3,-7,6,14,[C.orange,C.yellow,C.sky,C.mint][i%4],1,0);ctx.restore()}
}
function coastRoad(){
 seaBase();poly([[0,195],[249,194],[346,293],[261,392],[468,600],[0,600]],'#ABC093',true,3);
 ctx.beginPath();ctx.moveTo(89,605);ctx.bezierCurveTo(574,427,-97,390,232,188);ink(121,'#DDD0AD');ctx.stroke();ink(93,'#9D9C91');ctx.stroke();
 ctx.beginPath();ctx.moveTo(89,605);ctx.bezierCurveTo(574,427,-97,390,232,188);ink(4,'#FFF0CB');ctx.setLineDash([29,21]);ctx.stroke();ctx.setLineDash([]);
 for(let i=0;i<4;i++)palm(54+i*43,332+i*68,.46+i*.06);
 ctx.save();ctx.translate(247,448);ctx.rotate(.18);box(-57,-40,114,81,C.orange,22,4);box(-46,-26,92,30,'#DAE6DC',10,3);box(-43,12,21,13,C.yellow,4,2);box(23,12,21,13,C.yellow,4,2);box(-63,-21,13,39,C.ink,3,0);box(50,-21,13,39,C.ink,3,0);ctx.restore();
 line([[789,550],[789,411]],'#997450',6);box(694,405,190,68,'#FBEDD0',5,4);txt('沿着海岸走 →',789,440,{size:25,align:'center'});
}
function surfing(){
 seaBase();ctx.beginPath();ctx.moveTo(-20,549);ctx.bezierCurveTo(130,511,214,298,402,318);ctx.bezierCurveTo(635,333,591,428,557,425);ctx.bezierCurveTo(492,372,669,521,985,406);ctx.lineTo(985,620);ctx.lineTo(-20,620);ctx.closePath();ctx.fillStyle='#5D9FAF';ctx.fill();ink(5);ctx.stroke();
 ctx.beginPath();ctx.moveTo(-20,535);ctx.bezierCurveTo(202,462,279,279,438,325);ctx.bezierCurveTo(551,351,572,382,557,410);ink(23,'#E9F0D7');ctx.stroke();
 ctx.save();ctx.translate(517,444);ctx.rotate(-.2);ellipse(0,0,149,26,C.yellow,true,5);line([[-116,0],[122,0]],C.orange,7);person(0,-5,1.12,C.orange,'cheer');ctx.restore();
 for(let i=0;i<17;i++)ellipse(145+hash(i+55)*463,396+hash(i+61)*163,3+hash(i)*6,2,'#D9E6D3',false);
 poly([[754,264],[810,264],[797,272],[764,272]],C.ink,true,2);line([[780,264],[780,204]],C.ink,2);poly([[781,204],[781,256],[816,256]],'#F5E3B5',true,2);
}
function lighthouse(){
 seaBase();poly([[0,592],[254,325],[503,361],[631,482],[982,586],[982,610]],'#9AA68D',true,4);poly([[168,528],[260,360],[504,369],[382,563]],'#B9AE90',false);
 poly([[286,371],[315,117],[407,117],[438,371]],'#FAEBD0',true,5);poly([[304,215],[420,215],[426,266],[298,266]],'#D37E61',true,3);box(303,85,114,55,'#F4DDAE',8,4);box(291,127,138,16,'#85634E',3,3);poly([[282,86],[361,43],[436,86]],C.orange,true,4);box(342,297,43,74,'#765F4A',18,3);
 for(const x of [320,353,387])box(x,94,17,31,'#BFD9D5',2,2);line([[317,119],[406,119]],C.ink,3);
 for(let i=0;i<9;i++){let x=235+i*39,y=420+i*7;line([[x,y],[x,y+51]],'#796957',5);if(i<8)line([[x,y+13],[x+39,y+20]],'#796957',4)}
 person(503,479,.94,C.yellow,'camera');person(603,503,.93,C.pink,'stand',1);
}
function campsite(){
 ctx.fillStyle='#455067';ctx.fillRect(0,0,960,600);for(let i=0;i<71;i++)ellipse(hash(i+90)*960,hash(i+20)*288,1+hash(i)*2,1+hash(i)*2,'#F4E3B6',false);ellipse(783,102,39,39,'#F5E4B3',false);ellipse(801,87,36,36,'#455067',false);
 poly([[0,346],[130,227],[260,322],[436,171],[634,343],[811,197],[960,320],[960,600],[0,600]],'#71817F',true,3);poly([[0,407],[960,371],[960,600],[0,600]],'#839477',false);
 poly([[118,498],[316,301],[509,494]],'#E2B374',true,5);poly([[316,301],[583,346],[709,500],[509,494]],'#C89160',true,4);poly([[221,492],[316,351],[411,493]],'#685746',true,4);line([[318,314],[318,483]],'#B5A681',3);
 for(const x of [125,690]){line([[x,498],[x-40,550]],C.ink,3);line([[x-40,541],[x-40,558]],C.ink,5)}
 ellipse(643,525,81,25,'#665B48',false);line([[594,527],[689,532]],'#765336',13);line([[599,540],[681,513]],'#765336',13);poly([[616,527],[606,488],[635,498],[650,446],[670,491],[686,480],[680,525]],C.orange,true,3);poly([[638,527],[646,482],[662,513],[671,503],[666,528]],C.yellow,false);
 person(753,534,.95,C.pink,'stand',1);person(559,547,.85,C.sky,'stand');line([[795,448],[795,523]],C.ink,4);box(779,448,32,48,'#F2D694',7,3);
}
function sailing(){
 seaBase();poly([[228,443],[780,443],[714,507],[310,503]],'#D58B62',true,5);poly([[305,505],[714,509],[680,525],[346,521]],'#74664F',true,3);line([[491,443],[491,81]],C.ink,8);
 poly([[472,112],[249,413],[472,413]],'#FFF1D6',true,4);poly([[511,159],[511,412],[746,412]],'#F0D2A0',true,4);line([[484,97],[741,413]],'#8D7051',3);line([[473,107],[330,413]],'#E0CBA8',3);
 flag(492,86,.62);person(572,443,.75,C.sky,'cheer');person(659,445,.66,C.pink,'stand',1);
 for(let i=0;i<9;i++){let x=197+i*69,y=538+Math.sin(i)*11;line([[x,y],[x+43,y]],'#EAF0D9',6)}
}
function mountain(){
 sky('#D2DFD3');poly([[0,413],[199,209],[331,341],[532,103],[725,321],[819,202],[960,357],[960,600],[0,600]],'#A6B59D',true,4);poly([[0,505],[182,343],[305,444],[507,248],[755,492],[960,397],[960,600],[0,600]],'#829A83',true,3);
 poly([[192,600],[416,299],[553,261],[688,600]],'#C5B896',true,4);for(let i=0;i<12;i++){const y=586-i*23,k=i/12;line([[lerp(212,431,k),y],[lerp(668,537,k),y]],'#8F866D',4)}
 person(483,308,.8,C.orange,'cheer');flag(559,164,.93);person(353,511,1.09,C.sky,'camera');person(588,552,1.23,C.pink,'stand',1);cloud(713,367,1.3,'#E8EDDB');cloud(85,449,.96,'#E8EDDB');
}
function icecream(){
 sky('#C9DBD3');cityBack();bush(0,471,960,'#A7B18A');ctx.fillStyle='#D8C49F';ctx.fillRect(0,472,960,128);
 ctx.save();ctx.translate(485,364);ctx.rotate(.09);poly([[-84,-2],[84,-2],[14,207]],'#CEA172',true,5);for(let i=0;i<6;i++){let y=12+i*30,w=73*(1-y/230);line([[-w,y],[w,y+18]],'#A77A50',3);line([[w,y],[-w,y+18]],'#A77A50',3)}
 for(const [x,y,c] of [[-44,-33,C.pink],[45,-42,'#D7E1AA'],[0,-113,'#F2DCAC']]){ellipse(x,y,61,59,c,true,4);ellipse(x-19,y-23,16,8,'#FFF8D799',false)}
 for(let i=0;i<17;i++){let x=-63+hash(i+80)*130,y=-148+hash(i+42)*140;line([[x,y],[x+5,y+8]],[C.orange,C.yellow,'#956B53'][i%3],3)}ctx.restore();
 poly([[425,546],[490,494],[547,538],[570,600],[397,600]],'#F0CAA5',true,4);sparkle(252,304,25,C.yellow);sparkle(713,278,19,C.yellow);
}
function cafe(){
 ctx.fillStyle='#DFC8A6';ctx.fillRect(0,0,960,600);box(55,35,850,210,'#FCEDD1',14,5);ctx.save();rr(71,51,818,178,9);ctx.clip();sky('#C2D9D1');tree(170,252,1);tree(791,233,.86,true);ctx.restore();line([[493,42],[493,237]],C.ink,7);
 poly([[0,325],[960,299],[960,600],[0,600]],'#BD9873',true,4);for(let i=0;i<5;i++)line([[0,366+i*61],[960,340+i*61]],'#A38260',3);
 ellipse(332,452,202,77,'#F7E7C5',true,4);ellipse(478,350,55,58,'#F5E9CF',true,8);ellipse(326,389,132,106,'#F5E9CF',true,5);ellipse(326,351,132,69,'#F9EED8',true,5);ellipse(326,351,108,50,'#9F7454',true,3);
 ctx.beginPath();ctx.moveTo(326,377);ctx.bezierCurveTo(208,317,314,308,326,339);ctx.bezierCurveTo(360,300,426,336,326,377);ctx.fillStyle='#ECD4AD';ctx.fill();steam(290,288,.85,.7);
 ellipse(735,451,157,74,'#F4E5C9',true,4);poly([[650,463],[650,362],[806,405],[806,493]],'#E8BE8D',true,4);poly([[650,362],[743,308],[806,405]],'#FBDFBA',true,4);line([[653,405],[800,448]],'#B27F60',13);line([[653,426],[800,470]],'#F5D8A8',12);ellipse(730,338,20,22,C.red,true,3);for(let i=0;i<6;i++)ellipse(721+i%3*8,330+Math.floor(i/3)*10,1.5,2,'#FFD8A3',false);
}
function carousel(){
 sky('#CEDDD5');cityBack();ctx.fillStyle='#CABF99';ctx.fillRect(0,325,960,275);tree(67,420,1.1);tree(900,417,1.15,true);
 ellipse(497,509,295,69,'#B68C6C',true,5);ellipse(497,484,295,69,'#EDD5AB',true,4);line([[497,140],[497,465]],'#A97E52',10);
 poly([[209,202],[497,76],[788,202]],C.orange,true,5);for(let i=0;i<4;i++)poly([[497,76],[209+i*145,202],[281+i*145,202]],'#F4D8AA',true,2);
 box(203,198,590,46,C.yellow,8,4);for(let i=0;i<15;i++)ellipse(223+i*39,221,6,6,'#FFF0C2',true,2);
 for(let i=0;i<3;i++){let x=322+i*174;line([[x,243],[x,491]],'#A77B52',6);ctx.save();ctx.translate(x,394);poly([[-65,10],[-56,-18],[27,-12],[39,-63],[76,-45],[54,-12],[70,9],[29,28],[-42,30]],['#F7E8C9',C.sky,C.pink][i],true,4);line([[-39,28],[-56,57],[-76,59]],C.ink,6);line([[25,26],[45,57],[68,55]],C.ink,6);ellipse(58,-44,3,3,C.ink,false);box(-20,-27,36,25,C.orange,4,3);ctx.restore()}
 person(94,570,1.12,C.pink,'cheer',1);person(854,558,1.04,C.sky,'camera');
}
function fireworks(){
 ctx.fillStyle='#4F4A62';ctx.fillRect(0,0,960,600);
 for(const [x,y,r,col] of [[215,168,95,C.yellow],[686,136,106,C.pink],[480,275,67,C.sky]]){
  for(let i=0;i<14;i++){let a=i*TAU/14;line([[x+Math.cos(a)*r*.28,y+Math.sin(a)*r*.28],[x+Math.cos(a)*r,y+Math.sin(a)*r]],col,4);ellipse(x+Math.cos(a)*(r+17),y+Math.sin(a)*(r+17),3,3,col,false)}sparkle(x,y,11,col)
 }
 for(let i=0;i<31;i++)ellipse(hash(i+732)*960,hash(i+91)*352,1.5,1.5,'#F5DEB5',false);
 ctx.save();ctx.translate(0,114);cityBack(true);ctx.restore();ctx.fillStyle='#777887';ctx.fillRect(0,421,960,179);for(let i=0;i<30;i++){let x=hash(i+87)*960,y=436+hash(i+314)*142;line([[x,y],[x+17+hash(i)*25,y]],'#BCABB0',2)}
 person(367,579,1.05,C.sky,'cheer');person(519,581,1.12,C.pink,'cheer',1);line([[0,569],[960,549]],'#A78C76',9);
}
PHOTO_NAMES.push('去海边吹吹风','国庆快乐·合个影','沿海公路','浪花里冲浪','灯塔下的海','星空露营','扬帆出海','山顶见','假期的冰淇淋','咖啡与小蛋糕','旋转木马','一起看烟花');
PHOTO_DATE.push('10.02','10.01','10.02','10.02','10.03','10.03','10.04','10.04','10.05','10.05','10.06','10.06');
PAINTERS.push(beach,holidayGate,coastRoad,surfing,lighthouse,campsite,sailing,mountain,icecream,cafe,carousel,fireworks);
