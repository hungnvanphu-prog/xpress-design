'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'tag-multiselect',
    plugin: 'article-tag-picker',
    type: 'text',
  });
};
