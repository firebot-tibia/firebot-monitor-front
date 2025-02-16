/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.SITE_URL || 'https://monitor.firebot.run',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  exclude: [
    '/api/*', // Exclude API routes
    '/404', // Exclude error pages
    '/500',
    '/_*', // Exclude Next.js internal routes
    '/*.tsx$', // Exclude tsx files
    '/*.ts$', // Exclude ts files
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/*', '/*.tsx$', '/*.ts$'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority based on your routes
    const priorityMap = {
      '/': 1.0, // Home page
      '/dashboard': 0.9, // Main dashboard
      '/guild': 0.8, // Guild statistics
      '/statistics': 0.8, // Home section
      '/reservations': 0.8, // Reservations
    }

    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: priorityMap[path] || 0.5,
      lastmod: new Date().toISOString(),
    }
  },
  generateIndexSitemap: false,
  autoLastmod: true,
}
