/* ====== عدّل النصوص هنا فقط (CONFIG) ====== */
const CONFIG = {
  name: "فاطمة",
  birth: "2004-11-17", // تاريخ الميلاد (سنة-شهر-يوم)
  sub: "عالم صغير صنعه لكِ أيمن، بمناسبة بلوغك {age} سنة",
  // img: ضع صورة في assets/ ثم اكتب مثلاً "assets/1.jpg" (اتركها فارغة لتبقى الخلفية ملوّنة)
  memories: [
    { t: "ابتسامتك", txt: "ابتسامتك تضيء المكان قبل أن تدخليه، وتجعل الأيام الثقيلة أخفّ.", img: "" },
    { t: "طيبة قلبك", txt: "في قلبك مساحة تتسع للجميع، وهذا نادر في زمن ضاقت فيه القلوب.", img: "" },
    { t: "حضورك", txt: "وجودك نعمة، ومن عرفكِ فقد ربح شيئًا جميلًا لا يُعوَّض.", img: "" }
  ],
  wishes: [
    "أتمنى لكِ سنة تفيض فرحًا وطمأنينة",
    "أتمنى أن تتحقق أحلامك واحدًا تلو الآخر",
    "أتمنى لكِ صحة تحملين بها كل جميل",
    "أتمنى أن تبقى ضحكتك أصدق شيء في أيامك",
    "أتمنى أن تكون هذه أجمل سنة في عمرك حتى الآن"
  ],
  heartDone: "كل نجمة هنا أمنية صادقة لكِ ♥",
  cakeDone: "كل عام وأنتِ بخير يا فاطمة! تمنّي أمنية في قلبك ✨",
  letter: "عزيزتي فاطمة،\nفي يوم ميلادك أردت أن أقول لكِ شيئًا بسيطًا: وجودك في حياتي نعمة أحمد الله عليها.\nشكرًا لكِ على الدفء الذي تتركينه أينما كنتِ، وعلى طيبتك التي لا تتصنّع.\nأتمنى أن تحملك هذه السنة إلى كل ما تحبين، وأن تجدي فيها من الفرح أكثر مما تتوقعين.\nكل عام وأنتِ أجمل.",
  sign: "أيمن"
};
/* ========================================= */

const $ = (s) => document.querySelector(s);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const scenes = [...document.querySelectorAll(".scene")];
let cur = 0, px = .5, py = .5, typing;
addEventListener("pointermove", (e) => { px = e.clientX / innerWidth; py = e.clientY / innerHeight; });

/* ---------- Audio (synthesized, no files) ---------- */
let ac;
const audio = () => ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
function note(f, at = 0, d = .4, type = "sine", v = .18, atk = .02) {
  const a = audio(), o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + atk); g.gain.exponentialRampToValueAtTime(.001, t + d);
  o.connect(g).connect(a.destination); o.start(t); o.stop(t + d);
}
const penta = [523, 587, 659, 784, 880];
const melody = () => [[392, 0], [392, .35], [440, .7], [392, 1.1], [523, 1.5], [494, 1.95]].forEach(([f, t]) => note(f, t, .5, "triangle"));

/* ---------- Fireworks ---------- */
const fx = $("#fx"), fc = fx.getContext("2d");
let sparks = [], fxOn = false;
function burst(x, y) {
  const h = Math.random() * 360;
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * 6.283, s = 1 + Math.random() * 5;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, c: `hsl(${h + Math.random() * 40},100%,65%)` });
  }
  if (!fxOn) { fxOn = true; fxLoop(); }
}
function fxLoop() {
  fc.clearRect(0, 0, fx.width, fx.height);
  sparks = sparks.filter((p) => p.l > 0);
  for (const p of sparks) {
    p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .985; p.l -= .012;
    fc.globalAlpha = Math.max(p.l, 0); fc.fillStyle = p.c; fc.fillRect(p.x, p.y, 3, 3);
  }
  fc.globalAlpha = 1;
  if (sparks.length) requestAnimationFrame(fxLoop); else fxOn = false;
}
function show(n = 5) {
  if (reduce) return;
  for (let i = 0; i < n; i++) setTimeout(() => burst(innerWidth * (.15 + Math.random() * .7), innerHeight * (.15 + Math.random() * .4)), i * 350);
}

/* ---------- Background stars + name made of particles ---------- */
const bg = $("#bg"), bx = bg.getContext("2d");
const nc = $("#name"), nx = nc.getContext("2d");
let stars = [], dots = [], nW = 0, nH = 0, npx = -999, npy = -999;
const dpr = Math.min(devicePixelRatio || 1, 2);

function sizeAll() {
  bg.width = fx.width = innerWidth; bg.height = fx.height = innerHeight;
  stars = Array.from({ length: 110 }, () => ({ x: Math.random() * bg.width, y: Math.random() * bg.height, z: .3 + Math.random() * 1.2, t: Math.random() * 6 }));
  initName();
}
function initName() {
  nW = Math.min(innerWidth - 32, 440); nH = 190;
  nc.width = nW * dpr; nc.height = nH * dpr; nc.style.width = nW + "px"; nc.style.height = nH + "px";
  const o = document.createElement("canvas"); o.width = nW; o.height = nH;
  const ox = o.getContext("2d");
  let fs = 160;
  do { ox.font = `700 ${fs}px "Aref Ruqaa"`; fs -= 6; } while (ox.measureText(CONFIG.name).width > nW * .9 && fs > 20);
  ox.textAlign = "center"; ox.textBaseline = "middle"; ox.fillText(CONFIG.name, nW / 2, nH / 2);
  const d = ox.getImageData(0, 0, nW, nH).data; dots = [];
  for (let y = 0; y < nH; y += 3) for (let x = 0; x < nW; x += 3)
    if (d[(y * nW + x) * 4 + 3] > 128) dots.push({ hx: x, hy: y, x: Math.random() * nW, y: Math.random() * nH, vx: 0, vy: 0, c: `hsl(${330 - x / nW * 140},95%,70%)` });
}
nc.addEventListener("pointermove", (e) => { const r = nc.getBoundingClientRect(); npx = e.clientX - r.left; npy = e.clientY - r.top; });
["pointerleave", "pointerup"].forEach((ev) => nc.addEventListener(ev, () => { npx = npy = -999; }));

function frame(t) {
  bx.clearRect(0, 0, bg.width, bg.height);
  for (const s of stars) {
    bx.fillStyle = `rgba(255,255,255,${.35 + .45 * Math.sin(s.t + t / 900)})`;
    bx.fillRect(s.x + (px - .5) * s.z * 30, s.y + (py - .5) * s.z * 30, s.z * 1.4, s.z * 1.4);
  }
  if (cur === 0 && dots.length) {
    nx.setTransform(dpr, 0, 0, dpr, 0, 0); nx.clearRect(0, 0, nW, nH);
    for (const p of dots) {
      const dx = p.x - npx, dy = p.y - npy, m = Math.hypot(dx, dy) || 1;
      if (m < 60) { const f = (60 - m) / 60 * 3; p.vx += dx / m * f; p.vy += dy / m * f; }
      p.vx += (p.hx - p.x) * .06; p.vy += (p.hy - p.y) * .06; p.vx *= .85; p.vy *= .85; p.x += p.vx; p.y += p.vy;
      nx.fillStyle = p.c; nx.fillRect(p.x, p.y, 2.4, 2.4);
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- Build scenes ---------- */
const bi = (() => {
  const now = new Date(), [by, bm, bd] = CONFIG.birth.split("-").map(Number);
  const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nb = new Date(now.getFullYear(), bm - 1, bd); if (nb < day0) nb.setFullYear(nb.getFullYear() + 1);
  return { days: Math.round((nb - day0) / 864e5), turning: nb.getFullYear() - by };
})();
$("#hb").textContent = bi.days === 0 || bi.days > 30 ? "عيد ميلاد سعيد" : bi.days === 1 ? "غدًا ميلادك" : `بقي ${bi.days} يومًا على ميلادك`;
$("#sub").textContent = bi.days <= 30 ? CONFIG.sub.replace("{age}", bi.turning) : CONFIG.sub.split("،")[0];
$("#sign").textContent = CONFIG.sign;

CONFIG.memories.forEach((m) => {
  const c = document.createElement("article");
  c.className = "card";
  if (m.img) c.style.backgroundImage = `linear-gradient(transparent 40%,rgba(12,10,31,.9)),url(${m.img})`;
  c.innerHTML = "<h3></h3><p></p>";
  c.children[0].textContent = m.t; c.children[1].textContent = m.txt;
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - .5) * 14 + "deg");
    c.style.setProperty("--rx", -((e.clientY - r.top) / r.height - .5) * 14 + "deg");
  });
  c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
  $("#memories").append(c);
});

const pts = [[30, 28], [70, 28], [86, 52], [50, 88], [14, 52]];
const lit = [];
CONFIG.wishes.forEach((w, i) => {
  const b = document.createElement("button");
  b.className = "hs"; b.textContent = "★"; b.setAttribute("aria-label", "أمنية " + (i + 1));
  b.style.left = pts[i][0] + "%"; b.style.top = pts[i][1] + "%";
  b.onclick = () => {
    if (b.classList.contains("on")) return;
    b.classList.add("on"); navigator.vibrate?.(20); lit.push(i); note(penta[lit.length - 1], 0, .6);
    $("#wish").textContent = w;
    const all = lit.length === pts.length;
    $("#lines").innerHTML = `<polyline points="${lit.map((k) => pts[k].join(",")).join(" ")}${all ? " " + pts[lit[0]].join(",") : ""}"/>`;
    if (all) { $("#sky3").classList.add("done"); setTimeout(() => { $("#wish").textContent = CONFIG.heartDone; show(4); melody(); }, 900); }
  };
  $("#sky3").append(b);
});

/* ---------- Cake: blow into the mic, or tap ---------- */
let out = false;
function blow() {
  if (out) return;
  out = true; navigator.vibrate?.([40, 30, 80]); $("#cake").classList.add("out"); $("#mic").hidden = true;
  $("#cakeMsg").textContent = CONFIG.cakeDone; melody(); show(6);
}
$("#cake").onclick = blow;
$("#cake").onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") blow(); };
let micStream = null;
const stopMic = () => { micStream?.getTracks().forEach((t) => t.stop()); micStream = null; };
document.addEventListener("visibilitychange", () => { if (document.hidden) stopMic(); });
$("#mic").onclick = async () => {
  try {
    stopMic();
    const s = micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const a = audio(), an = a.createAnalyser(); an.fftSize = 512;
    a.createMediaStreamSource(s).connect(an);
    const d = new Uint8Array(an.fftSize); let hits = 0;
    $("#cakeMsg").textContent = "انفخي بقوة...";
    (function loop() {
      if (out) { stopMic(); return; }
      if (micStream !== s) return;
      an.getByteTimeDomainData(d);
      let mx = 0; for (let i = 0; i < d.length; i++) mx = Math.max(mx, Math.abs(d[i] - 128));
      hits = mx > 60 ? hits + 1 : 0;
      if (hits >= 5) blow(); else requestAnimationFrame(loop);
    })();
  } catch { $("#cakeMsg").textContent = "اضغطي على الشمعة لإطفائها"; }
};

/* ---------- Navigation + letter ---------- */
const dots_ = $("#dots");
scenes.forEach(() => dots_.append(document.createElement("b")));
function go(n) {
  const to = Math.max(0, Math.min(scenes.length - 1, n));
  const swap = () => {
    cur = to;
    if (cur !== 3) stopMic();
    scenes.forEach((s, i) => s.classList.toggle("active", i === cur));
    [...dots_.children].forEach((d, i) => d.classList.toggle("on", i === cur));
    $("#prev").disabled = cur === 0; $("#next").disabled = cur === scenes.length - 1;
    if (cur === 4) typeLetter();
  };
  if (to !== cur) navigator.vibrate?.(12);
  if (document.startViewTransition && !reduce && to !== cur) document.startViewTransition(swap); else swap();
}
function typeLetter() {
  clearTimeout(typing);
  const el = $("#letter"); el.textContent = "";
  if (reduce) { el.textContent = CONFIG.letter; return; }
  let i = 0;
  CONFIG.letter.split(/(\s+)/).forEach((w) => {
    if (!w.trim()) { el.append(w); return; }
    const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w;
    sp.style.animationDelay = (i++ * .13) + "s"; el.append(sp);
  });
  typing = setTimeout(() => show(3), i * 130 + 900);
}
$("#start").onclick = async () => {
  audio(); note(784, 0, .5); music(true); go(1);
  try { if (DeviceOrientationEvent?.requestPermission) await DeviceOrientationEvent.requestPermission(); } catch {}
  addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    px = .5 + Math.max(-1, Math.min(1, e.gamma / 40)) * .5;
    py = .5 + Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 40)) * .5;
  });
};
$("#next").onclick = () => go(cur + 1);
$("#prev").onclick = () => go(cur - 1);


/* ---------- WebGL: domain-warped aurora shader (raw WebGL, no libs) ---------- */
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r, m; uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}
void main(){
  vec2 u=gl_FragCoord.xy/r; vec2 p=(u-.5)*vec2(r.x/r.y,1.)*2.;
  vec2 q=vec2(fbm(p+t*.05),fbm(p+vec2(5.2,1.3)-t*.04));
  float f=fbm(p+1.6*q+(m-.5)*.7+t*.03);
  vec3 c=mix(vec3(.05,.04,.12),vec3(.48,.36,1.),smoothstep(.2,.8,f));
  c=mix(c,vec3(1.,.42,.54),smoothstep(.5,1.,q.x)*.55);
  c+=vec3(.37,.95,.77)*smoothstep(.65,1.,q.y)*.22;
  c*=1.-.5*length(u-.5);
  gl_FragColor=vec4(c,1.);
}`;
function initGL() {
  const c = $("#gl"), gl = c.getContext("webgl", { alpha: false, powerPreference: "low-power" });
  if (!gl) return;
  let U = null;
  const mk = (ty, src) => { const sh = gl.createShader(ty); gl.shaderSource(sh, src); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; };
  const setup = () => {
    const v = mk(gl.VERTEX_SHADER, "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}"), f = mk(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return false;
    const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return false;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    U = { r: gl.getUniformLocation(pr, "r"), m: gl.getUniformLocation(pr, "m"), t: gl.getUniformLocation(pr, "t") };
    return true;
  };
  if (!setup()) return;
  c.addEventListener("webglcontextlost", (e) => { e.preventDefault(); U = null; });
  c.addEventListener("webglcontextrestored", setup);
  document.body.classList.add("gl");
  (function draw(t) {
    if (U) {
      const w = Math.round(innerWidth * .5), h = Math.round(innerHeight * .5);
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(U.r, w, h); gl.uniform2f(U.m, px, 1 - py); gl.uniform1f(U.t, reduce ? 0 : t / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!reduce) requestAnimationFrame(draw);
  })(0);
}

/* ---------- Generative ambient music (G - Am - F - G pads + random sparkles) ---------- */
let musicOn = false, mTimers = [], mi = 0;
const chords = [[196, 247, 294], [220, 262, 330], [175, 220, 262], [196, 247, 392]];
function music(on) {
  musicOn = on; $("#snd").textContent = on ? "🔊" : "🔇";
  mTimers.forEach(clearInterval); mTimers = [];
  if (!on) return;
  const pad = () => chords[mi++ % 4].forEach((f) => note(f, 0, 7, "sine", .04, 2));
  const spark = () => note(penta[Math.random() * 5 | 0] * (Math.random() < .5 ? 1 : .5), 0, 1.8, "sine", .05, .03);
  pad(); mTimers.push(setInterval(pad, 6000), setInterval(spark, 1400));
}
$("#snd").onclick = () => { audio(); music(!musicOn); };
document.addEventListener("visibilitychange", () => { if (!ac) return; document.hidden ? ac.suspend() : musicOn && ac.resume(); });

initGL();

let rw = innerWidth, rt;
addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    if (innerWidth !== rw) { rw = innerWidth; sizeAll(); }
    else { bg.height = innerHeight; if (!sparks.length) fx.height = innerHeight; }
  }, 200);
});
sizeAll(); go(0); requestAnimationFrame(frame);
document.fonts.load('700 100px "Aref Ruqaa"', CONFIG.name).then(initName).catch(() => {});
