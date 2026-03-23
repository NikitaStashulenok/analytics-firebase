# Firebase Analytics Demo

Простейшее SPA на Vite с подключённым Firebase Analytics.

## Что реализовано

- регистрация пользователя через форму;
- установка `user_id` и `user_properties`;
- отправка 7 ключевых событий:
  - `app_open`
  - `sign_up`
  - `tutorial_start`
  - `feature_opened`
  - `generate_report`
  - `share_invite`
  - `purchase_intent`
  - `logout`
- локальный лог событий для наглядной проверки;
- отправка аналитики с `debug_mode: true` для просмотра в Firebase DebugView.

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Проверка событий в Firebase

1. Откройте приложение локально.
2. Зарегистрируйте пользователя.
3. Нажмите несколько кнопок действий.
4. В Firebase Console перейдите в **Analytics → DebugView**.
5. Убедитесь, что новые события приходят в режиме реального времени.

## Деплой на Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

При `firebase init` выберите Hosting, укажите директорию `dist` и включите SPA rewrite на `index.html`.
