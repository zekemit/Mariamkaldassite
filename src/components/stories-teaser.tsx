import Link from 'next/link';
import { StoryCard } from '@/components/story-card';
import { featuredStoryIds, stories } from '@/content/testimonials';

/** Home page proof: three featured stories (one per leading theme) and a path to all seven. */
export function StoriesTeaser() {
  const featured = featuredStoryIds
    .map((id) => stories.find((story) => story.id === id))
    .filter((story): story is NonNullable<typeof story> => Boolean(story));

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
            Read all seven client stories
          </Link>
        </p>
      </div>
    </section>
  );
}
