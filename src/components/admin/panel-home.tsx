'use client';

import { ImageField, Section, TextArea, TextInput } from '@/components/admin/fields';
import { ListEditor, moveItem } from '@/components/admin/list-editor';
import { KNOWN_IMAGES, errorIndexes, type PanelProps } from '@/components/admin/types';
import { newId } from '@/lib/cms-schema';

export function HomePanel({ content, update, errors }: PanelProps) {
  const { hero, mirror } = content;

  return (
    <div className="a-stack a-stack--lg">
      <Section title="Top of the home page" intro="The first thing visitors read and see.">
        <TextArea
          label="Headline"
          value={hero.headline}
          rows={2}
          maxLength={200}
          hint="Press Enter where you want the line to break. If you don’t, it is balanced for you."
          error={errors['hero.headline']}
          onChange={(v) => update((d) => void (d.hero.headline = v))}
        />
        <TextArea
          label="Sub-headline"
          value={hero.subheadline}
          rows={3}
          maxLength={500}
          error={errors['hero.subheadline']}
          onChange={(v) => update((d) => void (d.hero.subheadline = v))}
        />
        <TextInput
          label="Main button text"
          value={hero.ctaLabel}
          maxLength={80}
          hint="This button always opens the booking page."
          error={errors['hero.ctaLabel']}
          onChange={(v) => update((d) => void (d.hero.ctaLabel = v))}
        />
        <ImageField
          label="Portrait image"
          hint="A site path like /images/mariam-hero.jpg, or a full https:// image link. Portrait (tall) photos look best."
          value={hero.portraitSrc}
          known={KNOWN_IMAGES}
          error={errors['hero.portraitSrc']}
          onChange={(v) => update((d) => void (d.hero.portraitSrc = v))}
        />
        <TextInput
          label="Portrait description (for screen readers)"
          value={hero.portraitAlt}
          maxLength={200}
          error={errors['hero.portraitAlt']}
          onChange={(v) => update((d) => void (d.hero.portraitAlt = v))}
        />
      </Section>

      <Section
        title="“Does any of this sound like you?” statements"
        intro="Visitors tap the ones that fit. Whatever they tap is sent with their booking, so you start the conversation where they are."
      >
        <ListEditor
          noun="statement"
          items={mirror.prompts}
          defaultOpen
          minItems={1}
          maxItems={12}
          errorIndexes={errorIndexes(errors, 'mirror.prompts')}
          title={(item) => item.text}
          renderFields={(item, i) => (
            <>
              <TextArea
                label="Statement (in the visitor’s voice)"
                value={item.text}
                rows={2}
                maxLength={240}
                error={errors[`mirror.prompts.${i}.text`]}
                onChange={(v) => update((d) => void (d.mirror.prompts[i].text = v))}
              />
              <TextArea
                label="Your reply when it’s tapped (optional)"
                value={item.reply}
                rows={2}
                maxLength={400}
                error={errors[`mirror.prompts.${i}.reply`]}
                onChange={(v) => update((d) => void (d.mirror.prompts[i].reply = v))}
              />
            </>
          )}
          onMove={(from, to) => update((d) => moveItem(d.mirror.prompts, from, to))}
          onAdd={() => {
            const id = newId('prompt');
            update((d) => void d.mirror.prompts.push({ id, text: '', reply: '' }));
            return id;
          }}
          onRemove={(i) => update((d) => void d.mirror.prompts.splice(i, 1))}
          addLabel="Add a statement"
        />
      </Section>
    </div>
  );
}
