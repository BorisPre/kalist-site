// Everything that changes when the site moves (own domain) or the app goes live.
export default {
  // Public address, without a trailing slash. With an own domain: 'https://kalist.fr' and basePath ''.
  siteUrl: 'https://borispre.github.io/kalist-site',
  basePath: '/kalist-site',
  out: 'docs',
  defaultLang: 'fr',
  // Store pages, empty until the app is published. The buttons switch from "coming soon" to "download" by themselves.
  stores: { googlePlay: '', appStore: '' },
  // Google Search Console › HTML tag verification: paste the content="…" value here.
  googleSiteVerification: 'cPLIB4TgHCZYfot05AmqXGCK6n7qOlc94ZWebAOGtj8',
  email: 'kalist.support@gmail.com',
  publisher: 'Boris Prempain — EI',
  // The KALIST app project, for `npm run sync` (data, animations, legal pages).
  appPath: '../KALIST'
};
