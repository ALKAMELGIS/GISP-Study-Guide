/* ================= 3D BOOK ENGINE ================= */
const PW=1, PD=1.32, PAGE_Y=0.071, EL_W=600, EL_H=792;
const INK={navy:0x10233F,emerald:0x0E6B4F,teal:0x0F766E,gold:0xB08D3C,ivory:0xF3EEE2,red:0xB42318,ink:0x1C1A17,paper:0xF5F0E4,sky:0x6E9CC6};
const G={};               // engine state
const RM=()=>document.documentElement.dataset.rm==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches;

function mkCanvas(w,h){const c=document.createElement("canvas");c.width=w;c.height=h;return c;}
function rngF(seed){return()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}

/* ---- procedural textures ---- */
function paperBase(){
  if(G.paperBase) return G.paperBase;
  const c=mkCanvas(1024,1352),g=c.getContext("2d"),R=rngF(3);
  g.fillStyle="#F6F1E5";g.fillRect(0,0,1024,1352);
  for(let i=0;i<9000;i++){g.fillStyle=`rgba(${120+R()*60|0},${100+R()*50|0},${70+R()*40|0},${R()*.05})`;g.fillRect(R()*1024,R()*1352,R()*2+.5,R()*2+.5);}
  for(let i=0;i<260;i++){g.strokeStyle=`rgba(140,120,90,${R()*.06})`;g.lineWidth=.6;g.beginPath();const x=R()*1024,y=R()*1352;g.moveTo(x,y);g.quadraticCurveTo(x+R()*30-15,y+R()*30-15,x+R()*40-20,y+R()*40-20);g.stroke();}
  const vg=g.createRadialGradient(512,676,300,512,676,900);vg.addColorStop(0,"rgba(0,0,0,0)");vg.addColorStop(1,"rgba(120,95,55,.10)");g.fillStyle=vg;g.fillRect(0,0,1024,1352);
  G.paperBase=c;return c;
}
function woodTex(night){
  const c=mkCanvas(1024,1024),g=c.getContext("2d"),R=rngF(night?9:4);
  const base=night?["#3B2A20","#2C1F18","#4A3428"]:["#E2D6C2","#D6C7AE","#EBE1D0"];
  g.fillStyle=base[0];g.fillRect(0,0,1024,1024);
  for(let i=0;i<180;i++){const y=R()*1024,a=R()*12+4,f=R()*.01+.004,ph=R()*6;g.strokeStyle=base[1+(i%2)];g.globalAlpha=.25+R()*.35;g.lineWidth=R()*3+.5;g.beginPath();for(let x=0;x<=1024;x+=16){const yy=y+Math.sin(x*f+ph)*a+Math.sin(x*f*3.1)*a*.25;x?g.lineTo(x,yy):g.moveTo(x,yy);}g.stroke();}
  g.globalAlpha=1;for(let i=0;i<6;i++){const x=R()*1024,y=R()*1024;const rg=g.createRadialGradient(x,y,2,x,y,30+R()*30);rg.addColorStop(0,night?"rgba(20,12,8,.35)":"rgba(150,120,85,.25)");rg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=rg;g.fillRect(x-70,y-70,140,140);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,4);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;
}
function clothTex(){
  const c=mkCanvas(512,512),g=c.getContext("2d"),R=rngF(21);g.fillStyle="#1F4E8C";g.fillRect(0,0,512,512);
  for(let y=0;y<512;y+=2){g.fillStyle=`rgba(5,18,45,${.07+R()*.07})`;g.fillRect(0,y,512,1);}
  for(let x=0;x<512;x+=2){g.fillStyle=`rgba(170,200,240,${.03+R()*.05})`;g.fillRect(x,0,1,512);}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);t.encoding=THREE.sRGBEncoding;return t;
}
function edgeTex(){
  const c=mkCanvas(64,256),g=c.getContext("2d");g.fillStyle="#EDE6D6";g.fillRect(0,0,64,256);
  for(let y=0;y<256;y+=3){g.fillStyle=`rgba(120,105,80,${.18+Math.random()*.15})`;g.fillRect(0,y,64,1);}
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;
}
/* page canvas with real text for the WebGL page (seen while turning and in compact mode) */
function wrapText(g,text,x,y,maxW,lh,maxY){const words=String(text).split(/\s+/);let line="";for(const w of words){const t=line?line+" "+w:w;if(g.measureText(t).width>maxW&&line){if(y>maxY)return y;g.fillText(line,x,y);y+=lh;line=w;}else line=t;}if(line&&y<=maxY){g.fillText(line,x,y);y+=lh;}return y;}
function pageCanvas(spec){
  const c=mkCanvas(1024,1352),g=c.getContext("2d");g.drawImage(paperBase(),0,0);
  const L=spec.side==="left";const x0=L?92:80,maxW=1024-172,rtl=!!spec.rtl;
  const F=(kind,size)=>rtl?(kind==="d"?`700 ${size}px "Amiri", "Noto Naskh Arabic", serif`:kind==="m"?`500 ${size}px "IBM Plex Sans Arabic", "JetBrains Mono", sans-serif`:`400 ${size}px "Noto Naskh Arabic", "Amiri", serif`):(kind==="d"?`600 ${size}px "Crimson Pro", Georgia, serif`:kind==="m"?`500 ${size}px "JetBrains Mono", monospace`:`400 ${size}px "Source Serif 4", Georgia, serif`);
  const tx=rtl?x0+maxW:x0;if(rtl){g.direction="rtl";g.textAlign="right";}
  // gutter shading
  const gr=g.createLinearGradient(L?1024:0,0,L?880:144,0);gr.addColorStop(0,"rgba(90,70,40,.22)");gr.addColorStop(1,"rgba(90,70,40,0)");g.fillStyle=gr;g.fillRect(L?880:0,0,144,1352);
  g.fillStyle="#4F493F";g.font=F("m",rtl?22:19);
  if(spec.run){const a=rtl?spec.run[0]:spec.run[0].toUpperCase(),bb=rtl?spec.run[1]:spec.run[1].toUpperCase();g.fillText(a,tx,92);g.save();g.textAlign=rtl?"left":"right";g.fillText(bb,rtl?x0:x0+maxW,92);g.restore();g.fillStyle="rgba(28,26,23,.25)";g.fillRect(x0,106,maxW,1.5);}
  let y=170;
  if(spec.kicker){g.fillStyle="#6A5119";g.font=F("m",rtl?23:19);g.fillText(rtl?spec.kicker:spec.kicker.toUpperCase(),tx,y);y+=56;}
  if(spec.title){g.fillStyle="#151311";g.font=F("d",rtl?60:64);y=wrapText(g,spec.title,tx,y,maxW,rtl?76:64,400)+18;}
  if(spec.body){g.fillStyle="#26231F";g.font=F("b",rtl?28:26);for(const p of spec.body){y=wrapText(g,p,tx,y,maxW,rtl?46:38,1180)+16;if(y>1180)break;}}
  if(spec.figure){g.strokeStyle="rgba(16,35,63,.35)";g.setLineDash([10,8]);g.lineWidth=2;g.beginPath();g.ellipse(512,700,330,300,0,0,Math.PI*2);g.stroke();g.setLineDash([]);
    g.strokeStyle="rgba(16,35,63,.5)";g.lineWidth=2;[[150,330],[874,330],[150,1070],[874,1070]].forEach(([x,yy])=>{g.beginPath();g.moveTo(x-18,yy);g.lineTo(x+18,yy);g.moveTo(x,yy-18);g.lineTo(x,yy+18);g.stroke();g.beginPath();g.arc(x,yy,9,0,7);g.stroke();});
    g.fillStyle="#10233F";g.font=rtl?F("d",36):'italic 600 34px "Crimson Pro", Georgia, serif';const ft=spec.figure;g.fillText(ft,tx,1190);
    g.fillStyle="#4F493F";g.font=F("m",rtl?22:18);g.fillText(rtl?"مجسّم منبثق · اسحب لتدوير الكتاب · اضغط ▶ للمشاهدة":"POP-UP FIGURE · DRAG TO TURN · PRESS ▶ TO WATCH",tx,1232);}
  if(spec.folio){g.fillStyle="#4F493F";g.font=F("m",19);g.textAlign="center";g.fillText(spec.folio,512,1300);}
  return c;
}
function texFrom(c,flip){const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(flip){t.wrapS=THREE.RepeatWrapping;t.repeat.x=-1;t.offset.x=1;}return t;}
function inkLabel(text,opt={}){
  const ar=typeof isAR==="function"&&isAR();if(ar&&AR_LBL[text])text=AR_LBL[text];
  const T=THREE,c=mkCanvas(8,8),g=c.getContext("2d"),fs=opt.fs||46,font=ar?`700 ${fs}px "Amiri", "Noto Naskh Arabic", serif`:`${opt.italic===false?"":"italic "}600 ${fs}px "Crimson Pro", Georgia, serif`;g.font=font;
  const w=Math.ceil(g.measureText(text).width)+28;c.width=w;c.height=fs+22;g.font=font;g.textBaseline="middle";
  if(ar){g.direction="rtl";g.textAlign="right";}const lx=ar?w-14:14;g.lineWidth=8;g.strokeStyle="rgba(247,242,230,.95)";g.strokeText(text,lx,c.height/2+2);g.fillStyle=opt.color||"#10233F";g.fillText(text,lx,c.height/2+2);
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.minFilter=T.LinearFilter;
  const s=new T.Sprite(new T.SpriteMaterial({map:t,transparent:true,depthTest:opt.depth!==false?true:false}));const h=opt.h||.055;s.scale.set(h*w/c.height,h,1);s.renderOrder=opt.depth===false?20:5;return s;
}
function inked(mesh,color=INK.ink,op=.55){const e=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry,25),new THREE.LineBasicMaterial({color,transparent:true,opacity:op}));mesh.add(e);return mesh;}
/* figure models: soft studio-lit, lightly glossy finish (like a museum specimen render) */
function studioEnv(){if(G.env)return G.env;const T=THREE,s=new T.Scene(),geo=new T.SphereGeometry(10,32,16),c=mkCanvas(16,256),x=c.getContext("2d"),gr=x.createLinearGradient(0,0,0,256);
  gr.addColorStop(0,"#ffffff");gr.addColorStop(.45,"#F3F1EC");gr.addColorStop(.55,"#D9D4CB");gr.addColorStop(1,"#8E877B");x.fillStyle=gr;x.fillRect(0,0,16,256);
  s.add(new T.Mesh(geo,new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.BackSide})));
  const box=(w,h,px,py,pz)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));m.position.set(px,py,pz);m.lookAt(0,0,0);s.add(m);};
  box(6,3,-4,6,3);box(4,2,5,4,-3);
  const pm=new T.PMREMGenerator(G.r);G.env=pm.fromScene(s,.02).texture;pm.dispose();return G.env;}
/* paper-cream parts of a figure become a soft porcelain blue so the model reads clearly against the white page */
function specimen(color){const c=new THREE.Color(color),hsl={};c.getHSL(hsl);if(hsl.l>.72&&hsl.s<.5){c.setHSL(.585,.5,Math.min(.74,.5+(hsl.l-.72)*1.0));}return c;}
function mat(color,o={}){const env=G.r?studioEnv():null;color=specimen(color);return new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.38,metalness:0,clearcoat:.4,clearcoatRoughness:.3,envMap:env,envMapIntensity:.4},o));}

/* ---- scene ---- */
function initScene(){
  const T=THREE,host=$("#scene");
  const r=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
  r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
  r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;host.prepend(r.domElement);
  const css=new T.CSS3DRenderer();$("#css3d").appendChild(css.domElement);css.domElement.style.pointerEvents="none";
  const scene=new T.Scene(),cssScene=new T.Scene();
  const cam=new T.PerspectiveCamera(32,1,.02,60);
  const ctl=new T.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.minDistance=.9;ctl.maxDistance=5.2;ctl.minPolarAngle=.05;ctl.maxPolarAngle=1.25;ctl.screenSpacePanning=true;ctl.addEventListener("start",()=>{ctl.autoRotate=false;G.orbitPending=false;G.fly=null;});
  const hemi=new T.HemisphereLight(0xFFF8EC,0xB9A88A,.62);scene.add(hemi);
  const sun=new T.DirectionalLight(0xFFF3DF,1.15);sun.position.set(-2.4,4.2,1.6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-2.4,right:2.4,top:2.4,bottom:-2.4,near:.5,far:12});sun.shadow.bias=-.0004;sun.shadow.radius=4;scene.add(sun);
  const lamp=new T.PointLight(0xFFC58A,0,6,2);lamp.position.set(1.8,1.6,-1.2);scene.add(lamp);
  // desk
  const desk=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshStandardMaterial({map:woodTex(false),roughness:.62,metalness:0}));desk.rotation.x=-Math.PI/2;desk.receiveShadow=true;scene.add(desk);
  Object.assign(G,{T,r,css,scene,cssScene,cam,ctl,hemi,sun,lamp,desk});
  buildBook();
  props();
  setTheme(document.documentElement.dataset.night==="1");
  const fit=()=>{if(G.webFig){webFigFit();return;}const w=innerWidth,h=innerHeight;r.setSize(w,h,false);r.domElement.style.width=w+"px";r.domElement.style.height=h+"px";css.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();layoutMode();};
  let rzT=0;window.addEventListener("resize",()=>{fit();clearTimeout(rzT);rzT=setTimeout(()=>{if(!G.webOn&&!G.readMode&&(!G.view||G.view==="book"))resetView(true);},180);});fit();resetView(true);
  let last=performance.now();
  const loop=now=>{const dt=Math.min(.05,(now-last)/1000);last=now;if(G.webOn){if(G.webFig&&!document.hidden){if(G.fly){const f=G.fly,k=1-Math.pow(.015,dt);cam.position.lerp(f.p,k);ctl.target.lerp(f.t,k);f.time-=dt;if(f.time<=0)G.fly=null;}ctl.update();if(G.demo&&G.demo.tick)try{G.demo.tick(dt,now/1000);}catch(e){}fxTick(dt);if(G.demo&&!RM()){const tt=now/1000;G.demo.group.rotation.y=.025*Math.sin(tt*.5);}r.render(scene,cam);}requestAnimationFrame(loop);return;}
    if(G.fly){const f=G.fly,k=1-Math.pow(.015,dt);cam.position.lerp(f.p,k);ctl.target.lerp(f.t,k);f.time-=dt;if(f.time<=0)G.fly=null;}
    if(G.orbitPending&&!G.fly){G.orbitPending=false;ctl.autoRotate=!RM();ctl.autoRotateSpeed=1.4;}
    const tg=ctl.target;tg.x=Math.max(-1.6,Math.min(1.6,tg.x));tg.z=Math.max(-1.2,Math.min(1.2,tg.z));tg.y=Math.max(-.1,Math.min(.8,tg.y));
    ctl.update();
    if(G.demo&&G.demo.tick)try{G.demo.tick(dt,now/1000);}catch(e){console.error(e);}
    if(G.ambient)G.ambient(dt,now/1000);if(G.steam)G.steam(dt,now/1000);fxTick(dt);
    if(G.demo&&!RM()){const tt=now/1000;G.demo.group.position.y=.006*Math.sin(tt*1.3);G.demo.group.rotation.y=.025*Math.sin(tt*.5);}
    r.render(scene,cam);css.render(cssScene,cam);requestAnimationFrame(loop);};
  requestAnimationFrame(loop);
}
function softShadow(w,h,op){const c=mkCanvas(256,256),x=c.getContext("2d"),gr=x.createRadialGradient(128,128,20,128,128,128);gr.addColorStop(0,`rgba(40,28,12,${op})`);gr.addColorStop(1,"rgba(40,28,12,0)");x.fillStyle=gr;x.fillRect(0,0,256,256);const t=new THREE.CanvasTexture(c);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.001;return m;}
function props(){
  const T=THREE,g=new T.Group();
  g.add(softShadow(3.0,2.2,.38));
  // coffee cup + saucer with rising steam
  const cup=new T.Group(),pts=[[0,0],[.075,0],[.085,.01],[.1,.13],[.104,.14],[.098,.14],[.092,.135]].map(p=>new T.Vector2(p[0],p[1]));
  const cm=new T.Mesh(new T.LatheGeometry(pts,40),new T.MeshStandardMaterial({color:0xF7F4EE,roughness:.35,side:T.DoubleSide}));cup.add(cm);
  const cof=new T.Mesh(new T.CircleGeometry(.093,32),new T.MeshStandardMaterial({color:0x3B2416,roughness:.2}));cof.rotation.x=-Math.PI/2;cof.position.y=.118;cup.add(cof);
  const hd=new T.Mesh(new T.TorusGeometry(.035,.009,10,24,Math.PI*1.3),new T.MeshStandardMaterial({color:0xF7F4EE,roughness:.35}));hd.position.set(.108,.07,0);hd.rotation.z=-Math.PI*.65;cup.add(hd);
  const sau=new T.Mesh(new T.CylinderGeometry(.16,.12,.014,40),new T.MeshStandardMaterial({color:0xF2EEE6,roughness:.4}));sau.position.y=-.007;cup.add(sau);
  cup.position.set(1.5,.014,-.55);cup.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.add(cup);const cs=softShadow(.5,.5,.3);cs.position.set(1.5,.0012,-.55);g.add(cs);
  const sc=mkCanvas(64,64),sx=sc.getContext("2d"),sg=sx.createRadialGradient(32,32,2,32,32,30);sg.addColorStop(0,"rgba(255,255,255,.55)");sg.addColorStop(1,"rgba(255,255,255,0)");sx.fillStyle=sg;sx.fillRect(0,0,64,64);const st=new T.CanvasTexture(sc);
  const puffs=[];for(let i=0;i<10;i++){const s=new T.Sprite(new T.SpriteMaterial({map:st,transparent:true,depthWrite:false,opacity:0}));s.userData.ph=i/10;cup.add(s);puffs.push(s);}
  G.steam=(dt,t)=>{puffs.forEach(s=>{const p=(t*.18+s.userData.ph)%1;s.position.set(Math.sin(t*1.3+s.userData.ph*9)*.02*p,.13+p*.42,Math.cos(t+s.userData.ph*7)*.015*p);const k=.05+p*.16;s.scale.set(k,k,1);s.material.opacity=Math.sin(p*Math.PI)*.45*(document.documentElement.dataset.night==="1"?.6:1);});};
  // pencil
  const pen=new T.Group();const body=new T.Mesh(new T.CylinderGeometry(.018,.018,.62,6),mat(0x1F4E9C,{roughness:.5}));body.rotation.z=Math.PI/2;pen.add(body);
  const tip=new T.Mesh(new T.ConeGeometry(.018,.06,6),mat(0xE7CFA3));tip.rotation.z=-Math.PI/2;tip.position.x=.34;pen.add(tip);
  const lead=new T.Mesh(new T.ConeGeometry(.006,.02,6),mat(0x222222));lead.rotation.z=-Math.PI/2;lead.position.x=.375;pen.add(lead);
  const band=new T.Mesh(new T.CylinderGeometry(.019,.019,.04,12),mat(0xB08D3C,{metalness:.6,roughness:.3}));band.rotation.z=Math.PI/2;band.position.x=-.3;pen.add(band);
  pen.position.set(1.42,.018,.62);pen.rotation.y=.5;pen.traverse(o=>{if(o.isMesh){o.castShadow=true;}});g.add(pen);
  // closed notebook (navy)
  const nb=new T.Mesh(new T.BoxGeometry(.62,.035,.84),mat(INK.navy,{roughness:.7}));nb.position.set(-1.62,.0175,-.55);nb.rotation.y=.18;nb.castShadow=true;nb.receiveShadow=true;g.add(nb);
  const el=new T.Mesh(new T.BoxGeometry(.012,.036,.84),mat(0x9C7A2E,{metalness:.4,roughness:.4}));el.position.set(-1.62+.24,.018,-.55);el.rotation.y=.18;g.add(el);
  G.scene.add(g);
}
/* front cover artwork: blue book-cloth with gold-foil title (drawn for the outside face of a board) */
function coverArt(ar){const W=1050,H=1390,c=mkCanvas(W,H),g=c.getContext("2d"),R=rngF(ar?7:3);
  g.fillStyle="#1F4E8C";g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=2){g.fillStyle=`rgba(5,18,45,${.07+R()*.07})`;g.fillRect(0,y,W,1);}
  for(let x=0;x<W;x+=2){g.fillStyle=`rgba(170,200,240,${.03+R()*.05})`;g.fillRect(x,0,1,H);}
  const vg=g.createRadialGradient(W/2,H*.42,80,W/2,H/2,H*.75);vg.addColorStop(0,"rgba(255,255,255,.07)");vg.addColorStop(1,"rgba(0,0,20,.28)");g.fillStyle=vg;g.fillRect(0,0,W,H);
  const gold=(y0,y1)=>{const gr=g.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,"#F6E2A2");gr.addColorStop(.5,"#C99A3B");gr.addColorStop(1,"#E9CC7A");return gr;};
  g.strokeStyle=gold(0,H);g.lineWidth=4;g.strokeRect(54,54,W-108,H-108);g.lineWidth=1.5;g.strokeRect(70,70,W-140,H-140);
  // corner ornaments
  g.fillStyle=gold(0,H);[[70,70],[W-70,70],[70,H-70],[W-70,H-70]].forEach(([x,y])=>{g.save();g.translate(x,y);g.rotate(Math.PI/4);g.fillRect(-9,-9,18,18);g.restore();});
  // globe emblem
  const cx=W/2,cy=H*.33,r=150;g.strokeStyle=gold(cy-r,cy+r);g.lineWidth=5;g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.lineWidth=2.5;
  for(let k=1;k<4;k++){g.beginPath();g.ellipse(cx,cy,r*k/4,r,0,0,7);g.stroke();}
  [-.66,-.33,0,.33,.66].forEach(f=>{const yy=cy+f*r,hw=Math.sqrt(1-f*f)*r;g.beginPath();g.moveTo(cx-hw,yy);g.lineTo(cx+hw,yy);g.stroke();});
  g.lineWidth=3;g.beginPath();g.ellipse(cx,cy,r*1.32,r*.42,-.35,0,7);g.stroke();
  g.textAlign="center";g.textBaseline="alphabetic";
  const txt=(s,font,y,ls)=>{g.font=font;g.fillStyle="rgba(0,0,0,.35)";g.fillText(s,cx+2,y+3);g.fillStyle=gold(y-120,y+10);g.fillText(s,cx,y);};
  if(ar){g.direction="rtl";
    txt("GISP",'600 190px "Crimson Pro",Georgia,serif',H*.66,0);
    txt("الكتاب التفاعلي ثلاثي الأبعاد",'700 50px "Amiri","Noto Naskh Arabic",serif',H*.735);
    g.fillStyle=gold(0,H);g.fillRect(cx-90,H*.765,180,3);
    txt("اختبار المعرفة التقنية الأساسية في نظم المعلومات الجغرافية",'400 30px "Noto Naskh Arabic","Amiri",serif',H*.81);
    txt("محمد الكامل",'700 40px "Amiri","Noto Naskh Arabic",serif',H*.9);
  }else{
    txt("GISP",'600 190px "Crimson Pro",Georgia,serif',H*.66);
    txt("INTERACTIVE 3D STUDY BOOK",'500 34px "JetBrains Mono",monospace',H*.725);
    g.fillStyle=gold(0,H);g.fillRect(cx-90,H*.755,180,3);
    txt("Geospatial Core Technical Knowledge Exam",'italic 400 38px "Crimson Pro",Georgia,serif',H*.8);
    txt("MOHAMED ALKAMEL",'500 30px "JetBrains Mono",monospace',H*.9);
  }
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
function buildBook(){
  const T=THREE,book=new T.Group(),cloth=clothTex(),coverM=new T.MeshStandardMaterial({map:cloth,roughness:.82,color:0xffffff});
  const BT0=.05,HY=.016+BT0;   /* hinge height: top of a page block; turning one half by 180 degrees around it lays it exactly on the other */
  G.hingeL=new T.Group();G.hingeR=new T.Group();G.hingeL.position.set(0,HY,0);G.hingeR.position.set(0,HY,0);book.add(G.hingeL,G.hingeR);
  G.half=sx=>sx<0?G.hingeL:G.hingeR;
  const board=(sx)=>{const art=new T.MeshStandardMaterial({map:coverArt(sx>0),roughness:.7,metalness:.05});
    const m=new T.Mesh(new T.BoxGeometry(PW+.05,.016,PD+.07),[coverM,coverM,coverM,art,coverM,coverM]);m.position.set(sx*(PW/2+.03),.008-HY,0);m.castShadow=true;m.receiveShadow=true;
    /* the outside face (-y) is seen turned 180 degrees once the half is folded over, so turn the artwork to read upright */
    art.map.wrapS=art.map.wrapT=T.RepeatWrapping;art.map.repeat.set(-1,-1);art.map.offset.set(1,1);return m;};
  G.hingeL.add(board(-1));G.hingeR.add(board(1));
  /* rounded spine seen when the book is closed */
  G.spineClosed=[-1,1].map(s=>{const th=2*(.016+BT0)+.002,m=new T.Mesh(new T.CylinderGeometry(th/2,th/2,PD+.07,24,1,true,0,Math.PI),coverM);m.rotation.x=Math.PI/2;m.rotation.y=s>0?Math.PI:0;
    m.scale.x=.55;m.position.set(0,th/2-.001,0);m.visible=false;m.castShadow=true;book.add(m);return m;});
  const spine=new T.Mesh(new T.CylinderGeometry(.045,.045,PD+.07,20,1,true,Math.PI/2,Math.PI),new T.MeshStandardMaterial({map:cloth,roughness:.9,side:T.DoubleSide}));spine.rotation.x=Math.PI/2;spine.position.y=.02;book.add(spine);
  const eT=edgeTex(),paperM=new T.MeshStandardMaterial({color:0xF2ECDE,roughness:.95});
  const BT=.05;
  [-1,1].forEach(sx=>{const em=new T.MeshStandardMaterial({map:eT,roughness:.95});const blk=new T.Mesh(new T.BoxGeometry(PW-.01,BT,PD),[em,em,paperM,paperM,em,em]);blk.position.set(sx*(PW/2+.005),.016+BT/2-HY,0);blk.castShadow=true;blk.receiveShadow=true;G.half(sx).add(blk);});
  // curved page surfaces
  G.pages={};
  ["left","right"].forEach(side=>{const geo=new T.PlaneGeometry(PW,PD,48,1);geo.rotateX(-Math.PI/2);const P=geo.attributes.position;
    for(let i=0;i<P.count;i++){const x=P.getX(i)+PW/2,u=x/PW;const y=PAGE_Y-.016*Math.exp(-u*14)+.004*Math.sin(Math.PI*Math.min(1,u*1.2));P.setX(i,side==="right"?x:-x);P.setY(i,y);}
    if(side==="left"){const ix=geo.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i];ix[i]=ix[i+1];ix[i+1]=t;}}
    geo.computeVertexNormals();const m=new T.Mesh(geo,new T.MeshStandardMaterial({map:texFrom(pageCanvas({side}),side==="left"),roughness:.93}));m.receiveShadow=true;m.position.y=-HY;G.half(side==="left"?-1:1).add(m);G.pages[side]=m;});
  // ribbon
  const pts=[[.012,PAGE_Y+.002,-.62],[.016,PAGE_Y+.002,-.1],[.022,PAGE_Y+.002,.5],[.03,PAGE_Y-.004,.67],[.05,.03,.72],[.07,.002,.86],[.085,.001,.98]].map(p=>new T.Vector3(...p));
  const curve=new T.CatmullRomCurve3(pts),N=60,rw=.032,pos=[],idx=[];
  for(let i=0;i<=N;i++){const p=curve.getPoint(i/N);pos.push(p.x-rw/2,p.y,p.z,p.x+rw/2,p.y,p.z);if(i<N){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const rg=new T.BufferGeometry();rg.setAttribute("position",new T.Float32BufferAttribute(pos,3));rg.setIndex(idx);rg.computeVertexNormals();
  const rib=new T.Mesh(rg,new T.MeshStandardMaterial({color:0xC9A045,roughness:.45,metalness:.25,side:T.DoubleSide}));rib.castShadow=true;book.add(rib);G.ribbon=rib;
  // turning leaf
  const lg=new T.PlaneGeometry(PW,PD,40,1);lg.rotateX(-Math.PI/2);
  G.leafFront=new T.Mesh(lg,new T.MeshStandardMaterial({roughness:.93,side:T.FrontSide}));
  G.leafBack=new T.Mesh(lg,new T.MeshStandardMaterial({roughness:.93,side:T.BackSide}));
  [G.leafFront,G.leafBack].forEach(m=>{m.castShadow=true;m.visible=false;book.add(m);});
  G.leafGeo=lg;G.book=book;
  book.traverse(o=>{if(o.isMesh&&o!==G.pages.left&&o!==G.pages.right)o.castShadow=true;});
  G.scene.add(book);
  // CSS3D pages
  const s=PW/EL_W;
  G.leftEl=document.createElement("div");G.leftEl.className="page left";
  G.rightEl=document.createElement("div");G.rightEl.className="page right";
  G.leftObj=new T.CSS3DObject(G.leftEl);G.leftObj.rotation.x=-Math.PI/2;G.leftObj.scale.set(s,s,s);G.leftObj.position.set(-PW/2-.004,PAGE_Y+.0045,0);
  G.rightObj=new T.CSS3DObject(G.rightEl);G.rightObj.rotation.x=-Math.PI/2;G.rightObj.scale.set(s,s,s);G.rightObj.position.set(PW/2+.004,PAGE_Y+.0045,0);
  G.cssScene.add(G.leftObj,G.rightObj);
  G.demoRoot=new T.Group();G.demoRoot.position.set(PW/2,PAGE_Y,0);G.scene.add(G.demoRoot);
}
function setPageTex(side,spec){const m=G.pages[side];if(m.material.map)m.material.map.dispose();m.material.map=texFrom(pageCanvas(Object.assign({side},spec)),side==="left");m.material.needsUpdate=true;}

/* ---- page turn ---- */
function leafPose(t,dir){
  const P=G.leafGeo.attributes.position,N=40,du=PW/N,ease=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
  const th=dir>0?Math.PI*ease:Math.PI*(1-ease),bend=.55*Math.sin(Math.PI*t),lift=PAGE_Y+.006+.03*Math.sin(Math.PI*t);
  const xs=[0],ys=[lift];for(let s=1;s<=N;s++){const u=s/N,a=dir>0?th-bend*u:th+bend*u;xs.push(xs[s-1]+Math.cos(a)*du);ys.push(ys[s-1]+Math.sin(a)*du);}
  for(let i=0;i<P.count;i++){const s=Math.round((P.getX(i)+PW/2)/du);const k=Math.max(0,Math.min(N,s));P.setX(i,xs[k]);P.setY(i,ys[k]);}
  // keep original param in uv; restore x param base next frame
  P.needsUpdate=true;G.leafGeo.computeVertexNormals();G.leafGeo.computeBoundingSphere();
}
function resetLeafParam(){const P=G.leafGeo.attributes.position,N=40;for(let i=0;i<P.count;i++){const col=i%(N+1);P.setX(i,-PW/2+col*PW/N);}}
function turnPage(dir,frontSpec,backSpec,mid){
  return new Promise(res=>{
    const fF=G.leafFront.material,fB=G.leafBack.material;
    if(fF.map)fF.map.dispose();if(fB.map)fB.map.dispose();
    if(dir>0){fF.map=texFrom(pageCanvas(Object.assign({side:"right"},frontSpec)));fB.map=texFrom(pageCanvas(Object.assign({side:"left"},backSpec)),true);}else{fF.map=texFrom(pageCanvas(Object.assign({side:"right"},backSpec)));fB.map=texFrom(pageCanvas(Object.assign({side:"left"},frontSpec)),true);}fF.needsUpdate=fB.needsUpdate=true;
    sfx("flip");
    if(RM()){mid&&mid();res();return;}
    G.leafFront.visible=G.leafBack.visible=true;let called=false;const o={t:0};
    gsap.to(o,{t:1,duration:.95,ease:"none",onUpdate:()=>{resetLeafParam();leafPose(o.t,dir);if(!called&&o.t>.45){called=true;mid&&mid();}},onComplete:()=>{G.leafFront.visible=G.leafBack.visible=false;if(!called)mid&&mid();res();}});
  });
}

/* ---- camera ---- */
/* ---- responsive framing: fit a box of the book inside the screen area that no toolbar or panel covers ---- */
function freeRect(opts={}){const W=innerWidth,H=innerHeight,vis=e=>{if(!e)return null;const s=getComputedStyle(e);if(s.display==="none"||s.visibility==="hidden")return null;const r=e.getBoundingClientRect();return r.width>0&&r.height>0?r:null;};
  let top=8,bottom=H-8,left=10,right=W-10;
  const tools=vis(document.querySelector("#topbar .tools"));if(tools)top=Math.max(top,tools.bottom+10);
  const lows=["hud","sign","openHint","listenBar"].map(id=>vis(document.getElementById(id)));
  lows.forEach(r=>{if(r)bottom=Math.min(bottom,r.top-10);});
  if(G.compact&&!opts.closed){const rd=vis(document.getElementById("reader"));if(rd)bottom=Math.min(bottom,rd.top-6);}
  const ed=vis(document.getElementById("edgePrev"));if(ed){left=Math.max(left,ed.right+4);right=Math.min(right,W-(ed.right+4));}
  if(bottom-top<H*.3){top=8;bottom=H-8;}
  return{left,top,right,bottom,W,H};}
function fitBox(box,el,az=0){const cam=G.cam.clone();cam.aspect=G.cam.aspect;cam.updateProjectionMatrix();const fr=freeRect(box);
  const corners=[];for(const x of box.x)for(const y of box.y)for(const z of box.z)corners.push(new THREE.Vector3(x,y,z));
  const t=new THREE.Vector3((box.x[0]+box.x[1])/2,0,(box.z[0]+box.z[1])/2),dir=new THREE.Vector3(Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el));
  const proj=d=>{cam.position.copy(t).addScaledVector(dir,d);cam.lookAt(t);cam.updateMatrixWorld(true);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    corners.forEach(c=>{const v=c.clone().project(cam);if(v.z>1)v.x=v.y=9;const px=(v.x+1)/2*fr.W,py=(1-v.y)/2*fr.H;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py);});return[x0,y0,x1,y1];};
  const fits=r=>r[0]>=fr.left&&r[2]<=fr.right&&r[1]>=fr.top&&r[3]<=fr.bottom;
  let d=1;for(let it=0;it<3;it++){let lo=.2,hi=12;for(let k=0;k<26;k++){const m=(lo+hi)/2;if(fits(proj(m)))hi=m;else lo=m;}d=hi;
    const r=proj(d),cxp=(r[0]+r[2])/2,cyp=(r[1]+r[3])/2,ux=((fr.left+fr.right)/2-cxp),uy=((fr.top+fr.bottom)/2-cyp);
    const vh=2*d*Math.tan(cam.fov*Math.PI/360),pxw=vh/fr.H;t.x-=ux*pxw*Math.cos(az);t.z-=(uy*pxw)/Math.max(.35,Math.sin(el))*Math.cos(az)+ux*pxw*Math.sin(az)*0;}
  const p=t.clone().addScaledVector(dir,d);return{p:[p.x,p.y,p.z],t:[t.x,t.y,t.z]};}
function viewFor(kind){
  const cam=G.cam,vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*cam.aspect),fx=G.demoRoot?G.demoRoot.position.x:PW/2;
  if(kind==="demo"){const w=.95,d=Math.max(1.15,(w/2)/Math.tan(Math.min(hf,vf*1.3)/2)*1.15);return{p:[fx+.05,.25+d*.72,d*.72],t:[fx,.2,0]};}
  if(kind==="read"){const tx=G.leftObj?G.leftObj.position.x:-PW/2;return fitBox({x:[tx-PW/2-.01,tx+PW/2+.01],y:[PAGE_Y,PAGE_Y],z:[-PD/2,PD/2]},1.42);}
  /* the open spread fills the free screen area: nothing on screen covers the book */
  if(G.compact)return fitBox({x:[fx-PW/2-.02,fx+PW/2+.06],y:[0,.09],z:[-PD/2-.03,PD/2+.03]},.98);
  return fitBox({x:[-PW-.06,PW+.06],y:[0,.09],z:[-PD/2-.04,PD/2+.04]},1.12);
}
/* viewing-angle presets: same framing maths, different eye positions around the focus */
function fitDist(w,h,frac){const cam=G.cam,vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*cam.aspect*(frac||1));return Math.max((w/2)/Math.tan(hf/2),(h/2)/Math.tan(vf/2));}
function exploreFrac(){return G.compact?1:Math.max(.35,(innerWidth-600)/innerWidth);}
function viewPreset(kind){
  const fx=G.demoRoot?G.demoRoot.position.x:PW/2,tx=G.leftObj?G.leftObj.position.x:-PW/2;
  const fig=kind==="figure"||kind==="orbit"||document.body.classList.contains("exploring")&&kind!=="read"&&kind!=="book"&&kind!=="top";
  const cx=fig?fx:kind==="read"?tx:(G.compact?fx:0),w=fig?1.05:kind==="read"?PW*1.08:(G.compact?1.15:2.3),h=fig?.95:kind==="read"?PD*1.06:1.6;
  const ex=G.compact&&document.body.classList.contains("exploring"),ww=ex&&fig?.9:w;
  let v;
  if(G.is2D){const d=fitDist(ww,h,fig?exploreFrac():1)*1.08;v={p:[cx,d,.002],t:[cx,0,0]};}
  else{
    const d=fitDist(ww,h,fig?exploreFrac():1)*(fig?1.18:1.1),ty=fig?.12:0;
    const A={top:[0,1.5],front:[0,.4],side:[Math.PI/2,.5],iso:[Math.PI/4,.66],figure:[.18,.62],orbit:[.6,.6]}[kind];
    if(!A)return viewFor(kind);
    const [az,el]=A,r=Math.cos(el)*d;v={p:[cx+Math.sin(az)*r,ty+Math.sin(el)*d,Math.cos(az)*r],t:[cx,ty,0]};
  }
  /* phones: the explorer panels fill the lower half, so aim below-and-towards the camera to raise the figure into the open top area */
  if(ex){const dx=v.p[0]-v.t[0],dy=v.p[1]-v.t[1],dz=v.p[2]-v.t[2],hz=Math.hypot(dx,dz),d=Math.hypot(dx,dy,dz),sinEl=dy/d,s=.24*d*Math.tan(G.cam.fov*Math.PI/360)*2/Math.max(.45,sinEl);
    const ux=hz>.01?dx/hz:0,uz=hz>.01?dz/hz:1;v.t=[v.t[0]+ux*s,v.t[1],v.t[2]+uz*s];if(G.is2D||sinEl>.9)v.p=[v.p[0]+ux*s,v.p[1],v.p[2]+uz*s];}
  return v;
}
function setView(kind){
  G.view=kind;G.ctl.autoRotate=false;G.orbitPending=kind==="orbit";
  flyTo(G.is2D||["top","front","side","iso","figure","orbit"].includes(kind)?viewPreset(kind):viewFor(kind));
}
/* 2D plan: a very long lens straight overhead flattens perspective; 3D restores the reader's camera */
function set2D(on){
  const cam=G.cam,ctl=G.ctl;G.is2D=!!on;ctl.autoRotate=false;G.orbitPending=false;
  cam.fov=on?7:32;cam.near=on?.5:.02;cam.far=on?260:60;cam.updateProjectionMatrix();
  ctl.enableRotate=!on;ctl.minPolarAngle=on?0:.05;ctl.minDistance=on?4:.9;ctl.maxDistance=on?80:5.2;
  G.scene.fog=on?null:new THREE.Fog(G.scene.background.getHex(),5,13);
  const kind=G.view==="read"?"read":document.body.classList.contains("exploring")?"figure":"top";
  if(on)flyTo(viewPreset(kind),true);else setView(G.view&&G.view!=="top"?G.view:"book");
}
function flyTo(v,instant){if(instant||RM()){G.cam.position.set(...v.p);G.ctl.target.set(...v.t);G.fly=null;return;}G.fly={p:new THREE.Vector3(...v.p),t:new THREE.Vector3(...v.t),time:1.6};}
/* ---- the book opens and closes like a real hardcover ---- */
function viewClosed(){const x0=G.closedSide>0?-.06:-(PW+.08),x1=G.closedSide>0?PW+.08:.06;return fitBox({x:[x0,x1],y:[0,.15],z:[-PD/2-.04,PD/2+.04],closed:true},1.02);}
function closedSideNow(){return(typeof isAR==="function"&&isAR()&&(typeof S==="undefined"||S.vol==="gisp"))?-1:1;}
function setClosedVis(closed){if(G.spineClosed)G.spineClosed.forEach((m,i)=>m.visible=closed&&((i===0)===(G.closedSide>0)));document.body.classList.toggle("closed",closed);const v=closed?"hidden":"";if(G.leftEl)G.leftEl.style.visibility=v;if(G.rightEl)G.rightEl.style.visibility=v;
  if(G.demoRoot)G.demoRoot.visible=!closed;if(G.ribbon)G.ribbon.visible=!closed;}
function closeBook(instant){if(G.closed&&!instant)return Promise.resolve();
  gsap.killTweensOf([G.hingeL.rotation,G.hingeR.rotation]);G.closedSide=closedSideNow();const h=G.closedSide>0?G.hingeL:G.hingeR,target=G.closedSide>0?-Math.PI:Math.PI;G.hingeL.rotation.z=G.hingeR.rotation.z=0;
  G.closed=true;if(G.ctl)G.ctl.autoRotate=false;
  if(instant||RM()){h.rotation.z=target;setClosedVis(true);flyTo(viewClosed(),instant);return Promise.resolve();}
  if(G.leftEl)G.leftEl.style.visibility=G.rightEl.style.visibility="hidden";if(G.demoRoot)G.demoRoot.visible=false;if(G.ribbon)G.ribbon.visible=false;
  try{sfx("flip");}catch(e){}flyTo(viewClosed());
  return new Promise(res=>gsap.to(h.rotation,{z:target,duration:1.5,ease:"power2.inOut",onComplete:()=>{setClosedVis(true);res();}}));}
function openBook(){if(!G.closed)return Promise.resolve();gsap.killTweensOf([G.hingeL.rotation,G.hingeR.rotation]);const h=G.closedSide>0?G.hingeL:G.hingeR;G.closed=false;document.body.classList.remove("closed");if(G.spineClosed)G.spineClosed.forEach(m=>m.visible=false);
  try{sfx("flip");}catch(e){}
  const done=()=>{h.rotation.z=0;setClosedVis(false);if(typeof renderSpread==="function")renderSpread({reDemo:true});};
  if(RM()){done();resetView(true);return Promise.resolve();}
  flyTo(G.is2D?viewPreset("book"):viewFor("book"));
  return new Promise(res=>gsap.to(h.rotation,{z:0,duration:1.6,ease:"power2.inOut",onUpdate:()=>{if(Math.abs(h.rotation.z)<.35&&G.ribbon&&!G.ribbon.visible){G.ribbon.visible=true;}},onComplete:()=>{done();res();}}));}
function resetView(instant){if(G.closed){flyTo(viewClosed(),instant);return;}G.view="book";if(G.ctl)G.ctl.autoRotate=false;G.orbitPending=false;flyTo(G.is2D?viewPreset("book"):viewFor("book"),instant);}
function setTheme(night){
  const T=THREE;document.documentElement.dataset.night=night?"1":"0";
  if(G.desk.material.map)G.desk.material.map.dispose();G.desk.material.map=woodTex(night);G.desk.material.needsUpdate=true;
  const bg=night?0x0B111B:0xE9E5DD;G.scene.background=new T.Color(bg);G.scene.fog=G.is2D?null:new T.Fog(bg,5,13);
  G.hemi.intensity=night?.22:.62;G.sun.intensity=night?.35:1.15;G.sun.color.set(night?0x9DB4E0:0xFFF3DF);G.lamp.intensity=night?2.4:0;G.r.toneMappingExposure=night?1.2:1.05;
}

/* ================= POP-UP DEMOS ================= */
function popIn(group){group.scale.set(1,1,1);if(RM())return;group.traverse(o=>{});group.scale.set(.001,.001,.001);group.rotation.x=-1.1;gsap.to(group.scale,{x:1,y:1,z:1,duration:.9,ease:"back.out(1.4)"});gsap.to(group.rotation,{x:0,duration:1.1,ease:"power3.out"});}
function clearDemo(){if(G.demo){G.demoRoot.remove(G.demo.group);G.demo.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});});}G.demo=null;}
/* ---- web view: the same renderer is lent to one figure card at a time ---- */
function webFigFit(){const f=G.webFig;if(!f)return;const w=Math.max(200,f.stage.clientWidth),h=Math.max(200,f.stage.clientHeight);G.r.setSize(w,h,false);G.r.domElement.style.width=w+"px";G.r.domElement.style.height=h+"px";G.cam.aspect=w/h;G.cam.updateProjectionMatrix();}
function webFigView(instant){const cam=G.cam,vf=cam.fov*Math.PI/180,hf=2*Math.atan(Math.tan(vf/2)*cam.aspect),d=Math.max((cam.aspect<1.3?.46:.56)/Math.tan(hf/2),.42/Math.tan(vf/2)),el=.5,az=.35,ty=PAGE_Y+.16;
  flyTo({p:[Math.sin(az)*Math.cos(el)*d,ty+Math.sin(el)*d,Math.cos(az)*Math.cos(el)*d],t:[0,ty,0]},instant);}
function webFigMount(stage,key,step){const T=THREE;
  if(!G.webSave){G.webSave={vis:G.scene.children.map(o=>[o,o.visible]),bg:G.scene.background,fog:G.scene.fog,root:G.demoRoot.position.clone(),zoom:G.ctl.enableZoom,pan:G.ctl.enablePan,min:G.ctl.minDistance};
    G.scene.children.forEach(o=>{if(!o.isLight&&o!==G.demoRoot)o.visible=false;});
    if(!G.webGround){G.webGround=new T.Mesh(new T.PlaneGeometry(6,6),new T.ShadowMaterial({opacity:.16}));G.webGround.rotation.x=-Math.PI/2;G.webGround.position.y=PAGE_Y-.001;G.webGround.receiveShadow=true;G.scene.add(G.webGround);}
    G.webGround.visible=true;G.scene.fog=null;G.ctl.enableZoom=false;G.ctl.enablePan=false;G.ctl.minDistance=.4;G.ctl.autoRotate=false;}
  const night=document.documentElement.dataset.night==="1";G.scene.background=new T.Color(night?0x131D2C:0xF3EFE6);
  G.demoRoot.position.set(0,PAGE_Y,0);stage.appendChild(G.r.domElement);G.webFig={stage,key};webFigFit();showDemo(key,step||0);webFigView(true);}
function webFigUnmount(){if(!G.webSave)return;const s=G.webSave;s.vis.forEach(([o,v])=>o.visible=v);if(G.webGround)G.webGround.visible=false;G.scene.background=s.bg;G.scene.fog=s.fog;G.demoRoot.position.copy(s.root);
  G.ctl.enableZoom=s.zoom;G.ctl.enablePan=s.pan;G.ctl.minDistance=s.min;G.webSave=null;G.webFig=null;clearDemo();
  $("#scene").prepend(G.r.domElement);window.dispatchEvent(new Event("resize"));}
function showDemo(key,step){
  clearDemo();if(!key||!DEMOS[key])return;
  const d=DEMOS[key]();d.group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  /* keep every figure inside its page: scale tall or wide models down to fit */
  {const bx=new THREE.Box3().setFromObject(d.group),sz=bx.getSize(new THREE.Vector3()),k=Math.min(1,.86/Math.max(sz.x,sz.z,.01),.52/Math.max(bx.max.y,.01));G.demoRoot.scale.setScalar(k);}
  G.demoRoot.add(d.group);G.demo=d;G.demo.key=key;G.demo.step=-1;popIn(d.group);setDemoStep(step||0);
}
function setDemoStep(i){if(!G.demo)return;const n=G.demo.steps.length;i=Math.max(0,Math.min(n-1,i));const ch=G.demo.step!==i;G.demo.step=i;try{G.demo.steps[i]();}catch(e){console.error(e);}if(ch&&i>0)ripple(G.demoRoot.position.x,0);}
function sinkDemo(){return new Promise(res=>{if(!G.demo||RM()){res();return;}gsap.to(G.demo.group.scale,{x:.001,y:.001,z:.001,duration:.35,ease:"power2.in",onComplete:res});gsap.to(G.demo.group.rotation,{x:-1.1,duration:.35});});}

/* ---- demo helpers ---- */
function grat(r,step,col,op){const v=[],D=Math.PI/180,p=(la,lo)=>[r*Math.cos(la*D)*Math.sin(lo*D),r*Math.sin(la*D),r*Math.cos(la*D)*Math.cos(lo*D)];
  for(let la=-75;la<=75;la+=step)for(let lo=0;lo<360;lo+=4)v.push(...p(la,lo),...p(la,lo+4));
  for(let lo=0;lo<360;lo+=step)for(let la=-90;la<90;la+=4)v.push(...p(la,lo),...p(la+4,lo));
  const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(v,3));return new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:op}));}
function stand(h){const T=THREE,g=new T.Group();const base=new T.Mesh(new T.CylinderGeometry(.1,.12,.025,32),mat(INK.navy,{roughness:.5,metalness:.2}));base.position.y=.0125;g.add(inked(base,INK.gold,.6));const pole=new T.Mesh(new T.CylinderGeometry(.008,.008,h,10),mat(INK.gold,{metalness:.7,roughness:.3}));pole.position.y=h/2;g.add(pole);return g;}
function tweenTo(obj,props,d=.8){if(RM()){Object.assign(obj,props);return;}gsap.to(obj,Object.assign({duration:d,ease:"power2.inOut"},props));}
function fade(o,v,d=.6){o.traverse(c=>{if(c.material)[].concat(c.material).forEach(m=>{m.transparent=true;if(m.userData.base==null)m.userData.base=m.opacity;if(RM()){m.opacity=m.userData.base*v;}else gsap.to(m,{opacity:m.userData.base*v,duration:d});});});o.visible=true;if(v===0&&!RM())gsap.delayedCall(d,()=>{let z=true;o.traverse(c=>{if(c.material&&[].concat(c.material)[0].opacity>.01)z=false;});if(z)o.visible=false;});else if(v===0)o.visible=false;}
function hidden(o){o.traverse(c=>{if(c.material)[].concat(c.material).forEach(m=>{m.transparent=true;if(m.userData.base==null)m.userData.base=m.opacity;m.opacity=0;});});o.visible=false;return o;}
function flowParticles(curve,n,color,speed=.25){const T=THREE,pos=new Float32Array(n*3),g=new T.BufferGeometry();g.setAttribute("position",new T.BufferAttribute(pos,3));
  const p=new T.Points(g,new T.PointsMaterial({color,size:.022,transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false}));p.frustumCulled=false;
  const off=[...Array(n)].map((_,i)=>i/n);p.userData.tick=(dt)=>{for(let i=0;i<n;i++){off[i]=(off[i]+dt*speed)%1;const q=curve.getPoint(off[i]);pos.set([q.x,q.y,q.z],i*3);}g.attributes.position.needsUpdate=true;};return p;}
function lineOf(pts,color,op=1,w){const g=new THREE.BufferGeometry().setFromPoints(pts);return new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:op<1,opacity:op}));}
/* ---- a real Earth: Blue Marble imagery, relief shading and a soft atmosphere ---- */
function earthTex(){if(G.earthTex)return G.earthTex;const L=new THREE.TextureLoader(),m=L.load(EARTH_IMG),bm=L.load(EARTH_BUMP);m.encoding=THREE.sRGBEncoding;m.anisotropy=8;bm.anisotropy=4;G.earthTex={m,bm};return G.earthTex;}
function earthImg(cb){if(G.earthImgEl){if(G.earthImgEl.complete)cb(G.earthImgEl);else G.earthImgEl.addEventListener("load",()=>cb(G.earthImgEl));return;}const im=new Image();im.onload=()=>cb(im);im.src=EARTH_IMG;G.earthImgEl=im;}
function earth(R,o={}){const T=THREE,g=new T.Group(),tx=earthTex();
  const globe=new T.Mesh(new T.SphereGeometry(R,96,64),new T.MeshStandardMaterial({map:tx.m,bumpMap:tx.bm,bumpScale:R*.012,roughness:.62,metalness:0,color:new T.Color(1.22,1.22,1.25)}));
  globe.rotation.y=-Math.PI/2;globe.castShadow=true;g.add(globe);
  /* atmosphere: a back-facing shell that glows at the limb */
  const atm=new T.Mesh(new T.SphereGeometry(R*(o.halo||1.13),64,32),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.BackSide,
    uniforms:{c:{value:new T.Color(0x5AA2F0)},p:{value:o.glow||1.0}},
    vertexShader:"varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader:"uniform vec3 c;uniform float p;varying vec3 vN;varying vec3 vV;void main(){float f=pow(clamp(-dot(vN,vV),0.,1.),1.6)*p;gl_FragColor=vec4(c,clamp(f*.95,0.,.6));}"}));
  g.add(atm);
  /* thin bright rim on the day side for a photographic look */
  const rim=new T.Mesh(new T.SphereGeometry(R*1.004,64,32),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
    vertexShader:"varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}",
    fragmentShader:"varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-max(dot(vN,vV),0.),3.)*.28;gl_FragColor=vec4(vec3(.55,.78,1.)*f,f);}"}));
  g.add(rim);g.userData.globe=globe;return g;}
const LL=(la,lo,r)=>{const D=Math.PI/180;return new THREE.Vector3(r*Math.cos(la*D)*Math.sin(lo*D),r*Math.sin(la*D),r*Math.cos(la*D)*Math.cos(lo*D));};

const DEMOS={};
/* globe & CRS */
DEMOS.globe=()=>{const T=THREE,g=new T.Group(),R=.27;g.add(stand(.36));
  const gl=new T.Group();gl.position.y=.4;g.add(gl);
  gl.add(earth(R));
  const cage=new T.Group();cage.position.y=.4;g.add(cage);const gr=grat(R*1.045,15,INK.navy,.55);cage.add(gr);
  const eq=new T.Mesh(new T.TorusGeometry(R*1.01,.0035,8,128),mat(INK.gold,{metalness:.5,roughness:.35}));eq.rotation.x=Math.PI/2;gl.add(eq);
  const pm=new T.Mesh(new T.TorusGeometry(R*1.01,.0035,8,128,Math.PI),mat(INK.gold,{metalness:.5,roughness:.35}));pm.rotation.z=Math.PI/2;pm.rotation.y=-Math.PI/2;gl.add(pm);
  const o1=hidden(new T.Group());o1.add(eq.clone(),pm.clone());[["Equator 0°",new T.Vector3(R*1.05,0,.06)],["Prime meridian 0°",new T.Vector3(0,R*.62,R*.92)]].forEach(([t,p])=>{const s=inkLabel(t,{color:"#7A5E1F",h:.042});s.position.copy(p);o1.add(s);});gl.add(o1);
  const pt=new T.Group(),pd=LL(25.2,55.3,R*1.01);const m=new T.Mesh(new T.SphereGeometry(.012,16,8),mat(INK.red));m.position.copy(pd);pt.add(m);
  const arcLat=[],arcLon=[];for(let i=0;i<=40;i++){arcLat.push(LL(25.2,55.3*i/40,R*1.012));arcLon.push(LL(25.2*i/40,55.3,R*1.012));}
  pt.add(lineOf(arcLat,INK.red),lineOf(arcLon,INK.red),lineOf([new T.Vector3(),pd],INK.red,.6));
  const lb=inkLabel("Dubai · 25.2°N 55.3°E",{color:"#B42318",h:.045});lb.position.copy(pd.clone().multiplyScalar(1.35));pt.add(lb);gl.add(hidden(pt));
  const zg=new T.Group();const D=Math.PI/180;const band=new T.Mesh(new T.SphereGeometry(R*1.006,6,40,(54)*D+Math.PI/2,6*D),new T.MeshStandardMaterial({color:INK.emerald,transparent:true,opacity:.55,side:T.DoubleSide}));zg.add(band);
  const zl=inkLabel("UTM zone 40 · 54°–60°E · metres",{color:"#0E6B4F",h:.042});zl.position.copy(LL(-10,57,R*1.45));zg.add(zl);gl.add(hidden(zg));
  let spin=true,targetY=null;
  return{group:g,steps:[()=>{spin=true;fade(o1,0);fade(pt,0);fade(zg,0);},()=>{spin=true;fade(o1,1);fade(pt,0);fade(zg,0);},()=>{spin=false;targetY=-55.3*D;fade(o1,.5);fade(pt,1);fade(zg,0);},()=>{spin=false;targetY=-57*D;fade(o1,.3);fade(pt,1);fade(zg,1);}],
    tick(dt){if(!RM())cage.rotation.y-=dt*.04;if(spin&&!RM())gl.rotation.y+=dt*.25;else if(targetY!=null){let d=targetY-gl.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));gl.rotation.y+=d*Math.min(1,dt*3);}}};};
/* hero (front matter) */
DEMOS.hero=()=>{const T=THREE,g=new T.Group(),R=.24;g.add(stand(.38));const gl=new T.Group();gl.position.y=.42;g.add(gl);
  gl.add(earth(R));const cage=new T.Group();cage.position.y=.42;g.add(cage);cage.add(grat(R*1.05,15,INK.navy,.55));
  const sats=[];[[.36,.4,INK.gold],[.42,-.6,INK.teal],[.48,1.1,INK.navy]].forEach(([r,tilt,c],i)=>{const o=new T.Group();o.rotation.x=tilt;o.rotation.z=i*.7;o.position.y=.42;g.add(o);const ring=new T.Mesh(new T.TorusGeometry(r,.0018,6,120),new T.MeshBasicMaterial({color:c,transparent:true,opacity:.5}));ring.rotation.x=Math.PI/2;o.add(ring);const s=new T.Mesh(new T.OctahedronGeometry(.018),mat(c,{metalness:.4,roughness:.3}));o.add(s);sats.push([s,r,.5+i*.2]);});
  return{group:g,steps:[()=>{}],tick(dt,t){if(!RM()){gl.rotation.y+=dt*.2;cage.rotation.y-=dt*.035;}sats.forEach(([s,r,sp],i)=>{const a=t*sp+i*2;s.position.set(Math.cos(a)*r,0,Math.sin(a)*r);});}};};
/* projections */
DEMOS.proj=()=>{const T=THREE,g=new T.Group(),NL=72,NB=36,D=Math.PI/180,la0=-88*D,la1=88*D;
  const cv=mkCanvas(1024,512),c=cv.getContext("2d");c.fillStyle="#F3EEE2";c.fillRect(0,0,1024,512);const X=lo=>(lo+180)/360*1024,Y=la=>(88-la)/176*512;
  c.lineWidth=1.5;for(let lo=-180;lo<=180;lo+=15){c.strokeStyle=lo===0?"#9C7A2E":"rgba(16,35,63,.35)";c.beginPath();c.moveTo(X(lo),0);c.lineTo(X(lo),512);c.stroke();}
  for(let la=-75;la<=75;la+=15){c.strokeStyle=la===0?"#9C7A2E":"rgba(16,35,63,.35)";c.beginPath();c.moveTo(0,Y(la));c.lineTo(1024,Y(la));c.stroke();}
  for(let la=-60;la<=60;la+=30)for(let lo=-150;lo<=150;lo+=30){c.beginPath();c.ellipse(X(lo),Y(la),7/Math.cos(la*D)*1024/360,7*512/176,0,0,7);c.fillStyle="rgba(176,141,60,.45)";c.fill();c.strokeStyle="#7A5E1F";c.stroke();}
  const tex=new T.CanvasTexture(cv);tex.encoding=T.sRGBEncoding;tex.anisotropy=8;
  const overlay=()=>{c.lineWidth=1.6;for(let lo=-180;lo<=180;lo+=15){c.strokeStyle=lo===0?"rgba(246,226,162,.95)":"rgba(255,255,255,.42)";c.beginPath();c.moveTo(X(lo),0);c.lineTo(X(lo),512);c.stroke();}
    for(let la=-75;la<=75;la+=15){c.strokeStyle=la===0?"rgba(246,226,162,.95)":"rgba(255,255,255,.42)";c.beginPath();c.moveTo(0,Y(la));c.lineTo(1024,Y(la));c.stroke();}
    for(let la=-60;la<=60;la+=30)for(let lo=-150;lo<=150;lo+=30){c.beginPath();c.ellipse(X(lo),Y(la),7/Math.cos(la*D)*1024/360,7*512/176,0,0,7);c.fillStyle="rgba(246,200,90,.32)";c.fill();c.strokeStyle="rgba(255,236,170,.85)";c.lineWidth=1.2;c.stroke();}};
  earthImg(im=>{c.drawImage(im,0,im.height*2/180,im.width,im.height*176/180,0,0,1024,512);overlay();tex.needsUpdate=true;});
  const pos=[],uv=[],idx=[],ll=[];for(let j=0;j<=NB;j++)for(let i=0;i<=NL;i++){ll.push([-Math.PI+2*Math.PI*i/NL,la0+(la1-la0)*j/NB]);uv.push(i/NL,j/NB);pos.push(0,0,0);}
  for(let j=0;j<NB;j++)for(let i=0;i<NL;i++){const a=j*(NL+1)+i,b=a+1,c2=a+NL+1,d=c2+1;idx.push(a,b,d,a,d,c2);}
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(pos,3));geo.setAttribute("uv",new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);
  const S=.24,merc=p=>{const q=Math.max(-82*D,Math.min(82*D,p));return Math.log(Math.tan(Math.PI/4+q/2));};
  const shapes={globe:(l,p)=>[S*Math.cos(p)*Math.sin(l),S*Math.sin(p),S*Math.cos(p)*Math.cos(l)],cyl:(l,p)=>[S*Math.sin(l),S*.42*merc(p),S*Math.cos(l)],merc:(l,p)=>[S*.42*l,S*.42*merc(p),0],ea:(l,p)=>[S*.42*l,S*.42*Math.sin(p)*1.15,0],cone:(l,p)=>{const rho=(Math.PI/2-p)*S*.44+S*.16,th=.55*l;return[rho*Math.sin(th),S*1.05-rho*Math.cos(th),0];},azi:(l,p)=>{const rho=(Math.PI/2-p)*S*.31;return[rho*Math.sin(l),-rho*Math.cos(l),0];}};
  const arr={};for(const k in shapes){const a=new Float32Array(ll.length*3);ll.forEach(([l,p],i)=>a.set(shapes[k](l,p),i*3));arr[k]=a;}
  geo.attributes.position.array.set(arr.globe);geo.computeVertexNormals();
  const mesh=new T.Mesh(geo,new T.MeshStandardMaterial({map:tex,side:T.DoubleSide,roughness:.9}));mesh.frustumCulled=false;const holder=new T.Group();holder.position.y=.36;holder.add(mesh);g.add(holder);g.add(stand(.12));
  const ghost=hidden(new T.Mesh(new T.CylinderGeometry(S*1.03,S*1.03,S*2.1,40,1,true),new T.MeshBasicMaterial({color:INK.teal,wireframe:true,transparent:true,opacity:.35})));holder.add(ghost);
  const labH=new T.Group();labH.position.set(0,.68,0);g.add(labH);
  const cur=geo.attributes.position.array;let tgt=arr.globe,tilt=0;
  const top={};for(const k in arr){let m=-1;for(let i=1;i<arr[k].length;i+=3)m=Math.max(m,arr[k][i]);top[k]=m;}
  /* the caption floats just above whatever shape the Earth has become, with the projection's key property underneath */
  const set=(k,t,gh,til,sub)=>()=>{tgt=arr[k];fade(ghost,gh?1:0);tilt=til;while(labH.children.length){const o=labH.children[0];labH.remove(o);o.material.map.dispose();o.material.dispose();}
    const y=.36+top[k]*Math.cos(til)+.1;labH.position.set(0,y+.05,til?-top[k]*Math.sin(-til)*.9:0);labH.add(inkLabel(t,{h:.05}));if(sub){const s=inkLabel(sub,{h:.034,color:"#7A5E1F"});s.position.y=-.05;labH.add(s);}};
  return{group:g,steps:[set("globe","Globe · all circles equal",0,0,"no distortion: every Tissot circle is the same"),set("cyl","Wrapped on a cylinder",1,0,"touches the globe along the equator"),set("merc","Mercator · conformal",0,-.55,"shapes kept · areas swell toward the poles"),set("ea","Equal-area cylindrical",0,-.55,"areas kept · shapes squashed near the poles"),set("cone","Conic",0,-.55,"true along the standard parallel · mid-latitudes"),set("azi","Azimuthal (polar)",0,-.55,"true at the pole · distortion grows outward")],
    tick(dt){const k=1-Math.pow(.004,dt);let mv=false;for(let i=0;i<cur.length;i++){const d=tgt[i]-cur[i];if(Math.abs(d)>1e-5){cur[i]+=d*k;mv=true;}}if(mv){geo.attributes.position.needsUpdate=true;geo.computeVertexNormals();}holder.rotation.x+=(tilt-holder.rotation.x)*Math.min(1,dt*3);if(tgt===arr.globe&&!RM())holder.rotation.y+=dt*.25;else holder.rotation.y+=(0-holder.rotation.y)*Math.min(1,dt*3);}};};
/* earth models */
DEMOS.earth=()=>{const T=THREE,g=new T.Group(),R=.25,FL=.8;g.add(stand(.36));const h=new T.Group();h.position.y=.4;g.add(h);
  const geo=new T.SphereGeometry(R,96,48),P=geo.attributes.position,n=P.count,base=P.array.slice();
  const und=(x,y,z)=>.55*Math.sin(3*x/R+1)*Math.cos(2*y/R)+.35*Math.sin(4*z/R-1.3)*Math.cos(3*x/R)+.25*Math.sin(5*y/R+2*z/R);
  const sph=Float32Array.from(base),ell=Float32Array.from(base),gd=Float32Array.from(base),cB=new Float32Array(n*3),cG=new Float32Array(n*3),cb=new T.Color(1,1,1);
  const ramp=(t)=>{const a=new T.Color(0x7FB2FF),m=new T.Color(0xFFFFFF),b=new T.Color(0xFFC560);return t<.5?a.lerp(m,t*2):m.clone().lerp(b,(t-.5)*2);};
  for(let i=0;i<n;i++){const x=base[i*3],y=base[i*3+1],z=base[i*3+2],u=und(x,y,z);ell[i*3+1]*=FL;const k=1+.08*u;gd[i*3]=ell[i*3]*k;gd[i*3+1]=ell[i*3+1]*k;gd[i*3+2]=ell[i*3+2]*k;cB.set([cb.r,cb.g,cb.b],i*3);const c2=ramp((u+1.1)/2.2);cG.set([c2.r,c2.g,c2.b],i*3);}
  geo.setAttribute("color",new T.Float32BufferAttribute(cB.slice(),3));const tx=earthTex(),me=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,map:tx.m,bumpMap:tx.bm,bumpScale:R*.01,roughness:.62,color:new T.Color(1.2,1.2,1.24)}));me.rotation.y=-Math.PI/2;h.add(me);
  const pin=new T.Group(),dir=new T.Vector3(.35,.3,.89).normalize(),er=1/Math.sqrt(dir.x**2/R**2+(dir.y/(R*FL))**2+dir.z**2/R**2),uu=und(dir.x*R,dir.y*R,dir.z*R);
  const pE=dir.clone().multiplyScalar(er),pG=dir.clone().multiplyScalar(er*(1+.08*uu)),pT=dir.clone().multiplyScalar(er*(1+.08*uu)+.09);
  [[pE,INK.navy],[pG,INK.teal],[pT,INK.gold]].forEach(([p,c])=>{const s=new T.Mesh(new T.SphereGeometry(.009,12,6),mat(c));s.position.copy(p);pin.add(s);});
  pin.add(lineOf([pE.clone().multiplyScalar(.97),pT],INK.ink));
  [["ellipsoid (h measured from here)",pE,"#10233F",-.2],["geoid · N",pG,"#0F766E",.05],["ground · H = h − N",pT,"#7A5E1F",.08]].forEach(([t,p,c,dy])=>{const s=inkLabel(t,{color:c,h:.036});s.position.copy(p).add(new T.Vector3(.16,dy,0));pin.add(s);});
  h.add(hidden(pin));const cage=grat(R*1.03,15,INK.navy,.45);cage.scale.y=1;h.add(cage);const cur=P.array,cc=geo.attributes.color.array;let tP=sph,tC=cB,spin=true;
  let cageY=1;const set=(p,c,pn,sp)=>()=>{tP=p;tC=c;fade(pin,pn);spin=sp;cageY=p===sph?1:FL;};
  return{group:g,steps:[set(sph,cB,0,1),set(ell,cB,0,1),set(gd,cG,0,1),set(gd,cG,1,0)],
    tick(dt){const k=1-Math.pow(.004,dt);let mv=false;for(let i=0;i<cur.length;i++){const d=tP[i]-cur[i];if(Math.abs(d)>1e-5){cur[i]+=d*k;mv=true;}const e=tC[i]-cc[i];if(Math.abs(e)>1e-4)cc[i]+=e*k;}if(mv){P.needsUpdate=true;geo.computeVertexNormals();}geo.attributes.color.needsUpdate=true;cage.scale.y+=(cageY-cage.scale.y)*Math.min(1,dt*3);
      if(spin&&!RM())h.rotation.y+=dt*.25;else{let d=0-h.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));h.rotation.y+=d*Math.min(1,dt*3);}}};};
/* topology */
DEMOS.topology=()=>{const T=THREE,g=new T.Group(),cols=[0xD9E6F2,0xE6E0F2,0xF2E6D2,0xDCEFE2];
  const poly=(pts,col)=>{const sh=new T.Shape(pts.map(p=>new T.Vector2(p[0],p[1])));const ge=new T.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:false});ge.rotateX(Math.PI/2);ge.translate(0,.026,0);const m=new T.Mesh(ge,mat(col,{roughness:.9}));return inked(m,INK.ink,.7);};
  const A=poly([[-.36,-.4],[0,-.4],[0,0],[-.36,0]],cols[0]),B=poly([[0,-.4],[.36,-.4],[.36,0],[0,0]],cols[1]),C=poly([[-.36,0],[0,0],[0,.4],[-.36,.4]],cols[2]),Dp=poly([[0,0],[.36,0],[.36,.4],[0,.4]],cols[3]);
  [A,B,C,Dp].forEach(p=>g.add(p));
  const errM=new T.MeshStandardMaterial({color:INK.red,transparent:true,opacity:.75,emissive:INK.red,emissiveIntensity:.25});
  const ov=hidden(new T.Mesh(new T.BoxGeometry(.08,.03,.4),errM));ov.position.set(.04,.04,-.2);g.add(ov);
  const gap=hidden(new T.Mesh(new T.BoxGeometry(.36,.03,.03),errM.clone()));gap.position.set(-.18,.02,.0);g.add(gap);
  const road=new T.Group();const rp=[new T.Vector3(-.5,.06,.5),new T.Vector3(-.2,.06,.47),new T.Vector3(.18,.06,.47)];const tube=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rp),30,.008,8,false),mat(INK.ink));road.add(tube);
  const dang=new T.Mesh(new T.SphereGeometry(.018,12,8),errM.clone());dang.position.copy(rp[2]);road.add(dang);const jn=new T.Mesh(new T.CylinderGeometry(.012,.012,.06,12),mat(INK.navy));jn.position.set(.26,.06,.47);road.add(jn);g.add(hidden(road));
  const okRing=hidden(new T.Mesh(new T.TorusGeometry(.62,.006,8,100),new T.MeshBasicMaterial({color:INK.emerald,transparent:true,opacity:.8})));okRing.rotation.x=Math.PI/2;okRing.position.y=.05;g.add(okRing);
  const lab=(t,c)=>{const s=inkLabel(t,{color:c,h:.046});s.position.set(0,.32,-.48);return s;};let cur=null;const L=(t,c)=>{if(cur)g.remove(cur);cur=lab(t,c);g.add(cur);};
  const st=(bx,cz,o,gp,r,ok,t,c)=>()=>{tweenTo(B.position,{x:bx});tweenTo(C.scale,{z:cz});fade(ov,o);fade(gap,gp);fade(road,r);fade(okRing,ok);L(t,c);if(r){tweenTo(dang.position,{x:ok?.26:.18});}};
  return{group:g,steps:[st(0,1,0,0,0,0,"valid: shared edges","#0E6B4F"),st(-.08,1,1,0,0,0,"overlap → must not overlap","#B42318"),st(0,.92,0,1,0,0,"gap → must not have gaps","#B42318"),st(0,1,0,0,1,0,"dangle → must not have dangles","#B42318"),()=>{tweenTo(B.position,{x:0});tweenTo(C.scale,{z:1});fade(ov,0);fade(gap,0);fade(road,1);fade(okRing,1);tweenTo(dang.position,{x:.26});fade(dang,0);L("validated ✓","#0E6B4F");}],tick(){}};};
/* data quality */
DEMOS.quality=()=>{const T=THREE,g=new T.Group();
  for(let i=5;i>=1;i--){const r=new T.Mesh(new T.CylinderGeometry(i*.08,i*.08,.006+i*.001,64),mat(i%2?0xF3EEE2:0xE4DCC8));r.position.y=.004+(5-i)*.0015;g.add(r);}
  const truth=new T.Mesh(new T.ConeGeometry(.018,.06,16),mat(INK.navy));truth.rotation.x=Math.PI;truth.position.y=.06;g.add(truth);const tl=inkLabel("surveyed truth",{h:.04});tl.position.set(.02,.13,0);g.add(tl);
  const R=rngF(7),pts=[];for(let i=0;i<14;i++){const m=new T.Mesh(new T.SphereGeometry(.013,12,8),mat(INK.red,{roughness:.5}));m.position.set(0,.6,0);g.add(m);pts.push([m,(R()-.5)*.06,(R()-.5)*.06]);}
  const rr=hidden(new T.Mesh(new T.TorusGeometry(.12,.004,8,100),mat(INK.teal)));rr.rotation.x=Math.PI/2;rr.position.y=.03;g.add(rr);
  const r95=hidden(new T.Mesh(new T.TorusGeometry(.12*1.7308,.003,8,100),mat(INK.gold)));r95.rotation.x=Math.PI/2;r95.position.y=.03;g.add(r95);
  const lr=hidden(inkLabel("RMSE",{color:"#0F766E",h:.04}));lr.position.set(.12,.08,.04);g.add(lr);const l9=hidden(inkLabel("95% = 1.7308 × RMSE",{color:"#7A5E1F",h:.04}));l9.position.set(.2,.08,.2);g.add(l9);
  const drop=(cx,cz,spread)=>pts.forEach(([m,dx,dz],i)=>{if(RM()){m.position.set(cx+dx*spread,.03,cz+dz*spread);return;}gsap.fromTo(m.position,{y:.6},{x:cx+dx*spread,z:cz+dz*spread,y:.03,duration:.7,delay:i*.05,ease:"bounce.out"});});
  return{group:g,steps:[()=>{pts.forEach(([m])=>m.visible=false);[rr,r95,lr,l9].forEach(o=>fade(o,0));},()=>{pts.forEach(([m])=>m.visible=true);drop(.22,-.16,1);[rr,r95,lr,l9].forEach(o=>fade(o,0));},()=>{drop(0,0,1.3);[rr,r95,lr,l9].forEach(o=>fade(o,0));},()=>{drop(0,0,3.2);[rr,r95,lr,l9].forEach(o=>fade(o,1));}],tick(){}};};
/* terrain */
function terrainH(x,z){return .9*Math.exp(-((x-.12)**2+(z+.08)**2)/.035)+.55*Math.exp(-((x+.2)**2+(z-.15)**2)/.05)+.04*Math.sin(x*14)*Math.cos(z*12);}
DEMOS.terrain=()=>{const T=THREE,g=new T.Group(),S=.8,N=80,HS=.26;let mx=0;for(let i=0;i<=40;i++)for(let j=0;j<=40;j++)mx=Math.max(mx,terrainH(-S/2+S*i/40,-S/2+S*j/40));
  const h=(x,z)=>Math.max(0,terrainH(x,z))/mx*HS+.02;
  const geo=new T.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const P=geo.attributes.position;const col=[],grey=[];
  const ramp=t=>{const st=[[0,0x2E6B4E],[.3,0x7BA05B],[.55,0xD6C38A],[.8,0x9C6B43],[1,0xF4F1EA]];for(let i=1;i<st.length;i++)if(t<=st[i][0]){const a=new T.Color(st[i-1][1]),b=new T.Color(st[i][1]);return a.lerp(b,(t-st[i-1][0])/(st[i][0]-st[i-1][0]));}return new T.Color(0xffffff);};
  for(let i=0;i<P.count;i++){const y=h(P.getX(i),P.getZ(i));P.setY(i,y);const c=ramp((y-.02)/HS);col.push(c.r,c.g,c.b);grey.push(.86,.86,.84);}geo.computeVertexNormals();
  geo.setAttribute("color",new T.Float32BufferAttribute(col.slice(),3));const surf=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.9}));
  const block=new T.Group();block.add(surf);
  const base=new T.Mesh(new T.BoxGeometry(S,.02,S),mat(0xC9B48F));base.position.y=.01;block.add(inked(base,INK.ink,.4));
  g.add(block);
  const hv=(i,j)=>P.getY(j*(N+1)+i),gx=i=>-S/2+S*i/N,s3=[],sF=[],i3=[],iF=[];let li=0;
  for(let L=.035;L<HS+.02;L+=.018,li++){const A3=li%5===4?i3:s3,AF=li%5===4?iF:sF;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const v=[hv(i,j),hv(i+1,j),hv(i+1,j+1),hv(i,j+1)],xs=[gx(i),gx(i+1),gx(i+1),gx(i)],zs=[gx(j),gx(j),gx(j+1),gx(j+1)],q=[];
    for(let e=0;e<4;e++){const a=e,b=(e+1)%4;if((v[a]<L)!==(v[b]<L)){const t=(L-v[a])/(v[b]-v[a]);q.push([xs[a]+(xs[b]-xs[a])*t,zs[a]+(zs[b]-zs[a])*t]);}}
    for(let k=0;k+1<q.length;k+=2){A3.push(q[k][0],L+.002,q[k][1],q[k+1][0],L+.002,q[k+1][1]);AF.push(q[k][0],.004,q[k][1],q[k+1][0],.004,q[k+1][1]);}}}
  const mk=(a,c)=>{const ge=new T.BufferGeometry();ge.setAttribute("position",new T.Float32BufferAttribute(a.slice(),3));return new T.LineSegments(ge,new T.LineBasicMaterial({color:c,transparent:true,opacity:1}));};
  const cl=mk(s3,INK.navy),ci=mk(i3,0x9C5A12),cg=hidden(new T.Group());cg.add(cl,ci);g.add(cg);const S3=Float32Array.from(s3),SF=Float32Array.from(sF),I3=Float32Array.from(i3),IF=Float32Array.from(iF);
  const sheet=hidden(new T.Mesh(new T.BoxGeometry(S+.04,.004,S+.04),mat(0xF7F2E6)));sheet.position.y=.001;g.add(sheet);
  const sun=hidden(new T.Group());const sb=new T.Mesh(new T.SphereGeometry(.03,16,8),new T.MeshBasicMaterial({color:0xF2B640}));const a=315*Math.PI/180,e=45*Math.PI/180;sb.position.set(Math.sin(a)*Math.cos(e)*.6,Math.sin(e)*.6+.1,-Math.cos(a)*Math.cos(e)*.6);sun.add(sb);sun.add(lineOf([sb.position.clone(),new T.Vector3(0,.1,0)],0xC98A12));const sl=inkLabel("sun · 315° / 45°",{color:"#7A5E1F",h:.04});sl.position.copy(sb.position).add(new T.Vector3(0,.07,0));sun.add(sl);g.add(sun);
  const C=geo.attributes.color.array,M1=cl.geometry.attributes.position.array,M2=ci.geometry.attributes.position.array;let tC=Float32Array.from(col),t1=S3,t2=I3;
  return{group:g,steps:[()=>{fade(block,1);fade(cg,0);fade(sheet,0);fade(sun,0);tC=Float32Array.from(col);},()=>{fade(block,1);fade(cg,1);t1=S3;t2=I3;fade(sheet,0);fade(sun,0);},()=>{fade(block,.08);fade(cg,1);t1=SF;t2=IF;fade(sheet,1);fade(sun,0);},()=>{fade(block,1);fade(cg,0);fade(sheet,0);fade(sun,1);tC=Float32Array.from(grey);}],
    tick(dt){const k=1-Math.pow(.004,dt);for(let i=0;i<C.length;i++)C[i]+=(tC[i]-C[i])*k;geo.attributes.color.needsUpdate=true;for(let i=0;i<M1.length;i++)M1[i]+=(t1[i]-M1[i])*k;for(let i=0;i<M2.length;i++)M2[i]+=(t2[i]-M2[i])*k;cl.geometry.attributes.position.needsUpdate=true;ci.geometry.attributes.position.needsUpdate=true;}};};
/* GNSS */
DEMOS.gnss=()=>{const T=THREE,g=new T.Group(),R=.16;g.add(stand(.2));const w=new T.Group();w.position.y=.25;g.add(w);
  w.add(earth(R,{glow:.8}));w.add(grat(R*1.03,20,INK.navy,.45));
  const rec=LL(25,55,R),up=rec.clone().normalize();const rm=new T.Mesh(new T.SphereGeometry(.01,12,8),mat(INK.red));rm.position.copy(rec);w.add(rm);
  const DIST=.3,east=new T.Vector3(0,1,0).cross(up).normalize(),north=up.clone().cross(east);const dirOf=(az,el)=>{const a=az*Math.PI/180,e=el*Math.PI/180;return up.clone().multiplyScalar(Math.sin(e)).add(north.clone().multiplyScalar(Math.cos(a)*Math.cos(e))).add(east.clone().multiplyScalar(Math.sin(a)*Math.cos(e)));};
  const cfg=[[300,40],[60,45],[180,55],[110,82]],cols=[INK.navy,INK.teal,INK.gold,INK.emerald];
  const sats=cfg.map((c,i)=>{const s=new T.Group();s.add(new T.Mesh(new T.BoxGeometry(.022,.022,.022),mat(0xDADFE6,{metalness:.6,roughness:.3})));[-1,1].forEach(k=>{const p=new T.Mesh(new T.BoxGeometry(.05,.002,.018),mat(cols[i],{metalness:.3}));p.position.x=k*.036;s.add(p);});s.position.copy(rec.clone().add(dirOf(...c).multiplyScalar(DIST)));w.add(hidden(s));return s;});
  const sph=cfg.map((c,i)=>{const m=new T.Mesh(new T.SphereGeometry(DIST,40,20),new T.MeshStandardMaterial({color:cols[i],transparent:true,opacity:.1,depthWrite:false,side:T.DoubleSide}));m.position.copy(sats[i].position);w.add(hidden(m));return m;});
  const los=sats.map((s,i)=>{const l=lineOf([rec,s.position.clone()],cols[i]);w.add(hidden(l));return l;});
  const pulse=hidden(new T.Mesh(new T.SphereGeometry(.02,16,8),new T.MeshBasicMaterial({color:INK.emerald,transparent:true,opacity:.6})));pulse.position.copy(rec);w.add(pulse);
  w.rotation.y=-55*Math.PI/180;w.rotation.x=.35;
  const show=n=>()=>{sats.forEach((s,i)=>fade(s,i<n?1:0));sph.forEach((s,i)=>fade(s,i<n?(n===4?.5:1):0));los.forEach((l,i)=>fade(l,i<n?1:0));fade(pulse,n===4?1:0);};
  return{group:g,steps:[show(1),show(2),show(3),show(4)],tick(dt,t){const k=1+.7*(.5+.5*Math.sin(t*4));pulse.scale.set(k,k,k);}};};
/* spectral bands */
DEMOS.bands=()=>{const T=THREE,g=new T.Group(),N=96,cls=[],R=rngF(5);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){let c=1;const rv=Math.abs(j-(N*.35+Math.sin(i/9)*8));if(rv<4)c=0;else if(i>62&&j>55)c=3;else if(((i/16|0)+(j/14|0))%3===0)c=2;cls.push(c);}
  const refl=[[.08,.06,.04,.02],[.04,.09,.05,.5],[.12,.16,.22,.28],[.2,.2,.22,.24]];
  const tex=fn=>{const c=mkCanvas(N,N),x=c.getContext("2d"),im=x.createImageData(N,N);for(let k=0;k<N*N;k++){const [r,gg,b]=fn(cls[k],k);im.data.set([r,gg,b,255],k*4);}x.putImageData(im,0,0);const t=new T.CanvasTexture(c);t.magFilter=T.NearestFilter;t.encoding=T.sRGBEncoding;return t;};
  const band=b=>tex(c=>{const v=Math.min(255,refl[c][b]/.55*255+R()*14);return[v,v,v];});
  const rgb=tex(c=>[refl[c][2]*700,refl[c][1]*700,refl[c][0]*700].map(v=>Math.min(255,v+R()*10)));
  const ndvi=tex(c=>{const n=(refl[c][3]-refl[c][2])/(refl[c][3]+refl[c][2]);const t=(n+1)/2;return[180-120*t,120+90*t,70-20*t].map(v=>Math.max(0,Math.min(255,v)));});
  const S=.6,layer=(t,y,name,col)=>{const m=new T.Mesh(new T.BoxGeometry(S,.006,S),[mat(0xEEE8DA),mat(0xEEE8DA),new T.MeshStandardMaterial({map:t,roughness:.9}),mat(0xEEE8DA),mat(0xEEE8DA),mat(0xEEE8DA)]);m.position.y=y;inked(m,INK.ink,.4);const l=inkLabel(name,{color:col,h:.04});l.position.set(S/2+.02,.01,0);l.center.set(0,.5);m.add(l);return m;};
  const L=[layer(band(0),.02,"Blue","#1F4E9C"),layer(band(1),.02,"Green","#0E6B4F"),layer(band(2),.02,"Red","#B42318"),layer(band(3),.02,"Near-infrared","#7A5E1F")],top=layer(rgb,.03,"True colour","#10233F"),nd=layer(ndvi,.03,"NDVI","#0E6B4F");
  L.forEach(l=>g.add(l));g.add(top);g.add(hidden(nd));L.forEach(l=>hidden(l));
  return{group:g,steps:[()=>{L.forEach(l=>{fade(l,0);tweenTo(l.position,{y:.02});});fade(top,1);tweenTo(top.position,{y:.03});fade(nd,0);},
    ()=>{fade(top,.0);L.forEach((l,i)=>{fade(l,1);tweenTo(l.position,{y:.04+i*.11});});fade(nd,0);},
    ()=>{L.forEach((l,i)=>{fade(l,i===3?1:.15);tweenTo(l.position,{y:.04+i*.11});});fade(nd,0);},
    ()=>{L.forEach((l,i)=>{fade(l,i>=2?.6:.1);tweenTo(l.position,{y:.04+i*.08});});fade(nd,1);tweenTo(nd.position,{y:.46});}],tick(){}};};
/* raster resolution */
DEMOS.raster=()=>{const T=THREE,g=new T.Group(),S=.76;let inst=null,frame=null,fp=0;const H=(x,z)=>Math.max(0,terrainH(x*.95,z*.95))*.28+.01;
  const build=n=>{if(inst){g.remove(inst);inst.geometry.dispose();inst.material.dispose();}const cs=S/n,m=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshStandardMaterial({roughness:.8}),n*n),d=new T.Object3D();let k=0;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){const x=-S/2+cs*(i+.5),z=-S/2+cs*(j+.5),y=H(x,z);d.position.set(x,y/2,z);d.scale.set(cs*.93,y,cs*.93);d.updateMatrix();m.setMatrixAt(k,d.matrix);const c=new T.Color(0x2E6B4E).lerp(new T.Color(0xE7D7A8),Math.min(1,y/.22));m.setColorAt(k,c);k++;}
    m.instanceMatrix.needsUpdate=true;m.castShadow=true;g.add(m);inst=m;popIn(m);};
  const lab=inkLabel("",{h:.05});let L=null;const label=t=>{if(L)g.remove(L);L=inkLabel(t,{h:.05});L.position.set(0,.4,-.42);g.add(L);};
  frame=hidden(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(S/16*3,.32,S/16*3)),new T.LineBasicMaterial({color:INK.red,transparent:true})));g.add(frame);
  return{group:g,steps:[()=>{build(8);fade(frame,0);label("8 × 8 = 64 cells");},()=>{build(16);fade(frame,0);label("16 × 16 = 256 cells");},()=>{build(32);fade(frame,0);label("32 × 32 = 1,024 cells");},()=>{build(16);fade(frame,1);fp=0;label("focal 3 × 3 window");}],
    tick(dt){if(frame.visible){fp+=dt*.9;const cs=S/16,k=Math.floor(fp)%196,i=1+k%14,j=1+Math.floor(k/14);frame.position.set(-S/2+cs*(i+.5),.16,-S/2+cs*(j+.5));}}};};
/* buffer & overlay */
DEMOS.overlay=()=>{const T=THREE,g=new T.Group();
  const rv=[[-.45,-.32],[-.2,-.12],[.02,-.18],[.22,.05],[.45,.12]].map(p=>new T.Vector3(p[0],.03,p[1])),curve=new T.CatmullRomCurve3(rv);
  g.add(new T.Mesh(new T.TubeGeometry(curve,60,.012,8,false),mat(0x2F6DB5,{roughness:.4})));
  const bufM=new T.MeshStandardMaterial({color:INK.teal,transparent:true,opacity:.28,depthWrite:false});let buf=new T.Mesh(new T.TubeGeometry(curve,60,.001,16,false),bufM);buf.scale.y=.12;g.add(buf);
  const setBuf=r=>{buf.geometry.dispose();buf.geometry=new T.TubeGeometry(curve,60,r,20,false);};
  const zoneP=[[-.1,-.42],[.38,-.42],[.38,.2],[-.1,.2]];const sh=new T.Shape(zoneP.map(p=>new T.Vector2(p[0],p[1])));const zg=new T.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:false});zg.rotateX(Math.PI/2);zg.translate(0,.022,0);
  const zone=hidden(inked(new T.Mesh(zg,new T.MeshStandardMaterial({color:INK.gold,transparent:true,opacity:.35})),0x7A5E1F,.8));g.add(zone);
  const pts=curve.getPoints(200),dist=(x,z)=>Math.min(...pts.map(p=>Math.hypot(p.x-x,p.z-z))),inZone=(x,z)=>x>-.1&&x<.38&&z>-.42&&z<.2;
  const cs=.02,cells=[];for(let x=-.5;x<.5;x+=cs)for(let z=-.5;z<.5;z+=cs)if(inZone(x+cs/2,z+cs/2)&&dist(x+cs/2,z+cs/2)<.1)cells.push([x+cs/2,z+cs/2]);
  const im=new T.InstancedMesh(new T.BoxGeometry(cs*.96,.02,cs*.96),new T.MeshStandardMaterial({color:INK.emerald,transparent:true,opacity:0}),cells.length),d=new T.Object3D();cells.forEach(([x,z],k)=>{d.position.set(x,.04,z);d.updateMatrix();im.setMatrixAt(k,d.matrix);});g.add(im);
  const R=rngF(13),wells=[];for(let i=0;i<16;i++){const x=(R()-.5)*.9,z=(R()-.5)*.9,inside=inZone(x,z)&&dist(x,z)<.1;const w=new T.Mesh(new T.CylinderGeometry(.012,.012,.05,12),mat(inside?INK.navy:0x9AA3AE));w.position.set(x,.05,z);g.add(hidden(w));wells.push([w,inside]);}
  let L=null;const label=(t,c)=>{if(L)g.remove(L);L=inkLabel(t,{h:.048,color:c});L.position.set(0,.3,-.5);g.add(L);};const r0={r:.001};
  const grow=r=>{if(RM()){setBuf(r);r0.r=r;return;}gsap.to(r0,{r,duration:1.1,ease:"power2.out",onUpdate:()=>setBuf(r0.r)});};
  return{group:g,steps:[()=>{grow(.001);fade(zone,0);im.material.opacity=0;wells.forEach(([w])=>fade(w,0));label("river (line feature)","#1F4E9C");},()=>{grow(.1);fade(zone,0);im.material.opacity=0;label("buffer · 100 m","#0F766E");},()=>{grow(.1);fade(zone,1);im.material.opacity=0;label("zoning polygon","#7A5E1F");},()=>{grow(.1);fade(zone,.25);tweenTo(im.material,{opacity:.9});label("intersect = buffer ∩ zone","#0E6B4F");},()=>{fade(zone,.2);wells.forEach(([w,ins])=>{fade(w,1);if(ins)tweenTo(w.position,{y:.09});});label(`spatial join · ${wells.filter(w=>w[1]).length} wells inside`,"#10233F");}],tick(){}};};
/* spatial statistics */
DEMOS.stats=()=>{const T=THREE,g=new T.Group(),R=rngF(17),pts=[];const cl=[[-.2,-.15,.07],[.18,.12,.06]];
  for(let i=0;i<90;i++){if(i<60){const c=cl[i%2];pts.push([c[0]+(R()-.5)*c[2]*3,c[1]+(R()-.5)*c[2]*3]);}else pts.push([(R()-.5)*.8,(R()-.5)*.8]);}
  const pm=new T.InstancedMesh(new T.SphereGeometry(.008,8,6),mat(INK.red),pts.length),d=new T.Object3D();pts.forEach(([x,z],k)=>{d.position.set(x,.02,z);d.updateMatrix();pm.setMatrixAt(k,d.matrix);});g.add(pm);
  const S=.84,N=60,geo=new T.PlaneGeometry(S,S,N,N);geo.rotateX(-Math.PI/2);const P=geo.attributes.position,bw=.07;let mx=0;const dens=[];
  for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i);let s=0;for(const [px,pz] of pts)s+=Math.exp(-((x-px)**2+(z-pz)**2)/(2*bw*bw));dens.push(s);mx=Math.max(mx,s);}
  const cols=[];dens.forEach(v=>{const t=v/mx,c=new T.Color(0xF3EEE2).lerp(new T.Color(INK.teal),Math.min(1,t*1.2)).lerp(new T.Color(INK.gold),Math.max(0,t-.6)*1.6);cols.push(c.r,c.g,c.b);});
  geo.setAttribute("color",new T.Float32BufferAttribute(cols,3));const surf=hidden(new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.85,side:T.DoubleSide})));g.add(surf);
  const flat=new Float32Array(P.count),high=Float32Array.from(dens.map(v=>v/mx*.22+.01));let tgtH=flat;
  for(let i=0;i<P.count;i++)P.setY(i,0);
  const hs=new T.Group();[[-.2,-.15],[.18,.12]].forEach(([x,z])=>{for(let a=0;a<6;a++){const c=new T.Mesh(new T.CylinderGeometry(.018,.018,1,10),mat(INK.red,{emissive:INK.red,emissiveIntensity:.25}));const xx=x+Math.cos(a)*.05,zz=z+Math.sin(a)*.05,hh=.12+R()*.1;c.scale.y=hh;c.position.set(xx,hh/2+.02,zz);hs.add(c);}});
  const hl=inkLabel("Gi* hot spots (99% confidence)",{color:"#B42318",h:.042});hl.position.set(0,.34,-.4);hs.add(hl);g.add(hidden(hs));
  return{group:g,steps:[()=>{fade(surf,0);tgtH=flat;fade(hs,0);fade(pm,1);},()=>{fade(surf,1);tgtH=high;fade(hs,0);fade(pm,.6);},()=>{fade(surf,.45);tgtH=high;fade(hs,1);}],
    tick(dt){const k=1-Math.pow(.01,dt);let mv=false;for(let i=0;i<P.count;i++){const y=P.getY(i),d=tgtH[i]-y;if(Math.abs(d)>1e-4){P.setY(i,y+d*k);mv=true;}}if(mv){P.needsUpdate=true;geo.computeVertexNormals();}}};};
/* geodatabase */
function tableTex(title,cols,rows,hi){const c=mkCanvas(512,320),g=c.getContext("2d");g.fillStyle="#FBF8F1";g.fillRect(0,0,512,320);g.fillStyle="#10233F";g.fillRect(0,0,512,56);g.fillStyle="#fff";g.font='600 30px "Crimson Pro", Georgia, serif';g.fillText(title,18,38);
  const cw=512/cols.length;g.font='600 18px "JetBrains Mono", monospace';cols.forEach((h,i)=>{g.fillStyle=hi&&hi.includes(i)?"#9C7A2E":"#5E574C";g.fillText(h,10+i*cw,86);});g.fillStyle="rgba(16,35,63,.3)";g.fillRect(0,98,512,2);
  g.font='400 19px "JetBrains Mono", monospace';rows.forEach((r,j)=>{r.forEach((v,i)=>{g.fillStyle=hi&&hi.includes(i)?"#7A5E1F":"#2A2620";g.fillText(String(v),10+i*cw,130+j*40);});g.fillStyle="rgba(16,35,63,.1)";g.fillRect(0,144+j*40,512,1);});
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;return t;}
DEMOS.gdb=()=>{const T=THREE,g=new T.Group();
  const slab=(tex,x,y,z,ry)=>{const m=new T.Mesh(new T.BoxGeometry(.34,.21,.008),[mat(0xEEE8DA),mat(0xEEE8DA),mat(0xEEE8DA),mat(0xEEE8DA),new T.MeshStandardMaterial({map:tex,roughness:.9}),mat(0xEEE8DA)]);m.position.set(x,y,z);m.rotation.set(-.35,ry,0);inked(m,INK.ink,.35);return m;};
  const parcels=slab(tableTex("Parcels",["PID","Area","Zone"],[[101,"0.4 ha","R1"],[102,"0.7 ha","C2"],[103,"1.1 ha","R1"],[104,"0.3 ha","I1"]],[0]),-.24,.2,-.1,.25);
  const permits=slab(tableTex("Permits",["PermitID","PID (FK)","Year"],[[9001,101,2024],[9002,101,2025],[9003,103,2025],[9004,104,2026]],[1]),.24,.2,-.12,-.25);
  const owners=hidden(slab(tableTex("Owners",["OID","Name"],[[1,"Al Noor LLC"],[2,"M. Haddad"],[3,"City of Dubai"]],[0]),-.26,.2,.32,.2));
  const junc=hidden(slab(tableTex("ParcelOwner",["PID (FK)","OID (FK)"],[[101,1],[101,2],[102,3],[103,2]],[0,1]),.18,.2,.3,-.2));
  [parcels,permits].forEach(m=>g.add(m));g.add(owners);g.add(junc);
  const c1=new T.CatmullRomCurve3([new T.Vector3(-.1,.24,-.06),new T.Vector3(0,.34,-.1),new T.Vector3(.1,.24,-.08)]);const l1=hidden(new T.Group());l1.add(new T.Mesh(new T.TubeGeometry(c1,30,.003,6),mat(INK.gold)));const f1=flowParticles(c1,14,0xD9A83A,.35);l1.add(f1);const t1=inkLabel("1 — M",{color:"#7A5E1F",h:.045});t1.position.set(0,.38,-.1);l1.add(t1);g.add(l1);
  const c2=new T.CatmullRomCurve3([new T.Vector3(-.2,.2,.0),new T.Vector3(-.25,.2,.15),new T.Vector3(-.24,.22,.25)]),c3=new T.CatmullRomCurve3([new T.Vector3(-.1,.22,.32),new T.Vector3(0,.26,.34),new T.Vector3(.06,.22,.31)]),c4=new T.CatmullRomCurve3([new T.Vector3(-.16,.2,-.02),new T.Vector3(0,.18,.12),new T.Vector3(.14,.2,.24)]);
  const l2=hidden(new T.Group());[c3,c4].forEach(c=>{l2.add(new T.Mesh(new T.TubeGeometry(c,30,.003,6),mat(INK.teal)));const f=flowParticles(c,12,0x2BB3A3,.3);l2.add(f);});const t2=inkLabel("M — N via junction table",{color:"#0F766E",h:.042});t2.position.set(0,.36,.42);l2.add(t2);g.add(l2);
  const flows=[f1,...l2.children.filter(o=>o.isPoints)];
  return{group:g,steps:[()=>{fade(l1,0);fade(owners,0);fade(junc,0);fade(l2,0);},()=>{fade(l1,1);fade(owners,0);fade(junc,0);fade(l2,0);},()=>{fade(l1,.4);fade(owners,1);fade(junc,1);fade(l2,1);}],tick(dt){flows.forEach(f=>f.userData.tick(dt));}};};
/* web architecture */
DEMOS.arch=()=>{const T=THREE,g=new T.Group();
  const box=(w,h,d,c,x,z,name)=>{const m=inked(new T.Mesh(new T.BoxGeometry(w,h,d),mat(c,{roughness:.6})),INK.ink,.45);m.position.set(x,h/2,z);g.add(m);const l=inkLabel(name,{h:.04});l.position.set(x,h+.06,z);g.add(l);return m;};
  const lap=box(.14,.01,.1,0xD9DEE6,-.36,-.3,"browser");const scr=new T.Mesh(new T.BoxGeometry(.14,.09,.006),mat(INK.navy));scr.position.set(-.36,.055,-.35);scr.rotation.x=-.2;g.add(scr);
  box(.05,.09,.01,INK.navy,-.36,.0,"mobile app");
  const web=box(.12,.2,.12,0xEFE8D8,-.08,-.15,"web server");const gis=box(.12,.26,.12,0xE1EAF2,.16,-.02,"GIS server");
  const db=new T.Group();for(let k=0;k<3;k++){const c=new T.Mesh(new T.CylinderGeometry(.07,.07,.05,32),mat(k%2?INK.teal:INK.emerald,{roughness:.5}));c.position.y=.025+k*.055;db.add(inked(c,INK.ink,.3));}db.position.set(.36,0,.2);g.add(db);const dl=inkLabel("database",{h:.04});dl.position.set(.36,.24,.2);g.add(dl);
  const route=[new T.Vector3(-.36,.08,-.3),new T.Vector3(-.08,.22,-.15),new T.Vector3(.16,.28,-.02),new T.Vector3(.36,.18,.2)];
  const down=new T.CatmullRomCurve3(route),upc=new T.CatmullRomCurve3(route.slice().reverse().map(v=>v.clone().add(new T.Vector3(0,.03,.03))));
  const req=flowParticles(down,16,0x2BB3A3,.3),res=flowParticles(upc,22,0xE0A93A,.3);const reqG=hidden(new T.Group()),resG=hidden(new T.Group());reqG.add(req);resG.add(res);
  const rl=inkLabel("HTTPS request · REST",{color:"#0F766E",h:.04});rl.position.set(-.18,.36,-.3);reqG.add(rl);const sl=inkLabel("WMS image · WFS features",{color:"#7A5E1F",h:.04});sl.position.set(.12,.42,.1);resG.add(sl);g.add(reqG,resG);
  return{group:g,steps:[()=>{fade(reqG,0);fade(resG,0);},()=>{fade(reqG,1);fade(resG,0);},()=>{fade(reqG,.6);fade(resG,1);}],tick(dt){if(reqG.visible)req.userData.tick(dt);if(resG.visible)res.userData.tick(dt);}};};
/* project management */
DEMOS.pm=()=>{const T=THREE,g=new T.Group(),names=["Initiation","Planning","Execution","Closing"],cols=[INK.navy,INK.teal,INK.emerald,INK.gold],P=[];
  names.forEach((n,i)=>{const p=inked(new T.Mesh(new T.BoxGeometry(.11,1,.11),mat(cols[i],{roughness:.6})),INK.ink,.4);const x=-.3+i*.2;p.position.set(x,.001,0);p.scale.y=.001;g.add(p);const l=inkLabel(n,{h:.04});l.position.set(x,.08+(i+1)*.07,.08);g.add(hidden(l));P.push([p,(i+1)*.07,l]);});
  const ring=hidden(new T.Mesh(new T.TorusGeometry(.46,.007,8,120),mat(INK.red,{emissive:INK.red,emissiveIntensity:.2})));ring.rotation.x=Math.PI/2;ring.position.y=.18;g.add(ring);const rl=inkLabel("monitoring & control · every phase",{color:"#B42318",h:.04});rl.position.set(0,.24,-.5);ring.add(rl);rl.position.set(0,.5,0);
  const tri=hidden(new T.Group());const tp=[[0,.5],[-.25,.08],[.25,.08]].map(([x,y])=>new T.Vector3(x,y,-.32));tri.add(lineOf([...tp,tp[0]],INK.ink));[["scope",tp[0]],["time",tp[1]],["cost",tp[2]]].forEach(([t,p])=>{const s=inkLabel(t,{h:.045,color:"#10233F"});s.position.copy(p).add(new T.Vector3(0,.04,0));tri.add(s);});g.add(tri);
  const rise=()=>P.forEach(([p,h,l],i)=>{if(RM()){p.scale.y=h;p.position.y=h/2;fade(l,1);return;}gsap.to(p.scale,{y:h,duration:.7,delay:i*.35,ease:"power2.out"});gsap.to(p.position,{y:h/2,duration:.7,delay:i*.35,ease:"power2.out"});gsap.delayedCall(i*.35+.4,()=>fade(l,1));});
  return{group:g,steps:[()=>{rise();fade(ring,0);fade(tri,0);},()=>{fade(ring,1);fade(tri,0);},()=>{fade(ring,.4);fade(tri,1);}],tick(dt){if(ring.visible&&!RM())ring.rotation.z+=dt*.3;}};};

/* ================= DELIGHT ANIMATIONS ================= */
const FX=[];
function fxTick(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;if(f.tick(dt,f.t)===false){G.scene.remove(f.obj);f.obj.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});FX.splice(i,1);}}}
function burst(x,z,n=90,palette=[0xB08D3C,0x0E6B4F,0x0F766E,0x10233F,0xE9B93A]){
  if(RM())return;const T=THREE,geo=new T.PlaneGeometry(.012,.02),grp=new T.Group(),parts=[];
  for(let i=0;i<n;i++){const m=new T.Mesh(geo,new T.MeshBasicMaterial({color:palette[i%palette.length],side:T.DoubleSide,transparent:true}));m.position.set(x,PAGE_Y+.02,z);const a=Math.random()*Math.PI*2,s=.35+Math.random()*.55;parts.push({m,v:new T.Vector3(Math.cos(a)*s*.5,.9+Math.random()*.7,Math.sin(a)*s*.5),r:new T.Vector3(Math.random()*9,Math.random()*9,Math.random()*9)});grp.add(m);}
  G.scene.add(grp);FX.push({obj:grp,t:0,tick:(dt,t)=>{parts.forEach(p=>{p.v.y-=2.4*dt;p.v.multiplyScalar(1-1.6*dt);p.m.position.addScaledVector(p.v,dt);if(p.m.position.y<PAGE_Y+.003){p.m.position.y=PAGE_Y+.003;p.v.set(0,0,0);}p.m.rotation.x+=p.r.x*dt;p.m.rotation.y+=p.r.y*dt;p.m.material.opacity=Math.max(0,1-Math.max(0,t-1.4)/.8);});return t<2.3;}});}
function ripple(x,z,color=0x0F766E){if(RM())return;const T=THREE,m=new T.Mesh(new T.RingGeometry(.05,.058,64),new T.MeshBasicMaterial({color,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,PAGE_Y+.004,z);G.scene.add(m);FX.push({obj:m,t:0,tick:(dt,t)=>{const k=1+t*7;m.scale.set(k,k,k);m.material.opacity=Math.max(0,.8-t*.9);return t<.9;}});}
function stamp3D(x,z,done){
  const T=THREE,grp=new T.Group(),wood=new T.MeshStandardMaterial({color:0x7A4E2A,roughness:.55}),rub=new T.MeshStandardMaterial({color:0x9C2A1E,roughness:.8});
  const knob=new T.Mesh(new T.SphereGeometry(.05,24,12),wood);knob.position.y=.2;const neck=new T.Mesh(new T.CylinderGeometry(.022,.03,.12,20),wood);neck.position.y=.13;const base=new T.Mesh(new T.CylinderGeometry(.1,.1,.05,40),wood);base.position.y=.045;const pad=new T.Mesh(new T.CylinderGeometry(.095,.095,.02,40),rub);pad.position.y=.01;
  grp.add(knob,neck,base,pad);grp.traverse(o=>{if(o.isMesh)o.castShadow=true;});grp.position.set(x,.9,z);grp.rotation.z=.25;G.scene.add(grp);
  if(RM()){G.scene.remove(grp);done&&done();return;}
  const tl=gsap.timeline({onComplete:()=>{G.scene.remove(grp);}});
  tl.to(grp.position,{y:PAGE_Y+.002,duration:.45,ease:"power3.in"}).to(grp.rotation,{z:0,duration:.45,ease:"power3.in"},0)
    .add(()=>{ripple(x,z,0x9C2A1E);done&&done();}).to(grp.scale,{y:.88,duration:.08,yoyo:true,repeat:1})
    .to(grp.position,{y:1.1,duration:.6,ease:"power2.in",delay:.25}).to(grp.rotation,{z:-.3,duration:.6},"<");
}
