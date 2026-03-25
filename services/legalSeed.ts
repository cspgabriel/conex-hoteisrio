import { Demand, Status } from '../types';
import legalReportCsv from './AssessoriaJuridicaHotisRIO_Report.csv?raw';
import { getCsvHeaders, parseMappedCSV } from './mockData';

export const LEGAL_SEED_VERSION = 'legal-seed-21-resolved-2026-03-17';

export const getLegalSeedDemands = (): Demand[] => {
  const headers = getCsvHeaders(legalReportCsv);
  const findHeader = (pattern: string) => headers.find((header) => header.toLowerCase().includes(pattern.toLowerCase())) || '';

  const systemMap = {
    id: findHeader('solicita'),
    dateOpened: findHeader('adicionado'),
    hotelName: findHeader('nome do hotel'),
    category: findHeader('assunto'),
    description: findHeader('breve descri'),
    contactEmail: findHeader('email'),
    assignedAgency: findHeader('tarefa'),
  };

  const customMap = Object.fromEntries(
    [
      [findHeader('responsavel pelo preenchimento'), 'Responsavel pelo Preenchimento'],
      [findHeader('cargo'), 'Cargo'],
      [findHeader('whatsapp'), 'WhatsApp'],
      [findHeader('refer'), 'Nome da Referencia'],
    ].filter(([key]) => key)
  ) as Record<string, string>;

  return parseMappedCSV(legalReportCsv, systemMap, customMap).slice(0, 21).map((demand) => ({
    ...demand,
    id: demand.id.startsWith('AJ-') ? demand.id : `AJ-${demand.id}`,
    region: '',
    neighborhood: '',
    address: '',
    assignedAgency: demand.assignedAgency || 'Equipe Juridica HotéisRIO',
    status: Status.RESOLVED,
    dateResolved: demand.dateOpened,
  }));
};
