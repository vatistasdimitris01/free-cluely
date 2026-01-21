import axios from 'axios';

export class WebSearchHelper {
  private static readonly GOOGLE_API_KEY = "AIzaSyBeUoTpFTw6PLV0FXmwHKSDZTFeI9EpvTs";
  private static readonly SEARCH_ENGINE_ID = "65e9ca6ab35c2463c";

  public static async search(query: string) {
    try {
      console.log(`[WebSearchHelper] Searching for: ${query}`);
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.GOOGLE_API_KEY,
          cx: this.SEARCH_ENGINE_ID,
          q: query,
        }
      });

      const items = response.data.items || [];
      return items.map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet
      })).slice(0, 5); // Limit to top 5 results
    } catch (error: any) {
      console.error("[WebSearchHelper] Search failed:", error.response?.data || error.message);
      throw new Error(`Web search failed: ${error.message}`);
    }
  }
}
