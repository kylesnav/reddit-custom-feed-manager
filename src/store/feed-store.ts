import { create } from 'zustand';
import { CustomFeed, Subreddit } from '@/types/reddit';

interface FeedStore {
  selectedSubreddits: Set<string>;
  currentFeed: CustomFeed | null;
  feeds: CustomFeed[];
  subreddits: Subreddit[];
  searchQuery: string;
  filterCategory: string | null;
  
  setSelectedSubreddits: (subreddits: Set<string>) => void;
  toggleSubredditSelection: (subredditName: string) => void;
  selectAllSubreddits: () => void;
  clearSelection: () => void;
  
  setCurrentFeed: (feed: CustomFeed | null) => void;
  setFeeds: (feeds: CustomFeed[]) => void;
  setSubreddits: (subreddits: Subreddit[]) => void;
  
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: string | null) => void;
  
  getFilteredSubreddits: () => Subreddit[];
  getSelectedSubredditsList: () => string[];
  getSubredditFeeds: (subredditName: string) => CustomFeed[];
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  selectedSubreddits: new Set(),
  currentFeed: null,
  feeds: [],
  subreddits: [],
  searchQuery: '',
  filterCategory: null,
  
  setSelectedSubreddits: (subreddits) => set({ selectedSubreddits: subreddits }),
  
  toggleSubredditSelection: (subredditName) => {
    const { selectedSubreddits } = get();
    const newSet = new Set(selectedSubreddits);
    
    if (newSet.has(subredditName)) {
      newSet.delete(subredditName);
    } else {
      newSet.add(subredditName);
    }
    
    set({ selectedSubreddits: newSet });
  },
  
  selectAllSubreddits: () => {
    const { getFilteredSubreddits } = get();
    const filtered = getFilteredSubreddits();
    const newSet = new Set(filtered.map(s => s.display_name));
    set({ selectedSubreddits: newSet });
  },
  
  clearSelection: () => set({ selectedSubreddits: new Set() }),
  
  setCurrentFeed: (feed) => set({ currentFeed: feed }),
  setFeeds: (feeds) => set({ feeds }),
  setSubreddits: (subreddits) => set({ subreddits }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCategory: (category) => set({ filterCategory: category }),
  
  getFilteredSubreddits: () => {
    const { subreddits, searchQuery, filterCategory } = get();
    
    let filtered = [...subreddits];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.display_name.toLowerCase().includes(query) ||
          s.title.toLowerCase().includes(query) ||
          s.public_description.toLowerCase().includes(query)
      );
    }
    
    if (filterCategory) {
      if (filterCategory === 'nsfw') {
        filtered = filtered.filter((s) => s.over18);
      } else if (filterCategory === 'sfw') {
        filtered = filtered.filter((s) => !s.over18);
      }
    }
    
    return filtered.sort((a, b) => 
      a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase())
    );
  },
  
  getSelectedSubredditsList: () => {
    const { selectedSubreddits } = get();
    return Array.from(selectedSubreddits);
  },
  
  getSubredditFeeds: (subredditName: string) => {
    const { feeds } = get();
    return feeds.filter(feed => 
      feed.subreddits.some(sub => sub.name === subredditName)
    );
  },
}));