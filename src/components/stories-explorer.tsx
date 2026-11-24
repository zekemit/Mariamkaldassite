'use client';

import { useState } from 'react';
import { StoryCard } from '@/components/story-card';
import { STORY_TAGS, type StoryTag, type Testimonial } from '@/lib/cms-schema';
import { track } from '@/lib/analytics';

type Filter = 'All' | StoryTag;

/** Every client story, filterable by what changed. Without JavaScript every story is simply listed. */
export function StoriesExplorer({ stories }: { stories: readonly Testimonial[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const [touched, setTouched] = useState(false);

  const visible = filter === 'All' ? stories : stories.filter((story) => story.tags.includes(filter));

  const choose = (next: Filter) => {
    setFilter(next);
    setTouched(true);
    track('story_filter', { tag: next });
  };

  // Only offer a filter for a tag that at least one story uses.
  const options: { label: Filter; count: number }[] = [
    { label: 'All', count: stories.length },
    ...STORY_TAGS.map((tag) => ({ label: tag, count: stories.filter((story) => story.tags.includes(tag)).length })).filter(
      (option) => option.count > 0,
    ),
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
