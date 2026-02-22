'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateCustomFeed } from '@/hooks/use-reddit-queries';
import { CustomFeed } from '@/types/reddit';
import { Globe, Lock, EyeOff } from 'lucide-react';

interface EditFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  feed: CustomFeed;
  onSuccess: () => void;
}

export function EditFeedModal({ isOpen, onClose, feed, onSuccess }: EditFeedModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public' | 'hidden'>('private');
  const [isNsfw, setIsNsfw] = useState(false);

  const updateFeedMutation = useUpdateCustomFeed();

  useEffect(() => {
    if (feed) {
      setDisplayName(feed.display_name);
      setDescription(feed.description_md || '');
      setVisibility(feed.visibility);
      setIsNsfw(feed.over_18);
    }
  }, [feed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      return;
    }

    try {
      await updateFeedMutation.mutateAsync({
        path: feed.path,
        input: {
          display_name: displayName,
          description_md: description,
          visibility,
          over_18: isNsfw,
        },
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating feed:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Custom Feed"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-1">
            Feed Name *
          </label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My Awesome Feed"
            maxLength={50}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A collection of my favorite subreddits..."
            className="w-full px-3 py-2 border border-reddit-gray-300 dark:border-reddit-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-reddit-orange bg-white dark:bg-reddit-gray-800 text-gray-900 dark:text-gray-100 resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value as 'private')}
                className="text-reddit-orange focus:ring-reddit-orange"
              />
              <Lock className="h-4 w-4" />
              <span>Private (only you can see)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as 'public')}
                className="text-reddit-orange focus:ring-reddit-orange"
              />
              <Globe className="h-4 w-4" />
              <span>Public (anyone can see)</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="hidden"
                checked={visibility === 'hidden'}
                onChange={(e) => setVisibility(e.target.value as 'hidden')}
                className="text-reddit-orange focus:ring-reddit-orange"
              />
              <EyeOff className="h-4 w-4" />
              <span>Hidden (accessible via link)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={isNsfw}
              onCheckedChange={(checked) => setIsNsfw(checked as boolean)}
            />
            <span className="text-sm">This feed contains NSFW content</span>
          </label>
        </div>

        <div className="mt-4 p-3 bg-reddit-gray-100 dark:bg-reddit-gray-800 rounded-md">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Current subreddits:</strong> {feed.subreddits.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Use the main dashboard to add or remove subreddits from this feed.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={updateFeedMutation.isPending || !displayName.trim()}
          >
            {updateFeedMutation.isPending ? 'Updating...' : 'Update Feed'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}