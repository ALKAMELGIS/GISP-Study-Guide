/* ================= APP ================= */
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const KEY="gisp-library-v1";
let S={vol:"gisp",spread:{},bm:{},hl:{},les:{},qs:{},hist:[],wrong:[],flag:[],cards:{},aiQs:[],vols:[],examDate:"2026-12-02",sound:true,night:false,rm:false,lang:"en"};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s)S=Object.assign(S,s);}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}};
function toast(m){const d=document.createElement("div");d.textContent=m;$("#toast").appendChild(d);setTimeout(()=>d.remove(),2700);}
const isAR=()=>S.lang==="ar";
const AREA_T=n=>isAR()?AR_AREAS[n-1]:DATA.areas[n-1].title;
const tt=(en,ar)=>isAR()?ar:en;
const textSide=()=>isAR()&&S.vol==="gisp"?"right":"left";
function LZ(L){if(!isAR()||!AR_L[L.id])return L;const r=AR_L[L.id];return Object.assign({},L,{title:r.title,module:r.module,concept:r.concept,formula:L.formula.map((f,i)=>[f[0],r.fnotes[i]||f[1]]),vocab:r.vocab,predict:Object.assign({},L.predict,r.predict),check:L.check.map((c,i)=>Object.assign({},c,r.check[i]||{})),steps:r.steps});}
const IC={x:'<path d="M6 6l12 12M18 6L6 18"/>',play:'<path d="M7 4l13 8-13 8z"/>',pause:'<path d="M8 4v16M16 4v16"/>',speak:'<path d="M11 5L6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',spark:'<path d="M12 3l1.8 4.7L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/>',mark:'<path d="M6 3h12v18l-6-4-6 4z"/>',note:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',card:'<rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 2h12a2 2 0 0 1 2 2v12"/>',flag:'<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',right:'<path d="M5 12h14M12 5l7 7-7 7"/>',left:'<path d="M19 12H5M12 19l-7-7 7-7"/>',up:'<path d="M12 19V5M5 12l7-7 7 7"/>',trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>'};
const ic=(n)=>`<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- sound ---------- */
let AC=null;
/* Only the page turn makes a sound: a soft paper swish with faint fibre crackle and a gentle landing, synthesised fresh each time so no two turns sound identical. */
function sfx(kind){if(kind!=="flip"||!S.sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
  const sr=AC.sampleRate,dur=.78,n=Math.floor(sr*dur),b=AC.createBuffer(2,n,sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let p0=0,p1=0,p2=0,last=0;const pan=ch?1.08:.92;
    for(let i=0;i<n;i++){const t=i/sr,w=Math.random()*2-1;
      /* pinkish noise = paper air */
      p0=.99765*p0+w*.099;p1=.963*p1+w*.2965;p2=.57*p2+w*1.0526;let pink=(p0+p1+p2+w*.1848)*.11;
      /* swish envelope: lift, sweep (louder in the middle), settle */
      const sw=t<.06?t/.06:Math.exp(-Math.pow((t-.3)/.2,2))*.9+.25*Math.exp(-(t-.06)*6);
      let v=pink*sw*.55;
      /* fibre crackle: sparse tiny grains while the leaf bends */
      if(t>.05&&t<.5&&Math.random()<.0028)last=(Math.random()*.5+.2)*(Math.random()<.5?-1:1);
      v+=last;last*=.82;
      /* landing: soft low flap as the page settles */
      if(t>.56){const u=t-.56;v+=Math.sin(2*Math.PI*95*u)*Math.exp(-u*38)*.22+pink*Math.exp(-u*30)*.6;}
      d[i]=v*pan;}}
  const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=.94+Math.random()*.12;
  const hp=AC.createBiquadFilter();hp.type="highpass";hp.frequency.value=180;
  const lp=AC.createBiquadFilter();lp.type="lowpass";lp.frequency.value=5200;
  const g=AC.createGain();g.gain.value=.32;
  s.connect(hp).connect(lp).connect(g).connect(AC.destination);s.start();}catch(e){}}

/* ---------- question bank ---------- */
const isCalc=q=>/RMSE|Convert|height|errors are|NDVI|zone contains|decimal degrees/i.test(q);
function bank(){
  const out=[];
  DATA.questions.forEach((q,i)=>out.push({id:"f"+i,q:q[0],o:q[1],a:q[2],ex:q[3],area:q[4],diff:(q[2].length>1||isCalc(q[0]))?"advanced":"intermediate",src:`GISP · ${AREA_T(q[4])} practice set`}));
  LESSONS.forEach(L=>{[L.predict,...L.check].forEach((q,k)=>out.push({id:`l:${L.id}:${k}`,q:q.q,o:q.o,a:q.a,ex:q.ex,area:L.area,diff:isCalc(q.q)?"advanced":"intermediate",src:`Lesson · ${L.title}`}));});
  S.aiQs.forEach(q=>out.push(q));
  return out;
}
const ALLTERMS=[];DATA.areas.forEach(a=>a.terms.forEach(t=>ALLTERMS.push({t:t[0],m:t[1],a:a.n})));LESSONS.forEach(L=>L.vocab.forEach(([t,m])=>{if(!ALLTERMS.find(x=>x.t===t))ALLTERMS.push({t,m,a:L.area});}));
function termQ(x){const pool=ALLTERMS.filter(y=>y.a===x.a&&y.t!==x.t);const others=shuffle(pool.length>=3?pool:ALLTERMS.filter(y=>y.t!==x.t)).slice(0,3);const opts=shuffle([x,...others]);
  return{id:"k:"+x.t,q:`Which term matches this definition: “${x.m}”`,o:opts.map(y=>y.t),a:"ABCD"[opts.indexOf(x)],ex:`${x.t}: ${x.m}`,area:x.a,diff:"beginner",src:`GISP · ${AREA_T(x.a)} keyword list`};}
function numQ(){const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a,f2=x=>(+x).toFixed(2),t=r(0,3);let q;
  if(t===0){const D=r(10,80),M=r(1,59),Sx=[0,15,30,36,45][r(0,4)],c=(D+M/60+Sx/3600).toFixed(4);q={q:`Convert ${D}° ${M}′ ${Sx}″ to decimal degrees.`,c,d:[(D+M/100+Sx/10000).toFixed(4),(D+M/60).toFixed(4),(D+(M+Sx)/60).toFixed(4)],ex:`${D} + ${M}/60 + ${Sx}/3600 = ${c}`,area:1};}
  else if(t===1){const lon=r(-179,179),z=Math.floor((lon+180)/6)+1;q={q:`Which UTM zone contains longitude ${lon}°?`,c:"Zone "+z,d:["Zone "+(z===1?60:z-1),"Zone "+(z===60?1:z+1),"Zone "+(((z+29)%60)+1)],ex:`⌊(${lon} + 180) ÷ 6⌋ + 1 = ${z}`,area:1};}
  else if(t===2){const h=r(20,400),N=r(-60,40);q={q:`Ellipsoid height h = ${h} m and geoid separation N = ${N} m. What is the orthometric height H?`,c:(h-N)+" m",d:[(h+N)+" m",(N-h)+" m",h+" m"],ex:`H = h − N = ${h} − (${N}) = ${h-N} m`,area:1};}
  else{const e=Array.from({length:4},()=>r(0,6)),ss=e.reduce((s,x)=>s+x*x,0),c=f2(Math.sqrt(ss/4))+" m";q={q:`Check-point errors are ${e.join(", ")} m. What is the RMSE?`,c,d:[f2(e.reduce((s,x)=>s+x,0)/4)+" m",f2(ss/4)+" m",f2(Math.sqrt(ss))+" m"],ex:`√(${ss} ÷ 4) = ${c}`,area:2};}
  const opts=shuffle([q.c,...q.d.filter((v,i,a)=>v!==q.c&&a.indexOf(v)===i)]).slice(0,4);if(!opts.includes(q.c))opts[0]=q.c;
  return{id:"n:"+Math.random().toString(36).slice(2,8),q:q.q,o:opts,a:"ABCD"[opts.indexOf(q.c)],ex:q.ex,area:q.area,diff:"advanced",src:"GISP · formula sheet"};}
function buildSet({area=0,diff="mixed",n=20,mode="practice",fromIds=null}){
  const B=bank();let pool;
  if(fromIds){pool=fromIds.map(id=>B.find(q=>q.id===id)||(id.startsWith("k:")?termQ(ALLTERMS.find(x=>"k:"+x.t===id)||ALLTERMS[0]):null)).filter(Boolean);return shuffle(pool).slice(0,n);}
  const want=(q)=>(!area||q.area===area)&&(diff==="mixed"||q.diff===diff);
  if(mode==="mock"){const out=[];DATA.areas.forEach(a=>{const k=Math.round(a.w*n/100);let p=shuffle(B.filter(q=>q.area===a.n));const terms=shuffle(ALLTERMS.filter(x=>x.a===a.n)).map(termQ);p=p.concat(terms);if(a.n<=2)for(let i=0;i<3;i++){const nq=numQ();if(nq.area===a.n)p.push(nq);}out.push(...p.slice(0,k));});return shuffle(out).slice(0,n);}
  // weight toward weak questions
  let p=B.filter(want);if(diff==="beginner"||diff==="mixed")p=p.concat(shuffle(ALLTERMS.filter(x=>!area||x.a===area)).slice(0,diff==="beginner"?n:Math.ceil(n/4)).map(termQ));
  if(diff==="advanced"||diff==="mixed"){if(!area||area<=2)for(let i=0;i<(diff==="advanced"?Math.ceil(n/2):3);i++){const q=numQ();if(!area||q.area===area)p.push(q);}}
  const w=q=>{const s=S.qs[q.id]||{c:0,w:0};return Math.max(.3,1+2*s.w-.6*s.c+(s.c+s.w?0:.6));};
  const out=[];p=p.slice();while(out.length<n&&p.length){const t=p.reduce((s,q)=>s+w(q),0);let r=Math.random()*t,k=0;for(;k<p.length;k++){r-=w(p[k]);if(r<=0)break;}out.push(p.splice(Math.min(k,p.length-1),1)[0]);}
  return out;
}
function stat(q,ok){const s=S.qs[q.id]||{c:0,w:0,area:q.area};ok?s.c++:s.w++;s.area=q.area;s.last=Date.now();S.qs[q.id]=s;if(!ok){if(!S.wrong.includes(q.id))S.wrong.push(q.id);}else S.wrong=S.wrong.filter(x=>x!==q.id);}

/* ---------- spreads ---------- */
const VOL=()=>S.vol==="gisp"?null:S.vols.find(v=>v.id===S.vol);
let DOC=null; // loaded doc pages
function spreadCount(){return S.vol==="gisp"?1+LESSONS.length*3:Math.max(1,Math.ceil((DOC?DOC.pages.length:0)/2));}
function curSpread(){return Math.max(0,Math.min(spreadCount()-1,S.spread[S.vol]||0));}
function lessonAt(s){return s<1?null:{L:LESSONS[(s-1)/3|0],part:(s-1)%3,idx:(s-1)/3|0};}
function spec(s,side){
  if(S.vol!=="gisp"){const pi=s*2+(side==="right"?1:0),t=DOC&&DOC.pages[pi];return{run:[VOL()?VOL().title:"",`p. ${pi+1}`],body:t?[t.text.slice(0,900)]:[""],folio:String(pi+1)};}
  const rtl=isAR();
  if(s===0)return side==="left"?{rtl,run:[tt("GISP","كتاب GISP"),tt("Interactive edition","الطبعة التفاعلية")],kicker:tt("Study companion · 2026","رفيق الدراسة · 2026"),title:tt("GISP","كتاب GISP"),body:[tt("Fourteen illustrated lessons organised by the official GISCI Geospatial Core Technical Knowledge Exam® blueprint.","أربعة عشر درساً مصوّراً مرتّبة وفق المخطط الرسمي لاختبار GISCI للمعرفة التقنية الجيومكانية الأساسية.")],folio:"i"}:{rtl,run:[tt("Frontispiece","الصورة الافتتاحية"),""],figure:tt("Frontispiece — the graticule","الصورة الافتتاحية — الشبكة الجغرافية"),folio:"ii"};
  const {L:L0,part,idx}=lessonAt(s),L=LZ(L0),AR=tt("Area","المجال"),LS=tt("Lesson","الدرس");
  if(side==="right")return{rtl,run:[`${AR} ${L.area} · ${AREA_T(L.area)}`,`${LS} ${idx+1}`],figure:`${tt("Fig.","شكل")} ${idx+1} — ${L.title}`,folio:String(s*2+1)};
  if(part===0)return{rtl,run:[`${AR} ${L.area} · ${AREA_T(L.area)}`,L.module],kicker:`${LS} ${idx+1} · KSA ${L.ksa.join(" · ")}`,title:L.title,body:L.concept,folio:String(s*2)};
  if(part===1)return{rtl,run:[L.title,tt("Vocabulary & prediction","المصطلحات والتوقّع")],kicker:tt("Key vocabulary","المصطلحات الأساسية"),title:"",body:L.vocab.map(v=>v[0]+" — "+v[1]),folio:String(s*2)};
  return{rtl,run:[L.title,tt("Knowledge check","التحقق من الفهم")],kicker:tt("Knowledge check","التحقق من الفهم"),title:"",body:L.check.map(c=>c.q),folio:String(s*2)};
}
function pageSpec(s,side){return spec(s,S.vol==="gisp"?(side===textSide()?"left":"right"):side);}
function lessonState(L){return S.les[L.id]||(S.les[L.id]={pred:null,chk:{},demo:[],done:false});}
function checkDone(L){const st=lessonState(L);const ok=st.pred!=null&&L.check.every((_,i)=>st.chk[i]!=null)&&new Set(st.demo).size>=L.steps.length;if(ok&&!st.done){st.done=true;save();toast(tt("Lesson complete · ","اكتمل الدرس · ")+LZ(L).title);const x=G.leftObj.position.x+(textSide()==="left"?PW/2-.2:-(PW/2-.2)),z=PD/2-.24;G.stampPending=true;stamp3D(x,z,()=>{G.stampPending=false;const sEl=(G.compact?$("#rdHost"):G.leftEl).querySelector(".stamp");if(sEl)sEl.classList.add("on");burst(x,z,120);});}return st.done;}

function runHead(a,b){return `<div class="run"><span>${esc(a)}</span><span>${esc(b)}</span></div>`;}
function pageTools(side){return `<div class="tools"><button class="pbtn" data-act="listen" aria-label="${tt("Read this page aloud","اقرأ الصفحة بصوت عالٍ")}">${ic("speak")}</button><button class="pbtn" data-act="summary" aria-label="${tt("AI summary of this page","ملخّص ذكي لهذه الصفحة")}">${ic("spark")}</button></div>`;}
function leftHTML(s){
  if(S.vol!=="gisp"){const pi=s*2,t=DOC&&DOC.pages[pi];return pageTools()+runHead(VOL()?VOL().title:"Document",t?`source p. ${t.src}`:"")+`<div class="doctext">${t?esc(t.text):"<em>End of document.</em>"}</div><div class="folio">${pi+1}</div>`;}
  if(s===0&&isAR())return pageTools()+runHead("كتاب GISP","الطبعة التفاعلية")+`<div class="kicker">رفيق الدراسة · نوفمبر 2026</div><h1>كتاب GISP</h1>
   <p>أربعة عشر درساً مصوّراً لاختبار GISCI للمعرفة التقنية الجيومكانية الأساسية، مرتّبة وفق المخطط الرسمي لعام 2019 المعتمد لدورة ديسمبر 2026.</p>
   <p>يمتد كل درس على ثلاث صفحات مزدوجة: المفهوم ومعادلته، ثم المصطلحات مع توقّع تجيب عنه قبل مشاهدة المجسّم، ثم التحقق من الفهم. أكمل الثلاث وشاهد المجسّم المنبثق لتحصل على ختم الدرس.</p>
   <div class="formula"><div><code>← / →  تقليب الصفحات · Space  مشاهدة المجسّم</code><span>حدّد أي نص لتظليله أو إضافة ملاحظة أو سماعه أو سؤال المعلّم الذكي.</span></div></div>
   <p class="ksa">رسمي: المجالات المعرفية ورموز KSA من مخطط GISCI. تكميلي: نص الدروس والمجسّمات وكل أسئلة التدريب مادة دراسية كُتبت لهذا الكتاب، وليست أسئلة رسمية من GISCI. المصطلحات التقنية مكتوبة بالإنجليزية أيضاً لأن الاختبار باللغة الإنجليزية.</p><div class="folio">i</div>`;
  if(s===0)return pageTools()+runHead("GISP","Interactive edition")+`<div class="kicker">Study companion · November 2026</div><h1>GISP</h1>
   <p>Fourteen illustrated lessons for the GISCI Geospatial Core Technical Knowledge Exam®, arranged by the official 2019 exam blueprint used for the December 2026 sitting.</p>
   <p class="nodrop">Each lesson spans three spreads: the concept and its formula, the vocabulary with a prediction to make before you watch the figure, and a knowledge check. Finish all three and watch the pop-up figure to earn the lesson's stamp.</p>
   <div class="formula"><div><code>→ / ←  turn pages · Space  watch figure</code><span>Select any text to highlight it, add a note, hear it read or ask the AI tutor.</span></div></div>
   <p class="ksa nodrop">Official: the knowledge areas and KSA codes come from the GISCI blueprint. Supplementary: lesson text, figures and every practice question are study material written for this book. None are official GISCI exam items.</p><div class="folio">i</div>`;
  const {L:L0,part,idx}=lessonAt(s),st=lessonState(L0),L=LZ(L0),AR=tt("Area","المجال");
  if(part===0)return pageTools()+runHead(`${AR} ${L.area} · ${AREA_T(L.area)}`,L.module)+`<div class="kicker">${tt(`Lesson ${idx+1} of ${LESSONS.length}`,`الدرس ${idx+1} من ${LESSONS.length}`)}</div><h1>${esc(L.title)}</h1>${L.concept.map(p=>`<p>${esc(p)}</p>`).join("")}
   <div class="formula">${L.formula.map(([f,n])=>`<div><code>${esc(f)}</code><span>${esc(n)}</span></div>`).join("")}</div>
   <div class="ksa">${tt("Official blueprint KSAs: ","رموز KSA الرسمية: ")}${L.ksa.join(", ")} · ${tt("Lesson text: supplementary","نص الدرس: تكميلي")}</div><div class="folio">${s*2}</div>`;
  if(part===1){const p=L.predict,ans=st.pred;return pageTools()+runHead(L.title,tt("Vocabulary & prediction","المصطلحات والتوقّع"))+`<h2>${tt("Key vocabulary","المصطلحات الأساسية")}</h2><dl>${L.vocab.map(([t,d],vi)=>{const k=(FIGMAP[LESSONS[lessonAt(s).idx].id]||{}).v,st=k?k[vi]:null;return st!=null?`<dt><button class="vterm" data-vstep="${st}" title="${tt("Show on the figure","اعرضه على المجسّم")}">${esc(t)}<span aria-hidden="true">◈</span></button></dt><dd>${esc(d)}</dd>`:`<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`;}).join("")}</dl>
   <h2>${tt("Predict first","توقّع أولاً")}</h2><div class="q">${esc(p.q)}</div><div class="opts" data-q="pred">${p.o.map((o,j)=>{const l="ABCD"[j];const cls=ans?(l===p.a?"ok":(l===ans?"no":"")):"";return `<button class="opt ${cls}" data-l="${l}" ${ans?"disabled":""}><b>${l}</b><span>${esc(o)}</span></button>`;}).join("")}</div>
   <div class="flapwrap"><div class="under"><b>${tt("Answer","الإجابة")} ${p.a}.</b> ${esc(p.ex)}</div><button class="flap ${ans?"up":"locked"}" data-act="flap" aria-label="${ans?tt("Explanation revealed","ظهر الشرح"):tt("Answer the prediction to lift this flap","أجب عن التوقّع لرفع الطيّة")}" ${ans?"":"aria-disabled=\"true\""}>${tt("Lift the flap after you predict","ارفع الطيّة بعد أن تتوقّع")}</button></div><div class="folio">${s*2}</div>`;}
  const items=[[tt("Prediction answered","أُجيب عن التوقّع"),st.pred!=null],[tt(`Figure watched (${new Set(st.demo).size}/${L.steps.length} steps)`,`شوهد المجسّم (${new Set(st.demo).size}/${L.steps.length} خطوات)`),new Set(st.demo).size>=L.steps.length],[tt("Knowledge check answered","أُجيب عن التحقق من الفهم"),L.check.every((_,i)=>st.chk[i]!=null)]];
  return pageTools()+runHead(L.title,tt("Knowledge check","التحقق من الفهم"))+`<h2>${tt("Knowledge check","التحقق من الفهم")}</h2>${L.check.map((c,i)=>{const a=st.chk[i];return `<div class="q" style="font-size:17px">${i+1}. ${esc(c.q)}</div><div class="opts" data-q="chk${i}" style="margin-bottom:${a?6:12}px">${c.o.map((o,j)=>{const l="ABCD"[j],cls=a?(l===c.a?"ok":(l===a?"no":"")):"";return `<button class="opt ${cls}" data-l="${l}" ${a?"disabled":""}><b>${l}</b><span>${esc(o)}</span></button>`;}).join("")}</div>${a?`<div class="ai" style="margin:0 0 12px">${esc(c.ex)}</div>`:""}`;}).join("")}
   <ul class="checklist">${items.map(([t,ok])=>`<li class="${ok?"ok":""}"><i>${ok?"✓":""}</i>${esc(t)}</li>`).join("")}</ul>
   <div class="row" style="gap:6px"><button class="pbtn" data-act="practise">${tt("Practise","تدرّب على")} ${esc(AREA_T(L.area))}</button><button class="pbtn" data-act="aiq">${ic("spark")} ${tt("More questions","أسئلة إضافية")}</button></div>
   <div class="stamp ${st.done&&!G.stampPending?"on":""}" aria-hidden="${!st.done}"><div>${tt("Lesson","الدرس")}<b>${tt("Complete","مكتمل")}</b>${idx+1} / ${LESSONS.length}</div></div><div class="folio">${s*2}</div>`;
}
function rightHTML(s){const pi=s*2+1,t=DOC&&DOC.pages[pi];return pageTools()+runHead(VOL()?VOL().title:"",t?`source p. ${t.src}`:"")+`<div class="doctext">${t?esc(t.text):"<em>End of document.</em>"}</div><div class="folio">${pi+1}</div>`;}

/* ---------- render ---------- */
let busy=false;
function pageEls(){return G.compact?[$("#rdHost .page")].filter(Boolean):[G.leftEl,S.vol!=="gisp"?G.rightEl:null].filter(Boolean);}
function renderSpread(opts={}){
  const s=curSpread(),gisp=S.vol==="gisp",ts=textSide(),pdir=isAR()&&gisp?"rtl":"ltr";
  G.leftObj.position.x=ts==="left"?-PW/2-.004:PW/2+.004;G.demoRoot.position.x=ts==="left"?PW/2:-PW/2;
  G.leftEl.dir=pdir;G.leftEl.dataset.side=ts;G.rightEl.dataset.side="right";
  G.leftEl.innerHTML=leftHTML(s);G.leftEl.classList.toggle("scroll",!gisp);
  G.rightEl.innerHTML=gisp?"":rightHTML(s);G.rightObj.visible=!gisp&&!G.compact;G.leftObj.visible=!G.compact;G.rightEl.classList.toggle("scroll",!gisp);
  if(!opts.keepTex)staticTex(s);
  // compact reader shows left (and right for docs)
  if(G.compact){$("#rdHost").innerHTML=`<div class="page left" dir="${pdir}">${G.leftEl.innerHTML}</div>${gisp?"":`<div class="page right">${G.rightEl.innerHTML}</div>`}`;}
  const ls=gisp&&lessonAt(s);
  $("#hTitle").textContent=gisp?(s===0?tt("GISP","كتاب GISP"):LZ(ls.L).title):(VOL()?VOL().title:tt("Document","مستند"));
  $("#rdTitle").textContent=$("#hTitle").textContent;
  $("#hPage").textContent=gisp?(s===0?"Front matter":`Lesson ${ls.idx+1} · ${["Concept","Vocabulary & prediction","Knowledge check"][ls.part]}`):`pp. ${s*2+1}–${s*2+2} of ${DOC?DOC.pages.length:0}`;
  $("#hProg").style.width=(spreadCount()>1?s/(spreadCount()-1)*100:100)+"%";
  $("#hPrev").disabled=false;$("#hPrev").title=s===0?tt("Close the book","أغلق الكتاب"):tt("Previous page","الصفحة السابقة");$("#hNext").disabled=s>=spreadCount()-1;
  const bm=(S.bm[S.vol]||[]).includes(s);["#hMark","#mMark"].forEach(k=>{$(k).setAttribute("aria-pressed",bm);$(k).classList.toggle("on",bm);});
  $("#hPlay").disabled=!gisp;
  bindPages();applyHighlights();
  if(!opts.noDemo){if(gisp){const key=s===0?"hero":ls.L.demo;if(!G.demo||G.demo.key!==key||opts.reDemo)showDemo(key,0);}else clearDemo();}
  $("#volTitle").textContent=gisp?tt("GISP","كتاب GISP"):(VOL()?VOL().title:tt("Document","مستند"));$("#volSub").textContent=gisp?tt("Interactive edition","الطبعة التفاعلية"):tt("Your document","مستندك");
}
/* harmony between pages and figures: each page of a lesson sets the figure to the matching step,
   and vocabulary terms (◈) jump the figure to the step that shows them. p = [concept page, vocabulary page, check page] */
const FIGMAP={crs:{p:[0,3,3],v:[1,1,0,3,2]},proj:{p:[0,1,2],v:[2,3,1,2]},datum:{p:[0,3,1],v:[1,2,1,3]},topo:{p:[0,1,4],v:[4,0,2,3,null]},
  quality:{p:[0,1,3],v:[2,1,0,3,null]},carto:{p:[0,1,2],v:[1,2,3,2]},gnss:{p:[0,2,3],v:[2,3,3,3]},rs:{p:[0,2,3],v:[1,1,null,null]},
  raster:{p:[0,2,3],v:[1,0,3,null]},overlay:{p:[0,2,3],v:[1,3,3,4]},stats:{p:[0,2,1],v:[2,1,2,1]},gdb:{p:[0,2,0],v:[0,1,1,0,0]},
  arch:{p:[0,1,2],v:[0,1,2,2]},pm:{p:[0,1,2],v:[0,0,null,null]}};
function syncFigure(){if(S.vol!=="gisp"||!G.demo)return;const s=curSpread();if(G.figSyncAt!==s){const c=$("#caption");if(c&&!(typeof W!=="undefined"&&W.on))c.hidden=true;}if(s<1||G.figSyncAt===s)return;G.figSyncAt=s;const{L,part}=lessonAt(s),m=FIGMAP[L.id];if(!m)return;const k=Math.min(m.p[part],L.steps.length-1);
  if(G.demo.step!==k)setDemoStep(k);}
async function go(n,instant,drag){if(G.closed&&!G.webOn){await openBook();return;}if(!G.webOn&&n<0&&curSpread()===0){stopWatch();if(LS.on)stopListen();await closeBook();return;}if(G.webOn){const c=spreadCount();n=Math.max(0,Math.min(c-1,n));S.spread[S.vol]=n;save();const el=$("#w-"+n);if(el)el.scrollIntoView({behavior:RM()?"auto":"smooth",block:"start"});webTocMark(n);if(LS.on){LS.gen++;try{speechSynthesis.cancel();}catch(e){}clearReading();setTimeout(()=>{if(LS.on)startBlocks();},450);}return;}
  const cnt=spreadCount(),from=curSpread();n=Math.max(0,Math.min(cnt-1,n));if(n===from||busy)return;busy=true;stopWatch();if(LS.on){LS.gen++;try{speechSynthesis.cancel();}catch(e){}clearReading();}
  const dir=n>from?1:-1,gisp=S.vol==="gisp";
  const sameDemo=gisp&&n>0&&from>0&&lessonAt(n).L===lessonAt(from).L;
  pageEls().forEach(e=>e.style.opacity=0);
  if(!sameDemo)await sinkDemo();
  /* the same figure stays for the next page: fold it down while the leaf passes over it, then stand it back up */
  const fold=sameDemo&&!instant&&!RM()&&G.demo?G.demo.group:null;if(fold){gsap.killTweensOf(fold.scale);gsap.to(fold.scale,{x:.001,y:.001,z:.001,duration:.22,ease:"power2.in"});}
  const unfold=()=>{if(fold){gsap.killTweensOf(fold.scale);gsap.to(fold.scale,{x:1,y:1,z:1,duration:.5,ease:"back.out(1.6)"});}};
  if(instant||Math.abs(n-from)>1&&RM()){S.spread[S.vol]=n;save();renderSpread({reDemo:!sameDemo});pageEls().forEach(e=>e.style.opacity=1);busy=false;return;}
  const vd=(isAR()&&gisp)?-dir:dir,lift=vd>0?"right":"left",opp=vd>0?"left":"right";
  const front=pageSpec(from,lift),back=pageSpec(n,opp);
  setPageTex(lift,pageSpec(n,lift));setPageTex(opp,pageSpec(from,opp));
  if(gisp&&!sameDemo)clearDemo();
  const done=await turnPage(vd,front,back,()=>{},drag&&!RM()?drag:null);
  unfold();
  if(done===false){/* the reader let go early: the page falls back, nothing changes */
    setPageTex(lift,pageSpec(from,lift));setPageTex(opp,pageSpec(from,opp));renderSpread({reDemo:!sameDemo});pageEls().forEach(e=>e.style.opacity=1);busy=false;return;}
  S.spread[S.vol]=n;save();renderSpread({noDemo:sameDemo,reDemo:!sameDemo});
  pageEls().forEach(e=>{e.style.transition="opacity .35s";e.style.opacity=1;});
  busy=false;
}
function staticTex(s){const gisp=S.vol==="gisp",ts=textSide();["left","right"].forEach(side=>{const blank=!G.compact&&(side===ts||!gisp);setPageTex(side,blank?{}:pageSpec(s,side));});}
function bindPages(){
  const hosts=[G.leftEl,G.rightEl,$("#rdHost")];
  hosts.forEach(h=>{if(!h||h._b)return;h._b=1;h.addEventListener("click",onPageClick);});
}
/* which outer page edge (if any) is under the pointer, in book coordinates — the outer ~22% of each page turns it */
function edgeAt(e){if(G.closed||G.webOn||G.compact||!G.r)return null;const rc=G.r.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera({x:(e.clientX-rc.left)/rc.width*2-1,y:-(e.clientY-rc.top)/rc.height*2+1},G.cam);
  const p=new THREE.Vector3();if(!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-PAGE_Y),p))return null;
  const ax=Math.abs(p.x);if(Math.abs(p.z)>PD/2+.04||ax>PW+.08||ax<PW*.78)return null;
  if(ax<PW*.86&&G.demo&&ray.intersectObject(G.demo.group,true).length)return null;return p.x>0?"right":"left";}
function fwdFor(side){const rev=isAR()&&S.vol==="gisp";return side==="right"?(rev?-1:1):(rev?1:-1);}
function onPageClick(e){const vt=e.target.closest(".vterm");if(vt){const k=+vt.dataset.vstep;if(G.demo){setDemoStep(k);try{captionStep(k);}catch(_){}}$$(".vterm.on").forEach(x=>x.classList.remove("on"));vt.classList.add("on");return;}
  const b=e.target.closest("button");
  if(!b){if(performance.now()-(G.dragTurnAt||0)<400)return;if(G.webOn||G.compact||getSelection().toString()||e.target.closest("a,input,textarea,mark,.opt,.flap,summary,label"))return;const h=edgeAt(e);if(h)go(curSpread()+fwdFor(h));return;}
  const s=curSpread();
  const act=b.dataset.act;
  if(act==="listen"){speak(pageText());return;}
  if(act==="summary"){openDrawer("tutor");tutorAsk("Summarise this page in 4 short bullet points for a GISP candidate. Plain text, under 90 words.",true);return;}
  if(act==="flap"){const L=lessonAt(s).L;if(lessonState(L).pred==null){toast("Make your prediction first");return;}b.classList.toggle("up");return;}
  if(act==="practise"){openExam({area:lessonAt(s).L.area});return;}
  if(act==="aiq"){aiLessonQuestions(lessonAt(s).L);return;}
  const box=b.closest("[data-q]");if(box&&b.classList.contains("opt")){const {L}=lessonAt(s),st=lessonState(L),l=b.dataset.l,k=box.dataset.q;
    if(k==="pred"){st.pred=l;stat({id:`l:${L.id}:0`,area:L.area},l===L.predict.a);}
    else{const i=+k.slice(3);st.chk[i]=l;stat({id:`l:${L.id}:${i+1}`,area:L.area},l===L.check[i].a);}
    const right=k==="pred"?l===L.predict.a:l===L.check[+k.slice(3)].a;save();sfx("tap");
    if(right){const x=G.leftObj.position.x,z=k==="pred"?.18:.0;burst(x,z,46);toast(tt("Correct!","صحيح!"));}
    checkDone(L);renderSpread({keepTex:true,noDemo:true});
    if(k==="pred")setTimeout(()=>{const f=(G.compact?$("#rdHost"):G.leftEl).querySelector(".flap");if(f)f.classList.add("up");},250);}
}
function pageText(){const h=G.compact?$("#rdHost"):G.leftEl;const c=h.cloneNode(true);$$("button,.tools,.folio,.run",c).forEach(x=>x.remove());let t=c.textContent;if(S.vol!=="gisp"&&!G.compact)t+=" "+G.rightEl.textContent;return t.replace(/\s+/g," ").trim();}

/* ---------- layout ---------- */
/* phones and tablets: the step caption and the read-aloud bar live inside the reading panel, never over the book */
function dockBars(){const rd=document.getElementById("reader"),grab=rd&&rd.querySelector(".grab");if(!rd||!grab)return;const inPanel=document.body.classList.contains("compact");
  ["listenBar","caption"].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(inPanel){if(el.parentElement!==rd)grab.after(el);}else if(el.parentElement!==document.body)document.body.appendChild(el);});}
function placeChrome(){const R=document.documentElement,tb=document.querySelector("#topbar .tools"),hud=document.getElementById("hud");if(!tb||!hud)return;
  R.style.setProperty("--hudW",Math.round(hud.getBoundingClientRect().width)+"px");R.style.setProperty("--topH",Math.round(tb.getBoundingClientRect().bottom)+"px");requestAnimationFrame(()=>{R.style.setProperty("--hudW",Math.round(hud.getBoundingClientRect().width)+"px");R.style.setProperty("--hudB",Math.round(Math.max(hud.getBoundingClientRect().bottom,tb.getBoundingClientRect().bottom))+"px");});}
addEventListener("resize",()=>{placeChrome();});
function layoutMode(){const compact=innerWidth<900||innerHeight<520;if(compact===G.compact&&G.leftEl&&G._laid)return;G._laid=1;G.compact=compact;document.body.classList.toggle("compact",compact);placeChrome();dockBars();
  $("#reader").hidden=!compact;if(G.leftObj){G.leftObj.visible=!compact;G.rightObj.visible=!compact&&S.vol!=="gisp";}
  if(G.leftEl){renderSpread({keepTex:true,noDemo:true});staticTex(curSpread());}if(G.cam)resetView(true);}

/* ---------- watch demo ---------- */
let W={on:false,t:null};
function captionStep(i){if(!G.demo)return;const s=curSpread(),L=s>0?lessonAt(s).L:null;if(!L)return;const st=LZ(L).steps[i];$("#caption").hidden=false;$("#capN").textContent=`STEP ${i+1} / ${L.steps.length}`;$("#capT").textContent=st[0];$("#capD").textContent=st[1];
  const ls=lessonState(L);if(!ls.demo.includes(i)){ls.demo.push(i);save();}checkDone(L);}
function watch(){const s=curSpread();if(S.vol!=="gisp"||s===0){toast(s===0?"Turn to a lesson to watch its figure":"Figures are in the GISP book");return;}
  if(W.on){stopWatch();return;}W.on=true;$("#hPlay").innerHTML=ic("pause");$("#hPlay").setAttribute("aria-label","Pause demo");flyTo(viewFor("demo"));
  const L=lessonAt(s).L;let i=0;const stepf=()=>{if(!W.on)return;setDemoStep(i);captionStep(i);i++;if(i<L.steps.length)W.t=setTimeout(stepf,RM()?3200:4600);else W.t=setTimeout(()=>{stopWatch();renderSpread({keepTex:true,noDemo:true});},4800);};stepf();}
function stopWatch(){if(!W.on)return;W.on=false;clearTimeout(W.t);$("#hPlay").innerHTML=ic("play");$("#hPlay").setAttribute("aria-label","Watch demo");$("#caption").hidden=true;resetView();}

/* ---------- speech ---------- */
/* ---------- read-aloud: speaks the page block by block, marks what is being read, turns pages by itself ---------- */
const LS={on:false,paused:false,blocks:[],i:0,gen:0,turning:false};
function pickVoice(lang){const vs=speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith(lang));
  const score=v=>(/natural|neural|premium|enhanced|online/i.test(v.name)?4:0)+(/google|microsoft|samantha|daniel|maged|tarik|laila|hamed|zariyah/i.test(v.name)?2:0)+(v.localService?0:1);
  return vs.sort((a,b)=>score(b)-score(a))[0]||null;}
function readHosts(){if(G.webOn)return[$("#w-"+curSpread())];if(G.compact)return[$("#rdHost")];return S.vol==="gisp"?[G.leftEl]:[G.leftEl,G.rightEl];}
function collectBlocks(){const out=[];readHosts().forEach(h=>{if(!h)return;h.querySelectorAll("h1,h2,h3,p,li,dt,dd,.q,.formula,.opt,blockquote").forEach(el=>{if(el.closest(".folio,.run,.tools,.stamp,.kicker,[hidden]"))return;const par=el.parentElement&&el.parentElement.closest("h1,h2,h3,p,li,dt,dd,.q,.formula,.opt,blockquote");if(par&&h.contains(par))return;
  if(el.offsetParent===null&&!G.compact)return;const t=el.textContent.replace(/\s+/g," ").trim();if(t.length>1)out.push({el,t});});});return out;}
function clearReading(){$$(".page .reading").forEach(e=>e.classList.remove("reading"));}
function lbUpdate(){const bar=$("#listenBar");bar.hidden=!LS.on;bar.classList.toggle("paused",LS.paused);$("#lbPause").textContent=LS.paused?"▶":"❚❚";$("#lbPause").setAttribute("aria-label",LS.paused?tt("Resume","متابعة"):tt("Pause","إيقاف مؤقت"));
  const r=(S.rate||1);$("#lbRate").textContent=r+"×";const mv=$("#mRateV");if(mv)mv.textContent=r+"×";$("#lbTxt").textContent=LS.paused?tt("Paused","متوقف مؤقتاً"):tt("Reading aloud","القراءة بصوت");
  $("#hListen").classList.toggle("on",LS.on);$("#hListen").setAttribute("aria-pressed",LS.on);}
function speakBlock(){const g=LS.gen;if(!LS.on||LS.paused)return;
  if(LS.i>=LS.blocks.length){clearReading();const n=curSpread()+1;if(n<spreadCount()){if(G.webOn){go(n);return;}LS.turning=true;go(n);setTimeout(()=>{if(g!==LS.gen)return;const wait=()=>{if(g!==LS.gen)return;if(busy)return setTimeout(wait,150);LS.turning=false;startBlocks();};wait();},250);}else{stopListen();toast(tt("End of the book","نهاية الكتاب"));}return;}
  const b=LS.blocks[LS.i];clearReading();b.el.classList.add("reading");
  if(G.compact||G.webOn)b.el.scrollIntoView({block:"center",behavior:RM()?"auto":"smooth"});
  const u=new SpeechSynthesisUtterance(b.t);const ar=/[؀-ۿ]/.test(b.t);u.lang=ar?"ar-SA":"en-US";const v=pickVoice(ar?"ar":"en");if(v)u.voice=v;u.rate=S.rate||1;u.pitch=1;
  u.onend=()=>{if(g!==LS.gen||LS.paused)return;LS.i++;setTimeout(speakBlock,ar?260:200);};
  u.onerror=e=>{if(g!==LS.gen)return;if(e.error==="interrupted"||e.error==="canceled")return;LS.i++;setTimeout(speakBlock,200);};
  speechSynthesis.speak(u);}
function startBlocks(){LS.gen++;LS.blocks=collectBlocks();LS.i=0;try{speechSynthesis.cancel();}catch(e){}setTimeout(speakBlock,120);}
function startListen(){if(G.closed&&!G.webOn){openBook().then(()=>setTimeout(startListen,300));return;}if(!("speechSynthesis" in window)){toast(tt("Read aloud is not available in this browser","القراءة بصوت غير متاحة في هذا المتصفح"));return;}
  stopWatch();LS.on=true;LS.paused=false;lbUpdate();startBlocks();}
function stopListen(){LS.on=false;LS.paused=false;LS.gen++;try{speechSynthesis.cancel();}catch(e){}clearReading();lbUpdate();}
function pauseListen(){if(!LS.on)return;LS.paused=!LS.paused;LS.gen++;if(LS.paused){try{speechSynthesis.cancel();}catch(e){}}else{const g=LS.gen;setTimeout(()=>{if(g===LS.gen)speakBlock();},80);}lbUpdate();}
function cycleRate(){const R=[.8,.9,1,1.1,1.25];S.rate=R[(R.indexOf(S.rate||1)+1)%R.length];save();lbUpdate();if(LS.on&&!LS.paused){LS.gen++;try{speechSynthesis.cancel();}catch(e){}const g=LS.gen;setTimeout(()=>{if(g===LS.gen)speakBlock();},80);}toast(tt("Reading speed ","سرعة القراءة ")+S.rate+"×");}
/* Chrome stops long speech after ~15 s unless nudged */
setInterval(()=>{try{if(LS.on&&!LS.paused&&speechSynthesis.speaking){speechSynthesis.pause();speechSynthesis.resume();}}catch(e){}},12000);
try{speechSynthesis.onvoiceschanged=()=>{};speechSynthesis.getVoices();}catch(e){}
function speak(t){startListen();}
function stopSpeak(){stopListen();}

/* ---------- highlights & notes ---------- */
const hkey=()=>`${S.vol}:${curSpread()}`;
function applyHighlights(){const list=S.hl[hkey()]||[];const hosts=G.compact?[$("#rdHost")]:[G.leftEl,G.rightEl];
  hosts.forEach(h=>{if(!h)return;list.forEach(hl=>{const w=document.createTreeWalker(h,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement.closest("mark,button,.run,.folio"))continue;const i=n.textContent.indexOf(hl.t);if(i>=0){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+hl.t.length);const m=document.createElement("mark");if(hl.c)m.className=hl.c;if(hl.note)m.dataset.note=hl.note,m.title="Note: "+hl.note;try{r.surroundContents(m);}catch(e){}break;}}});});}
let SEL=null;
function onSel(){const s=getSelection();if(!s||s.isCollapsed||!s.rangeCount){hideSelTb();return;}const r=s.getRangeAt(0),pg=r.commonAncestorContainer.parentElement&&r.commonAncestorContainer.parentElement.closest(".page");if(!pg){hideSelTb();return;}
  const t=s.toString().trim();if(t.length<2){hideSelTb();return;}SEL={t,single:r.startContainer===r.endContainer};const rc=r.getBoundingClientRect();const tb=$("#seltb");
  tb.innerHTML=`<button class="tb" data-c="" aria-label="Yellow highlight"><span class="sw" style="background:var(--mark)"></span></button><button class="tb" data-c="g" aria-label="Green highlight"><span class="sw" style="background:var(--mark2)"></span></button><button class="tb" data-c="b" aria-label="Blue highlight"><span class="sw" style="background:var(--mark3)"></span></button><button class="tb" data-s="note" aria-label="Add a note">${ic("note")}</button><button class="tb" data-s="speak" aria-label="Read selection aloud">${ic("speak")}</button><button class="tb" data-s="explain" aria-label="Explain with AI">${ic("spark")}</button><button class="tb" data-s="card" aria-label="Make a flashcard">${ic("card")}</button>`;
  tb.hidden=false;tb.style.left=Math.max(170,Math.min(innerWidth-170,rc.left+rc.width/2))+"px";tb.style.top=Math.max(70,rc.top-10)+"px";}
function hideSelTb(){if(document.activeElement&&$("#seltb").contains(document.activeElement))return;$("#seltb").hidden=true;}
function addHL(c,note){if(!SEL)return;if(!SEL.single){toast("Select text within one paragraph to highlight it");return;}const k=hkey();(S.hl[k]=S.hl[k]||[]).push({t:SEL.t,c,note:note||"",at:Date.now(),title:$("#hTitle").textContent});save();getSelection().removeAllRanges();$("#seltb").hidden=true;renderSpread({keepTex:true,noDemo:true});toast(note?"Note saved":"Highlighted");}
function selAction(e){const b=e.target.closest("button");if(!b||!SEL)return;
  if(b.dataset.c!=null){addHL(b.dataset.c);return;}
  const a=b.dataset.s;
  if(a==="note"){const tb=$("#seltb");tb.innerHTML=`<input id="noteIn" aria-label="Note text" placeholder="Your note…" style="min-height:38px;border:1px solid var(--line2);border-radius:6px;padding:6px 10px;width:220px;font:inherit;background:var(--bg);color:var(--ink)"><button class="tb" id="noteOk">Save</button>`;$("#noteIn").focus();const go=()=>addHL("",$("#noteIn").value.trim()||"(no text)");$("#noteOk").onclick=go;$("#noteIn").onkeydown=ev=>{if(ev.key==="Enter")go();};return;}
  if(a==="speak"){speak(SEL.t);return;}
  if(a==="explain"){openDrawer("tutor");tutorAsk(`Explain “${SEL.t.slice(0,300)}” in the context of this page, for a GISP exam candidate. 3–5 sentences, plain text.`,true);$("#seltb").hidden=true;return;}
  if(a==="card"){const id="u:"+Date.now();S.cards[id]={box:1,due:0,front:SEL.t.slice(0,120),back:`From “${$("#hTitle").textContent}”. ${pageText().slice(0,0)}`,user:true};save();toast("Flashcard added to My cards");$("#seltb").hidden=true;}
}

/* ---------- AI (Claude via sample capability) ---------- */
let SAMPLE=null,AI_OK=null;
(async()=>{try{if(window.claude&&claude.use){SAMPLE=await claude.use("sample");}}catch(e){SAMPLE=null;}AI_OK=!!SAMPLE;$$('[data-open="tutor"]').forEach(b=>b.title=AI_OK?"AI tutor":"AI tutor (available inside Claude)");})();
const AIERR={not_granted:"AI is turned off for this page. You can allow it from the artifact's permissions.",sampling_disabled:"Claude isn't available for this account.",rate_limited:"Too many AI requests right now. Try again in a minute.",session_expired:"Please sign in to Claude again.",refused:"Claude declined that request. Try rephrasing it.",invalid_json:"The AI answer couldn't be read as questions. Try again.",prompt_too_large:"That's too much text at once. Choose fewer pages."};
const aiMsg=e=>AIERR[e&&e.code]||"The AI request didn't finish. Try again.";
function aiUnavailable(){return "AI features run on your Claude account and are available when this page is opened inside Claude.";}
let tutorTurns=[],tutorCtl=null;
function tutorAsk(text,withPage){if(!SAMPLE){toast(aiUnavailable());renderTutor();return;}
  const ctx=`You are a concise GISP exam tutor inside an interactive textbook. Use the page text below as your main source; say so if something is not in it. Never claim a question is an official GISCI exam item.\n\nCURRENT PAGE (${$("#hTitle").textContent}):\n${pageText().slice(0,6000)}`;
  tutorTurns.push({role:"user",content:text});renderTutor(true);
  tutorCtl=new AbortController();const box=$("#aiLive");
  SAMPLE([{role:"user",content:ctx},{role:"assistant",content:"Understood. Ask me about this page."},...tutorTurns.slice(-8)],{cache:false,signal:tutorCtl.signal,onText:({text})=>{if(box)box.textContent=text;}}).then(r=>{tutorTurns.push({role:"assistant",content:r.text});renderTutor();}).catch(e=>{if(e.code!=="cancelled"){tutorTurns.push({role:"assistant",content:(e.text?e.text+"\n\n":"")+"⚠ "+aiMsg(e)});}tutorTurns.length&&tutorTurns[tutorTurns.length-1].role==="user"&&tutorTurns.pop();renderTutor();});
}
async function aiLessonQuestions(L){if(!SAMPLE){toast(aiUnavailable());return;}toast("Asking Claude for 5 new questions…");
  const text=[L.title,...L.concept,...L.formula.map(f=>f.join(": ")),...L.vocab.map(v=>v.join(": "))].join("\n");
  try{const arr=await SAMPLE.json(`Write 5 NEW multiple-choice practice questions for a GISP exam candidate, based ONLY on this lesson text. Mix difficulty. Reply with only a JSON array of objects {"q": string, "options": [4 strings], "answer": "A"|"B"|"C"|"D", "explanation": string (1-2 sentences), "difficulty": "beginner"|"intermediate"|"advanced", "quote": a verbatim phrase of at most 15 words from the text that supports the answer}.\n\nLESSON TEXT:\n${text}`,{modelTier:"default"});
    const ok=addAiQs(arr,{area:L.area,src:`AI-generated from lesson “${L.title}”`});toast(`${ok} AI questions added to the Exam centre`);}catch(e){toast(aiMsg(e));}}
function addAiQs(arr,meta){let n=0;(Array.isArray(arr)?arr:[]).forEach(q=>{if(!q||!q.q||!Array.isArray(q.options)||q.options.length!==4||!/^[ABCD]$/.test(q.answer))return;S.aiQs.push({id:"ai:"+Date.now().toString(36)+n,q:String(q.q),o:q.options.map(String),a:q.answer,ex:String(q.explanation||""),area:meta.area||0,diff:["beginner","intermediate","advanced"].includes(q.difficulty)?q.difficulty:"intermediate",src:meta.src+(q.quote?` · “${String(q.quote).slice(0,120)}”`:""),ai:true,vol:meta.vol||"gisp"});n++;});save();return n;}

/* ---------- drawer ---------- */
let DRAWER=null;
function openDrawer(k){DRAWER=k;$("#drawer").hidden=false;$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.toggle("on",b.dataset.open===k));const R={toc:renderToc,notes:renderNotes,tutor:renderTutor,progress:renderProgress};(R[k]||renderToc)();}
function closeDrawer(){DRAWER=null;$("#drawer").hidden=true;$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.remove("on"));}
function renderToc(){$("#dwT").textContent="Contents";const s=curSpread();let h="";
  if(S.vol==="gisp"){h+=`<button class="btn sm" data-go="0" style="justify-content:flex-start">Front matter</button>`;let la=0;LESSONS.forEach((L,i)=>{if(L.area!==la){la=L.area;h+=`<span class="label" style="margin-top:6px">${tt("Area","المجال")} ${L.area} · ${esc(AREA_T(L.area))}</span>`;}const st=lessonState(L),base=1+i*3;h+=`<div class="card2" style="padding:10px 12px;gap:6px${s>=base&&s<base+3?";border-color:var(--ink)":""}"><div class="row" style="justify-content:space-between"><b style="font-family:var(--display);font-size:18px;color:var(--ink)">${i+1}. ${esc(LZ(L).title)}</b>${st.done?'<span class="chip" style="color:var(--good);border-color:var(--good)">✓ stamped</span>':""}</div><div class="row" style="gap:6px">${["Concept","Predict","Check"].map((p,k)=>`<button class="btn sm" data-go="${base+k}">${p}</button>`).join("")}</div></div>`;});}
  else{for(let i=0;i<spreadCount();i++)h+=`<button class="btn sm" data-go="${i}" style="justify-content:flex-start">pp. ${i*2+1}–${i*2+2}</button>`;}
  const bm=S.bm[S.vol]||[];h=`<span class="label">Bookmarks</span>${bm.length?bm.map(b=>`<button class="btn sm gold" data-go="${b}" style="justify-content:flex-start">${ic("mark")} ${S.vol==="gisp"?(b?esc(LZ(lessonAt(b).L).title)+" · "+(isAR()?["المفهوم","التوقّع","التحقق"]:["concept","predict","check"])[lessonAt(b).part]:tt("Front matter","المقدّمة")):"pp. "+(b*2+1)}</button>`).join(""):'<p class="muted">No bookmarks yet. Use the ribbon button in the bottom bar.</p>'}<span class="label" style="margin-top:8px">Chapters</span>`+h;
  $("#dwB").innerHTML=h;$$("[data-go]",$("#dwB")).forEach(b=>b.onclick=()=>{const n=+b.dataset.go;if(innerWidth<900)closeDrawer();go(n,Math.abs(n-curSpread())>1);});}
function renderNotes(){$("#dwT").textContent="Notes & highlights";const all=[];Object.entries(S.hl).forEach(([k,l])=>l.forEach((h,i)=>all.push({k,i,...h})));
  $("#dwB").innerHTML=all.length?`<div class="row"><button class="btn sm" id="cpN">${ic("copy")} Copy all notes</button></div>`+all.sort((a,b)=>b.at-a.at).map(n=>`<div class="note"><span class="label">${esc(n.title||"")}</span><q><mark class="${n.c}">${esc(n.t)}</mark></q>${n.note?`<div>${esc(n.note)}</div>`:""}<div class="row"><button class="btn sm" data-k="${n.k}">Open page</button><button class="btn sm" data-del="${n.k}|${n.i}" aria-label="Delete highlight">${ic("trash")}</button></div></div>`).join(""):`<p class="muted">Select any text on a page to highlight it, attach a note, hear it read, or turn it into a flashcard.</p>`;
  $$("[data-k]",$("#dwB")).forEach(b=>b.onclick=()=>{const [v,s]=b.dataset.k.split(":");if(v!==S.vol)openVolume(v,+s);else go(+s,true);});
  $$("[data-del]",$("#dwB")).forEach(b=>b.onclick=()=>{const [k,i]=b.dataset.del.split("|");S.hl[k].splice(+i,1);save();renderNotes();renderSpread({keepTex:true,noDemo:true});});
  const cp=$("#cpN");if(cp)cp.onclick=()=>{const t=all.map(n=>`• ${n.title}: "${n.t}"${n.note?" — "+n.note:""}`).join("\n");navigator.clipboard.writeText(t).then(()=>toast("Notes copied")).catch(()=>toast("Copy isn't available here"));};}
function renderTutor(pending){$("#dwT").textContent="AI tutor";
  if(!SAMPLE){$("#dwB").innerHTML=`<p>${aiUnavailable()}</p><p class="muted">Everything else in the book works without it.</p>`;return;}
  $("#dwB").innerHTML=`<p class="muted small">Answers come from Claude using the page you are reading. AI can be wrong: check against the lesson text.</p>
  <div class="row" style="gap:6px"><button class="btn sm" data-p="Summarise this page in 4 short bullet points for a GISP candidate.">Summarise page</button><button class="btn sm" data-p="Explain the formula on this page step by step with a worked example.">Explain the formula</button><button class="btn sm" data-p="Ask me one tough multiple-choice question about this page. Do not reveal the answer until I reply.">Quiz me</button></div>
  <div class="chat">${tutorTurns.map(t=>`<div class="msg ${t.role==="user"?"me":"ai"}">${esc(t.content)}</div>`).join("")}${pending?`<div class="msg ai" id="aiLive">Thinking…</div>`:""}</div>
  <div class="row" style="margin-top:auto">${pending?`<button class="btn" id="aiStop">Stop</button>`:""}<input id="aiIn" aria-label="Ask the tutor" placeholder="Ask about this page…" style="flex:1;min-width:0;min-height:42px;border:1px solid var(--line2);border-radius:6px;padding:8px 10px;font:inherit;background:var(--bg);color:var(--ink)"><button class="btn primary" id="aiGo">Ask</button></div>`;
  $$("[data-p]",$("#dwB")).forEach(b=>b.onclick=()=>tutorAsk(b.dataset.p));const send=()=>{const v=$("#aiIn").value.trim();if(v)tutorAsk(v);};$("#aiGo").onclick=send;$("#aiIn").onkeydown=e=>{if(e.key==="Enter")send();};const st=$("#aiStop");if(st)st.onclick=()=>tutorCtl&&tutorCtl.abort();
  const b=$("#dwB");b.scrollTop=b.scrollHeight;}
function weakAreas(){return DATA.areas.map(a=>{const s=Object.values(S.qs).filter(q=>q.area===a.n),c=s.reduce((x,q)=>x+q.c,0),w=s.reduce((x,q)=>x+q.w,0),acc=c+w?c/(c+w):null,les=LESSONS.filter(L=>L.area===a.n),done=les.filter(L=>lessonState(L).done).length;return{a,acc,n:c+w,done,les:les.length,score:(acc==null?.5:1-acc)*a.w+(les.length-done)*2};}).sort((x,y)=>y.score-x.score);}
function renderProgress(){$("#dwT").textContent="Progress & plan";const done=LESSONS.filter(L=>lessonState(L).done).length;let days=0;try{days=Math.max(0,Math.ceil((new Date(S.examDate+"T09:00:00")-new Date())/864e5));}catch(e){}
  const weeks=Math.max(1,Math.min(6,Math.ceil(days/7))),W=weakAreas();const plan=[];for(let w=0;w<weeks;w++)plan.push([]);W.forEach((x,i)=>plan[i%weeks].push(x));
  $("#dwB").innerHTML=`<div class="row" style="justify-content:space-between"><div><div class="big">${done}<span class="muted" style="font-size:22px">/${LESSONS.length}</span></div><span class="label">lessons stamped</span></div><div><div class="big">${days}</div><span class="label">days to exam</span></div></div>
   <label class="field">Exam date<input type="date" id="exD" value="${S.examDate}"></label>
   <span class="label">Stamps</span><div class="row" style="gap:6px">${LESSONS.map((L,i)=>`<button class="btn sm ${lessonState(L).done?"gold":""}" data-go="${1+i*3}" title="${esc(L.title)}" aria-label="Lesson ${i+1}: ${esc(L.title)}${lessonState(L).done?" (complete)":""}">${i+1}</button>`).join("")}</div>
   <span class="label">Revision plan · weakest areas first</span>${plan.map((p,w)=>`<div class="card2" style="padding:12px"><b style="font-family:var(--display);font-size:18px;color:var(--ink)">Week ${w+1}</b>${p.map(x=>`<div class="small">${esc(x.a.title)} <span class="muted">· ${x.acc==null?"not practised":Math.round(x.acc*100)+"% correct"} · ${x.done}/${x.les} lessons</span></div>`).join("")}</div>`).join("")}
   <div class="row"><button class="btn" id="pExam">Open exam analytics</button>${SAMPLE?`<button class="btn gold" id="pAI">${ic("spark")} Personalise with AI</button>`:""}</div><div id="pOut"></div>`;
  $("#exD").onchange=e=>{S.examDate=e.target.value;save();renderProgress();};$$("[data-go]",$("#dwB")).forEach(b=>b.onclick=()=>{switchVol("gisp",+b.dataset.go);});$("#pExam").onclick=()=>openExam({tab:"analytics"});
  const pa=$("#pAI");if(pa)pa.onclick=()=>{const o=$("#pOut");o.className="msg ai";o.textContent="Thinking…";SAMPLE(`Create a concise week-by-week GISP exam revision plan (plain text, under 180 words). Exam in ${days} days. Performance by knowledge area (accuracy, lessons done): ${W.map(x=>`${x.a.title} ${x.acc==null?"n/a":Math.round(x.acc*100)+"%"} ${x.done}/${x.les}`).join("; ")}. Blueprint weights: ${DATA.areas.map(a=>a.title+" "+a.w+"%").join(", ")}. Prioritise weak, heavily weighted areas.`,{onText:({text})=>{o.textContent=text;}}).catch(e=>{o.textContent=aiMsg(e);});};}

/* ---------- sheet: exam centre ---------- */
let EXAM=null,examTab="start",examTick=null;
function openSheet(title,body){$("#sheet").hidden=false;$("#shT").textContent=title;$("#shA").innerHTML="";$("#shB").innerHTML=body||"";}
function closeSheet(){$("#sheet").hidden=true;clearInterval(examTick);$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.remove("on"));}
function openExam(o={}){$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.toggle("on",b.dataset.open==="exam"));if(EXAM&&!EXAM.done&&!o.tab&&!o.area){openSheet("Exam centre");runExam();return;}examTab=o.tab||"start";openSheet("Exam centre");renderExamHome(o.area||0);}
function renderExamHome(area){clearInterval(examTick);const tabs=[["start","Practise"],["mock","Mock exams"],["analytics","Analytics"],["review","Mistakes & flags"],["ai","AI questions"]];
  $("#shB").innerHTML=`<div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" data-t="${k}" class="${examTab===k?"on":""}" aria-selected="${examTab===k}">${l}</button>`).join("")}</div><div id="exBody" style="display:flex;flex-direction:column;gap:18px"></div>`;
  $$(".tabs [data-t]",$("#shB")).forEach(b=>b.onclick=()=>{examTab=b.dataset.t;renderExamHome();});
  const B=$("#exBody"),note=`<p class="small muted">Practice questions written for this book or generated by AI. They are <b>not</b> official GISCI exam items; the exam's knowledge areas and weights follow the official 2019 blueprint.</p>`;
  if(examTab==="start"){B.innerHTML=note+`<div class="grid2"><label class="field">Knowledge area<select id="xA"><option value="0">All areas</option>${DATA.areas.map(a=>`<option value="${a.n}" ${area===a.n?"selected":""}>${a.n}. ${esc(a.title)}</option>`).join("")}</select></label>
    <label class="field">Difficulty<select id="xD"><option value="mixed">Mixed</option><option value="beginner">Beginner · definitions</option><option value="intermediate">Intermediate · concepts</option><option value="advanced">Advanced · calculations & multi-select</option></select></label>
    <label class="field">Questions<select id="xN"><option>10</option><option selected>20</option><option>30</option></select></label>
    <label class="field">Timer<select id="xT"><option value="0">Untimed</option><option value="90">1.5 min per question</option></select></label></div>
    <div class="row"><button class="btn primary" id="xGo">Start practice</button><span class="muted small">Instant feedback after each answer. Questions you miss come back more often.</span></div>`;
    $("#xGo").onclick=()=>startExam({mode:"practice",area:+$("#xA").value,diff:$("#xD").value,n:+$("#xN").value,secs:+$("#xT").value});}
  if(examTab==="mock"){B.innerHTML=note+`<div class="grid2">${[["Full-length",100,240,"Same length and time limit as the scored part of the real exam. Questions are drawn in proportion to the blueprint weights."],["Half-length",50,120,"Half the questions at the same pace (2.4 min per question)."],["Sprint",25,60,"A quick timed check across all ten areas."]].map(([t,n,m,d])=>`<div class="card2"><span class="label">${n} questions · ${m} min</span><h3>${t}</h3><p class="small">${d}</p><button class="btn primary" data-m="${n}|${m}" style="margin-top:auto">Start ${t.toLowerCase()} mock</button></div>`).join("")}</div>`;
    $$("[data-m]",B).forEach(b=>b.onclick=()=>{const [n,m]=b.dataset.m.split("|").map(Number);startExam({mode:"mock",n,mins:m});});}
  if(examTab==="analytics")renderAnalytics(B);
  if(examTab==="review"){const W=S.wrong.length,F=S.flag.length;B.innerHTML=`<div class="grid2"><div class="card2"><span class="label">Incorrect-answer tracking</span><div class="big">${W}</div><p class="small">Questions you got wrong and have not yet answered correctly since.</p><button class="btn primary" id="rW" ${W?"":"disabled"}>Retry my mistakes</button></div><div class="card2"><span class="label">Bookmarked questions</span><div class="big">${F}</div><p class="small">Questions you flagged during practice or mock exams.</p><button class="btn" id="rF" ${F?"":"disabled"}>Practise flagged questions</button></div></div>`;
    $("#rW").onclick=()=>startExam({mode:"practice",ids:S.wrong.slice(),n:Math.min(30,W)});$("#rF").onclick=()=>startExam({mode:"practice",ids:S.flag.slice(),n:Math.min(30,F)});}
  if(examTab==="ai")renderAiTab(B);
}
function renderAnalytics(B){const per=DATA.areas.map(a=>{const s=Object.values(S.qs).filter(q=>q.area===a.n),c=s.reduce((x,q)=>x+q.c,0),w=s.reduce((x,q)=>x+q.w,0);return{a,c,w,acc:c+w?c/(c+w):null};});
  const tot=per.reduce((x,p)=>x+p.c+p.w,0),acc=tot?per.reduce((x,p)=>x+p.c,0)/tot:null,H=S.hist.slice(-12);
  const sp=H.length>1?`<svg class="spark" viewBox="0 0 300 60" preserveAspectRatio="none" role="img" aria-label="Score trend"><line x1="0" x2="300" y1="${60-.73*56}" y2="${60-.73*56}" stroke="var(--gold)" stroke-dasharray="4 4"/><polyline fill="none" stroke="var(--ink)" stroke-width="2" points="${H.map((h,i)=>`${i/(H.length-1)*296+2},${58-h.pct/100*56}`).join(" ")}"/>${H.map((h,i)=>`<circle cx="${i/(H.length-1)*296+2}" cy="${58-h.pct/100*56}" r="3" fill="var(--ink)"/>`).join("")}</svg>`:'<p class="muted small">Take two or more exams to see your trend.</p>';
  const W=weakAreas().slice(0,3);
  B.innerHTML=`<div class="grid3"><div class="card2"><span class="label">Questions answered</span><div class="big">${tot}</div></div><div class="card2"><span class="label">Overall accuracy</span><div class="big">${acc==null?"—":Math.round(acc*100)+"%"}</div></div><div class="card2"><span class="label">Exams taken</span><div class="big">${S.hist.length}</div></div></div>
  <div class="card2"><span class="label">Accuracy by knowledge area · gold line = 73% pass level</span><div class="bars">${per.map(p=>`<div class="b"><span>${p.a.n}. ${esc(p.a.title)}</span><span class="t"><i style="width:${p.acc==null?0:p.acc*100}%;background:${p.acc==null?"var(--line)":p.acc>=.73?"var(--good)":"var(--bad)"}"></i></span><span class="mono small">${p.acc==null?"—":Math.round(p.acc*100)+"%"}</span></div>`).join("")}</div></div>
  <div class="grid2"><div class="card2"><span class="label">Score trend</span>${sp}</div><div class="card2"><span class="label">Recommended next</span>${W.map(x=>`<div class="row" style="justify-content:space-between"><span class="small">${esc(x.a.title)}</span><button class="btn sm" data-l="${x.a.n}">Open lesson</button></div>`).join("")}</div></div>
  <div class="card2"><span class="label">Exam history</span>${S.hist.length?`<div class="tw"><table><thead><tr><th>Date</th><th>Mode</th><th>Score</th><th>Time</th></tr></thead><tbody>${S.hist.slice().reverse().map(h=>`<tr><td>${new Date(h.at).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</td><td>${esc(h.label)}</td><td class="mono">${h.right}/${h.n} · ${h.pct}%</td><td class="mono">${Math.round(h.secs/60)} min</td></tr>`).join("")}</tbody></table></div>`:'<p class="muted small">No exams yet.</p>'}</div>`;
  $$("[data-l]",B).forEach(b=>b.onclick=()=>{const i=LESSONS.findIndex(L=>L.area===+b.dataset.l);closeSheet();switchVol("gisp",1+Math.max(0,i)*3);});}
function renderAiTab(B){const vols=S.vols;B.innerHTML=`<p class="small">Generate new practice questions directly from a book's text. Each question cites the passage it came from. AI-generated questions are labelled and are never official GISCI items; check them against the source.</p>
  ${SAMPLE?`<div class="grid2"><label class="field">Source<select id="aiV"><option value="gisp">GISP · current lesson</option>${vols.map(v=>`<option value="${v.id}">${esc(v.title)}</option>`).join("")}</select></label><label class="field">Pages (documents)<input id="aiP" placeholder="e.g. 1-6" value="1-6"></label><label class="field">How many<select id="aiN"><option>5</option><option selected>8</option><option>12</option></select></label></div><div class="row"><button class="btn primary" id="aiGen">${ic("spark")} Generate questions</button><span id="aiSt" class="small muted" role="status"></span></div>`:`<p class="muted">${aiUnavailable()}</p>`}
  <span class="label">AI question bank · ${S.aiQs.length}</span>${S.aiQs.length?`<div class="row"><button class="btn" id="aiPr">Practise AI questions</button><button class="btn" id="aiClr">${ic("trash")} Clear AI questions</button></div>`+S.aiQs.slice(-8).reverse().map(q=>`<div class="card2" style="padding:12px"><span class="chip ai">AI-generated · ${esc(q.diff)}</span><b>${esc(q.q)}</b><span class="small muted">${esc(q.src)}</span></div>`).join(""):'<p class="muted small">None yet.</p>'}`;
  const g=$("#aiGen");if(g)g.onclick=async()=>{const v=$("#aiV").value,n=+$("#aiN").value,st=$("#aiSt");st.textContent="Claude is reading and writing questions… this can take up to a minute.";g.disabled=true;
    try{let text,meta;if(v==="gisp"){const s=curSpread(),L=s>0?lessonAt(s).L:LESSONS[0];text=[L.title,...L.concept,...L.formula.map(f=>f.join(": ")),...L.vocab.map(x=>x.join(": "))].join("\n");meta={area:L.area,src:`AI-generated from lesson “${L.title}”`};}
      else{const vol=await idbGet(v);const m=($("#aiP").value||"1-6").match(/(\d+)\s*-\s*(\d+)/)||[0,1,6];const a=Math.max(1,+m[1]),b=Math.min(vol.pages.length,+m[2]);text=vol.pages.slice(a-1,b).map((p,i)=>`[page ${a+i}] ${p.text}`).join("\n\n").slice(0,60000);meta={area:0,src:`AI-generated from “${vol.title}” pp. ${a}–${b}`,vol:v};}
      const arr=await SAMPLE.json(`Write ${n} multiple-choice practice questions for a GISP (GIS Professional) exam candidate, using ONLY facts stated in the text below. Each must have exactly one correct answer among 4 options. Reply with only a JSON array of {"q": string, "options": [4 strings], "answer": "A"|"B"|"C"|"D", "explanation": string, "difficulty": "beginner"|"intermediate"|"advanced", "quote": verbatim supporting phrase of at most 15 words, prefixed with its [page n] tag if present}.\n\nTEXT:\n${text}`,{modelTier:"default"});
      const k=addAiQs(arr,meta);st.textContent=`${k} questions added.`;renderAiTab(B);}catch(e){st.textContent=aiMsg(e);g.disabled=false;}};
  const pr=$("#aiPr");if(pr)pr.onclick=()=>startExam({mode:"practice",ids:S.aiQs.map(q=>q.id),n:Math.min(30,S.aiQs.length)});
  const cl=$("#aiClr");if(cl)cl.onclick=e=>{if(!e.currentTarget.dataset.c){e.currentTarget.dataset.c=1;e.currentTarget.textContent="Tap again to clear";return;}S.aiQs=[];save();renderAiTab(B);};}
function startExam(o){const qs=o.ids?buildSet({fromIds:o.ids,n:o.n}):buildSet(o);if(!qs.length){toast("No questions match those settings");return;}
  EXAM={o,qs,ans:{},flag:new Set(),i:0,start:Date.now(),end:o.mode==="mock"?Date.now()+o.mins*60000:(o.secs?Date.now()+o.secs*1000*qs.length:0),done:false,instant:o.mode!=="mock",checked:{}};runExam();}
function runExam(){clearInterval(examTick);const E=EXAM,q=E.qs[E.i],multi=q.a.length>1,picked=E.ans[q.id]||"",checked=E.checked[q.id];
  $("#shA").innerHTML=E.end?`<span class="mono" id="xTm" style="font-size:18px;color:var(--ink)"></span>`:"";
  $("#shB").innerHTML=`<div class="row" style="justify-content:space-between"><span class="label">${E.o.mode==="mock"?`Mock exam · ${E.qs.length} questions`:"Practice"} · question ${E.i+1} of ${E.qs.length}</span><span class="row" style="gap:6px"><span class="chip">${esc(AREA_T(q.area||1))}</span><span class="chip">${q.diff}</span>${q.ai?'<span class="chip ai">AI-generated</span>':""}</span></div>
  <div class="qcard"><div class="qt">${esc(q.q)}</div>${multi?'<span class="label" style="color:var(--gold)">Select all that apply</span>':""}<div class="qopts">${q.o.map((o,j)=>{const l="ABCD"[j];let c=picked.includes(l)?"sel":"";if(checked){c=q.a.includes(l)?"ok":(picked.includes(l)?"no":"");}return `<button class="qo ${c}" data-l="${l}" ${checked?"disabled":""}><b>${l}</b><span>${esc(o)}</span></button>`;}).join("")}</div>
   ${checked?`<div class="fb ${picked===q.a?"ok":"no"}"><b>${picked===q.a?"Correct.":"Answer: "+q.a.split("").join(", ")+"."}</b> ${esc(q.ex)}<span class="src">Source: ${esc(q.src)} · Practice question, not an official GISCI item</span></div>`:""}</div>
  <div class="row" style="justify-content:space-between"><div class="row"><button class="btn" id="xP" ${E.i?"":"disabled"}>${ic("left")} Previous</button><button class="btn ${E.flag.has(q.id)?"gold":""}" id="xF" aria-pressed="${E.flag.has(q.id)}">${ic("flag")} ${E.flag.has(q.id)?"Flagged":"Flag"}</button></div><div class="row">${E.instant&&!checked?`<button class="btn primary" id="xC" ${picked?"":"disabled"}>Check</button>`:""}${E.i<E.qs.length-1?`<button class="btn ${E.instant&&!checked?"":"primary"}" id="xN">Next ${ic("right")}</button>`:""}<button class="btn" id="xS">Finish</button></div></div>
  <div class="card2" style="padding:12px"><span class="label">Questions · filled = answered, gold = flagged</span><div class="qgrid">${E.qs.map((x,i)=>`<button data-i="${i}" class="${E.ans[x.id]?"a":""} ${i===E.i?"c":""} ${E.flag.has(x.id)?"f":""} ${E.checked[x.id]?(E.ans[x.id]===x.a?"ok":"no"):""}" aria-label="Question ${i+1}">${i+1}</button>`).join("")}</div></div>`;
  $$(".qo",$("#shB")).forEach(b=>b.onclick=()=>{let cur=new Set((E.ans[q.id]||"").split("").filter(Boolean));if(multi){cur.has(b.dataset.l)?cur.delete(b.dataset.l):cur.add(b.dataset.l);}else cur=new Set([b.dataset.l]);E.ans[q.id]=[...cur].sort().join("");if(E.instant&&!multi){check();}else runExam();});
  const check=()=>{E.checked[q.id]=1;const ok=E.ans[q.id]===q.a;stat(q,ok);save();sfx("tap");runExam();};
  const xc=$("#xC");if(xc)xc.onclick=check;
  $("#xP").onclick=()=>{E.i--;runExam();};const xn=$("#xN");if(xn)xn.onclick=()=>{E.i++;runExam();};
  $("#xF").onclick=()=>{E.flag.has(q.id)?E.flag.delete(q.id):E.flag.add(q.id);if(E.flag.has(q.id)){if(!S.flag.includes(q.id))S.flag.push(q.id);}else S.flag=S.flag.filter(x=>x!==q.id);save();runExam();};
  $("#xS").onclick=e=>{const left=E.qs.filter(x=>!E.ans[x.id]).length;if(left&&!e.currentTarget.dataset.c){e.currentTarget.dataset.c=1;e.currentTarget.textContent=`${left} unanswered · tap again`;return;}finishExam();};
  $$(".qgrid button",$("#shB")).forEach(b=>b.onclick=()=>{E.i=+b.dataset.i;runExam();});
  if(E.end){const u=()=>{const ms=E.end-Date.now(),t=$("#xTm");if(ms<=0){finishExam();return;}if(t){const m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000);t.textContent=`${m}:${String(s).padStart(2,"0")}`;t.style.color=ms<300000?"var(--bad)":"var(--ink)";}};u();examTick=setInterval(u,1000);}
}
function finishExam(){clearInterval(examTick);const E=EXAM;E.done=true;const per={};let right=0;
  E.qs.forEach(q=>{const ok=(E.ans[q.id]||"")===q.a;if(ok)right++;const a=q.area||0;per[a]=per[a]||[0,0];per[a][1]++;if(ok)per[a][0]++;if(!E.checked[q.id])stat(q,ok);});
  const pct=Math.round(right/E.qs.length*100),secs=Math.round((Date.now()-E.start)/1000);S.hist.push({at:Date.now(),label:E.o.mode==="mock"?`Mock · ${E.qs.length}`:`Practice · ${E.o.area?AREA_T(E.o.area):"all areas"}`,n:E.qs.length,right,pct,secs});save();
  const W=Object.entries(per).filter(([a])=>+a).map(([a,[c,n]])=>({a:+a,c,n,acc:c/n})).sort((x,y)=>x.acc-y.acc);
  $("#shA").innerHTML="";
  $("#shB").innerHTML=`<div class="row" style="justify-content:space-between;align-items:flex-end"><div><span class="label">Result</span><div class="big">${right} / ${E.qs.length} · ${pct}%</div><p style="color:${pct>=73?"var(--good)":"var(--bad)"};font-weight:700;margin-top:6px">${pct>=73?"At or above the 73% pass level on this practice set.":"Below the 73% pass level on this practice set."}</p></div><div class="row"><button class="btn primary" id="xAgain">New exam</button><button class="btn" id="xWrong" ${S.wrong.length?"":"disabled"}>Retry mistakes</button></div></div>
  <div class="card2"><span class="label">By knowledge area</span><div class="bars">${W.map(w=>`<div class="b"><span>${w.a}. ${esc(AREA_T(w.a))}</span><span class="t"><i style="width:${w.acc*100}%;background:${w.acc>=.73?"var(--good)":"var(--bad)"}"></i></span><span class="mono small">${w.c}/${w.n}</span></div>`).join("")}</div></div>
  ${W.length&&W[0].acc<.73?`<div class="card2"><span class="label">Revise next</span><div class="row">${W.filter(w=>w.acc<.73).slice(0,3).map(w=>`<button class="btn sm" data-l="${w.a}">Open ${esc(AREA_T(w.a))} lesson</button>`).join("")}</div></div>`:""}
  <h3 style="font-size:24px">Review</h3>${E.qs.map((q,i)=>{const p=E.ans[q.id]||"",ok=p===q.a;return `<div class="qcard"><div class="row" style="justify-content:space-between"><span class="label">${i+1} · ${esc(AREA_T(q.area||1))}</span><span class="chip" style="color:${ok?"var(--good)":"var(--bad)"}">${ok?"Correct":p?"Incorrect":"Not answered"}</span></div><div class="qt" style="font-size:19px">${esc(q.q)}</div><div class="qopts">${q.o.map((o,j)=>{const l="ABCD"[j];return `<div class="qo ${q.a.includes(l)?"ok":p.includes(l)?"no":""}"><b>${l}</b><span>${esc(o)}</span></div>`;}).join("")}</div><div class="fb ${ok?"ok":"no"}">${esc(q.ex)}<span class="src">Source: ${esc(q.src)}</span></div></div>`;}).join("")}`;
  $("#xAgain").onclick=()=>{EXAM=null;examTab=E.o.mode==="mock"?"mock":"start";renderExamHome();};$("#xWrong").onclick=()=>startExam({mode:"practice",ids:S.wrong.slice(),n:Math.min(30,S.wrong.length)});
  $$("[data-l]",$("#shB")).forEach(b=>b.onclick=()=>{const i=LESSONS.findIndex(L=>L.area===+b.dataset.l);closeSheet();switchVol("gisp",1+Math.max(0,i)*3);});
  $("#shB").scrollTop=0;}

/* ---------- flashcards (Leitner) ---------- */
const BOXD=[0,0,1,3,7,14];let fcDeck="due",fcCur=null;
function allCards(){const c=ALLTERMS.map(x=>({id:"t:"+x.t,front:x.t,back:x.m,area:x.a,deck:"keywords"}));Object.entries(S.cards).filter(([id,v])=>v.front).forEach(([id,v])=>c.push({id,front:v.front,back:v.back,deck:v.ai?"ai":"mine"}));return c;}
function cardState(id){return S.cards[id]||{box:1,due:0};}
function openCards(){$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.toggle("on",b.dataset.open==="cards"));openSheet("Flashcards");renderCards();}
function renderCards(){const all=allCards(),now=Date.now(),due=all.filter(c=>cardState(c.id).due<=now),list=fcDeck==="due"?due:all.filter(c=>c.deck===fcDeck);
  const counts=[1,2,3,4,5].map(b=>all.filter(c=>cardState(c.id).box===b).length);
  if(!fcCur||!list.find(c=>c.id===fcCur.id))fcCur=list[Math.floor(Math.random()*list.length)]||null;
  $("#shB").innerHTML=`<div class="row" style="justify-content:space-between"><div class="seg" role="group" aria-label="Deck">${[["due",`Due today · ${due.length}`],["keywords","Keywords"],["mine","My cards"],["ai","AI cards"]].map(([k,l])=>`<button data-d="${k}" class="${fcDeck===k?"on":""}" aria-pressed="${fcDeck===k}">${l}</button>`).join("")}</div><span class="small muted">Leitner boxes: ${counts.map((n,i)=>`<b>${i+1}</b>:${n}`).join(" · ")}</span></div>
  ${fcCur?`<button class="fc" id="fc" aria-label="Flip card"><div class="in"><div class="f"><span class="label">${fcCur.deck==="keywords"?esc(AREA_T(fcCur.area))+" · keyword":fcCur.deck==="ai"?"AI card":"My card"} · box ${cardState(fcCur.id).box}</span><strong>${esc(fcCur.front)}</strong><span class="label">Tap to reveal</span></div><div class="bk"><span>${esc(fcCur.back||"Add your own answer by opening the page this came from.")}</span><span class="label" style="color:#BFC8D6">How well did you know it?</span></div></div></button>
  <div class="row" style="justify-content:center"><button class="btn" data-r="1">Again</button><button class="btn" data-r="2">Hard</button><button class="btn primary" data-r="3">Good</button><button class="btn gold" data-r="4">Easy</button></div>`:`<div class="card2"><h3>${fcDeck==="due"?"Nothing due. Well done.":"This deck is empty."}</h3><p class="small muted">${fcDeck==="mine"?"Select text in the book and choose the card button to add your own.":fcDeck==="ai"?"Generate cards from a document below.":"Come back tomorrow, or switch to the Keywords deck."}</p></div>`}
  ${SAMPLE&&S.vols.length?`<div class="card2"><span class="label">AI flashcards from a document</span><div class="row"><select id="fcV" aria-label="Document" style="min-height:40px;border:1px solid var(--line2);border-radius:6px;padding:6px;background:var(--bg);color:var(--ink)">${S.vols.map(v=>`<option value="${v.id}">${esc(v.title)}</option>`).join("")}</select><input id="fcP" aria-label="Pages" value="1-6" style="width:90px;min-height:40px;border:1px solid var(--line2);border-radius:6px;padding:6px;background:var(--bg);color:var(--ink)"><button class="btn" id="fcG">${ic("spark")} Make 10 cards</button><span id="fcS" class="small muted" role="status"></span></div></div>`:""}`;
  $$("[data-d]",$("#shB")).forEach(b=>b.onclick=()=>{fcDeck=b.dataset.d;fcCur=null;renderCards();});
  const fc=$("#fc");if(fc)fc.onclick=()=>fc.classList.toggle("on");
  $$("[data-r]",$("#shB")).forEach(b=>b.onclick=()=>{const st=cardState(fcCur.id),r=+b.dataset.r;st.box=r===1?1:r===2?Math.max(1,st.box):Math.min(5,st.box+(r===4?2:1));st.due=Date.now()+BOXD[st.box]*864e5+(r===1?60000:0);S.cards[fcCur.id]=Object.assign(S.cards[fcCur.id]||{},st);save();fcCur=null;renderCards();});
  const g=$("#fcG");if(g)g.onclick=async()=>{const st=$("#fcS");st.textContent="Thinking…";try{const vol=await idbGet($("#fcV").value);const m=$("#fcP").value.match(/(\d+)\s*-\s*(\d+)/)||[0,1,6];const a=+m[1],b=Math.min(vol.pages.length,+m[2]);
    const arr=await SAMPLE.json(`Make 10 study flashcards from this text for a GIS professional. Reply with only a JSON array of {"front": short term or question, "back": answer in under 30 words}. Use only facts in the text.\n\n${vol.pages.slice(a-1,b).map(p=>p.text).join("\n\n").slice(0,40000)}`,{modelTier:"quick"});
    let n=0;(arr||[]).forEach(c=>{if(c&&c.front&&c.back){S.cards["a:"+Date.now().toString(36)+n]={box:1,due:0,front:String(c.front).slice(0,140),back:String(c.back).slice(0,300),ai:true};n++;}});save();st.textContent=`${n} cards added to AI cards.`;fcDeck="ai";renderCards();}catch(e){st.textContent=aiMsg(e);}};}

/* ---------- library & documents (IndexedDB) ---------- */
function idb(){return new Promise((res,rej)=>{try{const r=indexedDB.open("gisp-library",1);r.onupgradeneeded=()=>r.result.createObjectStore("vols",{keyPath:"id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);}catch(e){rej(e);}});}
const MEMV={};
async function idbPut(v){MEMV[v.id]=v;try{const d=await idb();await new Promise((res,rej)=>{const t=d.transaction("vols","readwrite");t.objectStore("vols").put(v);t.oncomplete=res;t.onerror=()=>rej(t.error);});}catch(e){}}
async function idbGet(id){if(MEMV[id])return MEMV[id];try{const d=await idb();return await new Promise((res,rej)=>{const r=d.transaction("vols").objectStore("vols").get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}catch(e){return null;}}
async function idbDel(id){delete MEMV[id];try{const d=await idb();d.transaction("vols","readwrite").objectStore("vols").delete(id);}catch(e){}}
function openLibrary(){$$("[data-open]:not([data-open=explore])").forEach(b=>b.classList.toggle("on",b.dataset.open==="library"));openSheet("Library");renderLibrary();}
const COVERS=[["#E9B93A","#161616"],["#10233F","#F3EEE2"],["#0E6B4F","#F3EEE2"],["#F3EEE2","#10233F"],["#7A2E2E","#F3EEE2"]];
function renderLibrary(st){const vols=[{id:"gisp",title:"GISP",sub:"Interactive edition · 14 lessons"},...S.vols.map(v=>({id:v.id,title:v.title,sub:`${v.pages} pages · added ${new Date(v.added).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`}))];
  $("#shB").innerHTML=`<p class="small muted">Open a volume to read it as a 3D book. Your documents stay in this browser; AI features read only the pages you choose.</p>
  <div class="lib">${vols.map((v,i)=>{const [bg,fg]=COVERS[i%COVERS.length];return `<div style="display:flex;flex-direction:column;gap:8px"><button class="vol" data-v="${v.id}" aria-label="Open ${esc(v.title)}"><div class="cover" style="background:${bg};color:${fg}"><small>${v.id==="gisp"?"GISCI · GISP":"Document"}</small><b>${esc(v.title)}</b><small>${v.id===S.vol?"Open now":"Open"}</small></div></button><div class="meta">${esc(v.sub)}</div>${v.id!=="gisp"?`<button class="btn sm" data-del="${v.id}" aria-label="Remove ${esc(v.title)}">${ic("trash")} Remove</button>`:""}</div>`;}).join("")}</div>
  <label class="drop" id="drop"><b style="font-family:var(--display);font-size:22px;color:var(--ink)">Add a document</b><span>PDF, TXT or Markdown, up to 300 pages. Drop it here or choose a file.</span><input type="file" id="upl" accept=".pdf,.txt,.md,application/pdf,text/plain" style="max-width:100%"><span id="upS" role="status">${st||""}</span></label>`;
  $$("[data-v]",$("#shB")).forEach(b=>b.onclick=()=>{closeSheet();switchVol(b.dataset.v);});
  $$("[data-del]",$("#shB")).forEach(b=>b.onclick=async e=>{if(!e.currentTarget.dataset.c){e.currentTarget.dataset.c=1;e.currentTarget.textContent="Tap again to remove";return;}const id=b.dataset.del;await idbDel(id);S.vols=S.vols.filter(v=>v.id!==id);if(S.vol===id)await switchVol("gisp");save();renderLibrary();});
  const dz=$("#drop");dz.ondragover=e=>{e.preventDefault();dz.classList.add("over");};dz.ondragleave=()=>dz.classList.remove("over");dz.ondrop=e=>{e.preventDefault();dz.classList.remove("over");const f=e.dataTransfer.files[0];if(f)ingest(f);};
  $("#upl").onchange=e=>{const f=e.target.files[0];if(f)ingest(f);};}
async function ingest(f){const st=$("#upS");st.textContent="Reading "+f.name+"…";let srcPages=[];
  try{if(/\.pdf$/i.test(f.name)||f.type==="application/pdf"){if(!window.pdfjsLib)throw new Error("PDF reader did not load");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
      const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const n=Math.min(doc.numPages,300);for(let i=1;i<=n;i++){const p=await doc.getPage(i),tc=await p.getTextContent();srcPages.push(tc.items.map(x=>x.str+(x.hasEOL?"\n":" ")).join("").replace(/[ \t]+/g," ").trim());if(i%10===0)st.textContent=`Reading page ${i} of ${n}…`;}}
    else{const t=await f.text();srcPages=t.split(/\f/).length>1?t.split(/\f/):[t];}
  }catch(e){st.textContent="Couldn't read that file. Try a text-based PDF or a .txt file.";return;}
  const pages=[];srcPages.forEach((t,i)=>{const paras=t.split(/\n{2,}|\r\n\r\n/);let cur="";paras.forEach(p=>{p=p.trim();if(!p)return;if((cur+"\n\n"+p).length>1300&&cur){pages.push({text:cur,src:i+1});cur="";}while(p.length>1300){pages.push({text:p.slice(0,1300),src:i+1});p=p.slice(1300);}cur=cur?cur+"\n\n"+p:p;});if(cur)pages.push({text:cur,src:i+1});});
  if(!pages.length){st.textContent="No text found. Scanned PDFs need OCR first.";return;}
  const id="v"+Date.now().toString(36),title=f.name.replace(/\.[^.]+$/,"").slice(0,60);await idbPut({id,title,pages});S.vols.push({id,title,pages:pages.length,added:Date.now()});save();renderLibrary(`Added “${title}” · ${pages.length} book pages.`);}
async function switchVol(id,spread){if(id!=="gisp"){DOC=await idbGet(id);if(!DOC){toast("That document is no longer stored in this browser");S.vols=S.vols.filter(v=>v.id!==id);id="gisp";}}else DOC=null;
  const changed=S.vol!==id;S.vol=id;if(spread!=null)S.spread[id]=spread;save();stopWatch();if(changed){await sinkDemo();clearDemo();}
  pageEls().forEach(e=>e.style.opacity=0);await turnPage(1,{},{} ,null);renderSpread({reDemo:true});pageEls().forEach(e=>{e.style.opacity=1;});resetView();if(G.webOn)webJump();}
const openVolume=(v,s)=>switchVol(v,s);

/* ---------- figure explorer · viewing angles · 2D/3D ---------- */
const THUMB={
 globe:'<circle cx="16" cy="16" r="12"/><ellipse cx="16" cy="16" rx="5" ry="12"/><path d="M4 16h24M6 10h20M6 22h20"/>',
 proj:'<path d="M5 9c4-3 18-3 22 0M5 23c4 3 18 3 22 0"/><rect x="5" y="9" width="22" height="14"/><path d="M12 9v14M20 9v14M5 16h22"/>',
 earth:'<ellipse cx="16" cy="16" rx="13" ry="11"/><circle cx="16" cy="16" r="9" stroke-dasharray="2 2"/><path d="M16 3v26"/>',
 topology:'<circle cx="7" cy="9" r="2"/><circle cx="25" cy="9" r="2"/><circle cx="16" cy="25" r="2"/><path d="M9 9h14M8 11l7 12M24 11l-7 12"/>',
 quality:'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="6"/><circle cx="16" cy="16" r="1.5"/><circle cx="20" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
 terrain:'<path d="M3 25l8-12 5 7 4-5 9 10z"/><path d="M8 18c3-1 6 1 9 0M12 13c2-1 4 1 6 0"/>',
 gnss:'<circle cx="16" cy="25" r="2"/><path d="M5 6l3-2 2 3-3 2zM24 4l3 2-2 3-3-2zM15 3h3v3h-3z"/><path d="M8 8l7 15M24 8l-7 15M16 6v17" stroke-dasharray="2 2"/>',
 bands:'<rect x="5" y="5" width="16" height="16"/><rect x="8" y="8" width="16" height="16"/><rect x="11" y="11" width="16" height="16"/>',
 raster:'<rect x="5" y="5" width="22" height="22"/><path d="M5 12h22M5 19h22M12 5v22M19 5v22"/><path d="M12 12h7v7h-7z" fill="currentColor" fill-opacity=".25"/>',
 overlay:'<circle cx="12" cy="16" r="8"/><circle cx="20" cy="16" r="8"/>',
 stats:'<path d="M5 27h22"/><path d="M8 27V17M13 27V10M18 27V14M23 27V6"/>',
 gdb:'<ellipse cx="16" cy="7" rx="10" ry="3"/><path d="M6 7v18c0 2 4 3 10 3s10-1 10-3V7M6 16c0 2 4 3 10 3s10-1 10-3"/>',
 arch:'<rect x="4" y="4" width="10" height="7"/><rect x="18" y="4" width="10" height="7"/><rect x="11" y="21" width="10" height="7"/><path d="M9 11v5h14v-5M16 16v5"/>',
 pm:'<path d="M5 8h10M9 14h12M14 20h13"/><path d="M5 26h22"/><circle cx="15" cy="8" r="1.5"/><circle cx="21" cy="14" r="1.5"/>'
};
let EX_TAB="overview";
function exploring(){return document.body.classList.contains("exploring");}
function exIndex(){const s=curSpread();return S.vol==="gisp"&&s>0?lessonAt(s).idx:-1;}
function renderExplore(){
  const cur=exIndex();
  $("#exList").innerHTML=`<span class="label" style="padding:2px 4px 4px">${tt("Figures","المجسّمات")} · ${LESSONS.length}</span>`+LESSONS.map((L,i)=>{const Z=LZ(L),st=lessonState(L),seen=new Set(st.demo).size;
    return`<button class="fig${i===cur?" on":""}" data-fi="${i}" aria-pressed="${i===cur}"><span class="th"><svg viewBox="0 0 32 32" aria-hidden="true">${THUMB[L.demo]||THUMB.globe}</svg></span><span><b>${Z.title}</b><small>${tt("Area","المجال")} ${L.area} · ${seen}/${L.steps.length} ${tt("steps","خطوات")}</small>${st.done?`<span class="done">✓ ${tt("Complete","مكتمل")}</span>`:""}</span></button>`;}).join("");
  $$("#exList .fig").forEach(b=>b.onclick=()=>exPick(+b.dataset.fi));
  const on=$("#exList .fig.on");if(on)on.scrollIntoView({block:"nearest",inline:"nearest"});
  renderExInfo();
}
function renderExInfo(){
  const i=exIndex(),box=$("#exInfo");
  if(i<0){box.innerHTML=`<span class="label">${tt("Figure explorer","مستكشف المجسّمات")}</span><h2>${tt("Choose a figure","اختر مجسّماً")}</h2><p class="small muted">${tt("Pick a figure from the list to bring it to the centre of the desk. Use the camera button for viewing angles, and 2D / 3D to switch projection.","اختر مجسّماً من القائمة لينتقل إلى وسط المكتب. استخدم زر الكاميرا لزوايا الرؤية، وزر 2D / 3D لتغيير الإسقاط.")}</p>`;return;}
  const L=LESSONS[i],Z=LZ(L),st=lessonState(L),seen=new Set(st.demo),area=DATA.areas[L.area-1],step=G.demo?G.demo.step:0;
  const tabs=[["overview",tt("Overview","نظرة عامة")],["steps",tt("Steps","الخطوات")],["terms",tt("Terms","المصطلحات")]];
  let body="";
  if(EX_TAB==="overview")body=`<p style="margin:0;font-size:15.5px;line-height:1.6">${Z.concept[0]}</p>${L.formula&&L.formula.length?`<div><span class="label">${tt("Key formula","الصيغة الأساسية")}</span>${L.formula.slice(0,2).map((f,k)=>`<p style="margin:6px 0 0"><code>${f[0]}</code><br><span class="small muted">${(Z.fnotes&&Z.fnotes[k])||f[1]}</span></p>`).join("")}</div>`:""}<p class="small muted" style="margin:0">KSA ${L.ksa.join(" · ")} · ${tt("Supplementary study figure, not an official GISCI item.","مجسّم دراسي تكميلي، وليس مادة رسمية من GISCI.")}</p>`;
  else if(EX_TAB==="steps")body=`<div class="stepl">${Z.steps.map((s,k)=>`<button data-st="${k}" class="${k===step?"on":""}" aria-pressed="${k===step}"><span class="n">${k+1}</span><span><b>${s[0]}</b><small>${s[1]}</small></span><span class="ok">${seen.has(k)?"✓":""}</span></button>`).join("")}</div>`;
  else body=`<dl style="margin:0;display:flex;flex-direction:column;gap:10px">${Z.vocab.map(v=>`<div><dt style="font-weight:700;color:var(--ink)">${v[0]}</dt><dd style="margin:2px 0 0;font-size:14px;color:var(--muted);line-height:1.5">${v[1]}</dd></div>`).join("")}</dl>`;
  box.innerHTML=`<div><span class="label">${tt("Area","المجال")} ${L.area} · ${AREA_T(L.area)}</span><h2 style="margin:6px 0 0">${Z.title}</h2><p class="small muted" style="margin:4px 0 0">${Z.module}</p></div>
  <div class="stats"><div><b>${L.steps.length}</b><span>${tt("Steps","خطوات")}</span></div><div><b>${seen.size}/${L.steps.length}</b><span>${tt("Viewed","شوهدت")}</span></div><div><b>${area?area.w+"%":"–"}</b><span>${tt("Exam weight","وزن الاختبار")}</span></div></div>
  <div class="seg" role="tablist">${tabs.map(([k,t])=>`<button role="tab" data-xt="${k}" class="${EX_TAB===k?"on":""}" aria-selected="${EX_TAB===k}">${t}</button>`).join("")}</div>${body}
  <div style="display:flex;gap:8px;margin-top:auto"><button class="btn" id="exPrev" aria-label="${tt("Previous step","الخطوة السابقة")}">‹</button><button class="btn primary" id="exNext" style="flex:1">${tt("Next step","الخطوة التالية")}</button><button class="btn" id="exRead">${tt("Open lesson","افتح الدرس")}</button></div>`;
  $$("#exInfo [data-xt]").forEach(b=>b.onclick=()=>{EX_TAB=b.dataset.xt;renderExInfo();});
  $$("#exInfo [data-st]").forEach(b=>b.onclick=()=>exStep(+b.dataset.st));
  $("#exNext").onclick=()=>exStep(((G.demo?G.demo.step:0)+1)%L.steps.length);
  $("#exPrev").onclick=()=>exStep(Math.max(0,(G.demo?G.demo.step:0)-1));
  $("#exRead").onclick=()=>toggleExplore(false);
}
function exStep(k){if(!G.demo)return;setDemoStep(k);captionStep(k);renderExplore();}
async function exPick(i){
  if(busy)return;const n=1+i*3;
  if(S.vol!=="gisp")await switchVol("gisp",n);else if(curSpread()!==n&&exIndex()!==i)await go(n);
  if(G.demo&&G.demo.step==null)setDemoStep(0);
  setView(G.view&&!["book","read"].includes(G.view)?G.view:"figure");markView();renderExplore();
}
function toggleExplore(on){
  on=on==null?!exploring():on;stopWatch();closeDrawer();closeSheet&&$("#sheet").hidden===false&&closeSheet();
  document.body.classList.toggle("exploring",on);$("#explore").hidden=!on;
  $$('[data-open="explore"]').forEach(b=>{b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);});
  if(on){if(exIndex()<0)exPick(0);else{if(G.demo&&G.demo.step==null)setDemoStep(0);setView("figure");markView();renderExplore();}}
  else{setView("book");markView();}
}
function markView(){$$("#views .vb").forEach(b=>b.classList.toggle("on",b.dataset.view===G.view));$$("#views .vb").forEach(b=>b.setAttribute("aria-pressed",b.dataset.view===G.view));}
function markDim(){const on=!!G.is2D;$("#hDim").setAttribute("aria-pressed",on);$("#hDim").setAttribute("aria-label",on?"Switch to 3D view":"Switch to 2D view");$$("#views [data-dim]").forEach(b=>{const m=(b.dataset.dim==="2d")===on;b.classList.toggle("on",m);b.setAttribute("aria-pressed",m);});trAll&&trAll();}
function toggleDim(on){on=on==null?!G.is2D:on;set2D(on);markDim();markView();toast(on?tt("2D plan view","منظر مسطّح 2D"):tt("3D perspective","منظور ثلاثي الأبعاد 3D"));}

{const _rs=renderSpread;renderSpread=function(o){if(o&&o.reDemo)G.figSyncAt=null;const r=_rs(o);if(!(o&&o.noDemo))setTimeout(syncFigure,o&&o.reDemo?650:120);if(exploring()){renderExplore();}if(LS.on&&!LS.turning){const g=++LS.gen;setTimeout(()=>{if(g===LS.gen&&LS.on){const w=()=>{if(g!==LS.gen)return;if(busy)return setTimeout(w,150);startBlocks();};w();}},300);}return r;};}
/* ---------- web page view (same content, one scrolling article; the same icon returns to the book) ---------- */
let WIO=null;
function webSection(s){const gisp=S.vol==="gisp";let html=leftHTML(s);if(!gisp)html+=`<div class="doctext">${(DOC&&DOC.pages[s*2+1])?esc(DOC.pages[s*2+1].text):""}</div>`;
  if(gisp&&s>0){const {L:L0,part}=lessonAt(s),L=LZ(L0);if(part===0){const i=lessonAt(s).idx,seen=new Set(lessonState(L0).demo);html+=`<figure class="wfig" data-fi="${i}" data-key="${L0.demo}"><div class="wstage"><button class="wload" data-wact="load"><svg viewBox="0 0 32 32" aria-hidden="true">${THUMB[L0.demo]||""}</svg><span>${tt("Load the interactive 3D figure","حمّل المجسّم التفاعلي ثلاثي الأبعاد")}</span></button><span class="whint">${tt("Drag to rotate","اسحب للتدوير")}</span></div>
  <figcaption><div class="whead"><b>${tt("Fig.","شكل")} ${i+1} — ${esc(L.title)}</b><span><button class="wbtn" data-wact="prev" aria-label="${tt("Previous step","الخطوة السابقة")}">‹</button><button class="wbtn play" data-wact="play">▶ ${tt("Play","تشغيل")}</button><button class="wbtn" data-wact="next" aria-label="${tt("Next step","الخطوة التالية")}">›</button><button class="wbtn" data-wact="view" aria-label="${tt("Reset view","إعادة الزاوية")}">⟲</button></span></div>
  <ol class="wsteps">${L.steps.map(([t,d],k)=>`<li><button data-wact="step" data-k="${k}"><span class="n">${k+1}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span><span class="ok">${seen.has(k)?"✓":""}</span></button></li>`).join("")}</ol></figcaption></figure>`;}}
  return `<section class="page webpg" id="w-${s}" data-s="${s}" dir="${isAR()&&S.vol==="gisp"?"rtl":"ltr"}">${html}</section>`;}
function renderWeb(){if(G.webFig)webFigUnmount();wfigStop();const n=spreadCount(),gisp=S.vol==="gisp";let out="";for(let s=0;s<n;s++)out+=webSection(s);$("#webBody").innerHTML=out;
  $("#webToc").innerHTML=gisp?`<p class="lab">${tt("Lessons","الدروس")}</p><a href="#w-0" data-s="0"><i>·</i><span>${tt("Introduction","المقدّمة")}</span></a>`+LESSONS.map((L0,i)=>{const L=LZ(L0),done=lessonState(L0).done;return`<a href="#w-${1+i*3}" data-s="${1+i*3}"><i class="${done?"d":""}">${done?"✓":i+1}</i><span>${esc(L.title)}</span></a>`;}).join(""):`<p class="lab">${esc(VOL()?VOL().title:"")}</p>`;
  $$("#webToc a").forEach(a=>a.onclick=e=>{e.preventDefault();const el=$("#w-"+a.dataset.s);if(el)el.scrollIntoView({behavior:RM()?"auto":"smooth",block:"start"});});
  if(WIO)WIO.disconnect();WIO=new IntersectionObserver(es=>{if(LS.on)return;const vis=es.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(!vis)return;const s=+vis.target.dataset.s;S.spread[S.vol]=s;webTocMark(s);},{root:$("#web"),rootMargin:"-10% 0px -70% 0px"});
  $$("#webBody .webpg").forEach(x=>WIO.observe(x));wfigObserve();}
/* one live 3D figure at a time: it follows you down the page */
let WFIO=null,WPLAY=null;
function wfigEl(){return G.webFig?G.webFig.stage.closest(".wfig"):null;}
function wfigMark(){const f=wfigEl();$$("#webBody .wfig").forEach(x=>x.classList.toggle("live",x===f));if(!f||!G.demo)return;const st=lessonState(LESSONS[+f.dataset.fi]),seen=new Set(st.demo);
  $$(".wsteps button",f).forEach((b,k)=>{b.classList.toggle("on",k===G.demo.step);b.setAttribute("aria-pressed",k===G.demo.step);b.querySelector(".ok").textContent=seen.has(k)?"✓":"";});}
function wfigStop(){if(WPLAY){clearInterval(WPLAY);WPLAY=null;}$$("#webBody .wbtn.play").forEach(b=>b.innerHTML="▶ "+tt("Play","تشغيل"));}
function wfigMount(fig,step){if(!fig)return;const stage=fig.querySelector(".wstage");if(G.webFig&&G.webFig.stage===stage)return;wfigStop();
  if(G.webFig){const old=wfigEl();if(old)old.classList.remove("live");}
  S.spread[S.vol]=1+(+fig.dataset.fi)*3;webFigMount(stage,fig.dataset.key,step||0);captionStep(step||0);wfigMark();}
function wfigStep(fig,k){S.spread[S.vol]=1+(+fig.dataset.fi)*3;if(!G.webFig||G.webFig.stage.closest(".wfig")!==fig)wfigMount(fig,k);else{setDemoStep(k);captionStep(k);}wfigMark();
  const L=LESSONS[+fig.dataset.fi];checkDone(L);}
function wfigAct(e){const b=e.target.closest("[data-wact]"),fig=e.target.closest(".wfig");if(!b||!fig)return false;const a=b.dataset.wact,n=LESSONS[+fig.dataset.fi].steps.length,live=G.webFig&&wfigEl()===fig,cur=live&&G.demo?G.demo.step:-1;
  if(a==="load")wfigMount(fig,0);else if(a==="step"){wfigStop();wfigStep(fig,+b.dataset.k);}else if(a==="next"){wfigStop();wfigStep(fig,Math.min(n-1,cur+1));}else if(a==="prev"){wfigStop();wfigStep(fig,Math.max(0,cur-1));}
  else if(a==="view"){if(!live)wfigMount(fig,0);webFigView();}
  else if(a==="play"){if(WPLAY){wfigStop();}else{let k=live?cur:-1;if(k>=n-1)k=-1;wfigStep(fig,k+1);k++;b.innerHTML="❚❚ "+tt("Pause","إيقاف");WPLAY=setInterval(()=>{if(!G.webOn||wfigEl()!==fig){wfigStop();return;}k++;if(k>=n){wfigStop();return;}wfigStep(fig,k);},2800);}}
  return true;}
function wfigObserve(){if(WFIO)WFIO.disconnect();WFIO=new IntersectionObserver(es=>{const v=es.filter(e=>e.isIntersecting&&e.intersectionRatio>.45).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(v&&!WPLAY)wfigMount(v.target);},{root:$("#web"),threshold:[.45,.7]});
  $$("#webBody .wfig").forEach(x=>WFIO.observe(x));}
function webJump(){renderWeb();const s=curSpread();webTocMark(s);requestAnimationFrame(()=>{const el=$("#w-"+s);$("#web").scrollTop=el&&s>0?el.offsetTop-70:0;});}
function webTocMark(s){const lesson=s<1?0:1+((s-1)/3|0)*3;$$("#webToc a").forEach(a=>a.classList.toggle("on",+a.dataset.s===lesson));}
function webRefresh(s){const old=$("#w-"+s);if(!old||old.querySelector(".wfig"))return;old.outerHTML=webSection(s);WIO&&WIO.observe($("#w-"+s));}
function toggleWeb(on){on=on==null?!G.webOn:on;if(on===!!G.webOn)return;
  if(LS.on)stopListen();stopWatch();
  G.webOn=on;document.body.classList.toggle("web",on);$("#web").hidden=!on;$("#webBtn").setAttribute("aria-pressed",on);
  $("#webBtn").setAttribute("aria-label",on?tt("Back to the 3D book","العودة إلى الكتاب ثلاثي الأبعاد"):tt("Web page view","عرض صفحة الويب"));$("#webBtn").title=$("#webBtn").getAttribute("aria-label");
  if(on){renderWeb();const s=curSpread();webTocMark(s);requestAnimationFrame(()=>{const el=$("#w-"+s);$("#web").scrollTop=el&&s>0?el.offsetTop-70:0;});toast(tt("Web page view · press the same icon to return to the book","عرض صفحة الويب · اضغط الأيقونة نفسها للعودة إلى الكتاب"));}
  else{wfigStop();if(WFIO)WFIO.disconnect();webFigUnmount();$("#caption").hidden=true;renderSpread({reDemo:true});resetView(true);toast(tt("Back to the book","العودة إلى الكتاب"));}
  try{localStorage.setItem("gisp-web",on?"1":"0");}catch(e){}}
function onWebClick(e){if(wfigAct(e))return;const sec=e.target.closest(".webpg");if(!sec)return;const b=e.target.closest("button");if(!b)return;const s=+sec.dataset.s;S.spread[S.vol]=s;
  onPageClick(e);setTimeout(()=>webRefresh(s),30);}
/* ---------- wiring ---------- */
function wire(){
  $$("#topbar .tb[aria-label],#hud .tb[aria-label]").forEach(b=>{if(!b.title)b.title=b.getAttribute("aria-label");});
  $$("[data-open]").forEach(b=>b.onclick=()=>{const k=b.dataset.open;if(["notes","tutor","progress"].includes(k)){DRAWER===k?closeDrawer():openDrawer(k);}else if(k==="explore")toggleExplore();else if(k==="exam")openExam();else if(k==="cards")openCards();else openLibrary();});
  $("#dwX").onclick=closeDrawer;$("#shX").onclick=closeSheet;$("#sheet").addEventListener("click",e=>{if(e.target.id==="sheet")closeSheet();});
  $("#hToc").onclick=()=>DRAWER==="toc"?closeDrawer():openDrawer("toc");$("#hPrev").onclick=()=>go(curSpread()-1);$("#hNext").onclick=()=>go(curSpread()+1);$("#hPlay").onclick=watch;
  $("#hMark").onclick=()=>{const l=S.bm[S.vol]=S.bm[S.vol]||[],s=curSpread(),i=l.indexOf(s);i>=0?l.splice(i,1):l.push(s);save();renderSpread({keepTex:true,noDemo:true});toast(i>=0?"Bookmark removed":"Bookmarked");if(DRAWER==="toc")renderToc();};
  $("#hDim").onclick=()=>toggleDim();
  $$("#views [data-dim]").forEach(b=>b.onclick=()=>toggleDim(b.dataset.dim==="2d"));
  $("#hReset").onclick=()=>{stopWatch();G.readMode=false;$("#hRead").classList.remove("on");$("#hRead").setAttribute("aria-pressed","false");if(exploring())setView("figure");else resetView();markView();};
  $("#hRead").onclick=e=>{stopWatch();G.readMode=!G.readMode;e.currentTarget.classList.toggle("on",G.readMode);e.currentTarget.setAttribute("aria-pressed",G.readMode);if(G.readMode&&exploring())toggleExplore(false);setView(G.readMode?"read":"book");markView();toast(G.readMode?tt("Reading view","وضع القراءة"):tt("Book view","منظر الكتاب"));};
  $("#langBtn").onclick=()=>setLang(isAR()?"en":"ar");
  $("#hMore").onclick=e=>{const m=$("#more");m.hidden=!m.hidden;e.currentTarget.setAttribute("aria-expanded",!m.hidden);};
  $("#mSound").onclick=e=>{S.sound=!S.sound;save();e.currentTarget.setAttribute("aria-pressed",S.sound);e.currentTarget.classList.toggle("on",S.sound);toast(S.sound?"Sound on":"Sound off");};
  $("#mTheme").onclick=e=>{S.night=!S.night;save();setTheme(S.night);e.currentTarget.setAttribute("aria-pressed",S.night);e.currentTarget.classList.toggle("on",S.night);};
  $("#mRM").onclick=e=>{S.rm=!S.rm;save();document.documentElement.dataset.rm=S.rm?"1":"0";e.currentTarget.setAttribute("aria-pressed",S.rm);e.currentTarget.classList.toggle("on",S.rm);toast(S.rm?"Reduced motion on":"Reduced motion off");};
  const zoom=f=>{const c=G.cam,t=G.ctl.target,d=c.position.clone().sub(t).multiplyScalar(f);const L=d.length();if(L<G.ctl.minDistance||L>G.ctl.maxDistance)return;flyTo({p:t.clone().add(d).toArray(),t:t.toArray()});};
  $("#mZin").onclick=()=>zoom(.8);$("#mZout").onclick=()=>zoom(1.25);
  $("#mFull").onclick=()=>{const d=document;if(d.fullscreenElement)d.exitFullscreen&&d.exitFullscreen();else{const p=d.documentElement.requestFullscreen&&d.documentElement.requestFullscreen();if(p&&p.catch)p.catch(()=>toast("Fullscreen isn't available in this view"));else if(!p)toast("Fullscreen isn't available in this view");}};
  $("#mListen").onclick=()=>{$("#more").hidden=true;LS.on?stopListen():startListen();};
  $("#openHint").onclick=()=>openBook();
  /* in-flow copies of the signature for the reading panel and the web page */
  ["#reader","#web"].forEach(sel=>{const s=$("#sign"),d=document.createElement("div");d.className="sign-inline";d.innerHTML=s.innerHTML.replace(/ aria-label="Mohamed Alkamel on social media"/,"");d.querySelector(".soc").setAttribute("aria-label","Mohamed Alkamel on social media");$(sel).appendChild(d);});
  $("#webBtn").onclick=()=>toggleWeb();$("#web").addEventListener("click",onWebClick);
  $("#hListen").onclick=()=>LS.on?stopListen():startListen();
  $("#lbStop").onclick=stopListen;$("#lbPause").onclick=pauseListen;$("#lbRate").onclick=cycleRate;$("#mRate").onclick=cycleRate;lbUpdate();
  $("#mMark").onclick=()=>$("#hMark").click();$("#mReset").onclick=()=>$("#hReset").click();
  $("#rdToggle").onclick=e=>{const r=$("#reader");r.classList.toggle("min");const m=r.classList.contains("min");e.currentTarget.textContent=m?"Show text":"Hide text";e.currentTarget.setAttribute("aria-expanded",!m);};
  $("#seltb").addEventListener("mousedown",e=>{if(!e.target.closest("input"))e.preventDefault();});$("#seltb").addEventListener("click",selAction);
  document.addEventListener("selectionchange",()=>{clearTimeout(window._selT);window._selT=setTimeout(onSel,180);});
  document.addEventListener("keydown",e=>{if(e.target.closest("input,textarea,select"))return;if(!$("#sheet").hidden){if(e.key==="Escape")closeSheet();return;}
    const fw=isAR()&&S.vol==="gisp"?"ArrowLeft":"ArrowRight",bw=fw==="ArrowLeft"?"ArrowRight":"ArrowLeft";
    if(e.key===fw){go(curSpread()+1);e.preventDefault();}else if(e.key===bw){go(curSpread()-1);e.preventDefault();}else if(e.key.toLowerCase()==="f"){$("#hRead").click();}else if(e.key===" "){if(!e.target.closest("button")){watch();e.preventDefault();}}else if(e.key==="Escape"){stopSpeak();stopWatch();closeDrawer();$("#more").hidden=true;}else if(e.key==="2"||e.key==="3"){toggleDim(e.key==="2");}else if(e.key.toLowerCase()==="b")$("#hMark").click();else if(e.key.toLowerCase()==="r")$("#hReset").click();else if(e.key.toLowerCase()==="t")$("#hToc").click();});
  // click the pop-up figure to advance a step
  let pd=null;G.r.domElement.addEventListener("pointerdown",e=>{pd=[e.clientX,e.clientY];});
  G.r.domElement.addEventListener("pointerup",e=>{if(!pd||Math.hypot(e.clientX-pd[0],e.clientY-pd[1])>6||!G.demo||S.vol!=="gisp"||curSpread()===0)return;const rc=G.r.domElement.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera({x:(e.clientX-rc.left)/rc.width*2-1,y:-(e.clientY-rc.top)/rc.height*2+1},G.cam);if(ray.intersectObject(G.demo.group,true).length){const n=(G.demo.step+1)%G.demo.steps.length;setDemoStep(n);captionStep(n);clearTimeout(window._capT);if(!W.on)window._capT=setTimeout(()=>{$("#caption").hidden=true;renderSpread({keepTex:true,noDemo:true});},5200);}});
  // easy mouse turning: click near either outer edge of the open book
  const edgeHit=edgeAt;
  /* ---- how the mouse / finger behaves on the book (like holding a real book) ----
     desktop: outer edge of a page -> drag to turn it; anywhere else on the book -> hand drags (slides) the book;
              wheel or pinch -> zoom toward the pointer; double-click -> zoom in / back to the whole book;
              desk around the book -> rotate the view.
     phones/tablets: swipe across the book turns the page, pinch zooms, double-tap zooms. */
  const cv=G.r.domElement,rayAt=e=>{const rc=cv.getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera({x:(e.clientX-rc.left)/rc.width*2-1,y:-(e.clientY-rc.top)/rc.height*2+1},G.cam);return ray;},
    planeAt=e=>{const p=new THREE.Vector3();return rayAt(e).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-PAGE_Y),p)?p:null;},
    bookHit=e=>{const ray=rayAt(e),p=new THREE.Vector3();if(!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-PAGE_Y),p))return null;
      if(!G.closed&&G.demo&&G.demo.group.visible){const hit=ray.intersectObject(G.demo.group,true).find(o=>o.object.isMesh&&!o.object.material.transparent);if(hit&&Math.hypot(p.x-G.demoRoot.position.x,p.z)<.42)return"figure";}
      const x0=G.closed?(G.closedSide>0?-.04:-(PW+.08)):-(PW+.08),x1=G.closed?(G.closedSide>0?PW+.08:.04):PW+.08;
      if(!(p.x>=x0&&p.x<=x1&&Math.abs(p.z)<=PD/2+.05))return null;return(!G.closed&&!G.compact&&edgeAt(e))?"edge":"book";};
  const camDist=()=>G.cam.position.distanceTo(G.ctl.target);
  function zoomAt(cx,cy,f){if(G.webOn)return;G.fly=null;const p=planeAt({clientX:cx,clientY:cy})||G.ctl.target.clone(),t=G.ctl.target,d=camDist(),nd=Math.min(G.ctl.maxDistance,Math.max(G.ctl.minDistance,d*f)),k=nd/d;
    const off=G.cam.position.clone().sub(t);t.add(p.clone().sub(t).multiplyScalar(1-k));t.y=Math.max(0,t.y);G.cam.position.copy(t).add(off.multiplyScalar(k));G.view="free";}
  function panBy(dx,dy){const d=camDist(),wpp=2*d*Math.tan(G.cam.fov*Math.PI/360)/innerHeight,right=new THREE.Vector3().setFromMatrixColumn(G.cam.matrixWorld,0),fwd=new THREE.Vector3().setFromMatrixColumn(G.cam.matrixWorld,1);fwd.y=0;fwd.normalize();right.y=0;right.normalize();
    const el=Math.asin(Math.min(1,(G.cam.position.y-G.ctl.target.y)/d)),mv=right.multiplyScalar(-dx*wpp).add(fwd.multiplyScalar(dy*wpp/Math.max(.35,Math.sin(el))));G.fly=null;G.cam.position.add(mv);G.ctl.target.add(mv);G.view="free";}
  let hd=null;const ptrs=new Map();let pinch=null;
  const turnBy=dx=>{if(G.closed){openBook();return;}go(curSpread()+fwdFor(dx<0?"right":"left"));};
  const endHold=()=>{hd=null;G.ctl.enabled=true;};
  /* how far the pointer has carried the page: 0 = still on its side, 1 = laid on the other side */
  const pageSpanPx=()=>{const a=new THREE.Vector3(PW,PAGE_Y,0).project(G.cam),b=new THREE.Vector3(-PW,PAGE_Y,0).project(G.cam);return Math.max(120,Math.abs(a.x-b.x)/2*innerWidth);};
  const startTurn=(side)=>{if(busy||G.closed||G.webOn)return false;const n=curSpread()+fwdFor(side);if(n<0||n>=spreadCount())return false;
    hd.drag={t:0,side,sx:hd.lx,span:pageSpanPx()};go(n,false,hd.drag);return true;};
  const holdMove=(x,y)=>{if(!hd)return;const dx=x-hd.x,dy=y-hd.y;
    if(hd.mode==="pan"){panBy(x-hd.lx,y-hd.ly);}
    else if(hd.mode==="turn"){
      if(!hd.drag&&!hd.noDrag&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){const side=hd.side||(dx<0?"right":"left");if(hd.side&&((side==="right")!==(dx<0))){hd.noDrag=true;}else if(!startTurn(side))hd.noDrag=true;}
      if(hd.drag){const d=hd.drag,t=(d.side==="right"?(d.sx-x):(x-d.sx))/(d.span*1.6);d.t=Math.max(0,Math.min(1,t));d.v=(x-hd.lx);if(d.set)d.set(d.t);}}
    hd.lx=x;hd.ly=y;};
  cv.addEventListener("pointerdown",e=>{if(G.webOn||G.is2D)return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])};if(hd&&hd.drag){hd.drag.pending=false;if(hd.drag.release)hd.drag.release(false);}hd=null;G.ctl.enabled=false;e.stopImmediatePropagation();return;}
    const h=bookHit(e);if(h==="book"||h==="edge"){G.ctl.enabled=false;hd={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,mode:(h==="edge"||G.compact||G.closed)?"turn":"pan",side:h==="edge"?edgeAt(e):null};cv.style.cursor="grabbing";}},{capture:true});
  cv.addEventListener("pointermove",e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>0&&pinch.d>0)zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.d/d);pinch.d=d;return;}
    if(hd||e.buttons)return;const h=G.webOn?null:bookHit(e);cv.style.cursor=h==="figure"?"pointer":h==="edge"?(edgeAt(e)==="right"?"e-resize":"w-resize"):h==="book"?(G.closed?"pointer":"grab"):"";},{capture:true});
  addEventListener("pointermove",e=>{if(hd)holdMove(e.clientX,e.clientY);});
  const up=e=>{ptrs.delete(e.pointerId);if(pinch){if(ptrs.size<2){pinch=null;G.ctl.enabled=true;}return;}if(!hd)return;const dx=e.clientX-hd.x,dy=e.clientY-hd.y,m=hd.mode,drag=hd.drag;endHold();cv.style.cursor="grab";
    if(drag){/* let go: past a third of the way, or flicked forward, the page completes; otherwise it falls back */
      const fwdFlick=(drag.side==="right"?-drag.v:drag.v)>14,complete=drag.t>.33||fwdFlick&&drag.t>.08;G.dragTurnAt=performance.now();
      if(drag.release)drag.release(complete);else drag.pending=complete;return;}
    if(m==="turn"&&G.closed&&Math.abs(dx)>40){G.dragTurnAt=performance.now();openBook();return;}
    if(m==="pan"&&Math.hypot(dx,dy)>6)G.dragTurnAt=performance.now();};
  addEventListener("pointerup",up);addEventListener("pointercancel",e=>{ptrs.delete(e.pointerId);pinch=null;if(hd&&hd.drag){if(hd.drag.release)hd.drag.release(false);else hd.drag.pending=false;}endHold();});
  /* wheel / trackpad pinch: zoom toward the pointer (horizontal swipe or Shift+wheel still turns pages, handled below) */
  cv.addEventListener("wheel",e=>{if(G.webOn||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();e.stopImmediatePropagation();
    const dy=e.deltaMode===1?e.deltaY*16:e.deltaY;zoomAt(e.clientX,e.clientY,Math.exp(Math.max(-60,Math.min(60,dy))*(e.ctrlKey?.012:.0016)));},{capture:true,passive:false});
  /* double-click / double-tap: zoom in where you point, again to return to the whole book */
  cv.addEventListener("dblclick",e=>{if(G.webOn||G.closed)return;const fit=viewFor("book"),fd=Math.hypot(fit.p[0]-fit.t[0],fit.p[1]-fit.t[1],fit.p[2]-fit.t[2]);if(camDist()<fd*.8){resetView();}else zoomAt(e.clientX,e.clientY,.55);});
  /* the HTML text page: its outer edge turns the page; the text itself stays selectable */
  [G.leftEl,G.rightEl].forEach(el=>{el.addEventListener("pointermove",e=>{if(hd||e.buttons)return;const h=edgeAt(e);el.style.cursor=h&&!e.target.closest("button,a,input,textarea")?(h==="right"?"e-resize":"w-resize"):"";});
    el.addEventListener("pointerdown",e=>{if(e.target.closest("button,a,input,textarea,.opt,.vterm"))return;const sd=edgeAt(e);if(sd){hd={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,mode:"turn",side:sd};e.preventDefault();}});
    el.addEventListener("wheel",e=>{if(G.webOn||e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();zoomAt(e.clientX,e.clientY,Math.exp(Math.max(-60,Math.min(60,e.deltaY))*(e.ctrlKey?.012:.0016)));},{passive:false});});
  G.r.domElement.addEventListener("pointerup",e=>{if(!pd||Math.hypot(e.clientX-pd[0],e.clientY-pd[1])>6)return;if(G.closed){openBook();return;}const h=edgeHit(e);if(h)go(curSpread()+fwdFor(h));});
  $("#edgePrev").onclick=()=>go(curSpread()+fwdFor("left"));$("#edgeNext").onclick=()=>go(curSpread()+fwdFor("right"));
  // mouse wheel with Shift (or a horizontal trackpad swipe) turns pages; plain wheel still zooms
  let wl=0;G.r.domElement.addEventListener("wheel",e=>{const dx=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:(e.shiftKey?e.deltaY:0);if(!dx)return;e.preventDefault();e.stopImmediatePropagation();const now=performance.now();if(now-wl<700||Math.abs(dx)<12)return;wl=now;go(curSpread()+fwdFor(dx>0?"right":"left"));},{capture:true,passive:false});
  // swipe in compact reader
  let sx=null;$("#reader").addEventListener("touchstart",e=>{sx=e.touches[0].clientX;},{passive:true});$("#reader").addEventListener("touchend",e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>70&&!getSelection().toString())go(curSpread()+((dx<0)!==(isAR()&&S.vol==="gisp")?1:-1));sx=null;});
  $("#mSound").classList.toggle("on",S.sound);$("#mSound").setAttribute("aria-pressed",S.sound);$("#mTheme").classList.toggle("on",S.night);$("#mTheme").setAttribute("aria-pressed",S.night);$("#mRM").classList.toggle("on",S.rm);$("#mRM").setAttribute("aria-pressed",S.rm);
}

/* ---------- language ---------- */
const ORIG=new WeakMap();
function trNode(n){const raw=ORIG.has(n)?ORIG.get(n):n.nodeValue;const k=raw.trim();if(!k)return;let out=null;
  if(isAR()){if(AR_UI[k])out=AR_UI[k];else for(const [rx,rep] of AR_RX){if(rx.test(k)){out=k.replace(rx,rep);break;}}}
  if(out!=null){if(!ORIG.has(n))ORIG.set(n,raw);const v=raw.replace(k,out);if(n.nodeValue!==v)n.nodeValue=v;}else if(ORIG.has(n)&&!isAR()){if(n.nodeValue!==raw)n.nodeValue=raw;}}
const ATTRS=["aria-label","placeholder","title"];
function trEl(el){ATTRS.forEach(a=>{if(!el.hasAttribute||!el.hasAttribute(a))return;const key="data-en-"+a;const raw=el.getAttribute(key)??el.getAttribute(a);const out=isAR()?AR_UI[raw]||AR_A[raw]:null;if(out){if(!el.hasAttribute(key))el.setAttribute(key,raw);if(el.getAttribute(a)!==out)el.setAttribute(a,out);}else if(el.hasAttribute(key)&&!isAR()){el.setAttribute(a,raw);}});}
const AR_A={"Library tools":"أدوات المكتبة","Book controls":"أدوات الكتاب","Table of contents":"المحتويات","Previous page":"الصفحة السابقة","Next page":"الصفحة التالية","Watch demo":"شاهد العرض","Pause demo":"إيقاف العرض","Bookmark this page":"أضف إشارة لهذه الصفحة","Reset camera view":"إعادة ضبط المنظر","More settings":"إعدادات إضافية","Sound":"الصوت","Night desk theme":"مكتب ليلي","Reduced motion":"تقليل الحركة","Zoom in":"تكبير","Zoom out":"تصغير","Fullscreen":"ملء الشاشة","Read page aloud":"اقرأ الصفحة بصوت عالٍ","Close panel":"إغلاق اللوحة","Close":"إغلاق","Reading view":"وضع القراءة","Ask the tutor":"اسأل المعلّم","Ask about this page…":"اسأل عن هذه الصفحة…","Your note…":"ملاحظتك…","Yellow highlight":"تظليل أصفر","Green highlight":"تظليل أخضر","Blue highlight":"تظليل أزرق","Add a note":"أضف ملاحظة","Read selection aloud":"اقرأ التحديد","Explain with AI":"اشرح بالذكاء الاصطناعي","Make a flashcard":"اصنع بطاقة","Flip card":"اقلب البطاقة","Selection tools":"أدوات التحديد","Settings":"الإعدادات","Exam centre":"مركز الاختبارات","Flashcards":"البطاقات","Notes and highlights":"الملاحظات والتظليل","AI tutor":"المعلّم الذكي","Progress and plan":"التقدّم والخطة","Library":"المكتبة","Filter rows":"تصفية","Listen to this page":"استمع إلى الصفحة","Web page view":"عرض صفحة الويب","Back to the 3D book":"العودة إلى الكتاب ثلاثي الأبعاد","Reading speed":"سرعة القراءة","Stop reading":"إيقاف القراءة","Pause":"إيقاف مؤقت","Previous page":"الصفحة السابقة","Next page":"الصفحة التالية","Figure explorer":"مستكشف المجسّمات","Switch to 2D view":"التبديل إلى منظر 2D","Switch to 3D view":"التبديل إلى منظر 3D","Viewing angles":"زوايا الرؤية","Projection":"الإسقاط","Figures":"المجسّمات"};
const CHROME="#topbar,#hud,#more,#views,#listenBar,#sign,#openHint,.sign-inline,#drawer,#sheet,#reader .grab,#toast,#loader,#caption,#seltb";
function trAll(root){const roots=root?[root]:$$(CHROME);roots.forEach(r=>{if(!r)return;const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.parentElement&&n.parentElement.closest(".qt,.qo,.fc,.msg,.note q,.vol .cover b,input,textarea"))continue;trNode(n);}[r,...r.querySelectorAll("*")].forEach(trEl);});}
let trBusy=false;const MO=new MutationObserver(ms=>{if(trBusy||!isAR())return;trBusy=true;try{ms.forEach(m=>{const t=m.target.nodeType===3?m.target.parentElement:m.target;if(t&&t.closest&&t.closest(CHROME))trAll(t.closest(CHROME));});}finally{trBusy=false;}});
function setLang(l){S.lang=l;save();const ar=l==="ar";document.documentElement.lang=ar?"ar":"en";document.documentElement.dir=ar?"rtl":"ltr";$("#langBtn").innerHTML=ar?'<span lang="en">EN</span>':'<span lang="ar">ع</span>';$("#langBtn").setAttribute("aria-label",ar?"Switch to English":"التبديل إلى العربية");$("#langBtn").title=ar?"Switch to English":"التبديل إلى العربية";
  trAll();stopWatch();clearDemo();renderSpread({reDemo:true});resetView();if(DRAWER)openDrawer(DRAWER);if(!$("#sheet").hidden){const t=$("#shT").textContent;closeSheet();}placeChrome();if(G.closed)closeBook(true);if(G.webOn)webJump();if(exploring()){setView("figure");markView();renderExplore();}toast(ar?"تم التبديل إلى العربية":"Switched to English");}

/* ---------- boot ---------- */
async function boot(){
  const bar=$("#ldbar"),msg=$("#ldmsg"),step=(p,m)=>{bar.style.width=p+"%";msg.textContent=m;};
  document.documentElement.dataset.rm=S.rm?"1":"0";document.documentElement.dataset.night=S.night?"1":"0";
  if(!window.THREE||!THREE.CSS3DRenderer||!THREE.OrbitControls||!window.gsap){step(100,"3D components could not load");$("#loader .box").insertAdjacentHTML("beforeend",`<p style="text-align:center">This view could not load the 3D book. Check your connection and reload.</p>`);return;}
  step(20,"Setting the type");try{await Promise.race([Promise.all(['600 46px "Crimson Pro"','400 25px "Source Serif 4"','500 15px "JetBrains Mono"','italic 600 46px "Crimson Pro"'].map(f=>document.fonts.load(f))),new Promise(r=>setTimeout(r,2500))]);}catch(e){}
  step(45,"Binding the book");
  try{initScene();}catch(e){console.error(e);step(100,"WebGL is unavailable");$("#loader .box").insertAdjacentHTML("beforeend",`<p style="text-align:center">This device or view can't start WebGL, which the 3D book needs.</p>`);return;}
  step(75,"Folding the pop-ups");
  if(S.vol!=="gisp"){DOC=await idbGet(S.vol);if(!DOC)S.vol="gisp";}
  wire();layoutMode();MO.observe(document.body,{subtree:true,childList:true,characterData:true});
  document.documentElement.lang=isAR()?"ar":"en";document.documentElement.dir=isAR()?"rtl":"ltr";$("#langBtn").innerHTML=isAR()?'<span lang="en">EN</span>':'<span lang="ar">ع</span>';
  renderSpread({reDemo:true});trAll();closeBook(true);
  step(100,"Ready");setTimeout(()=>$("#loader").classList.add("done"),250);
}
boot();
