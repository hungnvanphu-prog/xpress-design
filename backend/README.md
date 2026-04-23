# Backend (NestJS)

Backend dựa theo `thietke.txt`. NestJS chỉ xử lý:

- **Auth**: đăng ký, đăng nhập, JWT, `users/me`
- **Contact**: nhận form liên hệ
- **Newsletter**: đăng ký email
- **CMS Proxy (optional)**: forward request sang Strapi

Toàn bộ content (projects, articles, news, pages) nằm trong Strapi — KHÔNG lưu ở đây.

## Stack

- NestJS 10, TypeScript
- Prisma + PostgreSQL
- JWT (passport-jwt) + bcrypt
- class-validator

## Cấu trúc

```
src/
  main.ts
  app.module.ts
  health.controller.ts
  prisma/          # PrismaService (global)
  auth/            # register, login, me, JwtStrategy, RolesGuard
  users/
  contact/
  newsletter/
  cms/             # proxy sang Strapi (GET /cms/projects, ...)
prisma/schema.prisma
```

## Chạy local

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Server: http://localhost:4000/api

## Endpoints

### Auth
- `POST /api/auth/register` — `{ email, password, name? }`
- `POST /api/auth/login` — `{ email, password }` → `{ accessToken, user }`
- `GET  /api/auth/me` — Bearer token
- `GET  /api/users/me` — Bearer token

### Contact
- `POST /api/contact` — `{ name, email, phone?, subject?, message }`
- `GET  /api/contact` — ADMIN only

### Newsletter
- `POST /api/newsletter` — `{ email }`
- `GET  /api/newsletter` — ADMIN only

### CMS Proxy (Strapi)
- `GET /api/cms/projects`
- `GET /api/cms/projects/:slug`
- `GET /api/cms/articles`
- `GET /api/cms/articles/:slug`
- `GET /api/cms/news`
- `GET /api/cms/pages/:slug`

### Health
- `GET /api/health`

## Docker

Được build bởi `docker-compose.yml` ở root. Container tự chạy `prisma migrate deploy` trước khi start.

## Note về DB

Theo `thietke.txt`:
- **CMS DB** (projects, articles, news, pages, upload_files) → do Strapi quản lý
- **App DB** (users, contacts, newsletter) → do NestJS + Prisma quản lý

Nên khuyến nghị tách 2 database (ví dụ `cms_db` và `app_db`) dù cùng 1 Postgres instance.
