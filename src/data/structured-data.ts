import type { FaqItem } from './content';

// Escapes `<` so no text can close the surrounding <script type="application/ld+json">.
export const serializeJsonLd = (value: unknown): string => JSON.stringify(value).replace(/</g, '\\u003c');

export const buildFaqPage = (items: readonly FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});
