import { useEffect } from 'react';

export default function SEO({
  title,
  description = 'Master Java Data Structures & Algorithms with SonuTechHub. Interactive Java 24 compiler, category tracks (Arrays, DP, Graphs, Trees), and LeetCode-style test case verification.',
  keywords = 'Java DSA, Java Compiler, Data Structures and Algorithms Java, SonuTechHub, LeetCode Java practice, Java coding interview preparation, Arrays, Dynamic Programming, Binary Search',
  url,
  image = '/favicon.svg',
  type = 'website'
}) {
  useEffect(() => {
    // 1. Update Title
    const siteTitle = title 
      ? `${title} | SonuTechHub - Java DSA Platform`
      : 'SonuTechHub | Java DSA Practice & Online Compiler';
    document.title = siteTitle;

    // Helper to update or create meta tag
    const updateMeta = (name, content, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content || '');
    };

    // 2. Standard Meta Tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', 'SonuTechHub');
    updateMeta('robots', 'index, follow');

    // 3. Open Graph Tags
    const fullUrl = url || window.location.href;
    updateMeta('og:title', siteTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:url', fullUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', 'SonuTechHub', true);
    updateMeta('og:image', image, true);

    // 4. Twitter Card Tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', siteTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);

    // 5. Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);
  }, [title, description, keywords, url, image, type]);

  return null;
}
