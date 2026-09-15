import { describe, expect, it } from 'vitest';
import { faqItems } from '../../src/data/content';
import { buildFaqPage, serializeJsonLd } from '../../src/data/structured-data';

describe('buildFaqPage', () => {
  it('mirrors every visible FAQ question and answer in order', () => {
    const page = buildFaqPage(faqItems);
    expect(page['@type']).toBe('FAQPage');
    expect(page.mainEntity.map(entry => [entry.name, entry.acceptedAnswer.text])).toEqual(
      faqItems.map(item => [item.question, item.answer]),
    );
  });
});

describe('serializeJsonLd', () => {
  it('produces valid JSON that cannot close the surrounding script element', () => {
    const value = { text: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonLd(value);
    expect(serialized).not.toContain('<');
    expect(JSON.parse(serialized)).toEqual(value);
  });
});
