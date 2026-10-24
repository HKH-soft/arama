import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const disallowList = [
    '/chat',
    '/dashboard',
    '/profile',
    '/settings',
    '/session-management',
    '/reports',
    '/admin',
    '/admin-login',
    '/api',
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      {
        userAgent: [
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Claude-SearchBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: [
          '/',
          '/magazine',
          '/magazine/*',
          '/meditation',
          '/exercises',
          '/about',
          '/terms',
          '/privacy',
          '/llms.txt',
        ],
        disallow: disallowList,
      },
    ],
    sitemap: 'https://arama.life/sitemap.xml',
  };
}
