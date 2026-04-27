# Cấu trúc code — hướng dẫn quản lý & maintain

Tài liệu này mô tả bối cảnh monorepo **fullstack-app** (Next.js + NestJS + Strapi + Docker/Nginx) để đọc code và sửa đỡ lạc hướng.

---

## 1. Tổng thể (monoreo)

| Thư mục / file | Vai trò |
|----------------|--------|
| `frontend/` | Web Next.js — giao diện người dùng, App Router, i18n. |
| `backend/` | API NestJS — proxy CMS, form, tích hợp DB, auth (nếu bật). |
| `cms/` | Strapi — nội dung, media, quản trị, schema bài viết / dự án / tag… |
| `infra/` | Nginx (reverse proxy, optional Basic Auth), PostgreSQL init, v.v. |
| `docker-compose.yml` | Stack chạy local: nginx → frontend / backend / cms, Postgres. |
| `data-run/` | Dữ liệu runtime (Postgres, upload Strapi) — thường **không** commit. |

**Luồng request thường gặp:** trình duyệt → **Nginx** (port 80) → **frontend** (Next) hoặc **`/api`** → **backend**; media / API public Strapi → **cms**; **Postgres** dùng chung theo cấu hình từng dịch vụ.

---

## 2. `frontend/` — Next.js (App Router)

| Thư mục / file | Vai trò |
|----------------|--------|
| `app/layout.tsx` | Layout gốc (có thể chỉ pass `children`). |
| `app/[locale]/` | **Cây route chính** theo locale (`vi`, `en`). Mọi trang người dùng tập trung đây. |
| `app/[locale]/layout.tsx` | `<html>`, `<body>`, Header, Footer, `NextIntlClientProvider`, CSS. |
| `app/[locale]/*/page.tsx` | Trang: server component, gọi API / Strapi, đổ dữ liệu xuống client. |
| `app/[locale]/*/*-client.tsx` | Phần **client** (tương tác, state) khi tách khỏi server. |
| `app/[locale]/[...path]/page.tsx` | Catch-all: URL không khớp route tĩnh → gọi `notFound()` → 404 tùy biến. |
| `app/[locale]/not-found.tsx` | Giao diện 404 (NotFoundView). |
| `middleware.ts` | next-intl: locale, rewrite, khớp với `i18n/routing.ts`. |
| `i18n/routing.ts` | Cấu hình `locales`, `defaultLocale`, `localePrefix` (as-needed, …). |
| `i18n/request.ts` | Cấu hình next-intl server (load messages theo locale). |
| `i18n/navigation.ts` | `Link`, `useRouter`, `redirect` có awareness locale — dùng thay `next/navigation` cho route có i18n. |
| `messages/vi.json`, `messages/en.json` | Chuỗi giao diện (namespace theo tính năng). |
| `lib/api.ts` | Hàm gọi **backend** (`/api/...`) và/hoặc **Strapi** (`NEXT_PUBLIC_CMS_URL`). Nơi tập trung biết “fetch từ đâu”. |
| `lib/cms-article-news.ts`, `lib/cms-transform.ts`, … | Biến đổi / chuẩn hoá dữ liệu Strapi → kiểu UI. |
| `lib/metadata.ts` | Helper SEO title/description theo page. |
| `components/` | Component tái sử dụng; `components/ui/` thường là primitive (Radix-style). |
| `next.config.mjs` | `next-intl` plugin, `output: 'standalone'` (Docker), `images.remotePatterns`. |

**Cách đọc nhanh:** URL → tìm `app/[locale]/.../page.tsx` → xem `import` từ `lib/api.ts` hoặc fetch trực tiếp.

---

## 3. `backend/` — NestJS

| Thư mục | Vai trò |
|---------|--------|
| `src/main.ts`, `app.module.ts` | Khởi động, đăng ký module. |
| `src/cms/` | **Đọc nội dung Strapi** (proxy / enrich): projects, articles, news, tags, pages; endpoint REST dưới prefix app (ví dụ `GET /api/cms/...` tùy `globalPrefix`). |
| `src/contact/` | API gửi form liên hệ. |
| `src/auth/` | JWT / bảo vệ route admin nếu dùng. |
| `src/prisma/` | Truy cập **PostgreSQL** qua Prisma (schema riêng với bảng Strapi — cần mở `prisma/schema.prisma` khi sửa DB). |

**Ý nghĩa:** phần “server an toàn + tích hợp” (form, có thể cache/enrichment). Một số dữ liệu Next **gọi thẳng Strapi**; một số đi qua **backend** — tra `frontend/lib/api.ts` để biết từng tính năng.

---

## 4. `cms/` — Strapi

| Thư mục | Vai trò |
|---------|--------|
| `src/api/<tên>/content-types/*/schema.json` | **Model** (Article, News, Project, Tag, Category, Page, …). |
| `src/api/<tên>/` | REST mặc định: `/api/<tên số nhiều strapi>`. |
| `src/components/sections/` | Component dùng trong **dynamic zone** (vd. Page). |
| `src/plugins/article-tag-picker/` | Plugin chọn tag trong admin. |
| `config/` | Database, i18n plugin, upload, CORS, middleware. |
| `src/index.js` | Bootstrap, **seed** dữ liệu, gán quyền public API. |

**Ghi chú:** collection **Page** (landing / dynamic zone) đã có schema và seed, nhưng **trang chủ Next hiện không consume** `Page` — home lấy projects + `HomeClient` (tĩnh + Strapi projects). Sửa `Page` trong admin **chưa** thay đổi giao diện home trừ khi sau này nối wire `cms.pageBySlug` vào UI.

**Tag:** mô hình `name` + `name_en` + `slug` (một bản ghi); không bắt buộc bật i18n Strapi cho Tag nếu chỉ cần hai nhãn + slug ổn định.

---

## 5. `infra/`

| Mục | Vai trò |
|-----|--------|
| `nginx/nginx.conf` | Dev: proxy tới `frontend:3000`, `backend:4000`, `cms:1337`… |
| `nginx/nginx.production.conf` | Mẫu server_name / nhiều `server` (frontend + CMS subdomain). |
| `nginx/snippets/basic-auth.conf` | Optional HTTP Basic Auth (comment mặc định). |
| `nginx/auth/` | Thư mục mount cho file `.htpasswd` (tạo local, không commit — xem `README-htauth.md`). |
| `postgres/init.sql` | SQL chạy khi khởi tạo DB (nếu có). |

Sau khi **thêm volume** mới cho nginx, cần `docker compose up -d --force-recreate nginx` (chỉ `restart` đôi khi không gắn mount cũ).

---

## 6. Cách truy vết một tính năng

1. **URL** → file `app/[locale]/.../page.tsx` tương ứng.  
2. **Nguồn dữ liệu** → `frontend/lib/api.ts` (hàm `cms*`, `api.cms*`, …).  
3. **Trường nội dung** → `cms/.../schema.json` + Strapi Admin.  
4. **Chuỗi UI** → `messages/vi.json` & `en.json` (namespace).  
5. **Proxy / xử lý server** → `backend/src/cms/` hoặc module liên quan.

---

## 7. Gợi ý maintain

- Tách rõ: **fetch & map dữ liệu** (`lib/`) vs **hiển thị** (`components/`, `*-client.tsx`).  
- **Đổi schema Strapi** → cập nhật transform trong `lib/cms-*` và mọi chỗ dùng type.  
- **Môi trường:** `frontend/.env` (API URL, CMS URL) phải khớp cách bạn chạy (Docker vs Vercel + API riêng).  
- Tài liệu deploy / Basic Auth: `infra/nginx/README-htauth.md`.

---

*Tài liệu được tạo để onboard và tra cứu nhanh; cập nhật khi cấu trúc repo thay đổi lớn.*
