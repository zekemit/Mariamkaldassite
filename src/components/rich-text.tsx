import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { BOOK_LABEL, BOOK_PATH } from '@/content/site';
import { toTelHref } from '@/lib/safe-url';
import { typo } from '@/lib/typo';

const TOKENS = /(\{\{(?:email|phone|book|contact)\}\})/g;

export interface ContactDetails {
  email: string;
  phone: string;
}

/** Renders copy with {{email}}, {{phone}}, {{book}} and {{contact}} turned into real links. */
export function RichText({
  text,
  contact,
  location = 'faq',
}: {
  text: string;
  contact: ContactDetails;
  location?: string;
}): ReactNode {
  return text.split(TOKENS).map((part, index) => {
    switch (part) {
      case '{{email}}':
        return (
          <a key={index} className="link-quiet" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        );
      case '{{phone}}':
        return (
          <a key={index} className="link-quiet" href={`tel:${toTelHref(contact.phone)}`}>
            {contact.phone}
          </a>
        );
      case '{{book}}':
        return (
          <Link key={index} href={BOOK_PATH} className="btn-book" data-cta={location}>
            {BOOK_LABEL}
          </Link>
        );
      case '{{contact}}':
        return (
          <Link key={index} className="link-quiet" href={`${BOOK_PATH}#contact`}>
            Send me a note.
          </Link>
        );
      default:
        return <Fragment key={index}>{typo(part)}</Fragment>;
    }
  });
}
