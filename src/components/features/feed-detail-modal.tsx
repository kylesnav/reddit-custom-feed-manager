'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomFeed } from '@/types/reddit';
import { useRemoveSubredditsFromFeed, useAddSubredditsToFeed, useUserSubreddits } from '@/hooks/use-reddit-queries';
import { toast } from 'sonner';
import { Search, Trash2, Plus, Users, Eye, EyeOff, CheckSquare, Square, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/format';
import { Checkbox } from '@/components/ui/checkbox';

interface FeedDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feed: CustomFeed;
  onUpdate: () => void;
}

export function FeedDetailModal({
  isOpen,
  onClose,
  feed,
  onUpdate,
}: FeedDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubreddits, setSelectedSubreddits] = useState<Set<string>>(new Set());
  const [showAddSubreddits, setShowAddSubreddits] = useState(false);
  const [availableSearchQuery, setAvailableSearchQuery] = useState('');
  const [selectedAvailable, setSelectedAvailable] = useState<Set<string>>(new Set());

  const removeSubredditsMutation = useRemoveSubredditsFromFeed();
  const addSubredditsMutation = useAddSubredditsToFeed();
  const { data: allSubreddits = [] } = useUserSubreddits();

  // Filter subreddits in the feed
  const filteredFeedSubreddits = useMemo(() => {
    if (!searchQuery) return feed.subreddits;
    const query = searchQuery.toLowerCase();
    return feed.subreddits.filter(sub => 
      sub.name.toLowerCase().includes(query)
    );
  }, [feed.subreddits, searchQuery]);

  // Get available subreddits (not in this feed)
  const availableSubreddits = useMemo(() => {
    const feedSubredditNames = new Set(feed.subreddits.map(s => s.name));
    return allSubreddits.filter(sub => !feedSubredditNames.has(sub.display_name));
  }, [allSubreddits, feed.subreddits]);

  // Filter available subreddits
  const filteredAvailableSubreddits = useMemo(() => {
    if (!availableSearchQuery) return availableSubreddits;
    const query = availableSearchQuery.toLowerCase();
    return availableSubreddits.filter(sub => 
      sub.display_name.toLowerCase().includes(query) ||
      sub.title?.toLowerCase().includes(query) ||
      sub.public_description?.toLowerCase().includes(query)
    );
  }, [availableSubreddits, availableSearchQuery]);

  const toggleSubreddit = (name: string) => {
    const newSelection = new Set(selectedSubreddits);
    if (newSelection.has(name)) {
      newSelection.delete(name);
    } else {
      newSelection.add(name);
    }
    setSelectedSubreddits(newSelection);
  };

  const toggleAvailable = (name: string) => {
    const newSelection = new Set(selectedAvailable);
    if (newSelection.has(name)) {
      newSelection.delete(name);
    } else {
      newSelection.add(name);
    }
    setSelectedAvailable(newSelection);
  };

  const selectAll = () => {
    setSelectedSubreddits(new Set(filteredFeedSubreddits.map(s => s.name)));
  };

  const deselectAll = () => {
    setSelectedSubreddits(new Set());
  };

  const selectAllAvailable = () => {
    setSelectedAvailable(new Set(filteredAvailableSubreddits.map(s => s.display_name)));
  };

  const deselectAllAvailable = () => {
    setSelectedAvailable(new Set());
  };

  const handleRemove = async () => {
    if (selectedSubreddits.size === 0) {
      toast.error('Please select subreddits to remove');
      return;
    }

    try {
      await removeSubredditsMutation.mutateAsync({
        feedPath: feed.path,
        subreddits: Array.from(selectedSubreddits),
      });
      toast.success(`Removed ${selectedSubreddits.size} subreddit${selectedSubreddits.size > 1 ? 's' : ''} from ${feed.display_name}`);
      setSelectedSubreddits(new Set());
      onUpdate();
    } catch (error) {
      toast.error('Failed to remove subreddits');
    }
  };

  const handleAdd = async () => {
    if (selectedAvailable.size === 0) {
      toast.error('Please select subreddits to add');
      return;
    }

    try {
      await addSubredditsMutation.mutateAsync({
        feedPath: feed.path,
        subreddits: Array.from(selectedAvailable),
      });
      toast.success(`Added ${selectedAvailable.size} subreddit${selectedAvailable.size > 1 ? 's' : ''} to ${feed.display_name}`);
      setSelectedAvailable(new Set());
      setShowAddSubreddits(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to add subreddits');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{feed.display_name}</span>
          {feed.visibility === 'private' ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </div>
      }
      className="max-w-3xl"
    >
      <div className="space-y-4">
        {feed.description_md && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {feed.description_md}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {feed.subreddits.length} subreddits
            </span>
            {feed.num_subscribers !== undefined && (
              <span>{formatNumber(feed.num_subscribers)} subscribers</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddSubreddits(!showAddSubreddits)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Subreddits
          </Button>
        </div>

        {showAddSubreddits && (
          <div className="border rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Add Subreddits to Feed</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddSubreddits(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search available subreddits..."
                value={availableSearchQuery}
                onChange={(e) => setAvailableSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedAvailable.size} of {filteredAvailableSubreddits.length} selected
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectedAvailable.size === filteredAvailableSubreddits.length ? deselectAllAvailable : selectAllAvailable}
                >
                  {selectedAvailable.size === filteredAvailableSubreddits.length ? (
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
                <Button
                  size="sm"
                  onClick={handleAdd}
                  disabled={selectedAvailable.size === 0 || addSubredditsMutation.isPending}
                >
                  Add Selected
                </Button>
              </div>
            </div>

            <div className="max-h-[200px] overflow-y-auto space-y-1">
              {filteredAvailableSubreddits.map((sub) => (
                <div
                  key={sub.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded cursor-pointer transition-colors',
                    selectedAvailable.has(sub.display_name)
                      ? 'bg-orange-100 dark:bg-orange-900/20'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => toggleAvailable(sub.display_name)}
                >
                  <Checkbox
                    checked={selectedAvailable.has(sub.display_name)}
                    onCheckedChange={() => toggleAvailable(sub.display_name)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm">r/{sub.display_name}</span>
                  {sub.over18 && (
                    <span className="text-xs px-1 rounded bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                      NSFW
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search subreddits in this feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSubreddits.size > 0 && `${selectedSubreddits.size} selected`}
            </p>
            <div className="flex gap-2">
              {selectedSubreddits.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={removeSubredditsMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Selected
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={selectedSubreddits.size === filteredFeedSubreddits.length ? deselectAll : selectAll}
              >
                {selectedSubreddits.size === filteredFeedSubreddits.length ? (
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
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-lg p-2">
          {filteredFeedSubreddits.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No subreddits found matching your search' : 'No subreddits in this feed yet'}
            </p>
          ) : (
            filteredFeedSubreddits.map((subreddit) => (
              <div
                key={subreddit.name}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer',
                  selectedSubreddits.has(subreddit.name)
                    ? 'border-reddit-orange bg-orange-50 dark:bg-orange-900/10'
                    : 'border-reddit-gray-200 dark:border-reddit-gray-700 hover:bg-reddit-gray-50 dark:hover:bg-reddit-gray-800'
                )}
                onClick={() => toggleSubreddit(subreddit.name)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedSubreddits.has(subreddit.name)}
                    onCheckedChange={() => toggleSubreddit(subreddit.name)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="font-medium">r/{subreddit.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSubredditsMutation.mutate({
                      feedPath: feed.path,
                      subreddits: [subreddit.name],
                    }, {
                      onSuccess: () => {
                        toast.success(`Removed r/${subreddit.name} from ${feed.display_name}`);
                        onUpdate();
                      },
                    });
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}