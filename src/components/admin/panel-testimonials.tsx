'use client';

import { Section, TagPicker, TextArea, TextInput, Toggle } from '@/components/admin/fields';
import { ListEditor, moveItem } from '@/components/admin/list-editor';
import { errorIndexes, type PanelProps } from '@/components/admin/types';
import { STORY_TAGS, newId } from '@/lib/cms-schema';

export function TestimonialsPanel({ content, update, errors }: PanelProps) {
  const featuredCount = content.testimonials.filter((t) => t.featured).length;

  return (
    <Section
      title="Client stories"
      intro={
        <>
          These appear on the Client stories page. Turn on “Featured on homepage” for the few you want in the home page
          section ({featuredCount} featured now). Quote them exactly as the client wrote them.
        </>
      }
    >
      <ListEditor
        noun="story"
        items={content.testimonials}
        minItems={1}
        maxItems={40}
        errorIndexes={errorIndexes(errors, 'testimonials')}
        title={(t) => t.name}
        summary={(t) => `“${t.pullQuote.slice(0, 110)}${t.pullQuote.length > 110 ? '…' : ''}”`}
        badge={(t) => (t.featured ? 'On homepage' : null)}
        renderFields={(t, i) => (
          <>
            <div className="a-grid-2">
              <TextInput
                label="Name or initials"
                value={t.name}
                maxLength={60}
                placeholder="Kevin C."
                error={errors[`testimonials.${i}.name`]}
                onChange={(v) => update((d) => void (d.testimonials[i].name = v))}
              />
              <TextInput
                label="Role or context (optional)"
                value={t.role}
                maxLength={100}
                placeholder="Software engineer, career changer"
                error={errors[`testimonials.${i}.role`]}
                onChange={(v) => update((d) => void (d.testimonials[i].role = v))}
              />
            </div>
            <TextArea
              label="Pull-quote"
              hint="The short line shown big on the card. It should be a sentence from the full text."
              value={t.pullQuote}
              rows={2}
              maxLength={400}
              error={errors[`testimonials.${i}.pullQuote`]}
              onChange={(v) => update((d) => void (d.testimonials[i].pullQuote = v))}
            />
            <TextArea
              label="Full testimonial"
              hint="Leave a blank line between paragraphs."
              value={t.text}
              rows={8}
              maxLength={4000}
              error={errors[`testimonials.${i}.text`]}
              onChange={(v) => update((d) => void (d.testimonials[i].text = v))}
            />
            <TagPicker
              label="What changed (tags)"
              hint="Visitors can filter the stories by these."
              options={STORY_TAGS}
              value={t.tags}
              onChange={(tags) => update((d) => void (d.testimonials[i].tags = tags))}
            />
            <Toggle
              label="Featured on homepage"
              checked={t.featured}
              onChange={(v) => update((d) => void (d.testimonials[i].featured = v))}
            />
          </>
        )}
        onMove={(from, to) => update((d) => moveItem(d.testimonials, from, to))}
        onAdd={() => {
          const id = newId('story');
          update((d) => void d.testimonials.push({ id, name: '', role: '', pullQuote: '', text: '', tags: [], featured: false }));
          return id;
        }}
        onRemove={(i) => update((d) => void d.testimonials.splice(i, 1))}
        addLabel="Add a client story"
      />
    </Section>
  );
}
