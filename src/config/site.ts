export const whatsappInitialMessage =
  'Olá! Gostaria de conversar sobre a comunicação do meu filho e saber como funciona a avaliação fonoaudiológica.';

export interface SiteConfig {
  name: string;
  city: string;
  instagram: string;
  instagramUrl: string;
  publicSiteUrl?: string;
  whatsappNumber?: string;
  crfa?: string;
  address?: string;
  businessHours?: string;
  cnpj?: string;
}

export const siteConfig: SiteConfig = {
  name: 'Maisa Palma',
  city: 'Itapeva–SP',
  instagram: '@fonomaisapalma',
  instagramUrl: 'https://instagram.com/fonomaisapalma',
  publicSiteUrl: import.meta.env.PUBLIC_SITE_URL?.trim(),
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER?.trim() || '5515992719708',
  crfa: '2-23944',
  businessHours: 'Segunda a sexta, das 8h às 18h',
};

export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '#contato';
};

export const normalizePublicSiteUrl = (value?: string): string | undefined => {
  if (!value?.trim()) return undefined;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
};

export const getWhatsAppUrl = (message = whatsappInitialMessage): string =>
  buildWhatsAppUrl(siteConfig.whatsappNumber ?? '', message);

// Renders a local phone number as schema.org's expected "+CC-DDD-XXXXX-XXXX" display format.
export const formatPhoneE164 = (digits: string): string | undefined => {
  if (digits.length < 12) return undefined;
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const rest = digits.slice(4);
  return `+${country}-${area}-${rest.slice(0, -4)}-${rest.slice(-4)}`;
};
