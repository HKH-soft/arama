import { MetadataRoute } from 'next';
import { magazines } from '@/data/magazines';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://arama.life';

  const magazineEntries: MetadataRoute.Sitemap = magazines.map((article) => ({
    url: `${baseUrl}/magazine/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/magazine`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...magazineEntries,
    {
      url: `${baseUrl}/meditation`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/exercises`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/billing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
