// SHARED (F1.2) — Dev 1.
// Здесь будет axios-клиент:
//   - baseURL из process.env.NEXT_PUBLIC_API_URL (http://localhost:3000/api/v1)
//   - заголовок Authorization: Bearer <access_token>
//   - при 401 — ОДИН общий запрос POST /auth/refresh с { refresh_token } в теле
//     (refresh-токен одноразовый: параллельные 401 ждут один и тот же promise),
//     потом повтор исходного запроса
//   - если refresh упал → logout и переход на /login
// Пакет axios ещё не установлен: npm install axios

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
