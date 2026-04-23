-- Tạo 2 DB tách biệt theo thietke.txt
--   cms_db  → Strapi
--   app_db  → NestJS (Prisma)

CREATE DATABASE cms_db;
CREATE DATABASE app_db;

GRANT ALL PRIVILEGES ON DATABASE cms_db TO admin;
GRANT ALL PRIVILEGES ON DATABASE app_db TO admin;
