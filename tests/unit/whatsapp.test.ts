import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl, normalizePublicSiteUrl } from '../../src/config/site';

describe('buildWhatsAppUrl', () => {
  it('normalizes the phone and encodes the message', () => {
    expect(buildWhatsAppUrl('+55 (15) 99999-9999', 'Olá, Maisa!')).toBe(
      'https://wa.me/5515999999999?text=Ol%C3%A1%2C%20Maisa!',
    );
  });

  it('falls back to the contact section before a number is configured', () => {
    expect(buildWhatsAppUrl('', 'Olá')).toBe('#contato');
  });
});

describe('normalizePublicSiteUrl', () => {
  it('preserves the configured public URL pathname and query', () => {
    expect(normalizePublicSiteUrl('https://example.com/maisa/?ref=x')).toBe('https://example.com/maisa/?ref=x');
  });
});
