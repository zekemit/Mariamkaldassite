import type { Testimonial } from '@/lib/cms-schema';
import { typo } from '@/lib/typo';

/** The full text is stored as one field; a blank line starts a new paragraph. */
export function storyParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

/** One client story: a verbatim pull quote, name, tags, and (optionally) the full text inline. */
export function StoryCard({ story, expandable = true }: { story: Testimonial; expandable?: boolean }) {
  return (
    <article className="story-card">
      <blockquote className="story-quote">
        <p>“{typo(story.pullQuote)}”</p>
      </blockquote>
      <div className="story-meta">
        <p className="story-name">
          {story.name}
          {story.role ? <span className="story-role">{story.role}</span> : null}
        </p>
        {story.tags.length > 0 ? (
          <ul className="story-tags" aria-label={`What changed for ${story.name}`}>
            {story.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {expandable ? (
        <details className="story-more">
          <summary>Read the full story</summary>
          <div>
            {storyParagraphs(story.text).map((paragraph, index) => (
              <p key={index}>{typo(paragraph)}</p>
            ))}
          </div>
        </details>
      ) : null}
    </article>
  );
}
