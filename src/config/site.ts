export const whatsappInitialMessage =
  'Olá! Gostaria de conversar sobre a comunicação do meu filho e saber como funciona a avaliação fonoaudiológica.';

export interface SiteConfig {
  name: string;
  city: string;
  instagram: string;
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
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '',
};

export const buildWhatsAppUrl = (phone: string, message: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '#contato';
};

export const getWhatsAppUrl = (message = whatsappInitialMessage): string =>
  buildWhatsAppUrl(siteConfig.whatsappNumber ?? '', message);
