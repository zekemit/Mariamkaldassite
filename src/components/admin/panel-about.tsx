'use client';

import { useRef } from 'react';
import { ImageField, Section, TextArea, TextInput, Toggle } from '@/components/admin/fields';
import { ListEditor, moveItem } from '@/components/admin/list-editor';
import { KNOWN_BADGES, errorIndexes, type PanelProps } from '@/components/admin/types';
import { newId } from '@/lib/cms-schema';
import { ANSWER_TOKENS, unknownTokens } from '@/lib/rich-text-markup';

const TOKEN_LABELS: Record<(typeof ANSWER_TOKENS)[number], string> = {
  '{{email}}': 'email address',
  '{{phone}}': 'phone number',
  '{{book}}': 'booking button',
  '{{contact}}': '“Send me a note” link',
};

/** The FAQ answer box, with one-click buttons that drop a live link into the text at the cursor. */
function AnswerField({ value, error, onChange }: { value: string; error?: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const unknown = unknownTokens(value);

  const insert = (token: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? start;
    onChange(value.slice(0, start) + token + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <TextArea
      label="Answer"
      hint={
        <>
          Leave a blank line between paragraphs. Start a line with “- ” for a bullet. Links are inserted for you with the
          buttons below.
        </>
      }
      value={value}
      rows={9}
      maxLength={6000}
      textareaRef={ref}
      error={error ?? (unknown.length ? `Not a known link: ${unknown.join(', ')}. Use the buttons below.` : undefined)}
      onChange={onChange}
      footer={
        <p className="a-known">
          Insert:{' '}
          {ANSWER_TOKENS.map((token) => (
            <button key={token} type="button" className="a-linkbtn" onClick={() => insert(token)}>
              {TOKEN_LABELS[token]}
            </button>
          ))}
        </p>
      }
    />
  );
}

export function AboutPanel({ content, update, errors }: PanelProps) {
  const { pillars, about, faq } = content;

  return (
    <div className="a-stack a-stack--lg">
      <Section
        title="The four coaching pillars"
        intro="“How we’ll work together” on the home page. There are always four; you can edit their wording and order."
      >
        <ListEditor
          noun="pillar"
          items={pillars}
          minItems={4}
          maxItems={4}
          errorIndexes={errorIndexes(errors, 'pillars')}
          title={(p) => p.title}
          summary={(p) => p.body.slice(0, 120) + (p.body.length > 120 ? '…' : '')}
          renderFields={(p, i) => (
            <>
              <TextInput
                label="Title"
                value={p.title}
                maxLength={100}
                error={errors[`pillars.${i}.title`]}
                onChange={(v) => update((d) => void (d.pillars[i].title = v))}
              />
              <TextArea
                label="Description"
                value={p.body}
                rows={4}
                maxLength={600}
                error={errors[`pillars.${i}.body`]}
                onChange={(v) => update((d) => void (d.pillars[i].body = v))}
              />
              <TextInput
                label="A question you might hear (optional)"
                value={p.sampleQuestion}
                maxLength={200}
                error={errors[`pillars.${i}.sampleQuestion`]}
                onChange={(v) => update((d) => void (d.pillars[i].sampleQuestion = v))}
              />
              <div className="a-grid-2">
                <TextInput
                  label="Supporting quote (optional)"
                  value={p.proofQuote}
                  maxLength={300}
                  error={errors[`pillars.${i}.proofQuote`]}
                  onChange={(v) => update((d) => void (d.pillars[i].proofQuote = v))}
                />
                <TextInput
                  label="Who said it (optional)"
                  value={p.proofBy}
                  maxLength={100}
                  error={errors[`pillars.${i}.proofBy`]}
                  onChange={(v) => update((d) => void (d.pillars[i].proofBy = v))}
                />
              </div>
            </>
          )}
          onMove={(from, to) => update((d) => moveItem(d.pillars, from, to))}
        />
      </Section>

      <Section title="About page" intro="Your story, as it appears on the About page. The first paragraph is shown larger.">
        <TextInput
          label="Page heading"
          value={about.heading}
          maxLength={160}
          error={errors['about.heading']}
          onChange={(v) => update((d) => void (d.about.heading = v))}
        />
        <h3 className="a-subhead">Your story</h3>
        <ListEditor
          noun="paragraph"
          items={about.paragraphs.map((text, index) => ({ id: `p${index}`, text }))}
          defaultOpen
          minItems={1}
          maxItems={12}
          errorIndexes={errorIndexes(errors, 'about.paragraphs')}
          title={(p) => p.text.slice(0, 70)}
          renderFields={(p, i) => (
            <TextArea
              label={`Paragraph ${i + 1}`}
              value={p.text}
              rows={5}
              maxLength={2000}
              error={errors[`about.paragraphs.${i}`]}
              onChange={(v) => update((d) => void (d.about.paragraphs[i] = v))}
            />
          )}
          onMove={(from, to) => update((d) => moveItem(d.about.paragraphs, from, to))}
          onAdd={() => void update((d) => void d.about.paragraphs.push(''))}
          onRemove={(i) => update((d) => void d.about.paragraphs.splice(i, 1))}
          addLabel="Add a paragraph"
        />
        <h3 className="a-subhead">Credential badges</h3>
        <ListEditor
          noun="credential"
          items={about.credentials}
          maxItems={8}
          errorIndexes={errorIndexes(errors, 'about.credentials')}
          title={(c) => `${c.code} ${c.title}`}
          renderFields={(c, i) => (
            <>
              <div className="a-grid-2">
                <TextInput
                  label="Short code"
                  value={c.code}
                  maxLength={20}
                  placeholder="CPCC"
                  error={errors[`about.credentials.${i}.code`]}
                  onChange={(v) => update((d) => void (d.about.credentials[i].code = v))}
                />
                <TextInput
                  label="Full title"
                  value={c.title}
                  maxLength={120}
                  error={errors[`about.credentials.${i}.title`]}
                  onChange={(v) => update((d) => void (d.about.credentials[i].title = v))}
                />
              </div>
              <TextInput
                label="Issued by"
                value={c.issuer}
                maxLength={120}
                error={errors[`about.credentials.${i}.issuer`]}
                onChange={(v) => update((d) => void (d.about.credentials[i].issuer = v))}
              />
              <TextInput
                label="Link to the issuer"
                value={c.href}
                inputMode="url"
                placeholder="https://…"
                error={errors[`about.credentials.${i}.href`]}
                onChange={(v) => update((d) => void (d.about.credentials[i].href = v))}
              />
              <ImageField
                label="Badge image (optional)"
                value={c.badgeSrc}
                known={KNOWN_BADGES}
                error={errors[`about.credentials.${i}.badgeSrc`]}
                onChange={(v) => update((d) => void (d.about.credentials[i].badgeSrc = v))}
              />
              {c.badgeSrc ? (
                <TextInput
                  label="Badge description (for screen readers)"
                  value={c.badgeAlt}
                  maxLength={160}
                  error={errors[`about.credentials.${i}.badgeAlt`]}
                  onChange={(v) => update((d) => void (d.about.credentials[i].badgeAlt = v))}
                />
              ) : null}
            </>
          )}
          onMove={(from, to) => update((d) => moveItem(d.about.credentials, from, to))}
          onAdd={() => {
            const id = newId('cred');
            update((d) => void d.about.credentials.push({ id, code: '', title: '', issuer: '', href: '', badgeSrc: '', badgeAlt: '' }));
            return id;
          }}
          onRemove={(i) => update((d) => void d.about.credentials.splice(i, 1))}
          addLabel="Add a credential"
        />
        <h3 className="a-subhead">Credential strip under the home page headline</h3>
        <ListEditor
          noun="strip item"
          items={about.strip}
          defaultOpen
          maxItems={8}
          errorIndexes={errorIndexes(errors, 'about.strip')}
          title={(s) => `${s.code} ${s.text}`}
          renderFields={(s, i) => (
            <div className="a-grid-2">
              <TextInput
                label="Bold word or number"
                value={s.code}
                maxLength={20}
                placeholder="CPCC"
                error={errors[`about.strip.${i}.code`]}
                onChange={(v) => update((d) => void (d.about.strip[i].code = v))}
              />
              <TextInput
                label="Text beside it"
                value={s.text}
                maxLength={80}
                error={errors[`about.strip.${i}.text`]}
                onChange={(v) => update((d) => void (d.about.strip[i].text = v))}
              />
            </div>
          )}
          onMove={(from, to) => update((d) => moveItem(d.about.strip, from, to))}
          onAdd={() => {
            const id = newId('strip');
            update((d) => void d.about.strip.push({ id, code: '', text: '' }));
            return id;
          }}
          onRemove={(i) => update((d) => void d.about.strip.splice(i, 1))}
          addLabel="Add an item"
        />
      </Section>

      <Section title="Questions and answers (FAQ)" intro="Shown on the FAQ page. Choose a few to also show on the home page.">
        <ListEditor
          noun="question"
          items={faq}
          minItems={1}
          maxItems={40}
          errorIndexes={errorIndexes(errors, 'faq')}
          title={(f) => f.question}
          summary={(f) => f.answer.replace(/\s+/g, ' ').slice(0, 110) + (f.answer.length > 110 ? '…' : '')}
          badge={(f) => (f.showOnHome ? 'On homepage' : null)}
          renderFields={(f, i) => (
            <>
              <TextInput
                label="Question"
                value={f.question}
                maxLength={200}
                error={errors[`faq.${i}.question`]}
                onChange={(v) => update((d) => void (d.faq[i].question = v))}
              />
              <AnswerField value={f.answer} error={errors[`faq.${i}.answer`]} onChange={(v) => update((d) => void (d.faq[i].answer = v))} />
              <Toggle label="Show on homepage" checked={f.showOnHome} onChange={(v) => update((d) => void (d.faq[i].showOnHome = v))} />
            </>
          )}
          onMove={(from, to) => update((d) => moveItem(d.faq, from, to))}
          onAdd={() => {
            const id = newId('faq');
            update((d) => void d.faq.push({ id, question: '', answer: '', showOnHome: false }));
            return id;
          }}
          onRemove={(i) => update((d) => void d.faq.splice(i, 1))}
          addLabel="Add a question"
        />
      </Section>
    </div>
  );
}
