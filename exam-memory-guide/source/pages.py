import json,subprocess,re
toc=json.load(open('toc.json'))
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo','GISP_Exam_Memory_Guide.pdf'],capture_output=True,text=True).stdout).group(1))
txt=[subprocess.run(['pdftotext','-f',str(i),'-l',str(i),'-layout','GISP_Exam_Memory_Guide.pdf','-'],capture_output=True,text=True).stdout for i in range(1,n+1)]
norm=lambda s:re.sub(r'\s+',' ',s)
ci=next(i for i,t in enumerate(txt) if 'Contents' in t and 'How to use this book' in norm(t))
out={}
for label,key in toc:
  for i in range(ci+1,n):
    if key in norm(txt[i]): out[label]=i+1
    if label in out: break
json.dump(out,open('pages.json','w'),indent=0); print(n,ci,out)
