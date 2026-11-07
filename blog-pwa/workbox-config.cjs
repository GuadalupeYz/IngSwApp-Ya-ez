// Configuración de Workbox: genera el service worker (sw.js) después de "ng build".
// Uso: npx workbox generateSW workbox-config.cjs   (lo hace "npm run build:pwa")
module.exports = {
  globDirectory: 'dist/blog-pwa/browser/',
  // Precaché: la "cáscara" de la app (HTML, JS, CSS, íconos y manifest) queda guardada al instalar
  globPatterns: ['**/*.{html,js,css,ico,png,svg,webmanifest}'],
  swDest: 'dist/blog-pwa/browser/sw.js',
  // Cualquier navegación sin conexión abre index.html (la app usa rutas con #)
  navigateFallback: 'index.html',
  // Ionic carga muchos chunks: se sube el límite de tamaño por archivo a precachear
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  // El service worker nuevo toma el control apenas se instala
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    {
      // API del Blog (JHipster): posts y blogs
      urlPattern: ({ url }) => url.port === '8080' && /^\/api\/(posts|blogs)/.test(url.pathname),
      // Primero la red; si no hay conexión o tarda más de 5 s, se usa lo guardado
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'api-blog',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 100, maxAgeSeconds: 3 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [200] },
      },
    },
  ],
};
