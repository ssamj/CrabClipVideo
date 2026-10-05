import asyncio,json,sys,wave,subprocess
from pathlib import Path
D=Path(__file__).resolve().parents[1]
import edge_tts
LINES=[
 ('p1',.35,5.35,'国庆拍了八百多张，帮我剪个视频，转场酷一点。'),
 ('c1',5.45,7.6,'没问题，简单剪一下！'),
 ('c2',10.6,12.0,'节奏，拿捏！'),
 ('p2',22.9,26.2,'酷一点，没让你把我转吐！'),
 ('c3',25.9,26.8,'收到！'),
 ('c4',27.05,28.05,'请欣赏！'),
 ('p3',38.7,42.6,'挺好，最后把这盘螃蟹也加上。'),
 ('c5',42.95,45.8,'当前剪辑额度不足。'),
]
async def main():
 (D/'audio').mkdir(exist_ok=True)
 (D/'out').mkdir(exist_ok=True)
 lines=[]
 for ident,start,limit,text in LINES:
  raw=D/'audio'/f'{ident}.mp3'
  cfg=dict(voice='zh-CN-YunxiNeural' if ident[0]=='p' else 'zh-CN-XiaoxiaoNeural',rate='+12%' if ident[0]=='p' else '+20%',pitch='-3Hz' if ident[0]=='p' else '+18Hz')
  if ident=='c5':cfg.update(rate='-5%',pitch='+0Hz')
  if not raw.exists() or raw.stat().st_size<1000:
   for attempt in range(3):
    try:
     events=[]
     with raw.open('wb') as f:
      async for e in edge_tts.Communicate(text,**cfg,boundary='SentenceBoundary').stream():
       if e['type']=='audio':f.write(e['data'])
       elif e['type']=='SentenceBoundary':events.append(e)
     (D/'audio'/f'{ident}.boundaries.json').write_text(json.dumps(events,ensure_ascii=False,indent=2),'utf-8')
     break
    except edge_tts.exceptions.NoAudioReceived:
     if attempt==2:raise
     await asyncio.sleep(.6)
  dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',str(raw)]))
  speed=max(1,dur/(limit-start))
  if speed>1.4:raise RuntimeError(f'{ident} exceeds dialogue window: {dur}')
  af=f'atempo={speed:.7f},highpass=f=70,loudnorm=I=-19:TP=-2:LRA=8'
  if ident=='c5':af+=',highpass=f=320,lowpass=f=3400'
  wav=D/'audio'/f'{ident}.wav'
  subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af',af,'-ar','48000','-ac','1',str(wav)],check=True)
  with wave.open(str(wav)) as w:duration=w.getnframes()/w.getframerate()
  lines.append(dict(id=ident,start=start,end=round(start+duration,5),file=f'audio/{ident}.wav',text=text,duration=duration,voice=cfg['voice'],tempo_factor=speed))
  print(ident,round(duration,3),text,flush=True)
 tl=dict(duration=46.6,lines=lines,timing_source='V3: cached dialogue measured from final WAV samples; final montage trimmed to 16 photos and ending moved 3.5 seconds earlier.')
 (D/'timeline.json').write_text(json.dumps(tl,ensure_ascii=False,indent=2),'utf-8')
 (D/'dialogue.js').write_text('window.DIALOGUE='+json.dumps(lines,ensure_ascii=False)+';','utf-8')
 def tc(t):
  n=round(t*1000);return f'{n//3600000:02}:{n//60000%60:02}:{n//1000%60:02},{n%1000:03}'
 (D/'out/小螃蟹剪国庆相册.srt').write_text('\n\n'.join(f"{i+1}\n{tc(l['start'])} --> {tc(l['end'])}\n{l['text']}" for i,l in enumerate(lines))+'\n','utf-8')
asyncio.run(main())
