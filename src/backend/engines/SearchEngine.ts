export class SearchEngine {
  async search(query: string) {
    return [
      { title: `Result for ${query}`, snippet: `Found relevant web results for ${query}...`, url: '' }
    ];
  }
}
export const searchEngine = new SearchEngine();
