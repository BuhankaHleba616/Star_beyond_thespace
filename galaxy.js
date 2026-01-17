const c = document.getElementById("galaxy");
const ctx = c.getContext("2d");

let mx = -9999, my = -9999;
let lastMove = Date.now();
let W = 0, H = 0;
let scale = 1;
let targetScale = 1;
const zoomSpeed = 0.001;
const zoomSmooth = 0.12;
let prevScale = 1;
let zoomKick = 0;

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width = window.innerWidth + "px";
    c.style.height = window.innerHeight + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    W = window.innerWidth;
    H = window.innerHeight;
}

resizeCanvas();
addEventListener("resize", resizeCanvas);

if (window.visualViewport) {
    visualViewport.addEventListener("resize", () => {
        const s = visualViewport.scale || 1;
        if (Math.abs(s - prevScale) > 0.001) {
            scale = s;
            zoomKick = 1;
            prevScale = s;
        }
    });
}

addEventListener("mousemove", e => {
    mx = e.clientX;
    my = e.clientY;
    lastMove = Date.now();
});



function r(a, b) { return a + Math.random() * (b - a); }

class Star {
    constructor() {
        this.x = r(0, W);
        this.y = r(0, H);
        this.ox = this.x;
        this.oy = this.y;
        this.vx = 0;
        this.vy = 0;
        this.baseSize = r(1.5, 5);
        this.size = this.baseSize;
        this.color = `hsl(${r(0, 360)},80%,75%)`;
        this.pulse = r(0, Math.PI * 2);
        this.depth = r(0.6, 1.4);
    }
    update(arr) {
        let inactive = Date.now() - lastMove > 1500;
        let dxm = this.x - mx;
        let dym = this.y - my;
        let dm = Math.sqrt(dxm * dxm + dym * dym);

        if (!inactive && dm < 150) {
            let f = (150 - dm) * 0.03 * this.depth;
            this.vx += dxm / dm * f;
            this.vy += dym / dm * f;
        }

        let dx0 = this.ox * scale - this.x;
        let dy0 = this.oy * scale - this.y;
        let d0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
        let pull = 0.01;
        if (zoomKick > 0) pull += zoomKick * 0.15;
        let f0 = pull * d0 * this.depth;
        if (d0 > 1) {
            this.vx += dx0 / d0 * f0;
            this.vy += dy0 / d0 * f0;
        }

        for (let p of arr) {
            if (p === this) continue;
            let dx = p.x - this.x;
            let dy = p.y - this.y;
            let d = Math.sqrt(dx * dx + dy * dy);
            let minD = this.size + p.size;
            if (d < minD && d > 0) {
                let overlap = (minD - d) * 0.015;
                let fx = dx / d * overlap;
                let fy = dy / d * overlap;
                this.vx -= fx;
                this.vy -= fy;
                p.vx += fx;
                p.vy += fy;
            }
        }

        this.vx *= 0.92;
        this.vy *= 0.92;
        this.x += this.vx;
        this.y += this.vy;
        this.size = this.baseSize + Math.sin(Date.now() * 0.005 + this.pulse) * 0.5;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Nebula {
    constructor() {
        this.x = r(0, W);
        this.y = r(0, H);
        this.radius = r(200, 400);
        this.color = `hsla(${r(180, 280)},60%,50%,0.1)`;
        this.angle = r(0, Math.PI * 2);
        this.speed = r(0.0001, 0.0003);
    }
    update() {
        this.angle += this.speed;
        this.x += Math.cos(this.angle) * 0.05;
        this.y += Math.sin(this.angle) * 0.05;
    }
    draw() {
        let g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        g.addColorStop(0, this.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Dust {
    constructor() {
        this.x = r(0, W);
        this.y = r(0, H);
        this.size = r(0.5, 1.5);
        this.sx = r(-0.05, 0.05);
        this.sy = r(-0.05, 0.05);
        this.color = 'rgba(255,255,255,' + r(0.1, 0.4) + ')';
    }
    update() {
        this.x += this.sx;
        this.y += this.sy;
        if (this.x < 0 || this.x > W) this.sx *= -1;
        if (this.y < 0 || this.y > H) this.sy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Meteor {
    constructor() {
        this.x = r(-200, W + 200);
        this.y = r(-200, -50);
        this.len = r(80, 150);
        this.speed = r(8, 15);
        this.angle = r(1.1, 1.4);
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.alpha = r(0.4, 0.8);
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.alpha *= 0.985;
        if (this.y > H + 200) this.dead = true;
    }
    draw() {
        ctx.strokeStyle = `rgba(255,255,255,${this.alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 3, this.y - this.vy * 3);
        ctx.stroke();
    }
}

const stars = [];
for (let i = 0; i < 350; i++) stars.push(new Star());
const nebulas = [];
for (let i = 0; i < 3; i++) nebulas.push(new Nebula());
const dusts = [];
for (let i = 0; i < 200; i++) dusts.push(new Dust());
let meteors = [];

function loop() {
    const hour = new Date().getHours();
    let bg = '0,0,0';
    if (hour >= 6 && hour < 18) bg = '10,10,30';
    else if (hour >= 18 && hour < 22) bg = '5,0,20';

    ctx.fillStyle = `rgba(${bg},0.25)`;
    ctx.fillRect(0, 0, W, H);

    nebulas.forEach(n => { n.update(); n.draw(); });
    stars.forEach(s => { s.update(stars); s.draw(); });
    dusts.forEach(d => { d.update(); d.draw(); });

    if (Math.random() < 0.004) meteors.push(new Meteor());

    meteors.forEach(m => { m.update(); m.draw(); });
    meteors = meteors.filter(m => !m.dead);

    zoomKick *= 0.9;

    requestAnimationFrame(loop);
}

loop();
