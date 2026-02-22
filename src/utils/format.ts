import { formatDistanceToNow, format } from 'date-fns';

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp * 1000), 'MMM d, yyyy');
}

export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export function getSubredditIcon(iconUrl?: string | null): string {
  if (iconUrl && iconUrl.trim() !== '') {
    return iconUrl;
  }
  return '/default-subreddit-icon.png';
}

export function sanitizeRedditName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 21);
}