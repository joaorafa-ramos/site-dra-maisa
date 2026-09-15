import { describe, expect, it } from 'vitest';
import {
  buildInstagramClickPayload,
  buildMapDirectionsPayload,
  buildWhatsAppClickPayload,
} from '../../src/scripts/tracking';

describe('buildWhatsAppClickPayload', () => {
  it('builds a whatsapp_click event with the CTA origin and label', () => {
    expect(buildWhatsAppClickPayload('hero', 'Conversar sobre meu filho')).toEqual({
      event: 'whatsapp_click',
      cta_location: 'hero',
      cta_label: 'Conversar sobre meu filho',
    });
  });
});

describe('buildMapDirectionsPayload', () => {
  it('builds a map_directions_click event with the clinic id', () => {
    expect(buildMapDirectionsPayload('senses')).toEqual({
      event: 'map_directions_click',
      location_id: 'senses',
    });
  });
});

describe('buildInstagramClickPayload', () => {
  it('builds a plain instagram_click event', () => {
    expect(buildInstagramClickPayload()).toEqual({ event: 'instagram_click' });
  });
});
