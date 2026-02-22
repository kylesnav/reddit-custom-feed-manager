import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RedditAPI } from '@/lib/api/reddit-api';
import { CustomFeed, CreateCustomFeedInput, UpdateCustomFeedInput, Subreddit } from '@/types/reddit';
import { toast } from 'sonner';

const api = RedditAPI.getInstance();

export function useUserSubreddits() {
  return useQuery({
    queryKey: ['subreddits', 'user'],
    queryFn: () => api.getAllUserSubreddits(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCustomFeeds() {
  return useQuery({
    queryKey: ['feeds'],
    queryFn: () => api.getCustomFeeds(),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCustomFeed(username: string, feedName: string) {
  return useQuery({
    queryKey: ['feed', username, feedName],
    queryFn: () => api.getCustomFeed(username, feedName),
    enabled: !!username && !!feedName,
  });
}

export function useCreateCustomFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomFeedInput) => api.createCustomFeed(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success(`Feed "${data.display_name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create feed: ${error.message}`);
    },
  });
}

export function useUpdateCustomFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ path, input }: { path: string; input: UpdateCustomFeedInput }) =>
      api.updateCustomFeed(path, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      toast.success(`Feed "${data.display_name}" updated successfully`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update feed: ${error.message}`);
    },
  });
}

export function useDeleteCustomFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedPath: string) => api.deleteCustomFeed(feedPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success('Feed deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete feed: ${error.message}`);
    },
  });
}

export function useAddSubredditsToFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedPath, subreddits }: { feedPath: string; subreddits: string[] }) =>
      api.bulkAddSubredditsToFeed(feedPath, subreddits),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success(`Added ${variables.subreddits.length} subreddit(s) to feed`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add subreddits: ${error.message}`);
    },
  });
}

export function useRemoveSubredditsFromFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedPath, subreddits }: { feedPath: string; subreddits: string[] }) =>
      api.bulkRemoveSubredditsFromFeed(feedPath, subreddits),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success(`Removed ${variables.subreddits.length} subreddit(s) from feed`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove subreddits: ${error.message}`);
    },
  });
}

export function useCopyCustomFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sourcePath, newName }: { sourcePath: string; newName: string }) =>
      api.copyCustomFeed(sourcePath, newName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] });
      toast.success(`Feed copied as "${data.display_name}"`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to copy feed: ${error.message}`);
    },
  });
}

export function useSearchSubreddits(query: string) {
  return useQuery({
    queryKey: ['subreddits', 'search', query],
    queryFn: () => api.searchSubreddits(query),
    enabled: query.length > 2,
    staleTime: 60 * 1000,
  });
}