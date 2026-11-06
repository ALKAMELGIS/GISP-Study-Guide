import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

NAVY="#0B2545"; TEAL="#13A89E"; AMBER="#F2A541"; LIGHT="#EEF4F8"

# ---------- COVER (A4 ratio) ----------
W,H = 8.27, 11.69
fig = plt.figure(figsize=(W,H), dpi=200)
ax = fig.add_axes([0,0,1,1]); ax.set_xlim(0,W); ax.set_ylim(0,H); ax.axis("off")
# background gradient
grad = np.linspace(0,1,512).reshape(-1,1)
cmap = LinearSegmentedColormap.from_list("bg", ["#13315C", NAVY, "#06162B"])
ax.imshow(grad, extent=[0,W,0,H], aspect="auto", cmap=cmap, origin="lower", zorder=0)
# synthetic terrain contours
x = np.linspace(0,W,500); y = np.linspace(0,H,700); X,Y = np.meshgrid(x,y)
Z = (np.exp(-((X-6.2)**2+(Y-8.6)**2)/2.2)*1.0 + np.exp(-((X-2.0)**2+(Y-3.2)**2)/3.0)*0.8
     + np.exp(-((X-5.5)**2+(Y-2.0)**2)/1.2)*0.6 + 0.08*np.sin(X*1.3)*np.cos(Y*0.9))
ax.contour(X,Y,Z,levels=28,colors=TEAL,linewidths=0.6,alpha=0.35,zorder=1)
ax.contour(X,Y,Z,levels=7,colors="#7FD8CF",linewidths=1.1,alpha=0.35,zorder=1)
# graticule
for gx in np.arange(0,W,0.9): ax.plot([gx,gx],[0,H],color="white",lw=0.3,alpha=0.08,zorder=1)
for gy in np.arange(0,H,0.9): ax.plot([0,W],[gy,gy],color="white",lw=0.3,alpha=0.08,zorder=1)
# accent bar
ax.add_patch(plt.Rectangle((0.75,7.05),0.12,2.75,color=AMBER,zorder=3))
ax.text(1.1,9.35,"GISP", fontsize=74, fontweight="bold", color="white", va="center", zorder=4)
ax.text(1.12,8.38,"Exam Quick Study Guide", fontsize=27, color="white", va="center", zorder=4)
ax.text(1.14,7.78,"GISCI Geospatial Core Technical Knowledge Exam®", fontsize=13.5, color="#BFD7EA", va="center", zorder=4)
ax.text(1.14,7.33,"Simple summaries  •  Exam keywords  •  Practice questions", fontsize=12, color=AMBER, va="center", zorder=4)
# pill boxes
items=[("10","Knowledge\nAreas"),("45","KSAs\ncovered"),("170+","Key terms"),("46","Practice\nquestions")]
for i,(n,l) in enumerate(items):
    x0=1.1+i*1.6
    ax.add_patch(plt.Rectangle((x0,4.85),1.4,1.5,facecolor="white",alpha=0.08,edgecolor=TEAL,lw=1.2,zorder=3))
    ax.text(x0+0.7,5.88,n,fontsize=22,fontweight="bold",color="white",ha="center",va="center",zorder=4)
    ax.text(x0+0.7,5.23,l,fontsize=9,color="#BFD7EA",ha="center",va="center",zorder=4,linespacing=1.2)
# bottom band
ax.add_patch(plt.Rectangle((0,0),W,1.55,color="#06162B",alpha=0.85,zorder=3))
ax.add_patch(plt.Rectangle((0,1.55),W,0.05,color=TEAL,zorder=3))
ax.text(0.75,1.02,"4-WEEK FAST-TRACK EDITION", fontsize=12, fontweight="bold", color=AMBER, zorder=4)
ax.text(0.75,0.6,"Based on the 2019 Exam Blueprint (used for the December 2026 exam)", fontsize=10, color="#BFD7EA", zorder=4)
ax.text(W-0.75,0.6,"November 2026", fontsize=10, color="#BFD7EA", ha="right", zorder=4)
fig.savefig("cover.png", dpi=200); plt.close(fig)

# ---------- WEIGHTS CHART ----------
areas=["Conceptual Foundations","Geospatial Data Fundamentals","Cartography & Visualization","Data Acquisition",
"Data Manipulation","Analytical Methods","Database Design & Mgmt","Application Development","Systems Design & Mgmt","Professional Practice"]
w=[10,15,10,11,11,11,10,7,7,8]
fig,ax=plt.subplots(figsize=(7.2,3.9),dpi=200)
ys=np.arange(len(areas))[::-1]
cols=[AMBER if v==15 else (TEAL if v>=10 else "#7FA7C9") for v in w]
ax.barh(ys,w,color=cols,height=0.62)
ax.set_yticks(ys); ax.set_yticklabels([f"{i+1}. {a}" for i,a in enumerate(areas)],fontsize=9.5,color=NAVY)
for yv,v in zip(ys,w): ax.text(v+0.25,yv,f"{v}%  ≈ {v} Qs",va="center",fontsize=9,color=NAVY)
ax.set_xlim(0,19); ax.set_xticks([])
for s in ["top","right","bottom"]: ax.spines[s].set_visible(False)
ax.spines["left"].set_color("#C9D6E2")
ax.tick_params(axis="y",length=0)
plt.tight_layout(); fig.savefig("weights.png",dpi=200); plt.close(fig)
print("done")
