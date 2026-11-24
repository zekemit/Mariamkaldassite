import type { Story } from '@/content/testimonials';
import { typo } from '@/lib/typo';

/** One client story: a verbatim pull quote, name, tags, and (optionally) the full text inline. */
export function StoryCard({ story, expandable = true }: { story: Story; expandable?: boolean }) {
  return (
    <article className="story-card">
      <blockquote className="story-quote">
        <p>“{typo(story.pullQuote)}”</p>
      </blockquote>
      <div className="story-meta">
        <p className="story-name">{story.name}</p>
        <ul className="story-tags" aria-label={`What changed for ${story.name}`}>
          {story.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
      {expandable ? (
        <details className="story-more">
          <summary>Read the full story</summary>
          <div>
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{typo(paragraph)}</p>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}
