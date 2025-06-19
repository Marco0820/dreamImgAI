const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'it', 'es', 'pt', 'hi'],
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}; 