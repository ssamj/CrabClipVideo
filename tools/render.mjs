import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url),D=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const modulePath=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=require(modulePath);
for(const dir of ['out','preview'])fs.mkdirSync(path.join(D,dir),{recursive:true});
const opts=process.argv.slice(2),value=(k,def)=>opts.includes(k)?opts[opts.indexOf(k)+1]:def;
const mime={'.js':'text/javascript','.html':'text/html','.ttc':'font/collection','.wav':'audio/wav','.json':'application/json'};
const server=http.createServer((req,res)=>{let p;try{p=path.resolve(D,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname))}catch{res.writeHead(400).end();return}if(!p.startsWith(D+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404).end();return}res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(res)});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--hide-scrollbars','--force-color-profile=srgb','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
const errors=[];const url=`http://127.0.0.1:${server.address().port}/scene.html?render=1`;
async function page(){const p=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});p.on('pageerror',e=>errors.push(e.stack||e.message));await p.goto(url);await p.evaluate(()=>window.ready);fs.writeFileSync(path.join(D,'sfx_events.json'),JSON.stringify(await p.evaluate(()=>window.SFX),null,2));fs.writeFileSync(path.join(D,'edit-info.json'),JSON.stringify(await p.evaluate(()=>window.EDIT_INFO),null,2));return p}
try{
 if(opts.includes('--export-photos')){
  const p=await page();fs.mkdirSync(path.join(D,'photos'),{recursive:true});
  const data=await p.evaluate(()=>PHOTOS.map((c,i)=>({name:PHOTO_NAMES[i],png:c.toDataURL('image/png').split(',')[1]})));
  for(let i=0;i<data.length;i++)fs.writeFileSync(path.join(D,'photos',`${String(i+1).padStart(2,'0')}_${data[i].name}.png`),Buffer.from(data[i].png,'base64'));
  console.log(`Exported ${data.length} original hand-drawn photos`);
 }else if(opts.includes('--preview')){
  const p=await page();for(const t of value('--preview','3.1,6.7,13.1,17.9,23.4,32.6,36.5,41.3,46.2').split(',').map(Number)){await p.evaluate(t=>window.renderAt(t),t);const file=path.join(D,'preview',`t${t.toFixed(2)}.png`);await p.locator('canvas').screenshot({path:file});console.log(file)}
 }else{
  const fps=60,duration=JSON.parse(fs.readFileSync(path.join(D,'timeline.json'),'utf8')).duration,total=Math.round(fps*duration),workers=Number(value('--workers','4')),n=Math.ceil(total/workers);fs.mkdirSync(path.join(D,'out','chunks'),{recursive:true});let count=0;const started=Date.now();
  const timer=setInterval(()=>console.log(`${count}/${total} frames · ${Math.round((Date.now()-started)/1000)}s`),10000);
  try{await Promise.all(Array.from({length:workers},async(_,idx)=>{
   const p=await page(),first=idx*n,last=Math.min(total,first+n),file=path.join(D,'out','chunks',`part-${idx}.mp4`);
   const ff=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-c:v','mjpeg','-i','-','-an','-c:v','libx264','-preset','fast','-crf','18','-threads','2','-pix_fmt','yuv420p','-video_track_timescale','15360',file],{stdio:['pipe','ignore','pipe']});let ffError='';ff.stderr.on('data',b=>ffError+=b);ff.stdin.on('error',()=>{});const ended=once(ff,'close');
   for(let i=first;i<last;i++){
    const jpg=await p.evaluate(t=>{window.renderAt(t);return document.querySelector('canvas').toDataURL('image/jpeg',.94).split(',')[1]},i/fps);
    if(!ff.stdin.write(Buffer.from(jpg,'base64')))await once(ff.stdin,'drain');count++;
    if(errors.length)throw new Error(errors.join('\n'));
   }
   ff.stdin.end();const [code]=await ended;if(code!==0)throw new Error(ffError);await p.close();console.log(`chunk ${idx} complete`);
  }));}finally{clearInterval(timer)}
  fs.writeFileSync(path.join(D,'out','chunks','concat.txt'),Array.from({length:workers},(_,i)=>`file 'part-${i}.mp4'`).join('\n'));
  const ff=spawn('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',path.join(D,'out','chunks','concat.txt'),'-c','copy','-movflags','+faststart',path.join(D,'out','video.mp4')],{stdio:'inherit'});const [code]=await once(ff,'close');if(code)throw new Error('concat failed');console.log('Silent master ready');
 }
 if(errors.length)throw new Error(errors.join('\n'));
}finally{await browser.close();server.close()}
