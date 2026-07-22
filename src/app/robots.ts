import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/chat/',
        '/dashboard/',
        '/profile/',
        '/settings/',
        '/session-management/',
        '/reports/',
        '/api/'
      ],
    },
    sitemap: 'https://arama.life/sitemap.xml',
  };
}
