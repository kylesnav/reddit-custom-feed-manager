'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useFeedStore } from '@/store/feed-store';
import { useUserSubreddits, useCustomFeeds, useCreateCustomFeed, useUpdateCustomFeed, useDeleteCustomFeed, useAddSubredditsToFeed, useRemoveSubredditsFromFeed } from '@/hooks/use-reddit-queries';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { Header } from '@/components/layout/header';
import { SubredditList } from '@/components/features/subreddit-list';
import { FeedList } from '@/components/features/feed-list';
import { CreateFeedModal } from '@/components/features/create-feed-modal';
import { EditFeedModal } from '@/components/features/edit-feed-modal';
import { FeedDetailModal } from '@/components/features/feed-detail-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { ErrorAlert } from '@/components/ui/error-alert';
import { SubredditListSkeleton, FeedListSkeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CustomFeed } from '@/types/reddit';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const {
    setSubreddits,
    setFeeds,
    selectedSubreddits,
    clearSelection,
    currentFeed,
    setCurrentFeed,
  } = useFeedStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feedToEdit, setFeedToEdit] = useState<CustomFeed | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedToDelete, setFeedToDelete] = useState<CustomFeed | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [feedToView, setFeedToView] = useState<CustomFeed | null>(null);
  
  const { handleError, tryAsync } = useErrorHandler();

  const { data: subreddits, isLoading: loadingSubreddits, error: subredditsError, refetch: refetchSubreddits } = useUserSubreddits();
  const { data: feeds, isLoading: loadingFeeds, error: feedsError, refetch: refetchFeeds } = useCustomFeeds();
  
  const createFeedMutation = useCreateCustomFeed();
  const updateFeedMutation = useUpdateCustomFeed();
  const deleteFeedMutation = useDeleteCustomFeed();
  const addSubredditsMutation = useAddSubredditsToFeed();
  const removeSubredditsMutation = useRemoveSubredditsFromFeed();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (subreddits) {
      setSubreddits(subreddits);
    }
  }, [subreddits, setSubreddits]);

  useEffect(() => {
    if (feeds) {
      setFeeds(feeds);
    }
  }, [feeds, setFeeds]);

  const handleAddToFeed = async () => {
    if (!currentFeed || selectedSubreddits.size === 0) {
      toast.error('Please select a feed and subreddits');
      return;
    }

    const subredditNames = Array.from(selectedSubreddits);
    const existingSubreddits = currentFeed.subreddits.map(s => s.name);
    const newSubreddits = subredditNames.filter(name => !existingSubreddits.includes(name));

    if (newSubreddits.length === 0) {
      toast.info('All selected subreddits are already in this feed');
      return;
    }

    const result = await tryAsync(
      () => addSubredditsMutation.mutateAsync({
        feedPath: currentFeed.path,
        subreddits: newSubreddits,
      }),
      'Failed to add subreddits to feed'
    );
    
    if (result) {
      clearSelection();
      refetchFeeds();
      toast.success(`Added ${newSubreddits.length} subreddit${newSubreddits.length > 1 ? 's' : ''} to ${currentFeed.display_name}`);
    }
  };

  const handleRemoveFromFeed = async () => {
    if (!currentFeed || selectedSubreddits.size === 0) {
      toast.error('Please select a feed and subreddits');
      return;
    }

    const subredditNames = Array.from(selectedSubreddits);
    const existingSubreddits = currentFeed.subreddits.map(s => s.name);
    const subredditsToRemove = subredditNames.filter(name => existingSubreddits.includes(name));

    if (subredditsToRemove.length === 0) {
      toast.info('None of the selected subreddits are in this feed');
      return;
    }

    const result = await tryAsync(
      () => removeSubredditsMutation.mutateAsync({
        feedPath: currentFeed.path,
        subreddits: subredditsToRemove,
      }),
      'Failed to remove subreddits from feed'
    );
    
    if (result) {
      clearSelection();
      refetchFeeds();
      toast.success(`Removed ${subredditsToRemove.length} subreddit${subredditsToRemove.length > 1 ? 's' : ''} from ${currentFeed.display_name}`);
    }
  };

  const handleEditFeed = (feed: CustomFeed) => {
    setFeedToEdit(feed);
    setIsEditModalOpen(true);
  };

  const handleDeleteFeed = (feed: CustomFeed) => {
    setFeedToDelete(feed);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!feedToDelete) return;

    const result = await tryAsync(
      () => deleteFeedMutation.mutateAsync(feedToDelete.path),
      'Failed to delete feed'
    );
    
    if (result) {
      setIsDeleteModalOpen(false);
      setFeedToDelete(null);
      if (currentFeed?.path === feedToDelete.path) {
        setCurrentFeed(null);
      }
      toast.success(`Deleted feed "${feedToDelete.display_name}"`);
    }
  };

  const handleCopyFeed = async (feed: CustomFeed) => {
    const newName = prompt(`Enter a name for the copied feed:`, `${feed.display_name} (Copy)`);
    if (!newName) return;

    const result = await tryAsync(
      () => createFeedMutation.mutateAsync({
        display_name: newName,
        description_md: feed.description_md,
        visibility: feed.visibility,
        over_18: feed.over_18,
        subreddits: feed.subreddits.map(s => s.name),
      }),
      'Failed to copy feed'
    );
    
    if (result) {
      refetchFeeds();
      toast.success(`Created copy of feed "${feed.display_name}"`);
    }
  };

  const handleViewFeed = (feed: CustomFeed) => {
    setFeedToView(feed);
    setIsDetailModalOpen(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen bg-reddit-gray-100 dark:bg-reddit-gray-900 overflow-hidden">
      <Header />
      
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-64px)] overflow-hidden">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100%-24px)]">
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Subreddits</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => refetchSubreddits()}
                    disabled={loadingSubreddits}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingSubreddits ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {loadingSubreddits ? (
                  <SubredditListSkeleton />
                ) : subredditsError ? (
                  <ErrorAlert
                    type="error"
                    title="Failed to load subreddits"
                    message="Please check your connection and try refreshing."
                  />
                ) : (
                  <SubredditList />
                )}
              </CardContent>
            </Card>

            {selectedSubreddits.size > 0 && currentFeed && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Bulk Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleAddToFeed} disabled={addSubredditsMutation.isPending}>
                      Add {selectedSubreddits.size} to {currentFeed.display_name}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleRemoveFromFeed}
                      disabled={removeSubredditsMutation.isPending}
                    >
                      Remove {selectedSubreddits.size} from {currentFeed.display_name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Custom Feeds</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => refetchFeeds()}
                      disabled={loadingFeeds}
                    >
                      <RefreshCw className={`h-4 w-4 ${loadingFeeds ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                {loadingFeeds ? (
                  <FeedListSkeleton />
                ) : feedsError ? (
                  <ErrorAlert
                    type="error"
                    title="Failed to load feeds"
                    message="Please check your connection and try refreshing."
                  />
                ) : (
                  <FeedList
                    feeds={feeds || []}
                    onEdit={handleEditFeed}
                    onDelete={handleDeleteFeed}
                    onCopy={handleCopyFeed}
                    onSelect={handleViewFeed}
                    selectedFeed={currentFeed}
                  />
                )}
              </CardContent>
            </Card>

            {currentFeed && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Selected Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{currentFeed.display_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentFeed.subreddits.length} subreddits
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <CreateFeedModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetchFeeds();
        }}
      />

      {feedToEdit && (
        <EditFeedModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setFeedToEdit(null);
          }}
          feed={feedToEdit}
          onSuccess={() => {
            setIsEditModalOpen(false);
            setFeedToEdit(null);
            refetchFeeds();
          }}
        />
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFeedToDelete(null);
        }}
        title="Delete Feed"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-gray-900 dark:text-white">
                Are you sure you want to delete "{feedToDelete?.display_name}"?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFeedToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteFeedMutation.isPending}
            >
              Delete Feed
            </Button>
          </div>
        </div>
      </Modal>

      {feedToView && (
        <FeedDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setFeedToView(null);
          }}
          feed={feedToView}
          onUpdate={() => {
            refetchFeeds();
          }}
        />
      )}
    </div>
  );
}