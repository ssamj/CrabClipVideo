from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
D=Path(__file__).resolve().parents[1];paths=sorted((D/'photos').glob('*.png'))
(D/'out').mkdir(exist_ok=True);(D/'preview').mkdir(exist_ok=True)
sheet=Image.new('RGB',(1600,312*((len(paths)+3)//4)),'#EFE4D0');dr=ImageDraw.Draw(sheet);font=ImageFont.truetype(str(D/'fonts/HannotateSC-W7.ttf'),22)
for i,p in enumerate(paths):
 x=i%4*400;y=i//4*312;sheet.paste(Image.open(p).resize((380,238)),(x+10,y+10));dr.text((x+15,y+260),p.stem,fill='#3A2418',font=font)
sheet.save(D/'out/手绘照片总览.jpg',quality=94)
times=[3.1,6.7,8.9,10.8,13.1,15.4,17.9,20.1,23.4,25.2,29.35,30.4,32.6,36.5,41.3,46.2]
preview=Image.new('RGB',(1920,1168),'#EFE4D0');draw=ImageDraw.Draw(preview)
for i,t in enumerate(times):
 p=D/'preview'/f't{t:.2f}.png'
 if not p.exists():continue
 x=i%4*480;y=i//4*292;preview.paste(Image.open(p).resize((480,270)),(x,y));draw.text((x+10,y+274),f'{t:.2f}s',fill='#3A2418')
preview.save(D/'preview/contact.jpg',quality=92)
print('Catalogued',len(paths),'illustrations')
