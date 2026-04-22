import { demandService } from './demandService';

// Default region list used across the UI. Can be expanded later.
// Canonical region groups used in both public form and internal pages
export const REGIONS: string[] = [
  'Barra / Recreio / São Conrado',
  'Botafogo / Largo do Machado / Flamengo e Catete',
  'Copacabana / Leme',
  'Centro / Santa Teresa / Lapa',
  'Ipanema / Leblon',
  'Ilha do Governador / Ramos',
  'Zona Norte',
  'Zona Oeste',
  'Niterói',
  'Outros'
];

export const CONEX_PREFERRED_LOCATIONS: string[] = [
  'Zona Sul 1 (Leme a São Conrado)',
  'Zona Sul 2 (Glória a Botafogo)',
  'Barra da Tijuca / Recreio',
  'Centro',
  'Indiferente',
];

export const CONEX_LOCATION_REGION_MAP: Record<string, string> = {
  'Zona Sul 1 (Leme a São Conrado)': 'Leme / Copacabana / Ipanema / Leblon / São Conrado',
  'Zona Sul 2 (Glória a Botafogo)': 'Glória / Flamengo / Botafogo',
  'Barra da Tijuca / Recreio': 'Barra / Recreio',
  'Centro': 'Centro / Santa Teresa / Lapa',
  'Indiferente': 'Outros',
};

// Returns a sorted list of unique neighborhoods from stored demands.
export const fetchUniqueNeighborhoods = async (): Promise<string[]> => {
  try {
    const demands = await demandService.getAll();
    const set = new Set<string>();
    demands.forEach(d => {
      if (d.neighborhood && d.neighborhood.trim()) set.add(d.neighborhood.trim());
    });
    const list = Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    // If no neighborhoods found, return a small default list to avoid empty selects.
    if (list.length === 0) return ['Centro', 'Botafogo', 'Copacabana', 'Barra da Tijuca'];
    return list;
  } catch (error) {
    console.error('Failed to fetch neighborhoods:', error);
    return ['Centro', 'Botafogo', 'Copacabana', 'Barra da Tijuca'];
  }
};

// Normalize incoming/free-text region values into one of the canonical REGIONS entries.
export const normalizeRegion = (raw?: string | null): string => {
  if (!raw) return 'Outros';
  const s = raw.toString().toLowerCase();

  if (s.match(/barra|recreio|s[oó] conrado/)) return 'Barra / Recreio / São Conrado';
  if (s.match(/botafogo|flamengo|largo|catete|gl[ií]a/)) return 'Botafogo / Flamengo / Largo do Machado / Catete / Glória';
  if (s.match(/copacabana|leme/)) return 'Copacabana / Leme';
  if (s.match(/centro|santa teresa|santa|teresa|lapa/)) return 'Centro / Santa Teresa / Lapa';
  if (s.match(/ipanema|leblon|leblon/)) return 'Ipanema / Leblon';
  if (s.match(/ilha do governador|ramos/)) return 'Ilha do Governador / Ramos';
  if (s.match(/niter/i)) return 'Niterói';
  if (s.match(/zona norte/)) return 'Zona Norte';
  if (s.match(/zona oeste/)) return 'Zona Oeste';

  return 'Outros';
};

export default {
  REGIONS,
  fetchUniqueNeighborhoods
};
