export interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export const buildWhatsAppClickPayload = (ctaLocation: string, ctaLabel: string): DataLayerEvent => ({
  event: 'whatsapp_click',
  cta_location: ctaLocation,
  cta_label: ctaLabel,
});

export const buildMapDirectionsPayload = (locationId: string): DataLayerEvent => ({
  event: 'map_directions_click',
  location_id: locationId,
});

export const buildInstagramClickPayload = (): DataLayerEvent => ({
  event: 'instagram_click',
});

export const pushToDataLayer = (payload: DataLayerEvent): void => {
  (window.dataLayer ??= []).push(payload);
};
