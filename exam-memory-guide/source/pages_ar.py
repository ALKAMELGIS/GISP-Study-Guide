import json,subprocess,re
F='GISP_Exam_Memory_Guide_AR.pdf'
toc=json.load(open('toc_ar.json'))
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',F],capture_output=True,text=True).stdout).group(1))
clean=lambda s:re.sub(r'[\u200e\u200f\u202a-\u202e\s]','',s)
txt=[clean(subprocess.run(['pdftotext','-f',str(i),'-l',str(i),F,'-'],capture_output=True,text=True).stdout) for i in range(1,n+1)]
out={}
for id,key in toc:
  for i in range(n):
    if re.search('§'+id+(r'(?![0-9])' if id.startswith('area') else ''),txt[i]) or re.search(r'(?<![a-z])'+id+'§',txt[i]): out[id]=i+1; break
json.dump(out,open('pages_ar.json','w')); print(n,out)
