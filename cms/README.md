# CMS (Strapi v4)

Strapi CMS cho hệ thống website kiến trúc. Quản lý toàn bộ content theo `thietke.txt`.

## Content Types

- **Project** (`/api/projects`) — dự án kiến trúc (title, slug, thumbnail, cover_image, content, location, client_name, project_type, year, gallery, featured, SEO)
- **Article** (`/api/articles`) — blog/góc nhìn (title, slug, excerpt, content, thumbnail, tags, category)
- **Category** (`/api/categories`) — phân loại bài viết
- **News** (`/api/news-items`) — tin tức & sự kiện (type: news/event/community)
- **Page** (`/api/pages`) — landing page với **Dynamic Zone** `sections`

## Components (dynamic zone)

- `sections.hero` — title, subtitle, background_image, CTA
- `sections.project-highlight` — relation projects
- `sections.stats` — repeatable `shared.stat-item` (label, value)
- `sections.cta` — title, description, button

## Chạy local

```bash
cp .env.example .env
npm install
npm run develop
```

Admin: http://localhost:1337/admin

## Seed admin

Khi container start lần đầu, `src/index.js` bootstrap sẽ:

1. Tạo super admin dựa trên `SEED_ADMIN_EMAIL` + `SEED_ADMIN_PASSWORD`
2. Mở quyền public cho `find/findOne` của projects, articles, categories, news, pages

Credentials mặc định trong `.env.example`:
- Email: `admin@example.com`
- Password: `Admin@12345`

⚠️ **Đổi ngay sau lần login đầu tiên.**

## Test public API

```bash
curl http://localhost:1337/api/projects?populate=*
curl http://localhost:1337/api/articles?populate=*
curl http://localhost:1337/api/pages?filters[slug][\$eq]=home&populate=deep
```
