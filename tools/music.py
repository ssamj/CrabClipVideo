"""Retain the original cartoon music, with new beat-aligned edits and a hold-music tag."""
import subprocess,wave,json
from pathlib import Path
import numpy as np
D=Path(__file__).resolve().parents[1];SR=48000;duration=46.6
def read(name):
 b=subprocess.check_output(['ffmpeg','-v','error','-i',str(D/'music'/name),'-f','f32le','-ar',str(SR),'-ac','2','-'])
 return np.frombuffer(b,dtype='<f4').reshape(-1,2).copy()
source=read('source.wav');out=np.zeros((round(SR*duration),2),np.float32)
cuts=[(.03,0,21),(21.03,12,5.87),(26.9,26.87,11.7)]
for dest,start,length in cuts:
 a=int(start*SR);n=int(length*SR);seg=source[a:a+n].copy();n=len(seg)
 fade=min(int(.04*SR),n//2);seg[:fade]*=np.linspace(0,1,fade)[:,None];seg[-fade:]*=np.linspace(1,0,fade)[:,None]
 j=int(dest*SR);out[j:j+n]+=seg[:len(out)-j]
# Explicit 120 BPM kick/hat accents make every half-second photo cut audible.
for beat in range(21):
 at=28.1+beat*.5;t=np.arange(round(.19*SR))/SR
 freq=52+102*np.exp(-t*36);hit=np.sin(2*np.pi*np.cumsum(freq)/SR)*np.exp(-t*21)*np.minimum(t/.002,1)*.17
 j=round(at*SR);out[j:j+len(hit)]+=hit[:,None]
 rng=np.random.default_rng(100+beat);hat=rng.standard_normal(round(.042*SR));hat=np.diff(hat,prepend=0)*np.exp(-np.arange(len(hat))/(SR*.012))*.025
 out[j:j+len(hat)]+=hat[:,None]
# Original public-domain telephone gag, newly positioned after the dinner photo.
notes=[76,75,76,75,76,71,74,72,69]
for i,m in enumerate(notes):
 at=43.8+i*.20;t=np.arange(int(.4*SR))/SR;f=440*2**((m-69)/12)
 sig=(np.sin(2*np.pi*f*t)+.13*np.sin(2*np.pi*f*3*t))*np.exp(-t*8)*np.minimum(1,t/.005)*.13
 j=int(at*SR);n=min(len(sig),len(out)-j);out[j:j+n]+=sig[:n,None]
out[-int(.6*SR):]*=np.linspace(1,0,int(.6*SR))[:,None]
with wave.open(str(D/'music/bgm.wav'),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype('<i2').tobytes())
(D/'music/edit-map.json').write_text(json.dumps({'source':'Original 小螃蟹修bug/music/v2_s800.wav','bpm':120,'edits':cuts,'montage_beat_times':[28.1+i*.5 for i in range(21)],'hold_music':'Newly synthesized public-domain Beethoven motif at 43.8s','duration':duration},ensure_ascii=False,indent=2),'utf-8')
print('Music bed ready:',duration,'seconds')
