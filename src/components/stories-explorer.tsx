'use client';

import { useState } from 'react';
import { StoryCard } from '@/components/story-card';
import { countByTag, stories, storyTags, type StoryTag } from '@/content/testimonials';
import { track } from '@/lib/analytics';

type Filter = 'All' | StoryTag;

/** All seven client stories, filterable by what changed. Without JavaScript every story is simply listed. */
export function StoriesExplorer() {
  const [filter, setFilter] = useState<Filter>('All');
  const [touched, setTouched] = useState(false);

  const visible = filter === 'All' ? stories : stories.filter((story) => story.tags.includes(filter));

  const choose = (next: Filter) => {
    setFilter(next);
    setTouched(true);
    track('story_filter', { tag: next });
  };

  const options: { label: Filter; count: number }[] = [
    { label: 'All', count: stories.length },
    ...storyTags.map((tag) => ({ label: tag, count: countByTag(tag) })),
  ];

  return (
    <div>
      <div className="chips-wrap">
        <div className="chips" role="group" aria-label="Filter stories by what changed">
          {options.map((option) => (
            <button
              key={option.label}
              type="button"
              className="chip"
              aria-pressed={filter === option.label}
              onClick={() => choose(option.label)}
            >
              <span>{option.label}</span>
              <span className="chip-count">{option.count}</span>
            </button>
          ))}
        </div>
      </div>

      <p role="status" className="sr-only">
        Showing {visible.length} of {stories.length} stories
        {filter === 'All' ? '' : `: ${filter.toLowerCase()}`}.
      </p>

      <ul className="story-grid mt-10">
        {visible.map((story) => (
          <li key={story.id} className={`story-item${touched ? ' is-entering' : ''}`}>
            <StoryCard story={story} />
          </li>
        ))}
      </ul>
    </div>
  );
}
