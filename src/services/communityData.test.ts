import { describe, expect, it } from 'vitest';
import type { DiscussionPost } from '../types/community';
import { applyDiscussionVote } from './communityData';

const createPost = (
  overrides: Partial<DiscussionPost> = {}
): DiscussionPost => ({
  id: 'post-1',
  title: 'Test post',
  category: 'test',
  author: { name: 'tester' },
  createdAt: '12:00',
  content: 'content',
  snippet: 'content',
  upvotes: 0,
  downvotes: 0,
  userVote: null,
  commentsCount: 0,
  viewsCount: 0,
  ...overrides,
});

describe('applyDiscussionVote', () => {
  it('increments a first downvote', () => {
    const result = applyDiscussionVote(createPost(), 'down');

    expect(result.downvotes).toBe(1);
    expect(result.userVote).toBe('down');
  });

  it('removes a repeated vote', () => {
    const result = applyDiscussionVote(
      createPost({ downvotes: 1, userVote: 'down' }),
      'down'
    );

    expect(result.downvotes).toBe(0);
    expect(result.userVote).toBeNull();
  });

  it('moves an upvote to a downvote without changing the total votes', () => {
    const result = applyDiscussionVote(
      createPost({ upvotes: 4, downvotes: 2, userVote: 'up' }),
      'down'
    );

    expect(result.upvotes).toBe(3);
    expect(result.downvotes).toBe(3);
    expect(result.userVote).toBe('down');
  });
});
