const cards = document.querySelectorAll('.project-card');
const details = document.getElementById('projectDetails');
const grid = document.querySelector('.projects-grid');
let animating = false;
let originRect = null;

function buildDetailsHtml(card) {
  const img = card.querySelector('.project-img')?.style.backgroundImage || '';
  const title = card.querySelector('h2')?.textContent || '';
  const lead = card.querySelector('p')?.textContent || '';
  const budget = card.dataset.budget || '$80 000 000';
  const extraImg = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1200px-Crab_Nebula.jpg'; 
  return `
    <button class="pd-close" aria-label="Закрыть">✕</button>
    <div class="pd-inner">
      <div class="pd-left">
        <div class="pd-hero" style="background-image:${img}"></div>
        <img src="${extraImg}" alt="Дополнительно" style="margin-top:15px; border-radius:8px; width:100%; object-fit:cover;">
      </div>
      <div class="pd-right">
        <h2>${title}</h2>
        <p class="pd-lead">${lead}</p>
        <div class="pd-meta"><strong>Бюджет:</strong> ${budget}</div>
        <h3>Зачем проект</h3>
        <p>Этот проект даст важные данные, расширит наши знания и создаст инфраструктуру для будущих исследований.</p>
        <h3>Стадии</h3>
        <ol>
          <li><strong>Исследование</strong> - идеология, дизайн, прототипы.</li>
          <li><strong>Разработка</strong> - сборка, тестирование, сертификация.</li>
          <li><strong>Ввод в эксплуатацию</strong> - запуск, калибровка, первые результаты.</li>
        </ol>
        <h3>На что пойдут деньги</h3>
        <ul>
          <li>Оборудование и оптика</li>
          <li>Инфраструктура и станции связи</li>
          <li>Запуск, логистика и страховка</li>
        </ul>
        <div class="pd-actions">
          <button class="pd-close-btn">Назад</button>
          <a class="pd-more" href="#">Поддержать проект</a>
        </div>
      </div>
    </div>
  `;
}


function openDetail(card) {
  if (animating) return;
  animating = true;
  const rect = card.getBoundingClientRect();
  originRect = rect;
  details.innerHTML = buildDetailsHtml(card);

  const targetW = Math.min(920, Math.round(window.innerWidth * 0.88));
  const targetH = Math.min(window.innerHeight - 120, 720);
  const targetLeft = Math.round((window.innerWidth - targetW) / 2);
  const targetTop = Math.round((window.innerHeight - targetH) / 2);

  details.style.display = 'block';
  details.style.position = 'fixed';
  details.style.zIndex = '120';
  details.style.overflow = 'hidden';
  details.style.pointerEvents = 'none';
  details.style.transition = 'none';
  details.style.left = rect.left + 'px';
  details.style.top = rect.top + 'px';
  details.style.width = rect.width + 'px';
  details.style.height = rect.height + 'px';
  details.style.borderRadius = window.getComputedStyle(card).borderRadius || '12px';
  details.style.transform = 'none';
  details.style.opacity = '1';
  void details.offsetWidth;
  details.style.transition = 'left 520ms cubic-bezier(.2,.8,.2,1), top 520ms cubic-bezier(.2,.8,.2,1), width 520ms cubic-bezier(.2,.8,.2,1), height 520ms cubic-bezier(.2,.8,.2,1), border-radius 420ms ease, box-shadow 420ms ease';
  details.style.left = targetLeft + 'px';
  details.style.top = targetTop + 'px';
  details.style.width = targetW + 'px';
  details.style.height = targetH + 'px';
  details.style.borderRadius = '14px';
  details.style.boxShadow = '0 30px 80px rgba(0,0,0,0.6), 0 8px 20px rgba(0,0,0,0.5)';

  setTimeout(() => {
    details.style.pointerEvents = 'auto';
    grid.classList.add('dimmed');
    document.body.classList.add('no-scroll');
    attachClose();
    animating = false;
  }, 540);
}

function closeDetail() {
  if (animating) return;
  animating = true;
  details.style.pointerEvents = 'none';
  grid.classList.remove('dimmed');

  const rect = originRect || { left: window.innerWidth / 2 - 100, top: window.innerHeight / 2 - 80, width: 200, height: 160 };
  details.style.transition = 'left 520ms cubic-bezier(.2,.8,.2,1), top 520ms cubic-bezier(.2,.8,.2,1), width 520ms cubic-bezier(.2,.8,.2,1), height 520ms cubic-bezier(.2,.8,.2,1), border-radius 420ms ease, box-shadow 420ms ease';
  details.style.left = rect.left + 'px';
  details.style.top = rect.top + 'px';
  details.style.width = rect.width + 'px';
  details.style.height = rect.height + 'px';
  details.style.borderRadius = '8px';
  details.style.boxShadow = 'none';

  setTimeout(() => {
    details.style.display = 'none';
    details.innerHTML = '';
    document.body.classList.remove('no-scroll');
    details.style.transition = '';
    animating = false;
  }, 540);
}

function attachClose() {
  const closeX = details.querySelector('.pd-close');
  const closeBtn = details.querySelector('.pd-close-btn');
  if (closeX) closeX.addEventListener('click', closeDetail, { once: true });
  if (closeBtn) closeBtn.addEventListener('click', closeDetail, { once: true });
}

function parseBudget(str) {
  if (!str) return 0;
  const digits = (str+'').replace(/\D/g,'');
  return Number(digits) || 0;
}

function setupCardsUI() {
  const budgets = Array.from(cards).map(c => parseBudget(c.dataset.budget));
  const max = Math.max(...budgets, 1);
  cards.forEach(card => {
    if (card.querySelector('.budget-badge')) return;
    const budget = parseBudget(card.dataset.budget);
    const pct = Math.round(budget / max * 100);
    const badge = document.createElement('div');
    badge.className = 'budget-badge';
    badge.textContent = card.dataset.budget || '';
    card.appendChild(badge);

    const progWrap = document.createElement('div');
    progWrap.className = 'progress-wrap';
    progWrap.innerHTML = `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-label">${pct}%</div>`;
    card.appendChild(progWrap);
  });
}

function addTilt(card) {
  const img = card.querySelector('.project-img');
  if (!img) return;
  let raf = null;
  let tx = 0, ty = 0, tz = 0;
  function onMove(e){
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width/2;
    const cy = r.top + r.height/2;
    const mx = (e.clientX ?? (e.touches && e.touches[0].clientX)) || cx;
    const my = (e.clientY ?? (e.touches && e.touches[0].clientY)) || cy;
    const dx = (mx - cx) / (r.width/2);
    const dy = (my - cy) / (r.height/2);
    tx = clamp(-dx * 6, -8, 8);
    ty = clamp(dy * 10, -10, 10);
    tz = 1 + clamp(1 - Math.abs(dx) * 0.05 - Math.abs(dy) * 0.05, 0, 0.06);
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=> {
      img.style.transform = `perspective(800px) rotateY(${tx}deg) rotateX(${ty}deg) scale(${1 + (tz-1)})`;
    });
  }
  function onLeave(){
    img.style.transition = 'transform 420ms cubic-bezier(.2,.8,.2,1)';
    img.style.transform = '';
    setTimeout(()=> img.style.transition = '', 420);
  }
  card.addEventListener('mousemove', onMove);
  card.addEventListener('touchmove', onMove, {passive:true});
  card.addEventListener('mouseleave', onLeave);
  card.addEventListener('touchend', onLeave);
}

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }

setupCardsUI();
cards.forEach(card => {
  addTilt(card);
  const btn = card.querySelector('.details-btn');
  if (!btn) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    openDetail(card);
  });
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && document.body.classList.contains('no-scroll')) closeDetail();
});

window.addEventListener('resize', () => {
  if (document.body.classList.contains('no-scroll')) {
    const w = Math.min(920, Math.round(window.innerWidth * 0.88));
    const h = Math.min(window.innerHeight - 120, 720);
    details.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
    details.style.top = Math.round((window.innerHeight - h) / 2) + 'px';
    details.style.width = w + 'px';
    details.style.height = h + 'px';
  }
});
