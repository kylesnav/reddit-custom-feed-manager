'use client';

import { CustomFeed } from '@/types/reddit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, Eye, EyeOff, Users } from 'lucide-react';
import { formatRelativeTime, formatNumber } from '@/utils/format';
import { cn } from '@/utils/cn';

interface FeedListProps {
  feeds: CustomFeed[];
  onEdit: (feed: CustomFeed) => void;
  onDelete: (feed: CustomFeed) => void;
  onCopy: (feed: CustomFeed) => void;
  onSelect: (feed: CustomFeed) => void;
  selectedFeed?: CustomFeed | null;
}

export function FeedList({
  feeds,
  onEdit,
  onDelete,
  onCopy,
  onSelect,
  selectedFeed,
}: FeedListProps) {
  return (
    <div className="h-full overflow-y-auto space-y-3 pr-2">
      {feeds.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No custom feeds yet. Create your first feed!
            </p>
          </CardContent>
        </Card>
      ) : (
        feeds.map((feed) => (
          <Card
            key={feed.path}
            data-testid="feed-item"
            className={cn(
              'cursor-pointer transition-all',
              selectedFeed?.path === feed.path
                ? 'ring-2 ring-reddit-orange'
                : 'hover:shadow-md'
            )}
            onClick={() => onSelect(feed)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(feed);
              }
            }}
            aria-selected={selectedFeed?.path === feed.path}
            aria-label={`Select feed: ${feed.display_name}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {feed.display_name}
                    {feed.visibility === 'private' ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </CardTitle>
                  {feed.description_md && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {feed.description_md}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(feed);
                    }}
                    aria-label="Copy feed"
                    title="Copy feed"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(feed);
                    }}
                    aria-label="Edit feed"
                    title="Edit feed"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(feed);
                    }}
                    className="text-red-500 hover:text-red-600"
                    aria-label="Delete feed"
                    title="Delete feed"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {feed.subreddits.length} subreddits
                </span>
                {feed.num_subscribers !== undefined && (
                  <span>{formatNumber(feed.num_subscribers)} subscribers</span>
                )}
                <span>Created {formatRelativeTime(feed.created_utc)}</span>
              </div>
              {feed.subreddits.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {feed.subreddits.slice(0, 5).map((sub) => (
                    <span
                      key={sub.name}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-reddit-gray-100 dark:bg-reddit-gray-700 text-xs"
                    >
                      r/{sub.name}
                    </span>
                  ))}
                  {feed.subreddits.length > 5 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-reddit-gray-100 dark:bg-reddit-gray-700 text-xs">
                      +{feed.subreddits.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}