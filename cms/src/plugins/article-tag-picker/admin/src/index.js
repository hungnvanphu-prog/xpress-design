import { PriceTag } from '@strapi/icons';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app) {
    app.customFields.register({
      name: 'tag-multiselect',
      pluginId: PLUGIN_ID,
      type: 'text',
      intlLabel: {
        id: `${PLUGIN_ID}.tag-multiselect.label`,
        defaultMessage: 'Tags',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.tag-multiselect.description`,
        defaultMessage: 'Tìm và chọn nhiều tag (Góc nhìn)',
      },
      icon: PriceTag,
      components: {
        Input: async () =>
          import(/* webpackChunkName: "article-tag-picker-input" */ './components/TagMultiSelectInput'),
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      isReady: true,
      name: PLUGIN_ID,
    });
  },
  bootstrap() {},
};
