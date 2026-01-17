const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');
const ui = document.getElementById('ui');
const orbitsLayer = document.getElementById('orbits');
const controls = document.getElementById('controls');
const info = document.getElementById('info');
const infoTitle = document.getElementById('infoTitle');
const infoDesc = document.getElementById('infoDesc');
const infoFacts = document.getElementById('infoFacts');
const infoClose = document.getElementById('infoClose');

let W = 0, H = 0, dpr = 1;

function resize() {
  dpr = window.devicePixelRatio || 1;
  W = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  H = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars.forEach(s => {
    s.x = Math.random() * W;
    s.y = Math.random() * H;
  });
  if (!camera.initialized) {
    camera.x = W/2;
    camera.y = H/2;
    camera.targetX = W/2;
    camera.targetY = H/2;
    camera.initialized = true;
  }
}
window.addEventListener('resize', resize);

const planets = [
  { id: 'mercury', name: 'Меркурий', radius: 4, orbitRadius: 0.09, orbitalSpeed: 0.785, color: '#bdbdbd', description: 'Самая маленькая и ближайщая планета к Солнцу, покрыта кратерами', facts: ['Радиус ≈ 2440 км','От Солнца ≈ 0.39 AU','Год ≈ 88 дней'] },
  { id: 'venus', name: 'Венера', radius: 7, orbitRadius: 0.14, orbitalSpeed: 0.449, color: '#e6c089', description: 'Вторая планета от Солнца, имеет плотную атмосферу из углекислого газа', facts: ['Радиус ≈ 6052 км','От Солнца ≈ 0.72 AU','День дольше года'] },
  { id: 'earth', name: 'Земля', radius: 8, orbitRadius: 0.20, orbitalSpeed: 0.314, color: '#4fb3ff', description: 'Наш дом, где мы живём', facts: ['Радиус ≈ 6371 км','От Солнца ≈ 1.00 AU','Год ≈ 365 дней'] },
  { id: 'mars', name: 'Марс', radius: 6, orbitRadius: 0.26, orbitalSpeed: 0.196, color: '#d86b49', description: 'Красная планета, оттенок из-за оксидов железа', facts: ['Радиус ≈ 3390 км','От Солнца ≈ 1.52 AU','Год ≈ 687 дней'] },
  { id: 'jupiter', name: 'Юпитер', radius: 14, orbitRadius: 0.36, orbitalSpeed: 0.105, color: '#e8a86b', description: 'Крупнейшая планета в Солнечной системе', facts: ['Радиус ≈ 69911 км','От Солнца ≈ 5.20 AU','Самая большая планета'] },
  { id: 'saturn', name: 'Сатурн', radius: 13, orbitRadius: 0.48, orbitalSpeed: 0.0698, color: '#f0d8a8', description: 'Известен своими кольцами', facts: ['Радиус ≈ 58232 км','От Солнца ≈ 9.58 AU','Яркие кольца'] },
  { id: 'uranus', name: 'Уран', radius: 11, orbitRadius: 0.62, orbitalSpeed: 0.0483, color: '#79e0d6', description: 'Наклонённая ледяная планета', facts: ['Радиус ≈ 25362 км','От Солнца ≈ 19.2 AU','Наклонённая ось'] },
  { id: 'neptune', name: 'Нептун', radius: 11, orbitRadius: 0.74, orbitalSpeed: 0.0314, color: '#3b6bff', description: 'Дальний и ветреный гигант', facts: ['Радиус ≈ 24622 км','От Солнца ≈ 30.05 AU','Очень сильные ветры'] }
];

const items = [];

planets.forEach((p, i) => {
  const btn = document.createElement('button');
  btn.className = 'planet-btn';
  btn.setAttribute('aria-label', p.name);
  btn.setAttribute('data-index', i);
  btn.innerHTML = `<svg class="visual" width="100%" height="100%" viewBox="0 0 100 100">
    <defs>
      <radialGradient id="g${i}" cx="30%" cy="30%">
        <stop offset="0" stop-color="#fff" stop-opacity="0.9"/>
        <stop offset="0.3" stop-color="${p.color}" stop-opacity="1"/>
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#g${i})" />
  </svg>`;
  btn.style.width = (p.radius*4) + 'px';
  btn.style.height = (p.radius*4) + 'px';
  btn.style.transition = 'transform .18s cubic-bezier(.2,.8,.2,1), opacity .25s';
  controls.appendChild(btn);

  const ring = document.createElement('div');
  ring.className = 'orbit-ring visible';
  orbitsLayer.appendChild(ring);

  items.push({ btn, ring, p, angle: Math.random()*Math.PI*2, hover: false });
});

let stars = [];
for (let i = 0; i < 300; i++) {
  stars.push({ x: Math.random() * (window.innerWidth||800), y: Math.random() * (window.innerHeight||600), r: Math.random() * 1.5, alpha: Math.random() });
}

const comets = [];
function spawnComet() {
  const fromEdge = Math.random() < 0.5 ? -50 : W + 50;
  const startY = Math.random() * H * 0.6;
  const vx = (fromEdge < 0 ? 1 : -1) * (2 + Math.random() * 4);
  const vy = 0.8 + Math.random() * 1.5;
  const length = 40 + Math.random() * 120;
  comets.push({
    x: fromEdge,
    y: startY,
    vx, vy,
    size: 1 + Math.random() * 2.2,
    life: 0,
    length,
    trail: []
  });
}

function spawnMeteor() {
  const x = Math.random() * W;
  comets.push({
    x,
    y: -30,
    vx: -1.5 + Math.random()*3,
    vy: 3 + Math.random() * 5,
    size: 1 + Math.random()*2,
    life: 0,
    length: 30 + Math.random()*100,
    trail: []
  });
}

function drawStars() {
  for (let s of stars) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    s.alpha += (Math.random() - 0.5) * 0.03;
    if (s.alpha < 0) s.alpha = 0;
    if (s.alpha > 1) s.alpha = 1;
  }
}

function drawCometsAndMeteors(dt) {
  for (let i = comets.length - 1; i >= 0; i--) {
    const c = comets[i];
    c.life += dt;
    c.trail.unshift({ x: c.x, y: c.y, a: 1 });
    if (c.trail.length > 30) c.trail.pop();
    c.x += c.vx * 60 * dt;
    c.y += c.vy * 60 * dt;
    for (let t = 0; t < c.trail.length; t++) {
      const p = c.trail[t];
      const alpha = Math.max(0, 1 - t / c.trail.length);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - c.vx * (c.length/30) * (1 + t/10), p.y - c.vy * (c.length/30) * (1 + t/10));
      ctx.strokeStyle = `rgba(255,255,255,${0.12 * alpha})`;
      ctx.lineWidth = c.size * (1 - t / c.trail.length) * 3;
      ctx.stroke();
    }
    const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 12*c.size);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, 'rgba(255,220,180,0.9)');
    grad.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6 * c.size, 0, Math.PI*2);
    ctx.fill();
    if (c.x < -200 || c.x > W + 200 || c.y > H + 200 || c.life > 6) {
      comets.splice(i, 1);
    }
  }
}

function computeOrbitPixels(rel, sunRadius, planetRadius) {
  const half = Math.min(W,H)/2;
  const margin = 22;
  const maxOrbit = Math.max(half - margin, sunRadius + margin + planetRadius);
  const innerBase = sunRadius + margin + planetRadius;
  const usable = Math.max(0, maxOrbit - innerBase);
  return innerBase + rel*usable;
}

let last = performance.now();
let lastCometSpawn = 0;
let lastMeteorSpawn = 0;
const cometProb = 0.0007;
const meteorProb = 0.0006;
const cometCooldownMs = 20000;
const meteorCooldownMs = 30000;

const camera = {
  x: 0,
  y: 0,
  zoom: 1,
  targetX: 0,
  targetY: 0,
  targetZoom: 1,
  easing: 0.14,
  flying: false,
  focusedIndex: null,
  initialized: false
};

function flyToPlanet(idx) {
  const it = items[idx];
  const cx = W/2;
  const cy = H/2;
  const sunRadius = Math.max(36, Math.min(W,H)*0.06);
  const rpx = computeOrbitPixels(it.p.orbitRadius, sunRadius, it.p.radius*2);
  const x = cx + Math.cos(it.angle) * rpx;
  const y = cy + Math.sin(it.angle) * rpx;
  camera.targetX = x;
  camera.targetY = y;
  camera.targetZoom = 2.6;
  camera.flying = true;
  camera.focusedIndex = idx;
  controls.style.transition = 'opacity .4s';
  controls.style.opacity = '0';
  controls.style.pointerEvents = 'none';
  infoTitle.textContent = it.p.name;
  infoDesc.textContent = it.p.description;
  infoFacts.innerHTML = '';
  it.p.facts.forEach(f=>{
    const li = document.createElement('li');
    li.textContent = f;
    infoFacts.appendChild(li);
  });
  info.setAttribute('aria-hidden','false');
  info.setAttribute('aria-modal','true');
  info.style.pointerEvents='auto';
  info.style.width = Math.min(520, Math.max(300, W*0.5)) + 'px';
  info.style.maxWidth = '90%';
  info.style.fontSize = '16px';
  info.style.transform = 'translate(-50%,-50%) scale(1.08)';
  info.style.left = '50%';
  info.style.top = '50%';
}

function resetCamera() {
  camera.targetX = W/2;
  camera.targetY = H/2;
  camera.targetZoom = 1;
  camera.flying = false;
  camera.focusedIndex = null;
  controls.style.opacity = '1';
  controls.style.pointerEvents = 'auto';
  info.setAttribute('aria-hidden','true');
  info.setAttribute('aria-modal','false');
  info.style.pointerEvents='none';
  info.style.transform = 'scale(1)';
  info.style.width = '';
  info.style.left = '';
  info.style.top = '';
  info.style.maxWidth = '';
  info.style.fontSize = '';
}

let lastTime = performance.now();

function updateCamera() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    const inSpeed = 5;
    const outSpeed = 3;

    const speed = camera.targetZoom > camera.zoom ? inSpeed : outSpeed;
    const k = 1 - Math.exp(-speed * dt);

    camera.zoom += (camera.targetZoom - camera.zoom) * k;
    camera.x += (camera.targetX - camera.x) * k;
    camera.y += (camera.targetY - camera.y) * k;

    if (Math.abs(camera.zoom - camera.targetZoom) < 0.002) camera.zoom = camera.targetZoom;
    if (Math.abs(camera.x - camera.targetX) < 0.002) camera.x = camera.targetX;
    if (Math.abs(camera.y - camera.targetY) < 0.002) camera.y = camera.targetY;
}




function worldToScreen(wx, wy) {
  return {
    x: (wx - camera.x) * camera.zoom + W/2,
    y: (wy - camera.y) * camera.zoom + H/2
  };
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function positionFocusedInfo(screenX, screenY, size) {
  const pad = 12;
  const rect = info.getBoundingClientRect();
  let left = Math.round(screenX - rect.width / 2);
  let top = Math.round(screenY + size + 14);
  if (left + rect.width + pad > W) left = W - rect.width - pad;
  if (left < pad) left = pad;
  if (top + rect.height + pad > H) top = Math.max(pad, screenY - rect.height - size - 14);
  if (top < pad) top = pad;
  info.style.left = left + 'px';
  info.style.top = top + 'px';
  info.style.transform = 'scale(1)';
}

function draw(time){
  const now = time || performance.now();
  const dt = Math.min(0.05, (now-last)/1000);
  last = now;
  ctx.clearRect(0,0,W,H);
  drawStars();
  if (now - lastCometSpawn > cometCooldownMs && Math.random() < cometProb) {
    spawnComet();
    lastCometSpawn = now;
  }
  if (now - lastMeteorSpawn > meteorCooldownMs && Math.random() < meteorProb) {
    spawnMeteor();
    lastMeteorSpawn = now;
  }
  updateCamera(dt);
  const cx = W/2;
  const cy = H/2;
  const sunRadius = Math.max(36, Math.min(W,H)*0.06);
  const sunWorldX = cx;
  const sunWorldY = cy;
  const sunScreen = worldToScreen(sunWorldX, sunWorldY);
  const sunScreenRadius = sunRadius * camera.zoom;
  const grad = ctx.createRadialGradient(sunScreen.x - sunScreenRadius*0.18, sunScreen.y - sunScreenRadius*0.18, sunScreenRadius*0.2, sunScreen.x, sunScreen.y, sunScreenRadius*2.6);
  grad.addColorStop(0, '#fff8e6');
  grad.addColorStop(0.28, '#ffd37a');
  grad.addColorStop(1, 'rgba(255,140,0,0.06)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(sunScreen.x, sunScreen.y, sunScreenRadius, 0, Math.PI*2);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  items.forEach((it, idx) => {
    const p = it.p;
    it.angle += p.orbitalSpeed * dt;
    const rpx = computeOrbitPixels(p.orbitRadius, sunRadius, p.radius*2);
    const worldX = cx + Math.cos(it.angle) * rpx;
    const worldY = cy + Math.sin(it.angle) * rpx;
    const screen = worldToScreen(worldX, worldY);
    it.btn.style.left = screen.x + 'px';
    it.btn.style.top = screen.y + 'px';
    const domSize = Math.max(8, (p.radius*4) * camera.zoom);
    it.btn.style.width = domSize + 'px';
    it.btn.style.height = domSize + 'px';
    it.btn.style.opacity = camera.zoom > 1.15 ? '0' : '1';
    it.btn.style.pointerEvents = camera.zoom > 1.15 ? 'none' : 'auto';
    const ringScreenRadius = rpx * camera.zoom;
    it.ring.style.left = sunScreen.x + 'px';
    it.ring.style.top = sunScreen.y + 'px';
    it.ring.style.width = (ringScreenRadius*2) + 'px';
    it.ring.style.height = (ringScreenRadius*2) + 'px';
    const baseSize = Math.max(1, p.radius*2);
    const hoverScale = it.hover ? 1.28 : 1;
    const size = baseSize * hoverScale * camera.zoom;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = p.color;
    ctx.shadowBlur = Math.max(6,p.radius*1.2) * (it.hover ? 1.2 : 1) * camera.zoom;
    ctx.shadowColor = p.color;
    ctx.arc(screen.x, screen.y, size, 0, Math.PI*2);
    ctx.fill();
    if (p.id === 'earth') {
      const g = ctx.createRadialGradient(screen.x, screen.y, size*0.3, screen.x, screen.y, size*3.0);
      g.addColorStop(0, 'rgba(79,179,255,0.25)');
      g.addColorStop(0.25, 'rgba(79,179,255,0.12)');
      g.addColorStop(1, 'rgba(79,179,255,0)');
      ctx.beginPath();
      ctx.fillStyle = g;
      ctx.arc(screen.x, screen.y, size*3.0, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(79,179,255,${it.hover?0.16:0.08})`;
      ctx.arc(screen.x, screen.y, size*1.2, 0, Math.PI*2);
      ctx.fill();
    }
    if (p.id === 'saturn') {
      ctx.save();
      ctx.translate(screen.x, screen.y);
      ctx.rotate(Math.sin(it.angle*0.2) * 0.3 - 0.45);
      const rx = size * 1.9;
      const ry = size * 0.7;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 1.02, ry * 1.02, 0, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(220,200,160,0.22)';
      ctx.lineWidth = Math.max(2, size * 0.22);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.9, ry * 0.45, 0, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(240,220,180,0.06)';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = Math.max(1, 1 * camera.zoom);
    ctx.arc(sunScreen.x, sunScreen.y, ringScreenRadius, 0, Math.PI*2);
    ctx.stroke();
    if (camera.focusedIndex === idx) {
      camera.targetX = worldX;
      camera.targetY = worldY;
      const infoSize = size;
      positionFocusedInfo(screen.x, screen.y, infoSize);
    }
  });
  drawCometsAndMeteors(dt);
  ctx.restore();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

let activeIndex = null;

function showInfo(index,x,y){
  if (camera.flying || camera.zoom > 1.15) return;
  const p = planets[index];
  infoTitle.textContent = p.name;
  infoDesc.textContent = p.description;
  infoFacts.innerHTML = '';
  p.facts.forEach(f=>{
    const li = document.createElement('li');
    li.textContent = f;
    infoFacts.appendChild(li);
  });
  info.setAttribute('aria-hidden','false');
  info.setAttribute('aria-modal','true');
  info.style.pointerEvents='auto';
  info.style.transform = 'scale(1.06)';
  positionInfo(x,y);
  info.focus();
  activeIndex = index;
}

function hideInfo(){
  if (camera.flying && camera.focusedIndex !== null) return;
  info.setAttribute('aria-hidden','true');
  info.setAttribute('aria-modal','false');
  info.style.pointerEvents='none';
  info.style.transform = 'scale(1)';
  activeIndex = null;
}

function positionInfo(x,y){
  const pad=12;
  const rect = info.getBoundingClientRect();
  let left = x+18;
  let top = y-rect.height/2;
  if(left+rect.width+pad>W) left = x-rect.width-18;
  if(left<pad) left=pad;
  if(top<pad) top=pad;
  if(top+rect.height+pad>H) top=H-rect.height-pad;
  info.style.left=left+'px';
  info.style.top=top+'px';
}

items.forEach((it,idx)=>{
  const el = it.btn;
  let tapped=false;
  el.addEventListener('mouseenter',()=>{
    it.hover = true;
    el.style.transform = 'translate(-50%,-50%) scale(1.12)';
    const rect = el.getBoundingClientRect();
    showInfo(idx, rect.left + rect.width/2, rect.top + rect.height/2);
  });
  el.addEventListener('mouseleave',()=>{
    it.hover = false;
    el.style.transform = 'translate(-50%,-50%) scale(1)';
    if(activeIndex===idx) hideInfo();
  });
  el.addEventListener('mousemove',e=>{ if(activeIndex===idx) positionInfo(e.clientX,e.clientY); });
  el.addEventListener('focus',()=>{
    it.hover = true;
    el.style.transform = 'translate(-50%,-50%) scale(1.12)';
    const rect = el.getBoundingClientRect();
    showInfo(idx, rect.left + rect.width/2, rect.top + rect.height/2);
  });
  el.addEventListener('blur',()=>{
    it.hover = false;
    el.style.transform = 'translate(-50%,-50%) scale(1)';
    if(activeIndex===idx) hideInfo();
  });
  el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      const r=el.getBoundingClientRect();
      if(info.getAttribute('aria-hidden')==='true') showInfo(idx,r.left+r.width/2,r.top+r.height/2);
      else hideInfo();
    }
    if(e.key==='Escape') hideInfo();
  });
  el.addEventListener('touchstart', e=>{
    e.preventDefault();
    tapped=!tapped;
    const r = el.getBoundingClientRect();
    if(tapped) {
      it.hover = true;
      el.style.transform = 'translate(-50%,-50%) scale(1.12)';
      showInfo(idx,r.left+r.width/2,r.top+r.height/2);
    } else {
      it.hover = false;
      el.style.transform = 'translate(-50%,-50%) scale(1)';
      hideInfo();
    }
  },{passive:false});
  el.addEventListener('click', (ev)=>{
    ev.stopPropagation();
    flyToPlanet(idx);
  });
});

canvas.addEventListener('click', ()=> {
  if (camera.flying || camera.zoom > 1.1) resetCamera();
});

infoClose.addEventListener('click', ()=> {
  resetCamera();
  hideInfo();
});

document.addEventListener('keydown',e=>{ if(e.key==='Escape') { resetCamera(); hideInfo(); } });

resize();
