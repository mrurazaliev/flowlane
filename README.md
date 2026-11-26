# Task Management — Frontend

Next.js 16 + TypeScript + Tailwind. Бэкенд: `task-management-backend` (Swagger: http://localhost:3000/docs).

## Запуск

```bash
cp .env.example .env.local
npm install
npm run dev        # http://localhost:5173
```

В `.env` бэкенда: `FRONTEND_URL=http://localhost:5173` (ссылки в письмах-приглашениях).
Тестовый вход (seed бэкенда): `demo@example.com` / `Demo12345!`.

## Структура и владельцы

```
src/
  app/            SHARED — только тонкие файлы-роуты Next.js
  shared/
    api/          SHARED — client.ts, types.ts, queryKeys.ts, lookups.ts
    ui/           SHARED — Button, Input, Modal, Badge, Avatar…
    layout/       SHARED — AppShell со слотами
    lib/          SHARED — utils.ts, errors.ts
  features/
    auth/         Dev 1
    issues/       Dev 1
    workspaces/   Dev 2
    projects/     Dev 2
    planning/     Dev 2 (cycles + modules)
    notifications/ Dev 2
```

## Правила

1. В `features/<x>/` пишет только владелец.
2. Другие фичи импортируются только через `index.ts`: `import { IssueList } from "@/features/issues"`.
3. `shared/` и `app/` меняются маленьким отдельным PR, который проверяет второй разработчик.
4. Ветки: `dev1/<задача>`, `dev2/<задача>` → Pull Request в `main` → review → merge.
5. Моки лежат в `features/<x>/mocks.ts` (и `shared/api/mocks.ts` для `lookups.ts`). Подключили API — удалили свои моки.
