import './styles.css';
import { identifyUser, trackEvent } from './firebase.js';

const app = document.querySelector('#app');
const STORAGE_KEY = 'firebase-analytics-demo-user';

app.innerHTML = `
  <main class="page">
    <section class="hero card">
      <p class="eyebrow">Firebase Analytics demo</p>
      <h1>Простое веб-приложение с аналитикой регистрации и ключевых действий</h1>
      <p class="description">
        Зарегистрируйте пользователя, выполните несколько действий и проверьте события в
        <strong>Firebase Analytics DebugView</strong> или консоли событий.
      </p>
      <div class="status" id="status">Ожидание регистрации пользователя…</div>
    </section>

    <section class="grid">
      <form id="registration-form" class="card form-card">
        <h2>Регистрация</h2>
        <label>
          Имя
          <input name="name" type="text" placeholder="Иван" required />
        </label>
        <label>
          Email
          <input name="email" type="email" placeholder="ivan@example.com" required />
        </label>
        <label>
          Роль
          <select name="role">
            <option value="marketer">Маркетолог</option>
            <option value="analyst">Аналитик</option>
            <option value="manager">Менеджер</option>
          </select>
        </label>
        <button type="submit">Зарегистрироваться</button>
      </form>

      <section class="card">
        <h2>Ключевые события</h2>
        <div class="actions">
          <button data-event="tutorial_start">Начать онбординг</button>
          <button data-event="feature_opened">Открыть dashboard</button>
          <button data-event="generate_report">Сгенерировать отчёт</button>
          <button data-event="share_invite">Отправить приглашение</button>
          <button data-event="purchase_intent">Клик по CTA тарифа</button>
          <button data-event="logout">Выйти</button>
        </div>
      </section>
    </section>

    <section class="card log-card">
      <div class="log-header">
        <h2>Локальный журнал событий</h2>
        <button id="clear-log" class="secondary">Очистить журнал</button>
      </div>
      <ul id="event-log" class="event-log"></ul>
    </section>

    <section class="card checklist">
      <h2>Как проверить поступление событий</h2>
      <ol>
        <li>Запустите приложение локально через <code>npm run dev</code>.</li>
        <li>Откройте страницу и зарегистрируйте пользователя.</li>
        <li>Нажмите несколько кнопок ключевых событий.</li>
        <li>В Firebase Console откройте <strong>Analytics → DebugView</strong>.</li>
        <li>События будут отправляться с параметром <code>debug_mode: true</code>.</li>
      </ol>
    </section>
  </main>
`;

const status = document.querySelector('#status');
const logNode = document.querySelector('#event-log');
const form = document.querySelector('#registration-form');
const clearLogButton = document.querySelector('#clear-log');
const actionButtons = [...document.querySelectorAll('[data-event]')];

let currentUser = loadUser();
renderUserStatus();

(async () => {
  await trackLocalAndRemote('app_open', { screen_name: 'home' });
  if (currentUser) {
    await identifyUser(currentUser.id, {
      role: currentUser.role,
      email_domain: currentUser.emailDomain,
    });
    setActionsDisabled(false);
  } else {
    setActionsDisabled(true);
  }
})();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim();
  const email = data.get('email')?.toString().trim().toLowerCase();
  const role = data.get('role')?.toString();

  if (!name || !email || !role) {
    return;
  }

  currentUser = {
    id: `user_${crypto.randomUUID()}`,
    name,
    email,
    role,
    emailDomain: email.split('@')[1] || 'unknown',
    registeredAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));

  await identifyUser(currentUser.id, {
    role: currentUser.role,
    email_domain: currentUser.emailDomain,
  });

  await trackLocalAndRemote('sign_up', {
    method: 'email_form',
    user_role: currentUser.role,
    email_domain: currentUser.emailDomain,
  });

  form.reset();
  renderUserStatus();
  setActionsDisabled(false);
});

for (const button of actionButtons) {
  button.addEventListener('click', async () => {
    if (!currentUser) {
      status.textContent = 'Сначала зарегистрируйте пользователя, чтобы привязать события к user_id.';
      return;
    }

    const eventName = button.dataset.event;
    const paramsByEvent = {
      tutorial_start: { step: 'welcome' },
      feature_opened: { feature_name: 'analytics_dashboard' },
      generate_report: { report_type: 'weekly_summary' },
      share_invite: { channel: 'email' },
      purchase_intent: { plan_name: 'pro' },
      logout: { reason: 'manual_click' },
    };

    await trackLocalAndRemote(eventName, {
      ...paramsByEvent[eventName],
      user_role: currentUser.role,
    });

    if (eventName === 'logout') {
      localStorage.removeItem(STORAGE_KEY);
      currentUser = null;
      renderUserStatus();
      setActionsDisabled(true);
    }
  });
}

clearLogButton.addEventListener('click', () => {
  logNode.innerHTML = '';
});

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function trackLocalAndRemote(eventName, params = {}) {
  addLogEntry(eventName, params);
  await trackEvent(eventName, params);
}

function addLogEntry(eventName, params) {
  const item = document.createElement('li');
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  item.innerHTML = `<strong>${eventName}</strong><span>${timestamp}</span><code>${JSON.stringify(params)}</code>`;
  logNode.prepend(item);
}

function renderUserStatus() {
  status.textContent = currentUser
    ? `Пользователь ${currentUser.name} (${currentUser.role}) зарегистрирован и готов к отправке событий.`
    : 'Ожидание регистрации пользователя…';
}

function setActionsDisabled(disabled) {
  actionButtons.forEach((button) => {
    button.disabled = disabled;
  });
}
