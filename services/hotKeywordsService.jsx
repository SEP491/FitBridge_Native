import { request } from "./request";

const hotKeywordsService = {
  // Get trending search keywords
  getHotKeywords: async () => {
    try {
      // This would be your API call to get trending keywords
      // const response = await request("GET", "v1/search/trending");
      // return response.data;

      // For now, return static data
      return {
        success: true,
        data: {
          hotKeywords: [
            { id: 1, text: "Gym 24/7", trend: "hot", searchCount: 1523 },
            { id: 2, text: "Boxing", trend: "rising", searchCount: 892 },
            { id: 3, text: "Yoga Studio", trend: "hot", searchCount: 1445 },
            { id: 4, text: "Swimming Pool", trend: "rising", searchCount: 756 },
            {
              id: 5,
              text: "Personal Training",
              trend: "hot",
              searchCount: 2103,
            },
            { id: 6, text: "Crossfit", trend: "new", searchCount: 234 },
            { id: 7, text: "Pilates", trend: "rising", searchCount: 667 },
            { id: 8, text: "Fitness Center", trend: "hot", searchCount: 1834 },
            { id: 9, text: "Dance Studio", trend: "new", searchCount: 345 },
            { id: 10, text: "Martial Arts", trend: "rising", searchCount: 523 },
          ],
          quickActions: [
            {
              id: 1,
              text: "gyms near me",
              icon: "location-outline",
              color: "#5352ED",
            },
            {
              id: 2,
              text: "24/7 gyms",
              icon: "time-outline",
              color: "#5352ED",
            },
            {
              id: 3,
              text: "premium gyms",
              icon: "star-outline",
              color: "#5352ED",
            },
          ],
        },
      };
    } catch (error) {
      console.error("Error fetching hot keywords:", error);
      return {
        success: false,
        data: {
          hotKeywords: [],
          quickActions: [],
        },
      };
    }
  },

  // Save search query (for analytics/trending)
  saveSearch: async (query) => {
    try {
      // This would save the search query to track trends
      // await request("POST", "v1/search/analytics", { query });
      console.log("Search saved for analytics:", query);
      return { success: true };
    } catch (error) {
      console.error("Error saving search:", error);
      return { success: false };
    }
  },

  // Get recent searches from local storage
  getRecentSearches: () => {
    try {
      // This would get from AsyncStorage in a real app
      // const recent = await AsyncStorage.getItem('recent_searches');
      // return recent ? JSON.parse(recent) : [];

      // For now return static data
      return [
        "Gold's Gym",
        "Fitness First",
        "California Fitness",
        "Anytime Fitness",
      ];
    } catch (error) {
      console.error("Error getting recent searches:", error);
      return [];
    }
  },

  // Save recent search to local storage
  saveRecentSearch: async (query) => {
    try {
      // This would save to AsyncStorage in a real app
      // const recent = await this.getRecentSearches();
      // const updated = [query, ...recent.filter(item => item !== query)].slice(0, 5);
      // await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));

      console.log("Recent search saved:", query);
      return { success: true };
    } catch (error) {
      console.error("Error saving recent search:", error);
      return { success: false };
    }
  },

  // Clear recent searches
  clearRecentSearches: async () => {
    try {
      // This would clear AsyncStorage in a real app
      // await AsyncStorage.removeItem('recent_searches');

      console.log("Recent searches cleared");
      return { success: true };
    } catch (error) {
      console.error("Error clearing recent searches:", error);
      return { success: false };
    }
  },
};

export default hotKeywordsService;
