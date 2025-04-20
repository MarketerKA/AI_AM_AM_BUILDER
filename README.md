# МТС Чат и JSON Schema Validator

Это React приложение с чатом в стиле МТС и валидатором JSON Schema.

## Демо-версия

Рабочую версию приложения можно посмотреть здесь: [https://marketerka.github.io/AI_AM_AM_BUILDER/](https://marketerka.github.io/AI_AM_AM_BUILDER/)

## Начало работы

1. Установка зависимостей:
```bash
npm install
```

2. Запуск в режиме разработки:
```bash
npm run dev
```

3. Сборка для продакшн:
```bash
npm run build
```

## Деплой на GitHub Pages y

### Автоматический деплой
При пуше в ветку `frontend` сайт автоматически публикуется через GitHub Actions.

### Ручной деплой
Для ручного деплоя выполните:

```bash
npm run deploy
```

## Структура проекта

```
src/
  ├── components/
  │   ├── ChatInterface/
  │   │   ├── ChatInterface.tsx
  │   │   ├── ChatInterface.module.scss
  │   │   └── index.ts
  │   ├── JsonSchema/
  │   │   ├── JsonSchema.tsx
  │   │   ├── JsonSchema.module.scss
  │   │   └── index.ts
  ├── pages/
  │   ├── Home/
  │   │   ├── Home.tsx
  │   │   ├── Home.module.scss
  │   │   └── index.ts
  ├── styles/
  │   ├── variables.scss
  │   ├── mixins.scss
  │   ├── reset.scss
  │   └── index.scss
  ├── App.tsx
  ├── main.tsx
  └── index.css
```