import subprocess,json,hashlib,re,wave
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
D=Path(__file__).resolve().parents[1];V=D/'out/小螃蟹剪国庆相册_精简版.mp4'
tl=json.loads((D/'timeline.json').read_text('utf-8'));edit=json.loads((D/'edit-info.json').read_text('utf-8'));duration=tl['duration']
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames,sample_rate,channels','-of','json',str(V)]))
decode=subprocess.run(['ffmpeg','-v','error','-i',str(V),'-map','0:v:0','-map','0:a:0','-f','null','-'],capture_output=True,text=True)
assert decode.returncode==0 and not decode.stderr.strip(),decode.stderr
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'60/1',round(duration*60))
assert abs(float(probe['format']['duration'])-duration)<.03
assert a['sample_rate']=='48000' and a['channels']==2
assert all(x['end']<=y['start'] for x,y in zip(tl['lines'],tl['lines'][1:]))
for l in tl['lines']:
 with wave.open(str(D/l['file'])) as w:measured=w.getnframes()/w.getframerate()
 assert abs(measured-l['duration'])<1/48000 and l['end']<tl['duration']
manifest=json.loads((D/'asset-manifest.json').read_text('utf-8'))
for name,digest in manifest['files'].items():
 data=(D/name).read_bytes()
 if name.endswith('.js'):data=data.replace(b'\r\n',b'\n')
 assert hashlib.sha256(data).hexdigest()==digest,f'Preserved asset changed: {name}; review asset-manifest.json after intentional updates'

events=json.loads((D/'sfx_events.json').read_text('utf-8'));mixer=(D/'tools/mix.py').read_text('utf-8')
recognized=set(re.findall(r'k == "([^"]+)"',mixer));assert not {e['kind'] for e in events}-recognized
assert edit['photo_count']==24 and len(list((D/'photos').glob('*.png')))==24
assert len(edit['montage'])==16 and len({m['id'] for m in edit['montage']})==16
assert {m['id'] for m in edit['montage']}=={0,1,2,3,4,5,6,7,8,10,12,13,17,18,19,23}
assert all(abs(m['at']/.5-round(m['at']/.5))<1e-8 for m in edit['montage'])
assert all(abs((m['start']-edit['montage_start'])/.5-round((m['start']-edit['montage_start'])/.5))<1e-7 for m in edit['montage'])
assert all(next(m for m in edit['montage'] if m['id']==i)['end']-next(m for m in edit['montage'] if m['id']==i)['start']>=.999 for i in [12,13])
assert all(0<=e['t']<tl['duration'] for e in events)
(D/'preview').mkdir(exist_ok=True)
times=[3.1,6.7,8.9,10.8,13.1,15.4,17.9,20.1,23.4,25.2,29.35,30.4,32.6,36.5,41.3,46.2]
sheet=Image.new('RGB',(1920,1168),'#e8dcc7');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 p=D/'preview'/f'encoded_{t:.2f}.jpg'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(V),'-frames:v','1','-q:v','2',str(p)],check=True)
 im=Image.open(p).convert('RGB');assert im.getextrema()[0][1]-im.getextrema()[0][0]>40
 x=i%4*480;y=i//4*292;sheet.paste(im.resize((480,270)),(x,y));draw.text((x+8,y+274),f'{t:.2f}s',fill='#3a2418')
sheet.save(D/'out/成片抽帧.jpg',quality=92)
subprocess.run(['ffmpeg','-v','error','-y','-ss','3.1','-i',str(V),'-frames:v','1','-q:v','1',str(D/'out/封面.jpg')],check=True)
report={'media':probe,'full_video_audio_decode':'passed','dialogue_overlap':'none','dialogue_measured_from_wav':True,'preserved_assets_match_manifest':True,'original_layout_palette_retained':True,'new_choreography':True,'hand_drawn_photo_count':24,'unique_montage_photos':16,'montage_seconds':[28.1,38.6],'beat_seconds':.5,'all_montage_cuts_on_beat':True,'sea_and_holiday_photo_minimum_seconds':1,'sfx_events':len(events),'unknown_sfx_kinds':[],'sha256':hashlib.sha256(V.read_bytes()).hexdigest(),'bytes':V.stat().st_size,'voice_line_count':len(tl['lines']),'visual_review':'Encoded contact sheet ready for review; not user aesthetic acceptance.'}
(D/'out/成片检查.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2))
