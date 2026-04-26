const path = require('path');

module.exports = ({ env }) => ({
  'article-tag-picker': {
    enabled: true,
    resolve: path.join(__dirname, '..', 'src', 'plugins', 'article-tag-picker'),
  },
  'strapi-tiptap-editor': {
    enabled: true,
  },
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});
