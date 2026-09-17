export class SearchEngine {
  async search(query: string) {
    if (!query || !query.trim()) {
      throw new Error("Query pencarian tidak boleh kosong");
    }

    try {
      // Connect to real search provider (DuckDuckGo Instant Answer API)
      const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      if (res.ok) {
        const data: any = await res.json();
        const results: Array<{ title: string; snippet: string; url: string }> = [];

        if (data.AbstractText) {
          results.push({
            title: data.Heading || query,
            snippet: data.AbstractText,
            url: data.AbstractURL || ''
          });
        }

        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 5)) {
            if (topic.Text) {
              results.push({
                title: topic.FirstURL ? topic.FirstURL.split('/').pop()?.replace(/_/g, ' ') || query : query,
                snippet: topic.Text,
                url: topic.FirstURL || ''
              });
            }
          }
        }

        if (results.length > 0) {
          return results;
        }
      }
    } catch (err: any) {
      console.warn("[SearchEngine] Real search request failed:", err?.message || err);
    }

    // Provider not configured or query yielded no live results - real error reporting (no fake success)
    throw new Error(`CAPABILITY_NOT_AVAILABLE: Layanan pencarian web untuk "${query}" tidak dapat diakses atau provider eksternal tidak merespons.`);
  }
}
export const searchEngine = new SearchEngine();
