import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import type { Testimonial } from '@/lib/cms-schema';
import { countWord } from '@/lib/typo';

/** Home page proof: the stories marked "Featured on Homepage" (or the first three if none are), and a path to all. */
export function StoriesTeaser({ stories }: { stories: readonly Testimonial[] }) {
  const flagged = stories.filter((story) => story.featured);
  const featured = flagged.length > 0 ? flagged : stories.slice(0, 3);
  if (featured.length === 0) return null;

  return (
    <section id="stories" aria-labelledby="stories-title" className="section">
      <div className="wrap">
        <h2 id="stories-title" className="display-2 max-w-[22ch]">
          What clients say changed
        </h2>
        <ul className="mt-12 grid list-none gap-x-10 gap-y-12 p-0 md:grid-cols-3">
          {featured.map((story) => (
            <li key={story.id}>
              <StoryCard story={story} expandable={false} />
            </li>
          ))}
        </ul>
        <p className="mt-12">
          <Link href="/testimonials" className="link-quiet">
            {stories.length === 1 ? 'Read the client story' : `Read all ${countWord(stories.length)} client stories`}
          </Link>
        </p>
      </div>
    </section>
  );
}
