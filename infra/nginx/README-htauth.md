# Basic HTTP Auth (tạm thời) — Nginx

## Lần đầu bật (sau khi thêm mount `snippets` / `auth` trong `docker-compose.yml`)

Cần **tạo lại** container nginx để mount có hiệu lực (chỉ `restart` là chưa đủ nếu container cũ chưa có volume):

```bash
docker compose up -d --force-recreate nginx
```

Sau đó: `http://127.0.0.1/` **không** gửi mật khẩu → `401`; có `-u user:pass` đúng → `200`. `/api/...` mặc định **không** bị Basic Auth (theo cấu hình `location /`).

## Khi nào dùng

Chặn công khai, chỉ cho vài người xem bản **preview** (cùng mật khẩu). Bật trên **HTTPS** khi deploy thật; dev `http://localhost` thì mật khẩu gửi rõ hơn — chấp nhận hoặc chỉ bật trên mạng tin cậy.

## Bật

1. Tạo user (trên máy có `htpasswd` — gói `apache2-utils`, hoặc dùng container `httpd:alpine` chạy `htpasswd`):

   ```bash
   htpasswd -c infra/nginx/auth/.htpasswd ten_dang_nhap
   # user thứ 2: bỏ -c
   htpasswd infra/nginx/auth/.htpasswd nguoi_khac
   ```

2. Sửa `infra/nginx/snippets/basic-auth.conf`: bỏ dấu `#` ở **2 dòng** `auth_basic` và `auth_basic_user_file` (lưu file).

3. Khởi động lại nginx:

   ```bash
   docker compose restart nginx
   ```

## Tắt (mở lại công khai)

- Thêm lại `#` ở 2 dòng đó, hoặc xóa 2 dòng, rồi `docker compose restart nginx`.
- (Tuỳ chọn) xóa `infra/nginx/auth/.htpasswd` — file đã trong `.gitignore`, không lên git.

## Ghi chú

- Mặc định request **/api** và (dev) **/uploads** / **/cms** đi thẳng, **không** bị Basic Auth — frontend vẫn gọi API được sau khi browser đã gửi `Authorization` cho cùng origin lần đầu. Nếu cần chặn cả API, thêm cùng `include` + snippet vào từng `location` tương ứng trong `nginx.conf`.
- Production (`nginx.production.conf`): khối `server` Strapi (subdomain CMS) **không** bật Basic Auth mặc định; chỉ trang chính + API trên cùng domain theo cấu hình bạn sửa.
