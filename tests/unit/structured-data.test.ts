import { describe, expect, it } from 'vitest';
import { faqItems } from '../../src/data/content';
import { locations } from '../../src/data/locations';
import { buildFaqPage, buildMedicalBusiness, buildPerson, serializeJsonLd } from '../../src/data/structured-data';

describe('buildFaqPage', () => {
  it('mirrors every visible FAQ question and answer in order', () => {
    const page = buildFaqPage(faqItems);
    expect(page['@type']).toBe('FAQPage');
    expect(page.mainEntity.map(entry => [entry.name, entry.acceptedAnswer.text])).toEqual(
      faqItems.map(item => [item.question, item.answer]),
    );
  });
});

describe('buildPerson', () => {
  it('keeps ids relative without a confirmed public site URL', () => {
    const person = buildPerson({ name: 'Maisa Palma', crfa: '2-23944', instagramUrl: 'https://instagram.com/x' });
    expect(person['@id']).toBe('#maisa');
    expect(person.hasCredential).toEqual({ '@type': 'EducationalOccupationalCredential', name: 'CRFa 2-23944' });
  });

  it('qualifies ids and omits the credential when data is missing', () => {
    const person = buildPerson({ name: 'Maisa Palma', instagramUrl: 'https://instagram.com/x', siteUrl: 'https://example.com' });
    expect(person['@id']).toBe('https://example.com#maisa');
    expect(person).not.toHaveProperty('hasCredential');
  });
});

describe('buildMedicalBusiness', () => {
  it('uses the first location as the primary address and the rest as additional locations', () => {
    const business = buildMedicalBusiness({
      name: 'Maisa Palma',
      phoneE164: '+55-15-99271-9708',
      businessHours: 'Segunda a sexta, das 8h às 18h',
      locations,
    });
    expect(business?.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Alameda Toledo Ribas, 628',
      addressLocality: 'Itapeva',
      addressRegion: 'SP',
      postalCode: '18400-060',
      addressCountry: 'BR',
    });
    expect(business?.location).toHaveLength(locations.length - 1);
    expect(business).not.toHaveProperty('aggregateRating');
    expect(business?.employee).toEqual({ '@id': '#maisa' });
  });

  it('returns null when there is no location data', () => {
    expect(buildMedicalBusiness({ name: 'Maisa Palma', locations: [] })).toBeNull();
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
