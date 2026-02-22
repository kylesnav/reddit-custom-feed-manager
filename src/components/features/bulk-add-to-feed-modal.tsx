'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAddSubredditsToFeed } from '@/hooks/use-reddit-queries';
import { CustomFeed } from '@/types/reddit';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface BulkAddToFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  subredditNames: string[];
  feeds: CustomFeed[];
  onSuccess: () => void;
}

export function BulkAddToFeedModal({
  isOpen,
  onClose,
  subredditNames,
  feeds,
  onSuccess,
}: BulkAddToFeedModalProps) {
  const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());
  const addSubredditsMutation = useAddSubredditsToFeed();

  const handleToggleFeed = (feedPath: string) => {
    const newSelectedFeeds = new Set(selectedFeeds);
    if (newSelectedFeeds.has(feedPath)) {
      newSelectedFeeds.delete(feedPath);
    } else {
      newSelectedFeeds.add(feedPath);
    }
    setSelectedFeeds(newSelectedFeeds);
  };

  const handleSubmit = async () => {
    if (selectedFeeds.size === 0) {
      toast.error('Please select at least one feed');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const feedPath of Array.from(selectedFeeds)) {
      try {
        await addSubredditsMutation.mutateAsync({
          feedPath,
          subreddits: subredditNames,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Failed to add to feed ${feedPath}:`, error);
      }
    }

    if (successCount > 0) {
      toast.success(
        `Added ${subredditNames.length} subreddit${subredditNames.length > 1 ? 's' : ''} to ${successCount} feed${successCount > 1 ? 's' : ''}`
      );
      setSelectedFeeds(new Set());
      onSuccess();
      onClose();
    }

    if (errorCount > 0) {
      toast.error(`Failed to add to ${errorCount} feed${errorCount > 1 ? 's' : ''}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add ${subredditNames.length} Subreddit${subredditNames.length > 1 ? 's' : ''} to Feeds`}
      className="max-w-md"
    >
      <div className="space-y-4">
        {feeds.length === 0 ? (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No feeds available. Create a feed first.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select the feeds to add these subreddits to:
            </p>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {feeds.map((feed) => (
                <div
                  key={feed.path}
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    selectedFeeds.has(feed.path)
                      ? 'border-reddit-orange bg-orange-50 dark:bg-orange-900/10'
                      : 'border-reddit-gray-200 dark:border-reddit-gray-700 hover:bg-reddit-gray-50 dark:hover:bg-reddit-gray-800'
                  )}
                  onClick={() => handleToggleFeed(feed.path)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleToggleFeed(feed.path);
                    }
                  }}
                >
                  <Checkbox
                    checked={selectedFeeds.has(feed.path)}
                    onCheckedChange={() => handleToggleFeed(feed.path)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{feed.display_name}</p>
                    {feed.description_md && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                        {feed.description_md}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {feed.subreddits.length} subreddits currently
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {feeds.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={addSubredditsMutation.isPending || selectedFeeds.size === 0}
            >
              {addSubredditsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to {selectedFeeds.size} Feed{selectedFeeds.size !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}