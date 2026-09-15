import type { FaqItem } from './content';
import type { ClinicLocation } from './locations';

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

// A location's ID is stable, so #id here (and in structured data) always resolves without a domain.
const ref = (siteUrl: string | undefined, id: string) => (siteUrl ? `${siteUrl}#${id}` : `#${id}`);

const buildAddress = (location: ClinicLocation) => ({
  '@type': 'PostalAddress',
  streetAddress: location.street,
  addressLocality: location.city,
  addressRegion: location.state,
  ...(location.postalCode ? { postalCode: location.postalCode } : {}),
  addressCountry: 'BR',
});

export const buildPerson = (options: {
  name: string;
  crfa?: string;
  instagramUrl: string;
  siteUrl?: string;
}) => ({
  '@type': 'Person',
  '@id': ref(options.siteUrl, 'maisa'),
  name: options.name,
  jobTitle: 'Fonoaudióloga infantil',
  knowsAbout: ['Fonoaudiologia infantil', 'Linguagem e fala infantil', 'Motricidade orofacial'],
  sameAs: [options.instagramUrl],
  ...(options.crfa ? { hasCredential: { '@type': 'EducationalOccupationalCredential', name: `CRFa ${options.crfa}` } } : {}),
});

export const buildMedicalBusiness = (options: {
  name: string;
  siteUrl?: string;
  ogImageUrl?: string;
  phoneE164?: string;
  businessHours?: string;
  locations: readonly ClinicLocation[];
}) => {
  const [mainLocation, ...otherLocations] = options.locations;
  if (!mainLocation) return null;

  return {
    '@type': 'MedicalBusiness',
    '@id': ref(options.siteUrl, 'atendimento'),
    name: `${options.name} — Fonoaudiologia Infantil`,
    ...(options.siteUrl ? { url: options.siteUrl } : {}),
    ...(options.ogImageUrl ? { image: options.ogImageUrl } : {}),
    ...(options.phoneE164 ? { telephone: options.phoneE164 } : {}),
    address: buildAddress(mainLocation),
    ...(options.businessHours
      ? {
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '18:00',
          },
        }
      : {}),
    areaServed: { '@type': 'City', name: 'Itapeva' },
    employee: { '@id': ref(options.siteUrl, 'maisa') },
    ...(otherLocations.length
      ? { location: otherLocations.map(location => ({ '@type': 'Place', name: location.name, address: buildAddress(location) })) }
      : {}),
  };
};
