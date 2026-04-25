var re=Object.defineProperty;var ae=(e,t,n)=>t in e?re(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var Z=(e,t,n)=>ae(e,typeof t!="symbol"?t+"":t,n);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const o of s)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(s){const o={};return s.integrity&&(o.integrity=s.integrity),s.referrerPolicy&&(o.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?o.credentials="include":s.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(s){if(s.ep)return;s.ep=!0;const o=n(s);fetch(s.href,o)}})();function le(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var ct={exports:{}},ce=ct.exports,Ot;function he(){return Ot||(Ot=1,(function(e,t){(function(n,i){e.exports=i()})(ce,function(){return n.importState=function(s){var o=new n;return o.importState(s),o},n;function n(){return(function(s){var o=0,r=0,a=0,l=1;s.length==0&&(s=[+new Date]);var h=i();o=h(" "),r=h(" "),a=h(" ");for(var g=0;g<s.length;g++)o-=h(s[g]),o<0&&(o+=1),r-=h(s[g]),r<0&&(r+=1),a-=h(s[g]),a<0&&(a+=1);h=null;var c=function(){var d=2091639*o+l*23283064365386963e-26;return o=r,r=a,a=d-(l=d|0)};return c.next=c,c.uint32=function(){return c()*4294967296},c.fract53=function(){return c()+(c()*2097152|0)*11102230246251565e-32},c.version="Alea 0.9",c.args=s,c.exportState=function(){return[o,r,a,l]},c.importState=function(d){o=+d[0]||0,r=+d[1]||0,a=+d[2]||0,l=+d[3]||0},c})(Array.prototype.slice.call(arguments))}function i(){var s=4022871197,o=function(r){r=r.toString();for(var a=0;a<r.length;a++){s+=r.charCodeAt(a);var l=.02519603282416938*s;s=l>>>0,l-=s,l*=s,s=l>>>0,l-=s,s+=l*4294967296}return(s>>>0)*23283064365386963e-26};return o.version="Mash 0.9",o}})})(ct)),ct.exports}var de=he();const Ft=le(de),F=11102230246251565e-32,D=134217729,ue=(3+8*F)*F;function bt(e,t,n,i,s){let o,r,a,l,h=t[0],g=i[0],c=0,d=0;g>h==g>-h?(o=h,h=t[++c]):(o=g,g=i[++d]);let u=0;if(c<e&&d<n)for(g>h==g>-h?(r=h+o,a=o-(r-h),h=t[++c]):(r=g+o,a=o-(r-g),g=i[++d]),o=r,a!==0&&(s[u++]=a);c<e&&d<n;)g>h==g>-h?(r=o+h,l=r-o,a=o-(r-l)+(h-l),h=t[++c]):(r=o+g,l=r-o,a=o-(r-l)+(g-l),g=i[++d]),o=r,a!==0&&(s[u++]=a);for(;c<e;)r=o+h,l=r-o,a=o-(r-l)+(h-l),h=t[++c],o=r,a!==0&&(s[u++]=a);for(;d<n;)r=o+g,l=r-o,a=o-(r-l)+(g-l),g=i[++d],o=r,a!==0&&(s[u++]=a);return(o!==0||u===0)&&(s[u++]=o),u}function ge(e,t){let n=t[0];for(let i=1;i<e;i++)n+=t[i];return n}function rt(e){return new Float64Array(e)}const fe=(3+16*F)*F,pe=(2+12*F)*F,me=(9+64*F)*F*F,tt=rt(4),Ut=rt(8),Bt=rt(12),Nt=rt(16),U=rt(4);function ye(e,t,n,i,s,o,r){let a,l,h,g,c,d,u,w,f,y,p,M,b,S,_,k,R,I;const v=e-s,P=n-s,T=t-o,E=i-o;S=v*E,d=D*v,u=d-(d-v),w=v-u,d=D*E,f=d-(d-E),y=E-f,_=w*y-(S-u*f-w*f-u*y),k=T*P,d=D*T,u=d-(d-T),w=T-u,d=D*P,f=d-(d-P),y=P-f,R=w*y-(k-u*f-w*f-u*y),p=_-R,c=_-p,tt[0]=_-(p+c)+(c-R),M=S+p,c=M-S,b=S-(M-c)+(p-c),p=b-k,c=b-p,tt[1]=b-(p+c)+(c-k),I=M+p,c=I-M,tt[2]=M-(I-c)+(p-c),tt[3]=I;let C=ge(4,tt),q=pe*r;if(C>=q||-C>=q||(c=e-v,a=e-(v+c)+(c-s),c=n-P,h=n-(P+c)+(c-s),c=t-T,l=t-(T+c)+(c-o),c=i-E,g=i-(E+c)+(c-o),a===0&&l===0&&h===0&&g===0)||(q=me*r+ue*Math.abs(C),C+=v*g+E*a-(T*h+P*l),C>=q||-C>=q))return C;S=a*E,d=D*a,u=d-(d-a),w=a-u,d=D*E,f=d-(d-E),y=E-f,_=w*y-(S-u*f-w*f-u*y),k=l*P,d=D*l,u=d-(d-l),w=l-u,d=D*P,f=d-(d-P),y=P-f,R=w*y-(k-u*f-w*f-u*y),p=_-R,c=_-p,U[0]=_-(p+c)+(c-R),M=S+p,c=M-S,b=S-(M-c)+(p-c),p=b-k,c=b-p,U[1]=b-(p+c)+(c-k),I=M+p,c=I-M,U[2]=M-(I-c)+(p-c),U[3]=I;const N=bt(4,tt,4,U,Ut);S=v*g,d=D*v,u=d-(d-v),w=v-u,d=D*g,f=d-(d-g),y=g-f,_=w*y-(S-u*f-w*f-u*y),k=T*h,d=D*T,u=d-(d-T),w=T-u,d=D*h,f=d-(d-h),y=h-f,R=w*y-(k-u*f-w*f-u*y),p=_-R,c=_-p,U[0]=_-(p+c)+(c-R),M=S+p,c=M-S,b=S-(M-c)+(p-c),p=b-k,c=b-p,U[1]=b-(p+c)+(c-k),I=M+p,c=I-M,U[2]=M-(I-c)+(p-c),U[3]=I;const H=bt(N,Ut,4,U,Bt);S=a*g,d=D*a,u=d-(d-a),w=a-u,d=D*g,f=d-(d-g),y=g-f,_=w*y-(S-u*f-w*f-u*y),k=l*h,d=D*l,u=d-(d-l),w=l-u,d=D*h,f=d-(d-h),y=h-f,R=w*y-(k-u*f-w*f-u*y),p=_-R,c=_-p,U[0]=_-(p+c)+(c-R),M=S+p,c=M-S,b=S-(M-c)+(p-c),p=b-k,c=b-p,U[1]=b-(p+c)+(c-k),I=M+p,c=I-M,U[2]=M-(I-c)+(p-c),U[3]=I;const x=bt(H,Bt,4,U,Nt);return Nt[x-1]}function at(e,t,n,i,s,o){const r=(t-o)*(n-s),a=(e-s)*(i-o),l=r-a,h=Math.abs(r+a);return Math.abs(l)>=fe*h?l:-ye(e,t,n,i,s,o,h)}const Wt=Math.pow(2,-52),lt=new Uint32Array(512);class xt{static from(t,n=Se,i=_e){const s=t.length,o=new Float64Array(s*2);for(let r=0;r<s;r++){const a=t[r];o[2*r]=n(a),o[2*r+1]=i(a)}return new xt(o)}constructor(t){const n=t.length>>1;if(n>0&&typeof t[0]!="number")throw new Error("Expected coords to contain numbers.");this.coords=t;const i=Math.max(2*n-5,0);this._triangles=new Uint32Array(i*3),this._halfedges=new Int32Array(i*3),this._hashSize=Math.ceil(Math.sqrt(n)),this._hullPrev=new Uint32Array(n),this._hullNext=new Uint32Array(n),this._hullTri=new Uint32Array(n),this._hullHash=new Int32Array(this._hashSize),this._ids=new Uint32Array(n),this._dists=new Float64Array(n),this.trianglesLen=0,this._cx=0,this._cy=0,this._hullStart=0,this.hull=this._triangles,this.triangles=this._triangles,this.halfedges=this._halfedges,this.update()}update(){const{coords:t,_hullPrev:n,_hullNext:i,_hullTri:s,_hullHash:o}=this,r=t.length>>1;let a=1/0,l=1/0,h=-1/0,g=-1/0;for(let v=0;v<r;v++){const P=t[2*v],T=t[2*v+1];P<a&&(a=P),T<l&&(l=T),P>h&&(h=P),T>g&&(g=T),this._ids[v]=v}const c=(a+h)/2,d=(l+g)/2;let u=0,w=0,f=0;for(let v=0,P=1/0;v<r;v++){const T=vt(c,d,t[2*v],t[2*v+1]);T<P&&(u=v,P=T)}const y=t[2*u],p=t[2*u+1];for(let v=0,P=1/0;v<r;v++){if(v===u)continue;const T=vt(y,p,t[2*v],t[2*v+1]);T<P&&T>0&&(w=v,P=T)}let M=t[2*w],b=t[2*w+1],S=1/0;for(let v=0;v<r;v++){if(v===u||v===w)continue;const P=we(y,p,M,b,t[2*v],t[2*v+1]);P<S&&(f=v,S=P)}let _=t[2*f],k=t[2*f+1];if(S===1/0){for(let T=0;T<r;T++)this._dists[T]=t[2*T]-t[0]||t[2*T+1]-t[1];et(this._ids,this._dists,0,r-1);const v=new Uint32Array(r);let P=0;for(let T=0,E=-1/0;T<r;T++){const C=this._ids[T],q=this._dists[C];q>E&&(v[P++]=C,E=q)}this.hull=v.subarray(0,P),this.triangles=new Uint32Array(0),this.halfedges=new Int32Array(0);return}if(at(y,p,M,b,_,k)<0){const v=w,P=M,T=b;w=f,M=_,b=k,f=v,_=P,k=T}const R=Me(y,p,M,b,_,k);this._cx=R.x,this._cy=R.y;for(let v=0;v<r;v++)this._dists[v]=vt(t[2*v],t[2*v+1],R.x,R.y);et(this._ids,this._dists,0,r-1),this._hullStart=u;let I=3;i[u]=n[f]=w,i[w]=n[u]=f,i[f]=n[w]=u,s[u]=0,s[w]=1,s[f]=2,o.fill(-1),o[this._hashKey(y,p)]=u,o[this._hashKey(M,b)]=w,o[this._hashKey(_,k)]=f,this.trianglesLen=0,this._addTriangle(u,w,f,-1,-1,-1);for(let v=0,P=0,T=0;v<this._ids.length;v++){const E=this._ids[v],C=t[2*E],q=t[2*E+1];if(v>0&&Math.abs(C-P)<=Wt&&Math.abs(q-T)<=Wt||(P=C,T=q,E===u||E===w||E===f))continue;let N=0;for(let yt=0,se=this._hashKey(C,q);yt<this._hashSize&&(N=o[(se+yt)%this._hashSize],!(N!==-1&&N!==i[N]));yt++);N=n[N];let H=N,x;for(;x=i[H],at(C,q,t[2*H],t[2*H+1],t[2*x],t[2*x+1])>=0;)if(H=x,H===N){H=-1;break}if(H===-1)continue;let Q=this._addTriangle(H,E,i[H],-1,-1,s[H]);s[E]=this._legalize(Q+2),s[H]=Q,I++;let G=i[H];for(;x=i[G],at(C,q,t[2*G],t[2*G+1],t[2*x],t[2*x+1])<0;)Q=this._addTriangle(G,E,x,s[E],-1,s[G]),s[E]=this._legalize(Q+2),i[G]=G,I--,G=x;if(H===N)for(;x=n[H],at(C,q,t[2*x],t[2*x+1],t[2*H],t[2*H+1])<0;)Q=this._addTriangle(x,E,H,-1,s[H],s[x]),this._legalize(Q+2),s[x]=Q,i[H]=H,I--,H=x;this._hullStart=n[E]=H,i[H]=n[G]=E,i[E]=G,o[this._hashKey(C,q)]=E,o[this._hashKey(t[2*H],t[2*H+1])]=H}this.hull=new Uint32Array(I);for(let v=0,P=this._hullStart;v<I;v++)this.hull[v]=P,P=i[P];this.triangles=this._triangles.subarray(0,this.trianglesLen),this.halfedges=this._halfedges.subarray(0,this.trianglesLen)}_hashKey(t,n){return Math.floor(be(t-this._cx,n-this._cy)*this._hashSize)%this._hashSize}_legalize(t){const{_triangles:n,_halfedges:i,coords:s}=this;let o=0,r=0;for(;;){const a=i[t],l=t-t%3;if(r=l+(t+2)%3,a===-1){if(o===0)break;t=lt[--o];continue}const h=a-a%3,g=l+(t+1)%3,c=h+(a+2)%3,d=n[r],u=n[t],w=n[g],f=n[c];if(ve(s[2*d],s[2*d+1],s[2*u],s[2*u+1],s[2*w],s[2*w+1],s[2*f],s[2*f+1])){n[t]=f,n[a]=d;const p=i[c];if(p===-1){let b=this._hullStart;do{if(this._hullTri[b]===c){this._hullTri[b]=t;break}b=this._hullPrev[b]}while(b!==this._hullStart)}this._link(t,p),this._link(a,i[r]),this._link(r,c);const M=h+(a+1)%3;o<lt.length&&(lt[o++]=M)}else{if(o===0)break;t=lt[--o]}}return r}_link(t,n){this._halfedges[t]=n,n!==-1&&(this._halfedges[n]=t)}_addTriangle(t,n,i,s,o,r){const a=this.trianglesLen;return this._triangles[a]=t,this._triangles[a+1]=n,this._triangles[a+2]=i,this._link(a,s),this._link(a+1,o),this._link(a+2,r),this.trianglesLen+=3,a}}function be(e,t){const n=e/(Math.abs(e)+Math.abs(t));return(t>0?3-n:1+n)/4}function vt(e,t,n,i){const s=e-n,o=t-i;return s*s+o*o}function ve(e,t,n,i,s,o,r,a){const l=e-r,h=t-a,g=n-r,c=i-a,d=s-r,u=o-a,w=l*l+h*h,f=g*g+c*c,y=d*d+u*u;return l*(c*y-f*u)-h*(g*y-f*d)+w*(g*u-c*d)<0}function we(e,t,n,i,s,o){const r=n-e,a=i-t,l=s-e,h=o-t,g=r*r+a*a,c=l*l+h*h,d=.5/(r*h-a*l),u=(h*g-a*c)*d,w=(r*c-l*g)*d;return u*u+w*w}function Me(e,t,n,i,s,o){const r=n-e,a=i-t,l=s-e,h=o-t,g=r*r+a*a,c=l*l+h*h,d=.5/(r*h-a*l),u=e+(h*g-a*c)*d,w=t+(r*c-l*g)*d;return{x:u,y:w}}function et(e,t,n,i){if(i-n<=20)for(let s=n+1;s<=i;s++){const o=e[s],r=t[o];let a=s-1;for(;a>=n&&t[e[a]]>r;)e[a+1]=e[a--];e[a+1]=o}else{const s=n+i>>1;let o=n+1,r=i;nt(e,s,o),t[e[n]]>t[e[i]]&&nt(e,n,i),t[e[o]]>t[e[i]]&&nt(e,o,i),t[e[n]]>t[e[o]]&&nt(e,n,o);const a=e[o],l=t[a];for(;;){do o++;while(t[e[o]]<l);do r--;while(t[e[r]]>l);if(r<o)break;nt(e,o,r)}e[n+1]=e[r],e[r]=a,i-o+1>=r-n?(et(e,t,o,i),et(e,t,n,r-1)):(et(e,t,n,r-1),et(e,t,o,i))}}function nt(e,t,n){const i=e[t];e[t]=e[n],e[n]=i}function Se(e){return e[0]}function _e(e){return e[1]}const gt=(e,t=0)=>{const n=10**t;return Math.round(e*n)/n},$=(e,t,n)=>Math.min(Math.max(e,t),n),W=e=>$(e,0,100),Kt=(e,t)=>e===void 0&&t===void 0?Math.random():(t===void 0&&(t=e,e=0),Math.floor(Math.random()*(t-e+1))+e),Tt=e=>e>=1?!0:e<=0?!1:Math.random()<e,z=e=>{if(typeof e!="string")return 0;if(!Number.isNaN(+e))return~~e+ +Tt(+e-~~e);const t=e[0]==="-"?-1:1;Number.isNaN(+e[0])&&(e=e.slice(1));const n=e.includes("-")?e.split("-"):null;if(!n)return 0;const i=Kt(parseFloat(n[0])*t,+parseFloat(n[1]));return Number.isNaN(i)||i<0?0:i},Jt=({maxValue:e,length:t,from:n})=>{const i=e<=255?Uint8Array:e<=65535?Uint16Array:Uint32Array;return n?i.from(n):new i(t)},$t=e=>e.length?e.reduce((t,n)=>t+n,0)/e.length:0,Xt=(e,t)=>{if(!e.length)return;let n=0;for(let i=1;i<e.length;i++)t(e[i],e[n])<0&&(n=i);return n},Yt=e=>{const t=Math.max(0,Math.ceil(e));return Array.from({length:t},(n,i)=>i)},Rt=(e,t)=>Math.hypot(e[0]-t[0],e[1]-t[1]),Te=([e,t],n,i)=>[$(e,0,n),$(t,0,i)];class Pe{constructor(t,n,i){Z(this,"cells",{v:[],c:[],b:[],i:new Uint32Array});Z(this,"vertices",{p:[],v:[],c:[]});this.delaunay=t,this.points=n,this.pointsN=i;for(let s=0;s<this.delaunay.triangles.length;s++){const o=this.delaunay.triangles[this.nextHalfedge(s)];if(o<this.pointsN&&!this.cells.c[o]){const a=this.edgesAroundPoint(s);this.cells.v[o]=a.map(l=>this.triangleOfEdge(l)),this.cells.c[o]=a.map(l=>this.delaunay.triangles[l]).filter(l=>l<this.pointsN),this.cells.b[o]=a.length>this.cells.c[o].length?1:0}const r=this.triangleOfEdge(s);this.vertices.p[r]||(this.vertices.p[r]=this.triangleCenter(r),this.vertices.v[r]=this.trianglesAdjacentToTriangle(r),this.vertices.c[r]=this.pointsOfTriangle(r))}}pointsOfTriangle(t){return this.edgesOfTriangle(t).map(n=>this.delaunay.triangles[n])}trianglesAdjacentToTriangle(t){const n=[];for(const i of this.edgesOfTriangle(t)){const s=this.delaunay.halfedges[i];n.push(this.triangleOfEdge(s))}return n}edgesAroundPoint(t){const n=[];let i=t;do{n.push(i);const s=this.nextHalfedge(i);i=this.delaunay.halfedges[s]}while(i!==-1&&i!==t&&n.length<20);return n}triangleCenter(t){const n=this.pointsOfTriangle(t).map(i=>this.points[i]);return this.circumcenter(n[0],n[1],n[2])}edgesOfTriangle(t){return[3*t,3*t+1,3*t+2]}triangleOfEdge(t){return Math.floor(t/3)}nextHalfedge(t){return t%3===2?t-2:t+1}circumcenter(t,n,i){const[s,o]=t,[r,a]=n,[l,h]=i,g=s*s+o*o,c=r*r+a*a,d=l*l+h*h,u=2*(s*(a-h)+r*(h-o)+l*(o-a));return[Math.floor((g*(a-h)+c*(h-o)+d*(o-a))/u),Math.floor((g*(l-r)+c*(s-l)+d*(r-s))/u)]}}const ke=(e,t,n)=>{const i=gt(-1*n),s=n*2,o=e-i*2,r=t-i*2,a=Math.ceil(o/s)-1,l=Math.ceil(r/s)-1,h=[];for(let g=.5;g<a;g++){const c=Math.ceil(o*g/a+i);h.push([c,i],[c,r+i])}for(let g=.5;g<l;g++){const c=Math.ceil(r*g/l+i);h.push([i,c],[o+i,c])}return h},Ee=(e,t,n)=>{const i=n/2,s=i*.9,o=s*2,r=()=>Math.random()*o-s,a=[];for(let l=i;l<t;l+=n)for(let h=i;h<e;h+=n){const g=Math.min(gt(h+r(),2),e),c=Math.min(gt(l+r(),2),t);a.push([g,c])}return a},He=(e,t,n)=>{const i=gt(Math.sqrt(e*t/n),2),s=ke(e,t,i),o=Ee(e,t,i),r=Math.floor((e+.5*i-1e-10)/i),a=Math.floor((t+.5*i-1e-10)/i);return{spacing:i,cellsDesired:n,boundary:s,points:o,cellsX:r,cellsY:a}},Ie=(e,t)=>{const n=e.concat(t),i=xt.from(n),s=new Pe(i,n,e.length),o=s.cells;return o.i=Jt({maxValue:e.length,length:e.length}).map((r,a)=>a),{cells:o,vertices:s.vertices}},Ae=(e,t,n,i)=>{Math.random=Ft(e);const{spacing:s,boundary:o,points:r,cellsX:a,cellsY:l}=He(t,n,i),{cells:h,vertices:g}=Ie(r,o);return{spacing:s,cellsDesired:i,boundary:o,points:r,cellsX:a,cellsY:l,cells:h,vertices:g,seed:e,width:t,height:n}},J=(e,t,n)=>Math.floor(Math.min(t/n.spacing,n.cellsY-1))*n.cellsX+Math.floor(Math.min(e/n.spacing,n.cellsX-1)),Ce=`Hill 1 90-100 44-56 40-60
  Multiply 0.8 50-100 0 0
  Range 1.5 30-55 45-55 40-60
  Smooth 3 0 0 0
  Hill 1.5 35-45 25-30 20-75
  Hill 1 35-55 75-80 25-75
  Hill 0.5 20-25 10-15 20-25
  Mask 3 0 0 0`,xe=`Hill 1 90-100 65-75 47-53
  Add 7 all 0 0
  Hill 5-6 20-30 25-55 45-55
  Range 1 40-50 45-55 45-55
  Multiply 0.8 land 0 0
  Mask 3 0 0 0
  Smooth 2 0 0 0
  Trough 2-3 20-30 20-30 20-30
  Trough 2-3 20-30 60-80 70-80
  Hill 1 10-15 60-60 50-50
  Hill 1.5 13-16 15-20 20-75
  Range 1.5 30-40 15-85 30-40
  Range 1.5 30-40 15-85 60-70
  Pit 3-5 10-30 15-85 20-80`,Re=`Hill 1 90-99 60-80 45-55
  Hill 1-2 20-30 10-30 10-90
  Smooth 2 0 0 0
  Hill 6-7 25-35 20-70 30-70
  Range 1 40-50 45-55 45-55
  Trough 2-3 20-30 15-85 20-30
  Trough 2-3 20-30 15-85 70-80
  Hill 1.5 10-15 5-15 20-80
  Hill 1 10-15 85-95 70-80
  Pit 5-7 15-25 15-85 20-80
  Multiply 0.4 20-100 0 0
  Mask 4 0 0 0`,Le=`Hill 1 80-85 60-80 40-60
  Hill 1 80-85 20-30 40-60
  Hill 6-7 15-30 25-75 15-85
  Multiply 0.6 land 0 0
  Hill 8-10 5-10 15-85 20-80
  Range 1-2 30-60 5-15 25-75
  Range 1-2 30-60 80-95 25-75
  Range 0-3 30-60 80-90 20-80
  Strait 2 vertical 0 0
  Strait 1 vertical 0 0
  Smooth 3 0 0 0
  Trough 3-4 15-20 15-85 20-80
  Trough 3-4 5-10 45-55 45-55
  Pit 3-4 10-20 15-85 20-80
  Mask 4 0 0 0`,qe=`Add 11 all 0 0
  Range 2-3 40-60 20-80 20-80
  Hill 5 15-20 10-90 30-70
  Hill 2 10-15 10-30 20-80
  Hill 2 10-15 60-90 20-80
  Smooth 3 0 0 0
  Trough 10 20-30 5-95 5-95
  Strait 2 vertical 0 0
  Strait 2 horizontal 0 0`,De=`Hill 1 75-80 50-60 45-55
  Hill 1.5 30-50 25-75 30-70
  Hill .5 30-50 25-35 30-70
  Smooth 1 0 0 0
  Multiply 0.2 25-100 0 0
  Hill 0.5 10-20 50-55 48-52`,Oe=`Range 4-6 30-80 0-100 0-10
  Range 4-6 30-80 0-100 90-100
  Hill 6-8 30-50 10-90 0-5
  Hill 6-8 30-50 10-90 95-100
  Multiply 0.9 land 0 0
  Mask -2 0 0 0
  Smooth 1 0 0 0
  Hill 2-3 30-70 0-5 20-80
  Hill 2-3 30-70 95-100 20-80
  Trough 3-6 40-50 0-100 0-10
  Trough 3-6 40-50 0-100 90-100`,Ue=`Range 2-3 20-35 40-50 0-15
  Add 5 all 0 0
  Hill 1 90-100 10-90 0-5
  Add 13 all 0 0
  Hill 3-4 3-5 5-95 80-100
  Hill 1-2 3-5 5-95 40-60
  Trough 5-6 10-25 5-95 5-95
  Smooth 3 0 0 0
  Invert 0.4 both 0 0`,Be=`Hill 1-2 25-40 15-50 0-10
  Hill 1-2 5-40 50-85 0-10
  Hill 1-2 25-40 50-85 90-100
  Hill 1-2 5-40 15-50 90-100
  Hill 8-12 20-40 20-80 48-52
  Smooth 2 0 0 0
  Multiply 0.7 land 0 0
  Trough 3-4 25-35 5-95 10-20
  Trough 3-4 25-35 5-95 80-90
  Range 5-6 30-40 10-90 35-65`,Ne=`Hill 5-10 15-30 0-30 0-20
  Hill 5-10 15-30 10-50 20-40
  Hill 5-10 15-30 30-70 40-60
  Hill 5-10 15-30 50-90 60-80
  Hill 5-10 15-30 70-100 80-100
  Smooth 2 0 0 0
  Trough 4-8 15-30 0-30 0-20
  Trough 4-8 15-30 10-50 20-40
  Trough 4-8 15-30 30-70 40-60
  Trough 4-8 15-30 50-90 60-80
  Trough 4-8 15-30 70-100 80-100
  Invert 0.25 x 0 0`,We=`Hill 8 35-40 15-85 30-70
  Trough 10-20 40-50 5-95 5-95
  Range 5-7 30-40 10-90 20-80
  Pit 12-20 30-40 15-85 20-80`,$e=`Hill 1-3 20-30 30-70 30-70
  Hill 2-4 60-85 0-5 0-100
  Hill 2-4 60-85 95-100 0-100
  Hill 3-4 60-85 20-80 0-5
  Hill 3-4 60-85 20-80 95-100
  Smooth 3 0 0 0`,Xe=`Range 3 70 15-85 20-80
  Hill 2-3 50-70 15-45 20-80
  Hill 2-3 50-70 65-85 20-80
  Hill 4-6 20-25 15-85 20-80
  Multiply 0.5 land 0 0
  Smooth 2 0 0 0
  Range 3-4 20-50 15-35 20-45
  Range 2-4 20-50 65-85 45-80
  Strait 3-7 vertical 0 0
  Trough 6-8 20-50 15-85 45-65
  Pit 5-6 20-30 10-90 10-90`,Ye=`Hill 12-15 50-80 5-95 5-95
  Mask -1.5 0 0 0
  Mask 3 0 0 0
  Add -20 30-100 0 0
  Range 6-8 40-50 5-95 10-90`,ft={volcano:{id:0,name:"Volcano",template:Ce,probability:3},highIsland:{id:1,name:"High Island",template:xe,probability:19},lowIsland:{id:2,name:"Low Island",template:Re,probability:9},continents:{id:3,name:"Continents",template:Le,probability:16},archipelago:{id:4,name:"Archipelago",template:qe,probability:18},atoll:{id:5,name:"Atoll",template:De,probability:1},mediterranean:{id:6,name:"Mediterranean",template:Oe,probability:5},peninsula:{id:7,name:"Peninsula",template:Ue,probability:3},pangea:{id:8,name:"Pangea",template:Be,probability:5},isthmus:{id:9,name:"Isthmus",template:Ne,probability:2},shattered:{id:10,name:"Shattered",template:We,probability:7},taklamakan:{id:11,name:"Taklamakan",template:$e,probability:1},oldWorld:{id:12,name:"Old World",template:Xe,probability:8},fractious:{id:13,name:"Fractious",template:Ye,probability:3}},Lt={"africa-centric":{id:0,name:"Africa Centric"},arabia:{id:1,name:"Arabia"},atlantics:{id:2,name:"Atlantics"},britain:{id:3,name:"Britain"},caribbean:{id:4,name:"Caribbean"},"east-asia":{id:5,name:"East Asia"},eurasia:{id:6,name:"Eurasia"},europe:{id:7,name:"Europe"},"europe-accented":{id:8,name:"Europe Accented"},"europe-and-central-asia":{id:9,name:"Europe and Central Asia"},"europe-central":{id:10,name:"Europe Central"},"europe-north":{id:11,name:"Europe North"},greenland:{id:12,name:"Greenland"},hellenica:{id:13,name:"Hellenica"},iceland:{id:14,name:"Iceland"},"indian-ocean":{id:15,name:"Indian Ocean"},"mediterranean-sea":{id:16,name:"Mediterranean Sea"},"middle-east":{id:17,name:"Middle East"},"north-america":{id:18,name:"North America"},"us-centric":{id:19,name:"US-centric"},"us-mainland":{id:20,name:"US Mainland"},world:{id:21,name:"World"},"world-from-pacific":{id:22,name:"World from Pacific"}},Ge={...ft,...Lt},je=e=>({1e3:.93,2e3:.95,5e3:.97,1e4:.98,2e4:.99,3e4:.991,4e4:.993,5e4:.994,6e4:.995,7e4:.9955,8e4:.996,9e4:.9964,1e5:.9973})[e]||.98,ze=e=>({1e3:.75,2e3:.77,5e3:.79,1e4:.81,2e4:.82,3e4:.83,4e4:.84,5e4:.86,6e4:.87,7e4:.88,8e4:.91,9e4:.92,1e5:.93})[e]||.81;class Fe{constructor(){Z(this,"grid",null);Z(this,"heights",null);Z(this,"blobPower",0);Z(this,"linePower",0)}setGraph(t){const{cellsDesired:n,cells:i,points:s}=t;this.heights=i.h?Uint8Array.from(i.h):Jt({maxValue:100,length:s.length}),this.blobPower=je(n),this.linePower=ze(n),this.grid=t}async generate(t,n,i){Math.random=Ft(i);const o=n in ft?this.fromTemplate(t,n):await this.fromPrecreated(t,n);return this.clearData(),o}fromTemplate(t,n){var o;const s=(((o=ft[n])==null?void 0:o.template)||"").split(`
`);if(!s.length)throw new Error(`Heightmap template has no steps: ${n}`);this.setGraph(t);for(const r of s){const a=r.trim().split(" ");if(a.length<2)throw new Error(`Invalid heightmap template step: ${r}`);this.addStep(...a)}return Uint8Array.from(this.heights??[])}getHeights(){return this.heights}clearData(){this.heights=null,this.grid=null}getPointInRange(t,n){if(typeof t!="string")return;const i=parseInt(t.split("-")[0],10)/100||0,s=parseInt(t.split("-")[1],10)/100||i;return Kt(i*n,s*n)}addHill(t,n,i,s){const o=()=>{if(!this.heights||!this.grid)return;const a=new Uint8Array(this.heights.length);let l=0,h=0;const g=W(z(n));do{const d=this.getPointInRange(i,this.grid.width),u=this.getPointInRange(s,this.grid.height);if(d===void 0||u===void 0)return;h=J(d,u,this.grid),l++}while(this.heights[h]+g>90&&l<50);a[h]=g;const c=[h];for(;c.length;){const d=c.shift();for(const u of this.grid.cells.c[d])a[u]||(a[u]=a[d]**this.blobPower*(Math.random()*.2+.9),a[u]>1&&c.push(u))}this.heights=this.heights.map((d,u)=>W(d+a[u]))},r=z(t);for(let a=0;a<r;a++)o()}addPit(t,n,i,s){const o=()=>{if(!this.heights||!this.grid)return;const a=new Uint8Array(this.heights.length);let l=0,h=0,g=W(z(n));do{const d=this.getPointInRange(i,this.grid.width),u=this.getPointInRange(s,this.grid.height);if(d===void 0||u===void 0)return;h=J(d,u,this.grid),l++}while(this.heights[h]<20&&l<50);const c=[h];for(;c.length;){const d=c.shift();if(g=g**this.blobPower*(Math.random()*.2+.9),g<1)return;this.grid.cells.c[d].forEach(u=>{a[u]||this.heights===null||(this.heights[u]=W(this.heights[u]-g*(Math.random()*.2+.9)),a[u]=1,c.push(u))})}},r=z(t);for(let a=0;a<r;a++)o()}addRange(t,n,i,s,o,r){if(!this.heights||!this.grid)return;const a=()=>{if(!this.heights||!this.grid)return;const h=new Uint8Array(this.heights.length);let g=W(z(n));const c=(f,y)=>{const p=[f],M=this.grid.points;for(h[f]=1;f!==y;){let b=1/0;if(this.grid.cells.c[f].forEach(S=>{if(h[S])return;let _=(M[y][0]-M[S][0])**2+(M[y][1]-M[S][1])**2;Math.random()>.85&&(_=_/2),_<b&&(b=_,f=S)}),b===1/0)return p;p.push(f),h[f]=1}return p};if(i&&s){const f=this.getPointInRange(i,this.grid.width),y=this.getPointInRange(s,this.grid.height);let p=0,M=0,b=0,S=0;do S=Math.random()*this.grid.width*.8+this.grid.width*.1,b=Math.random()*this.grid.height*.7+this.grid.height*.15,p=Math.abs(b-y)+Math.abs(S-f),M++;while((p<this.grid.width/8||p>this.grid.width/3)&&M<50);o=J(f,y,this.grid),r=J(S,b,this.grid)}const d=c(o,r);let u=d.slice(),w=0;for(;u.length;){const f=u.slice();if(u=[],w++,f.forEach(y=>{this.heights&&(this.heights[y]=W(this.heights[y]+g*(Math.random()*.3+.85)))}),g=g**this.linePower-1,g<2)break;f.forEach(y=>{this.grid.cells.c[y].forEach(p=>{h[p]||(u.push(p),h[p]=1)})})}d.forEach((f,y)=>{if(y%6!==0)return;let p=f;for(const M of Yt(w)){const b=Xt(this.grid.cells.c[p],(_,k)=>this.heights[_]-this.heights[k]);if(b===void 0)continue;const S=this.grid.cells.c[p][b];this.heights[S]=(this.heights[p]*2+this.heights[S])/3,p=S}})},l=z(t);for(let h=0;h<l;h++)a()}addTrough(t,n,i,s,o,r){const a=()=>{if(!this.heights||!this.grid)return;const h=new Uint8Array(this.heights.length);let g=W(z(n));const c=(f,y)=>{const p=[f],M=this.grid.points;for(h[f]=1;f!==y;){let b=1/0;if(this.grid.cells.c[f].forEach(S=>{if(h[S])return;let _=(M[y][0]-M[S][0])**2+(M[y][1]-M[S][1])**2;Math.random()>.8&&(_=_/2),_<b&&(b=_,f=S)}),b===1/0)return p;p.push(f),h[f]=1}return p};if(i&&s){let f=0,y=0,p=0,M=0,b=0,S=0;do y=this.getPointInRange(i,this.grid.width),p=this.getPointInRange(s,this.grid.height),o=J(y,p,this.grid),f++;while(this.heights[o]<20&&f<50);f=0;do b=Math.random()*this.grid.width*.8+this.grid.width*.1,S=Math.random()*this.grid.height*.7+this.grid.height*.15,M=Math.abs(S-p)+Math.abs(b-y),f++;while((M<this.grid.width/8||M>this.grid.width/2)&&f<50);r=J(b,S,this.grid)}const d=c(o,r);let u=d.slice(),w=0;for(;u.length;){const f=u.slice();if(u=[],w++,f.forEach(y=>{this.heights[y]=W(this.heights[y]-g*(Math.random()*.3+.85))}),g=g**this.linePower-1,g<2)break;f.forEach(y=>{this.grid.cells.c[y].forEach(p=>{h[p]||(u.push(p),h[p]=1)})})}d.forEach((f,y)=>{if(y%6!==0)return;let p=f;for(const M of Yt(w)){const b=Xt(this.grid.cells.c[p],(_,k)=>this.heights[_]-this.heights[k]);if(b===void 0)continue;const S=this.grid.cells.c[p][b];this.heights[S]=(this.heights[p]*2+this.heights[S])/3,p=S}})},l=z(t);for(let h=0;h<l;h++)a()}addStrait(t,n="vertical"){if(!this.heights||!this.grid)return;const i=Math.min(z(t),this.grid.cellsX/3);if(i<1&&Tt(i))return;const s=new Uint8Array(this.heights.length),o=n==="vertical",r=o?Math.floor(Math.random()*this.grid.width*.4+this.grid.width*.3):5,a=o?5:Math.floor(Math.random()*this.grid.height*.4+this.grid.height*.3),l=o?Math.floor(this.grid.width-r-this.grid.width*.1+Math.random()*this.grid.width*.2):this.grid.width-5,h=o?this.grid.height-5:Math.floor(this.grid.height-a-this.grid.height*.1+Math.random()*this.grid.height*.2),g=J(r,a,this.grid),c=J(l,h,this.grid);let u=((y,p)=>{const M=[],b=this.grid.points;for(;y!==p;){let S=1/0;this.grid.cells.c[y].forEach(_=>{let k=(b[p][0]-b[_][0])**2+(b[p][1]-b[_][1])**2;Math.random()>.8&&(k=k/2),k<S&&(S=k,y=_)}),M.push(y)}return M})(g,c);const w=[],f=.1/i;for(let y=0;y<i;y++){const p=.9-f*i;u.forEach(M=>{this.grid.cells.c[M].forEach(b=>{s[b]||(s[b]=1,w.push(b),this.heights[b]**=p,this.heights[b]>100&&(this.heights[b]=5))})}),u=w.slice()}}modify(t,n,i,s){if(!this.heights)return;const o=t==="land"?20:t==="all"?0:+t.split("-")[0],r=t==="land"||t==="all"?100:+t.split("-")[1],a=o===20;this.heights=this.heights.map(l=>l<o||l>r?l:(n&&(l=a?Math.max(l+n,20):l+n),i!==1&&(l=a?(l-20)*i+20:l*i),s&&(l=a?(l-20)**s+20:l**s),W(l)))}smooth(t=2,n=0){!this.heights||!this.grid||(this.heights=this.heights.map((i,s)=>{const o=[i];return this.grid.cells.c[s].forEach(r=>o.push(this.heights[r])),t===1?$t(o)+n:W((i*(t-1)+$t(o)+n)/t)}))}mask(t=1){if(!this.heights||!this.grid)return;const n=t?Math.abs(t):1;this.heights=this.heights.map((i,s)=>{const[o,r]=this.grid.points[s],a=2*o/this.grid.width-1,l=2*r/this.grid.height-1;let h=(1-a**2)*(1-l**2);t<0&&(h=1-h);const g=i*h;return W((i*(n-1)+g)/n)})}invert(t,n){if(!Tt(t)||!this.heights||!this.grid)return;const i=n!=="y",s=n!=="x",{cellsX:o,cellsY:r}=this.grid;this.heights=this.heights.map((a,l)=>{const h=l%o,g=Math.floor(l/o),c=i?o-h-1:h,d=s?r-g-1:g,u=c+d*o;return this.heights[u]})}addStep(t,n,i,s,o){if(t==="Hill")return this.addHill(n,i,s,o);if(t==="Pit")return this.addPit(n,i,s,o);if(t==="Range")return this.addRange(n,i,s,o);if(t==="Trough")return this.addTrough(n,i,s,o);if(t==="Strait")return this.addStrait(n,i);if(t==="Mask")return this.mask(+n);if(t==="Invert")return this.invert(+n,i);if(t==="Add")return this.modify(i,+n,1);if(t==="Multiply")return this.modify(i,0,+n);if(t==="Smooth")return this.smooth(+n)}getHeightsFromImageData(t){if(this.heights)for(let n=0;n<this.heights.length;n++){const i=t[n*4]/255,s=i<.2?i:.2+(i-.2)**.8;this.heights[n]=$(Math.floor(s*100),0,100)}}fromPrecreated(t,n){if(!(n in Lt))throw new Error(`Unknown precreated heightmap: ${n}`);return new Promise((i,s)=>{const o=document.createElement("canvas"),r=o.getContext("2d"),{cellsX:a,cellsY:l}=t;o.width=a,o.height=l;const h=new Image,g="./";h.src=`${g.replace(/\/?$/,"/")}heightmaps/${n}.png`,h.onload=()=>{if(!r){s(new Error("Could not get canvas context"));return}this.heights=this.heights||new Uint8Array(a*l),r.drawImage(h,0,0,a,l);const c=r.getImageData(0,0,a,l);this.setGraph(t),this.getHeightsFromImageData(c.data),i(Uint8Array.from(this.heights??[]))},h.onerror=()=>s(new Error(`Could not load heightmap image: ${n}`))})}}const X=1e3,Y=700,Qt="fantasy-world-map-state-v1",wt={seed:"20260425",heightmapId:"continents",cellsDesired:2e4,renderStyle:"terrain",creationMode:!1,activeTool:"border",borderColor:"#b92e3a",roadColor:"#7c5a2b",borderWidth:5,roadWidth:4,snapRoads:!0,strokes:[],settlements:[]};let m=sn(),L=null,B=null,A=null,pt=null,mt=[],Mt=null;const Zt=document.querySelector("#app");if(!Zt)throw new Error("App root not found");Zt.innerHTML=`
  <div class="shell ${m.creationMode?"creation":""}" id="shell">
    <header class="topbar" id="topbar">
      <div class="field compact">
        <span>Template</span>
        <select id="heightmapSelect"></select>
      </div>
      <div class="field seed-field">
        <span>Seed</span>
        <input id="seedInput" inputmode="numeric" autocomplete="off" />
      </div>
      <div class="field compact">
        <span>Detail</span>
        <select id="detailSelect">
          <option value="10000">10k</option>
          <option value="20000">20k</option>
          <option value="30000">30k</option>
          <option value="50000">50k</option>
        </select>
      </div>
      <div class="field compact">
        <span>View</span>
        <select id="renderSelect">
          <option value="terrain">Terrain</option>
          <option value="height">Height</option>
          <option value="relief">Relief</option>
        </select>
      </div>
      <button class="button primary" id="generateButton" type="button">Generate</button>
      <button class="button" id="randomButton" type="button">Random</button>
    </header>

    <main class="map-stage" id="mapStage" aria-label="Fantasy world map editor">
      <canvas id="mapCanvas"></canvas>
      <canvas id="editCanvas"></canvas>
      <div class="loading" id="loading">Generating terrain</div>
      <div class="status-pill" id="statusPill"></div>
    </main>

    <nav class="floatbar" aria-label="Map actions">
      <button class="button glass" id="creationToggle" type="button"></button>
      <button class="button glass creation-only" id="toolsToggle" type="button">Tools</button>
      <button class="button glass" id="installButton" type="button" hidden>Install</button>
    </nav>

    <section class="editor-drawer" id="editorDrawer" aria-label="Creation tools">
      <div class="drawer-grip"></div>
      <div class="tool-grid" role="group" aria-label="Tool">
        <button class="tool-button" data-tool="border" type="button">Border</button>
        <button class="tool-button" data-tool="road" type="button">Road</button>
        <button class="tool-button" data-tool="capital" type="button">Capital</button>
        <button class="tool-button" data-tool="town" type="button">Town</button>
      </div>
      <div class="drawer-fields">
        <label class="field">
          <span>Border color</span>
          <input id="borderColor" type="color" />
        </label>
        <label class="field">
          <span>Border width</span>
          <input id="borderWidth" type="range" min="1" max="18" step="1" />
        </label>
        <label class="field">
          <span>Road color</span>
          <input id="roadColor" type="color" />
        </label>
        <label class="field">
          <span>Road width</span>
          <input id="roadWidth" type="range" min="1" max="14" step="1" />
        </label>
      </div>
      <label class="toggle-row">
        <input id="snapRoads" type="checkbox" />
        <span>Snap roads</span>
      </label>
      <div class="drawer-actions">
        <button class="button" id="undoButton" type="button">Undo</button>
        <button class="button" id="clearButton" type="button">Clear</button>
        <button class="button" id="exportButton" type="button">PNG</button>
      </div>
    </section>
  </div>
`;const Ke=document.querySelector("#shell"),Je=document.querySelector("#mapStage"),qt=document.querySelector("#mapCanvas"),j=document.querySelector("#editCanvas"),Gt=document.querySelector("#loading"),ot=document.querySelector("#statusPill"),Pt=document.querySelector("#editorDrawer"),Vt=document.querySelector("#creationToggle"),Qe=document.querySelector("#toolsToggle"),St=document.querySelector("#installButton"),kt=document.querySelector("#seedInput"),st=document.querySelector("#heightmapSelect"),ht=document.querySelector("#detailSelect"),dt=document.querySelector("#renderSelect"),Ze=document.querySelector("#generateButton"),Ve=document.querySelector("#randomButton"),Et=document.querySelector("#borderColor"),Ht=document.querySelector("#roadColor"),It=document.querySelector("#borderWidth"),At=document.querySelector("#roadWidth"),Ct=document.querySelector("#snapRoads"),tn=document.querySelector("#undoButton"),en=document.querySelector("#clearButton"),nn=document.querySelector("#exportButton"),on=new Fe,ut=document.createElement("canvas"),_t=ut.getContext("2d",{willReadFrequently:!0});rn();an();ln();te();it();function sn(){const e=localStorage.getItem(Qt);if(!e)return{...wt};try{const t=JSON.parse(e);return{...wt,...t,strokes:Array.isArray(t.strokes)?t.strokes:[],settlements:Array.isArray(t.settlements)?t.settlements:[]}}catch{return{...wt}}}function O(){localStorage.setItem(Qt,JSON.stringify(m))}function rn(){const e=Object.entries(ft).map(([n,i])=>`<option value="${n}">${i.name}</option>`).join(""),t=Object.entries(Lt).map(([n,i])=>`<option value="${n}">${i.name}</option>`).join("");st.innerHTML=`
    <optgroup label="Procedural">${e}</optgroup>
    <optgroup label="Precreated">${t}</optgroup>
  `}function an(){kt.value=m.seed,st.value=m.heightmapId,ht.value=String(m.cellsDesired),dt.value=m.renderStyle,Et.value=m.borderColor,Ht.value=m.roadColor,It.value=String(m.borderWidth),At.value=String(m.roadWidth),Ct.checked=m.snapRoads,ie(),oe()}function ln(){window.addEventListener("resize",()=>{te(),cn()}),Ze.addEventListener("click",()=>{m.seed=kt.value.trim()||m.seed,m.heightmapId=st.value,m.cellsDesired=Number(ht.value),m.renderStyle=dt.value,O(),it()}),Ve.addEventListener("click",()=>{m.seed=String(Math.floor(Math.random()*1e9)),kt.value=m.seed,O(),it()}),st.addEventListener("change",()=>{m.heightmapId=st.value,O(),it()}),ht.addEventListener("change",()=>{m.cellsDesired=Number(ht.value),O(),it()}),dt.addEventListener("change",()=>{m.renderStyle=dt.value,O(),Dt()}),Vt.addEventListener("click",()=>{m.creationMode=!m.creationMode,m.creationMode||Pt.classList.remove("open"),O(),ie()}),Qe.addEventListener("click",()=>{Pt.classList.toggle("open")}),document.querySelectorAll("[data-tool]").forEach(e=>{e.addEventListener("click",()=>{m.activeTool=e.dataset.tool,O(),oe()})}),Et.addEventListener("input",()=>{m.borderColor=Et.value,O()}),Ht.addEventListener("input",()=>{m.roadColor=Ht.value,O()}),It.addEventListener("input",()=>{m.borderWidth=Number(It.value),O()}),At.addEventListener("input",()=>{m.roadWidth=Number(At.value),O()}),Ct.addEventListener("change",()=>{m.snapRoads=Ct.checked,O()}),tn.addEventListener("click",bn),en.addEventListener("click",vn),nn.addEventListener("click",wn),j.addEventListener("pointerdown",pn),j.addEventListener("pointermove",mn),j.addEventListener("pointerup",jt),j.addEventListener("pointercancel",jt),window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),Mt=e,St.hidden=!1}),St.addEventListener("click",async()=>{const e=Mt;e!=null&&e.prompt&&(await e.prompt(),Mt=null,St.hidden=!0)}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register(`${"./".replace(/\/?$/,"/")}sw.js`).catch(()=>{})})}async function it(){var e;Gt.classList.add("visible"),ot.textContent="Generating";try{await new Promise(requestAnimationFrame),L=Ae(m.seed,X,Y,m.cellsDesired),B=await on.generate(L,m.heightmapId,m.seed),L.cells.h=B,Dt(),K();const t=((e=Ge[m.heightmapId])==null?void 0:e.name)||m.heightmapId;ot.textContent=`${t} / ${m.seed}`}catch(t){console.error(t),ot.textContent="Generation failed"}finally{Gt.classList.remove("visible")}}function te(){const e=Je.getBoundingClientRect(),t=Math.min(e.width/X,e.height/Y),n=X*t,i=Y*t,s=(e.width-n)/2,o=(e.height-i)/2;for(const r of[qt,j]){const a=window.devicePixelRatio||1;r.width=Math.round(X*a),r.height=Math.round(Y*a),r.style.width=`${n}px`,r.style.height=`${i}px`,r.style.left=`${s}px`,r.style.top=`${o}px`;const l=r.getContext("2d");l==null||l.setTransform(a,0,0,a,0,0)}}function cn(){Dt(),K()}function Dt(){if(!L||!B||!_t)return;ut.width=L.cellsX,ut.height=L.cellsY;const e=_t.createImageData(L.cellsX,L.cellsY);for(let n=0;n<B.length;n++){const i=B[n]??0,s=dn(n,i),[o,r,a]=un(i,s),l=n*4;e.data[l]=o,e.data[l+1]=r,e.data[l+2]=a,e.data[l+3]=255}_t.putImageData(e,0,0);const t=qt.getContext("2d");t.clearRect(0,0,X,Y),t.imageSmoothingEnabled=!0,t.drawImage(ut,0,0,X,Y),hn(t)}function hn(e){if(!L||!B||m.renderStyle==="height")return;e.save(),e.globalAlpha=.16,e.fillStyle="#fff8d4";const t=Math.max(1.4,L.spacing*.28);for(let n=0;n<B.length;n++){if(B[n]<19||B[n]>23)continue;const[i,s]=L.points[n];e.beginPath(),e.arc(i,s,t,0,Math.PI*2),e.fill()}e.restore()}function dn(e,t){if(!L||!B||m.renderStyle==="height")return 0;const n=e%L.cellsX,i=Math.floor(e/L.cellsX),s=n<L.cellsX-1?B[e+1]:t,o=i<L.cellsY-1?B[e+L.cellsX]:t;return $((t-s)*1.6+(t-o)*1.1,-22,22)}function un(e,t){if(m.renderStyle==="height"){const i=Math.round(e/100*255);return[i,i,i]}if(m.renderStyle==="relief"){const i=$(Math.round(36+e*2.15+t),0,255),s=e<20?$(i+34,0,255):$(i-26,0,255);return[i,$(i+10,0,255),s]}let n;return e<8?n=V([17,52,78],[25,80,106],e/8):e<20?n=V([25,80,106],[75,133,142],(e-8)/12):e<24?n=V([205,190,127],[182,188,116],(e-20)/4):e<45?n=V([101,152,94],[73,128,88],(e-24)/21):e<65?n=V([73,128,88],[133,132,82],(e-45)/20):e<82?n=V([133,132,82],[139,111,84],(e-65)/17):n=V([174,163,140],[245,242,228],(e-82)/18),n.map(i=>$(Math.round(i+t),0,255))}function V(e,t,n){const i=$(n,0,1);return[Math.round(e[0]+(t[0]-e[0])*i),Math.round(e[1]+(t[1]-e[1])*i),Math.round(e[2]+(t[2]-e[2])*i)]}function K(){const e=j.getContext("2d");e.clearRect(0,0,X,Y),ee(e,[...m.strokes,...A?[A]:[]],m.settlements)}function ee(e,t,n){e.save(),e.lineCap="round",e.lineJoin="round";for(const i of t)if(!(i.points.length<2)){e.strokeStyle=i.color,e.lineWidth=i.width,e.globalAlpha=i.kind==="road"?.86:.94,e.setLineDash(i.kind==="road"?[]:[i.width*2.8,i.width*1.4]),e.beginPath(),e.moveTo(i.points[0][0],i.points[0][1]);for(const s of i.points.slice(1))e.lineTo(s[0],s[1]);e.stroke()}e.setLineDash([]),e.globalAlpha=1;for(const i of n)i.kind==="capital"?gn(e,i.x,i.y):fn(e,i.x,i.y);e.restore()}function gn(e,t,n){e.save(),e.fillStyle="#f9f3c7",e.strokeStyle="#2d2518",e.lineWidth=2.4,e.beginPath();for(let o=0;o<10;o++){const r=o%2===0?14:6,a=-Math.PI/2+o*Math.PI/5,l=t+Math.cos(a)*r,h=n+Math.sin(a)*r;o===0?e.moveTo(l,h):e.lineTo(l,h)}e.closePath(),e.stroke(),e.fill(),e.restore()}function fn(e,t,n){e.save(),e.fillStyle="#f8f0ce",e.strokeStyle="#2d2518",e.lineWidth=2.2,e.beginPath(),e.arc(t,n,8,0,Math.PI*2),e.fill(),e.stroke(),e.restore()}function pn(e){if(!m.creationMode)return;e.preventDefault(),pt=e.pointerId,j.setPointerCapture(e.pointerId);const t=ne(e);if(m.activeTool==="capital"||m.activeTool==="town"){const n={id:crypto.randomUUID(),kind:m.activeTool,x:t[0],y:t[1]};m.settlements.push(n),mt.push({type:"settlement",id:n.id}),O(),K();return}A={id:crypto.randomUUID(),kind:m.activeTool,color:m.activeTool==="road"?m.roadColor:m.borderColor,width:m.activeTool==="road"?m.roadWidth:m.borderWidth,points:[t]},K()}function mn(e){if(!A||e.pointerId!==pt)return;e.preventDefault();const t=ne(e),n=A.points[A.points.length-1];Rt(n,t)<2||(A.points.push(t),K())}function jt(e){e.pointerId===pt&&(j.releasePointerCapture(e.pointerId),pt=null,A&&(A.points.length>1&&(A.kind==="road"&&m.snapRoads&&(A.points[0]=zt(A.points[0]),A.points[A.points.length-1]=zt(A.points[A.points.length-1])),A.points=yn(A.points),m.strokes.push(A),mt.push({type:"stroke",id:A.id}),O()),A=null,K()))}function ne(e){const t=j.getBoundingClientRect(),n=(e.clientX-t.left)/t.width*X,i=(e.clientY-t.top)/t.height*Y;return Te([n,i],X,Y)}function zt(e){let t=null,n=1/0;for(const i of m.settlements){const s=Rt(e,[i.x,i.y]);s<n&&(t=i,n=s)}return t&&n<36?[t.x,t.y]:e}function yn(e){if(e.length<4)return e;const t=[e[0]];for(let n=1;n<e.length-1;n++)Rt(t[t.length-1],e[n])>=3&&t.push(e[n]);return t.push(e[e.length-1]),t}function bn(){const e=mt.pop();e&&(e.type==="stroke"?m.strokes=m.strokes.filter(t=>t.id!==e.id):m.settlements=m.settlements.filter(t=>t.id!==e.id),O(),K())}function vn(){!m.strokes.length&&!m.settlements.length||window.confirm("Clear current creation layer?")&&(m.strokes=[],m.settlements=[],A=null,mt=[],O(),K())}function wn(){const e=document.createElement("canvas");e.width=X,e.height=Y;const t=e.getContext("2d");t.drawImage(qt,0,0,X,Y),ee(t,m.strokes,m.settlements);const n=document.createElement("a");n.download=`fantasy-map-${m.seed}.png`,n.href=e.toDataURL("image/png"),n.click()}function ie(){Ke.classList.toggle("creation",m.creationMode),Vt.textContent=m.creationMode?"Exit":"Creation",j.style.pointerEvents=m.creationMode?"auto":"none",m.creationMode||Pt.classList.remove("open"),K()}function oe(){document.querySelectorAll("[data-tool]").forEach(e=>{e.classList.toggle("active",e.dataset.tool===m.activeTool)}),ot.textContent=m.creationMode?m.activeTool:ot.textContent}
