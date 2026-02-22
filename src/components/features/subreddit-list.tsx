'use client';

import { useState } from 'react';
import { useFeedStore } from '@/store/feed-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/format';
import { Search, Users, Shield, CheckSquare, Square, Plus } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AddToFeedModal } from './add-to-feed-modal';
import { BulkAddToFeedModal } from './bulk-add-to-feed-modal';
import { useCustomFeeds } from '@/hooks/use-reddit-queries';

export function SubredditList() {
  const {
    selectedSubreddits,
    toggleSubredditSelection,
    selectAllSubreddits,
    clearSelection,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    getFilteredSubreddits,
    currentFeed,
    getSubredditFeeds,
  } = useFeedStore();

  const [modalSubreddit, setModalSubreddit] = useState<string | null>(null);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const { data: feeds = [], refetch: refetchFeeds } = useCustomFeeds();

  const filteredSubreddits = getFilteredSubreddits();
  const allSelected = filteredSubreddits.length > 0 && 
    filteredSubreddits.every(s => selectedSubreddits.has(s.display_name));

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search subreddits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="subreddit-search"
            aria-label="Search subreddits"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(null)}
            data-testid="filter-all"
            aria-pressed={filterCategory === null}
          >
            All
          </Button>
          <Button
            variant={filterCategory === 'sfw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('sfw')}
            data-testid="filter-sfw"
            aria-pressed={filterCategory === 'sfw'}
          >
            SFW
          </Button>
          <Button
            variant={filterCategory === 'nsfw' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('nsfw')}
            data-testid="filter-nsfw"
            aria-pressed={filterCategory === 'nsfw'}
          >
            NSFW
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedSubreddits.size} of {filteredSubreddits.length} selected
        </p>
        <div className="flex gap-2">
          {selectedSubreddits.size > 0 && feeds.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowBulkAddModal(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add {selectedSubreddits.size} to Feeds
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? clearSelection : selectAllSubreddits}
          >
            {allSelected ? (
              <>
                <Square className="h-4 w-4 mr-1" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-1" />
                Select All
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {filteredSubreddits.length === 0 ? (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No subreddits found
          </p>
        ) : (
          filteredSubreddits.map((subreddit) => (
            <div
              key={subreddit.id}
              data-testid="subreddit-item"
              className={cn(
                'flex flex-col sm:flex-row items-start gap-3 p-3 rounded-lg border transition-colors',
                selectedSubreddits.has(subreddit.display_name)
                  ? 'border-reddit-orange bg-orange-50 dark:bg-orange-900/10'
                  : 'border-reddit-gray-200 dark:border-reddit-gray-700 hover:bg-reddit-gray-50 dark:hover:bg-reddit-gray-800'
              )}
            >
              <div className="flex items-start gap-3 flex-1 w-full">
                <Checkbox
                  checked={selectedSubreddits.has(subreddit.display_name)}
                  onCheckedChange={() => toggleSubredditSelection(subreddit.display_name)}
                  aria-label={`Select r/${subreddit.display_name}`}
                  className="mt-1"
                />
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => toggleSubredditSelection(subreddit.display_name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSubredditSelection(subreddit.display_name);
                    }
                  }}
                  aria-selected={selectedSubreddits.has(subreddit.display_name)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      r/{subreddit.display_name}
                    </h3>
                    {subreddit.over18 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        NSFW
                      </span>
                    )}
                  </div>
                  {subreddit.public_description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {subreddit.public_description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {formatNumber(subreddit.subscribers)} members
                    </span>
                    {subreddit.user_is_moderator && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <Shield className="h-3 w-3" />
                        Moderator
                      </span>
                    )}
                  </div>
                  {(() => {
                    const subredditFeeds = getSubredditFeeds(subreddit.display_name);
                    if (subredditFeeds.length > 0) {
                      return (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">In feeds:</span>
                          {subredditFeeds.slice(0, 3).map(feed => (
                            <span
                              key={feed.name}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              title={feed.display_name}
                            >
                              {feed.display_name}
                            </span>
                          ))}
                          {subredditFeeds.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{subredditFeeds.length - 3} more
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalSubreddit(subreddit.display_name);
                }}
                className="flex-shrink-0 w-full sm:w-auto"
                title={`Add r/${subreddit.display_name} to feeds`}
                aria-label={`Add r/${subreddit.display_name} to feeds`}
              >
                <Plus className="h-4 w-4" />
                <span className="ml-1">Add to Feed</span>
              </Button>
            </div>
          ))
        )}
      </div>

      {modalSubreddit && (
        <AddToFeedModal
          isOpen={!!modalSubreddit}
          onClose={() => setModalSubreddit(null)}
          subredditName={modalSubreddit}
          feeds={feeds}
          onSuccess={() => {
            refetchFeeds();
          }}
        />
      )}

      {showBulkAddModal && (
        <BulkAddToFeedModal
          isOpen={showBulkAddModal}
          onClose={() => setShowBulkAddModal(false)}
          subredditNames={Array.from(selectedSubreddits)}
          feeds={feeds}
          onSuccess={() => {
            refetchFeeds();
            clearSelection();
          }}
        />
      )}
    </div>
  );
}