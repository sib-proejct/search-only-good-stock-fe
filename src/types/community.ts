export type DiscussionCategory = 'all' | string;

export type DiscussionSort = 'daily' | 'weekly' | 'monthly' | 'latest' | 'top';

export interface Comment {
  id: string;
  author: {
    name: string;
    isVerified?: boolean;
  };
  createdAt: string;
  content: string;
  likes: number;
  userLiked?: boolean;
}

export interface DiscussionPost {
  id: string;
  title: string;
  category: DiscussionCategory;
  author: {
    name: string;
    isVerified?: boolean;
  };
  createdAt: string;
  ticker?: string;
  stockPassStatus?: 'pass' | 'watch' | 'fail';
  buffettScore?: number;
  isPinned?: boolean;
  isEditorsPick?: boolean;
  content: string;
  snippet: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  commentsCount: number;
  viewsCount: number;
  comments?: Comment[];
}

export interface SentimentPollOption {
  id: string;
  label: string;
  votes: number;
  percentage: number;
}

export interface SentimentPoll {
  id: string;
  question: string;
  description: string;
  totalVotes: number;
  endsIn: string;
  options: SentimentPollOption[];
  userVotedId?: string;
}

export interface TopContributor {
  id: string;
  name: string;
  passAccuracy: string;
  reputation: number;
  followers: number;
}
