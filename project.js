const cards = document.querySelectorAll(".project-card"); // Выбирает все элементы карточек на странице
const details = document.getElementById("projectDetails"); // Ищет контейнер для отображения полной инфо проекта
const grid = document.querySelector(".projects-grid"); // Ищет основной контейнер сетки проектов
const vBtn = document.getElementById('showVideoBtn');
const vModal = document.getElementById('videoModal');
const vClose = document.getElementById('closeVideo');
const vTag = document.getElementById('mainVideo');
let animating = false; // Флаг: предотвращает повторные клики, пока идет анимация
let originRect = null; // Переменная для сохранения координат карточки перед развертыванием

function buildDetailsHtml(card) {
  // Функция формирует HTML-код внутреннего окна на основе данных карточки
  const img = card.querySelector(".project-img")?.style.backgroundImage || ""; // Достает картинку проекта
  const title = card.querySelector("h2")?.textContent || ""; // Достает название проекта
  const lead = card.querySelector("p")?.textContent || ""; // Достает описание проекта
  const budget = card.dataset.budget || "$80 000 000"; // Достает бюджет из атрибута data
  const extraImg =
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Crab_Nebula.jpg/1200px-Crab_Nebula.jpg"; // Ссылка на доп. картинку
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
        <p>Этот проект даст важные данные для понимания глубокого космоса...</p>
        <div class="pd-footer-row" style="margin-top:30px; display:flex; gap:15px;">
           <button class="pd-close-btn">Вернуться</button>
           <a href="#" class="pd-more">Сайт проекта</a>
        </div>
      </div>
    </div>
  `; // Возвращает готовую верстку для окна
}

function setupCardsUI() {
  // Настройка внешнего вида сетки при загрузке
  if (!details) {
    // Если на странице нет блока деталей (например, другая страница)
    const el = document.createElement("div"); // Создает этот блок программно
    el.id = "projectDetails"; // Задает ID
    el.className = "project-details"; // Задает класс
    document.body.appendChild(el); // Добавляет в конец тела документа
  }
}

function openDetail(card) {
  // Функция анимации превращения карточки в окно
  if (animating) return; // Если анимация уже запущена, игнорирует вызов
  animating = true; // Включает режим анимации
  const rect = card.getBoundingClientRect(); // Получает точные размеры и положение карточки на экране
  originRect = rect; // Сохраняет их, чтобы знать, куда окно должно "схлопнуться" обратно
  const det = document.getElementById("projectDetails"); // Ссылка на блок деталей
  det.innerHTML = buildDetailsHtml(card); // Вставляет внутрь контент конкретного проекта

  // Вычисляет размеры финального окна в зависимости от экрана
  const targetW = Math.min(920, Math.round(window.innerWidth * 0.88));
  const targetH = Math.min(window.innerHeight - 120, 720);
  const targetLeft = Math.round((window.innerWidth - targetW) / 2); // Центрирует по X
  const targetTop = Math.round((window.innerHeight - targetH) / 2); // Центрирует по Y

  det.style.display = "block"; // Делает блок видимым
  det.style.position = "fixed"; // Фиксирует его поверх всего остального
  det.style.zIndex = "120"; // Выносит на самый передний план
  det.style.overflow = "hidden"; // Прячет прокрутку во время движения
  det.style.pointerEvents = "none"; // Отключает взаимодействие (клики), пока окно летит
  det.style.transition = "none"; // Убирает старые анимации для мгновенного позиционирования
  det.style.left = rect.left + "px"; // Ставит окно точно поверх нажатой карточки
  det.style.top = rect.top + "px"; // ...
  det.style.width = rect.width + "px"; // ...
  det.style.height = rect.height + "px"; // ...
  det.style.borderRadius = "12px"; // Начальное скругление углов
  det.style.opacity = "1"; // Делает окно полностью непрозрачным

  void det.offsetWidth; // Магическая строка: заставляет браузер применить стили немедленно (reflow)

  // Включает плавное перемещение и изменение размеров
  det.style.transition =
    "left 520ms cubic-bezier(.2,.8,.2,1), top 520ms cubic-bezier(.2,.8,.2,1), width 520ms cubic-bezier(.2,.8,.2,1), height 520ms cubic-bezier(.2,.8,.2,1), opacity 400ms ease";
  det.style.left = targetLeft + "px"; // Окно летит в центр экрана
  det.style.top = targetTop + "px"; // ...
  det.style.width = targetW + "px"; // Растет до финальной ширины
  det.style.height = targetH + "px"; // Растет до финальной высоты

  setTimeout(() => {
    // Ждет окончания анимации (540мс)
    det.style.pointerEvents = "auto"; // Разрешает клики внутри окна (прокрутка, кнопки)
    det.style.overflowY = "auto"; // Включает внутреннюю прокрутку текста
    grid.classList.add("dimmed"); // Затемняет задний фон (сетку карточек)
    document.body.classList.add("no-scroll"); // Отключает прокрутку всей страницы
    attachClose(); // Подключает функции к кнопкам закрытия внутри окна
    animating = false; // Разрешает новые действия
  }, 540);
}

function closeDetail() {
  // Функция закрытия окна и возврата его в карточку
  if (animating) return; // Если что-то анимируется, игнорируем
  animating = true; // Включаем блокировку
  const det = document.getElementById("projectDetails"); // Ссылка на окно
  grid.classList.remove("dimmed"); // Убираем затемнение фона
  document.body.classList.remove("no-scroll"); // Возвращаем прокрутку страницы

  det.style.overflow = "hidden"; // Прячем полосы прокрутки во время обратной анимации
  det.style.pointerEvents = "none"; // Блокируем клики
  det.style.transition =
    "left 480ms cubic-bezier(.4,0,.2,1), top 480ms cubic-bezier(.4,0,.2,1), width 480ms cubic-bezier(.4,0,.2,1), height 480ms cubic-bezier(.4,0,.2,1), opacity 400ms ease";

  det.style.left = originRect.left + "px"; // Окно летит обратно на место карточки
  det.style.top = originRect.top + "px"; // ...
  det.style.width = originRect.width + "px"; // Сжимается до размеров карточки
  det.style.height = originRect.height + "px"; // ...
  det.style.opacity = "0"; // Плавно исчезает

  setTimeout(() => {
    // После завершения полета (480мс)
    det.style.display = "none"; // Полностью скрывает элемент из DOM-дерева
    animating = false; // Разрешает открывать новые проекты
  }, 490);
}

function attachClose() {
  // Находит все кнопки закрытия в новом окне и вешает на них функции
  const det = document.getElementById("projectDetails");
  const btnX = det.querySelector(".pd-close"); // Кнопка "крестик"
  const btnRet = det.querySelector(".pd-close-btn"); // Кнопка "вернуться"
  btnX?.addEventListener("click", closeDetail); // При клике запускает закрытие
  btnRet?.addEventListener("click", closeDetail); // ...
}

function addTilt(card) {
  // Добавляет 3D-эффект наклона карточки при движении мыши
  const img = card.querySelector(".project-img"); // Элемент с картинкой, который будем наклонять
  let raf; // Переменная для управления кадрами анимации
  function onMove(e) {
    // Выполняется при движении мыши над карточкой
    const r = card.getBoundingClientRect(); // Положение карточки на экране
    const x = (e.clientX || e.touches?.[0].clientX) - r.left; // Позиция мыши относительно левого края карточки
    const y = (e.clientY || e.touches?.[0].clientY) - r.top; // Позиция мыши относительно верха карточки
    const px = x / r.width; // Позиция в процентах (0..1) по X
    const py = y / r.height; // Позиция в процентах (0..1) по Y
    const tx = (px - 0.5) * 12; // Вычисляет угол поворота по Y (до 6 градусов в обе стороны)
    const ty = (0.5 - py) * 12; // Вычисляет угол поворота по X
    const tz = 1 + (Math.abs(px - 0.5) + Math.abs(py - 0.5)) * 0.06; // Небольшое увеличение масштаба при наклоне
    if (raf) cancelAnimationFrame(raf); // Отменяет старый кадр, если он еще не отрисовался
    raf = requestAnimationFrame(() => {
      // Рисует трансформацию в следующем свободном кадре
      img.style.transform = `perspective(800px) rotateY(${tx}deg) rotateX(${ty}deg) scale(${tz})`;
    });
  }
  function onLeave() {
    // Выполняется, когда мышь уходит с карточки
    img.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)"; // Включает плавный возврат
    img.style.transform = ""; // Сбрасывает все углы поворота в ноль
    setTimeout(() => (img.style.transition = ""), 420); // Выключает transition после возврата
  }
  card.addEventListener("mousemove", onMove); // Вешает событие движения мыши
  card.addEventListener("touchmove", onMove, { passive: true }); // Вешает событие для тачскринов
  card.addEventListener("mouseleave", onLeave); // Вешает событие ухода мыши
  card.addEventListener("touchend", onLeave); // Вешает событие окончания касания
}

setupCardsUI(); // Инициализирует контейнер для деталей
cards.forEach((card) => {
  // Для каждой карточки на странице
  addTilt(card); // Добавляет 3D эффект
  const btn = card.querySelector(".details-btn"); // Ищет кнопку "Подробнее"
  btn?.addEventListener("click", (e) => {
    // При клике на кнопку
    e.stopPropagation(); // Останавливает всплытие события (чтобы не сработал клик по самой карточке)
    openDetail(card); // Открывает окно
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.body.classList.contains("no-scroll"))
    closeDetail(); 
});

if (vBtn) {
    vBtn.onclick = () => {
        vModal.style.display = 'flex'; 
        document.body.classList.add('no-scroll'); 
        vTag.play(); 
    };
}

if (vClose) {
    vClose.onclick = () => {
        vModal.style.display = 'none';
        document.body.classList.remove('no-scroll');
        vTag.pause(); 
    };
}


function openDetail(card) {
    if (animating) return;
    animating = true;
    const rect = card.getBoundingClientRect();
    originRect = rect;
    details.style.display = "flex"; 
    details.innerHTML = buildDetailsHtml(card);

    details.style.zIndex = "2000"; 
    
}

