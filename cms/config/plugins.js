module.exports = ({ env }) => ({
  'strapi-tiptap-editor': {
    enabled: true,
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});
