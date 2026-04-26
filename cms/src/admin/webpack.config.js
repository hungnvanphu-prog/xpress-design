'use strict';

const Webpack = require('webpack');

/**
 * Required by strapi-tiptap-editor: tiptap's dependency tippy.js has no ESM build.
 * @see https://github.com/dasmikko/strapi-tiptap-editor#readme
 */
module.exports = (config) => {
  config.plugins.push(
    new Webpack.NormalModuleReplacementPlugin(
      /^tippy\.js$/,
      'tippy.js/dist/tippy-bundle.umd.min.js',
    ),
  );
  return config;
};
