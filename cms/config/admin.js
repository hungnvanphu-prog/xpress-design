module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      /** Bắt buộc set trong .env; không dùng salt mặc định đã biết. */
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});
