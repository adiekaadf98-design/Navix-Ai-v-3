/**
 * NAVIX OPEN-SOURCE ENGINE CORE: CRAWL4AI ADAPTATION
 * Adapted from Crawl4AI (https://github.com/unclecode/crawl4ai)
 * License: Apache-2.0
 * 
 * Provides semantic HTML/text parsing, boilerplate filtering (nav/footer/ads removal),
 * token density optimization, and LLM-friendly clean markdown extraction.
 */

export interface Crawl4AiExtractOptions {
  removeImages?: boolean;
  minWordCount?: number;
  preserveCodeBlocks?: boolean;
  preserveTables?: boolean;
}

export interface Crawl4AiExtractResult {
  urlOrTarget: string;
  cleanMarkdown: string;
  title: string;
  wordCount: number;
  characterCount: number;
  tokenDensity: number;
  linksCount: number;
  headingsCount: number;
  tablesCount: number;
  openGraph: Record<string, string>;
  schemaOrgTypes: string[];
}

export class Crawl4AiCoreExtractor {
  /**
   * Extracts clean semantic markdown and structured content from raw HTML or web text
   */
  public static extract(rawContent: string, targetUrl: string = 'web-target', options?: Crawl4AiExtractOptions): Crawl4AiExtractResult {
    let content = rawContent || '';

    // 1. Extract metadata (Title, OpenGraph, Schema.org)
    const openGraph: Record<string, string> = {};
    const schemaOrgTypes: string[] = [];

    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Web Content';

    const ogMatches = content.matchAll(/<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']*)["']/gi);
    for (const m of ogMatches) {
      openGraph[m[1]] = m[2];
    }

    const schemaMatches = content.matchAll(/"@type"\s*:\s*["']([^"']+)["']/gi);
    for (const sm of schemaMatches) {
      if (!schemaOrgTypes.includes(sm[1])) {
        schemaOrgTypes.push(sm[1]);
      }
    }

    // 2. Remove noise, scripts, styles, iframes, SVGs, and header/footer boilerplate
    content = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    // Remove boilerplate navigation and footer sections
    content = content
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

    // 3. Count links before stripping
    const linksCount = (content.match(/<a\b/gi) || []).length;
    const headingsCount = (content.match(/<h[1-6]\b/gi) || []).length;
    const tablesCount = (content.match(/<table\b/gi) || []).length;

    // 4. Transform semantic HTML elements to Markdown
    // Headings
    content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n\n# $1\n\n');
    content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n\n## $1\n\n');
    content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n\n### $1\n\n');
    content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n\n#### $1\n\n');
    content = content.replace(/<h[56][^>]*>([\s\S]*?)<\/h[56]>/gi, '\n\n##### $1\n\n');

    // Code blocks & inline code
    content = content.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n\n```\n$1\n```\n\n');
    content = content.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

    // Paragraphs and breaks
    content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
    content = content.replace(/<br\s*\/?>/gi, '\n');
    content = content.replace(/<hr\s*\/?>/gi, '\n\n---\n\n');

    // Lists
    content = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n• $1');
    content = content.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

    // Bold / Italic
    content = content.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
    content = content.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

    // Blockquotes
    content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

    // Links (keep anchor text with URL if meaningful)
    content = content.replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (match, href, anchor) => {
      const cleanAnchor = anchor.replace(/<[^>]+>/g, '').trim();
      if (!cleanAnchor || cleanAnchor.length < 2) return '';
      if (href.startsWith('#') || href.startsWith('javascript:')) return cleanAnchor;
      return `[${cleanAnchor}](${href})`;
    });

    // Strip remaining tags
    content = content.replace(/<[^>]+>/g, ' ');

    // Decode HTML entities
    content = content
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Clean whitespace & empty lines
    const lines = content.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const cleanMarkdown = lines.join('\n\n');
    const words = cleanMarkdown.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = cleanMarkdown.length;

    // Token Density = Words / Characters (Higher is denser, less formatting noise)
    const tokenDensity = characterCount > 0 ? parseFloat((wordCount / characterCount).toFixed(3)) : 0;

    return {
      urlOrTarget: targetUrl,
      cleanMarkdown,
      title,
      wordCount,
      characterCount,
      tokenDensity,
      linksCount,
      headingsCount,
      tablesCount,
      openGraph,
      schemaOrgTypes
    };
  }
}
