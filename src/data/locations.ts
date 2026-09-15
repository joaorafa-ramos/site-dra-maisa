export interface ClinicLocation {
  id: 'senses' | 'sinapse' | 'cliniprev';
  name: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode?: string;
  embedUrl: string;
  mapsUrl: string;
}

// Single display line built from the structured fields below, comma-separated (Iris, iris.md §11.b A-13:
// PT-BR allows the em dash, but eleven of them read as over-punctuated — plain commas read cleaner here).
export const formatAddress = (location: ClinicLocation): string =>
  [`${location.street}, ${location.neighborhood}`, `${location.city}/${location.state}`, location.postalCode]
    .filter(Boolean)
    .join(', ');

export const locations: readonly ClinicLocation[] = [
  {
    id: 'senses',
    name: 'Clínica Senses',
    street: 'Alameda Toledo Ribas, 628',
    neighborhood: 'Centro',
    city: 'Itapeva',
    state: 'SP',
    postalCode: '18400-060',
    embedUrl: 'https://www.google.com/maps?output=embed&q=Cl%C3%ADnica%20Senses%2C%20Alameda%20Toledo%20Ribas%2C%20628%2C%20Itapeva%20-%20SP&hl=pt-BR',
    mapsUrl: 'https://maps.app.goo.gl/wMjFU8sUqFeVpfbg7',
  },
  {
    id: 'sinapse',
    name: 'Clínica Sinapse',
    street: 'Rua Flauzino Antunes, 14',
    neighborhood: 'Centro',
    city: 'Itapeva',
    state: 'SP',
    postalCode: '18400-220',
    embedUrl: 'https://www.google.com/maps?output=embed&q=Cl%C3%ADnica%20Sinapse%20Itapeva&hl=pt-BR',
    mapsUrl: 'https://maps.google.com/maps?vet=10CAAQoqAOahcKEwiAw_KvzeWWAxUAAAAAHQAAAAAQBQ..i&sca_esv=3af28261fd404a58&pvq=Cg0vZy8xMWtqbWRjZnI5IhUKD2NsaW5pY2Egc2luYXBzZRACGAM&lqi=ChdjbGluaWNhIHNpbmFwc2UgaXRhcGV2YUjp7Za2wrGAgAhaIRAAEAEYARgCIhdjbGluaWNhIHNpbmFwc2UgaXRhcGV2YZIBD3BzeWNob3RoZXJhcGlzdA&fvr=1&cs=1&um=1&ie=UTF-8&fb=1&gl=br&sa=X&ftid=0x94c38d0fd4dbe463:0x35e0728d81df6a0',
  },
  {
    id: 'cliniprev',
    name: 'CliniPrev',
    street: 'Rua Santos Dumont, 221',
    neighborhood: 'Centro',
    city: 'Itapeva',
    state: 'SP',
    embedUrl: 'https://www.google.com/maps?output=embed&q=Rua%20Santos%20Dumont%2C%20221%2C%20Centro%2C%20Itapeva%20-%20SP&hl=pt-BR',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=CliniPrev%2C%20Rua%20Santos%20Dumont%2C%20221%2C%20Centro%2C%20Itapeva%20-%20SP',
  },
];
