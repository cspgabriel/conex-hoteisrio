export enum Status {
  OPEN = 'Pendente',
  IN_PROGRESS = 'Em Negociação',
  DELAYED = 'Atrasada / Sem Resposta',
  PARTIAL = 'Parcialmente Atendida',
}

export enum Category {
  SECURITY = 'Segurança',
  HOMELESSNESS = 'Assistência Social',
  CLEANING = 'Limpeza Urbana',
  TRANSPORT = 'Trabalhista', // Mapped based on legacy
  ORDER = 'Ordem Pública',
  INFRASTRUCTURE = 'Infraestrutura',
  OTHER = 'Outros',
}

export interface Agency {
  id: string;
  name: string;
  acronym: string;
}

export interface Demand {
  id: string;
  hotelName: string;
  region: string;
  neighborhood: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string; // New field for CONEX
  category: string[];
  description: string;
  status: Status;
  dateOpened: string;
  dateResolved?: string;
  assignedAgency: string; // Will use this as "Responsável"
  lat?: number;
  lng?: number;
  // Hospedagem / Eventos Specific Fields
  fullName?: string;
  company?: string;
  institutionType?: string;
  demandType?: string;
  checkIn?: string;
  checkOut?: string;
  numNights?: string;
  numUHs?: string;
  roomConfig?: {
    single?: string;
    double?: string;
    twin?: string;
    triple?: string;
  };
  nationality?: string;
  groupProfile?: string;
  hotelCategory?: string;
  preferredLocation?: string;
  needsEventRoom?: string;
  eventDates?: string;
  eventTime?: string;
  numParticipants?: string;
  roomSetup?: string;
  basicEquipment?: string[];
  abServices?: string[];
  foodRestrictions?: string;
  paymentPolicy?: string;
  attachments?: Array<{
    name: string;
    url: string;
    uploadedAt?: string;
  }>;
  customFields?: Record<string, string>;
}

export interface DashboardStats {
  totalDemands: number;
  resolvedCount: number;
  openCount: number;
  resolutionRate: number;
  avgResolutionTimeDays: number;
}
