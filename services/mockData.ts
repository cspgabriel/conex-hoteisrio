
import { Demand, Status, Category } from '../types';
import legalReportCsv from './AssessoriaJuridicaHotisRIO_Report.csv?raw';

// Raw CSV Data provided by the user
const CSV_CONTENT = `"OP","Data da Solicitação","Categorias de demanda de ordem pública","Nome do Hotel","Status","Hotel","Localização (GEO)","Localização (GEO): Rua","Localização (GEO): Cidade","Localização (GEO): CEP","Localização (GEO): Nome","Região do hotel","Nome do Responsável pelo preenchimento","Cargo do responsável","Bairro do hotel","Observações Theresa","demandas:","Observações adicionais","Endereço do Hotel","E-mail do responsável","Prazo para resolução","Número de celular do responsável","Estado do Google Docs","Nome da referência","PDF Status","Responsável pela tarefa","Criado","Localização (GEO): Coordenadas","Criado por","Modificado por"
"OP99","14/08/2025","[""RIOLUZ""]","Courtyard & Residence Inn By Marriott","Atendido","COURTYARD BY MARRIOTT","{""DisplayName"":""Avª Embaixador Abelardo Bueno 5001"",""LocationUri"":""https://www.bingapis.com/api/v6/geoentities?streetaddress=Av%c2%aa+Embaixador+Abelardo+Bueno+5001&locality=Rio+de+Janeiro&region=RJ&country=Brasil&setLang=pt-BR%2cpt-br&count=1"",""EntityType"":""PostalAddress"",""Address"":{""Street"":""Avª Embaixador Abelardo Bueno 5001"",""City"":""Rio de Janeiro"",""State"":""RJ"",""CountryOrRegion"":""Brasil"",""Type"":""Unknown"",""IsInferred"":""False""},""Coordinates"":{""Latitude"":null,""Longitude"":null}}","Avª Embaixador Abelardo Bueno 5001","Rio de Janeiro",,"Avª Embaixador Abelardo Bueno 5001","Barra / Recreio / São Conrado","Livia Freitas
","Gerente de Manutenção","Barra olímpica",,"RIOLUZ - Iluminação pública (lâmpada queimada, falta de iluminação, iluminação insuficiente, etc.)","Iluminação na rua lateral ao hotel (entre o hotel e a Vila Autodromo e entre a Vila e o Parque Olímpico) está muito deficitária, com postes apagados

Localização precisa/ponto de referência das demandas apontadas acima:Proximo à Vila Autodromo e a entrada de serviço do Hotel

SERVIÇOS DE ILUMINAÇÃO PÚBLICA FORAM EXECUTADOS  PELA SMARTLUZ. GILSON - CHEFE DE SEGURANÇA
","Av. Embaixador Abelardo Bueno, 5001","livia.freitas@marriott.com","29/08/2025","21991144313",,,,,"14/08/2025 17:35",,"Cristiana Souza","Theresa Jansen"`;

// Helper to parse a line considering quotes
const parseLine = (text: string): string[][] => {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; 
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; 
      currentRow.push(currentField);
      if (currentRow.length > 0) lines.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    lines.push(currentRow);
  }
  return lines;
};

// 1. Get Headers from CSV
export const getCsvHeaders = (csvText: string): string[] => {
  const lines = parseLine(csvText);
  return lines.length > 0 ? lines[0] : [];
};

// 2. Parse CSV with Mapping (System + Custom)
export const parseMappedCSV = (
    csvText: string, 
    systemMapping: Record<string, string>,
    customMapping?: Record<string, string> // { csvHeader: customFieldName }
): Demand[] => {
  const lines = parseLine(csvText);
  if (lines.length < 2) return [];

  const headers = lines[0];
  const dataRows = lines.slice(1);
  const demands: Demand[] = [];

  // Create a quick lookup for column indexes
  const colIndex: Record<string, number> = {};
  headers.forEach((h, i) => { colIndex[h] = i; });

  // Helper to get value based on mapped field
  const getVal = (row: string[], fieldKey: string): string => {
    const csvHeaderName = systemMapping[fieldKey];
    if (!csvHeaderName) return ''; // Field not mapped
    const index = colIndex[csvHeaderName];
    return index !== undefined && row[index] ? row[index].trim() : '';
  };

  dataRows.forEach((row, index) => {
    if (row.length < 2) return;

    // Extract basic fields via mapping
    const id = getVal(row, 'id') || `OP-IMP-${index}-${Date.now()}`;
    const hotelName = getVal(row, 'hotelName') || 'Hotel Desconhecido';
    const region = getVal(row, 'region') || 'Geral';
    const neighborhood = getVal(row, 'neighborhood') || 'Geral';
    const address = getVal(row, 'address');
    const contactEmail = getVal(row, 'contactEmail');
    const description = getVal(row, 'description') || 'Sem descrição';
    const assignedAgency = getVal(row, 'assignedAgency');
    
    // Dates
    const dateStr = getVal(row, 'dateOpened');
    let isoDate = new Date().toISOString().split('T')[0];
    if (dateStr && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    } else if (dateStr && !isNaN(Date.parse(dateStr))) {
        isoDate = new Date(dateStr).toISOString().split('T')[0];
    }

    // Status (Smart Parsing)
    let status = Status.OPEN;
    const mappedStatus = getVal(row, 'status').toUpperCase();
    if (mappedStatus.includes('PARCIAL')) status = Status.PARTIAL;
    else if (mappedStatus.includes('ATENDIDO') || mappedStatus.includes('RESOLVIDO')) status = Status.RESOLVED;
    else if (mappedStatus.includes('ANDAMENTO')) status = Status.IN_PROGRESS;
    else if (mappedStatus.includes('PENDENTE')) status = Status.DELAYED;
    else if (mappedStatus.includes('NÃO INICIADO')) status = Status.OPEN;

    // Category Logic: Now supports multiple
    let categories: string[] = [];
    
    // 1. Try to get from column
    const mappedCategoryRaw = getVal(row, 'category');
    if (mappedCategoryRaw) {
        // Remove brackets/quotes if format is like ["ITEM"]
        const cleanCat = mappedCategoryRaw.replace(/[\[\]"]/g, '');
        // Split by comma
        categories = cleanCat.split(',').map(c => c.trim()).filter(c => c);
    }

    // 2. Fallback Intelligence if empty
    if (categories.length === 0) {
        const combinedText = (assignedAgency + " " + description).toUpperCase();

        if (combinedText.includes('SEGURANÇA') || combinedText.includes('ROUBO') || combinedText.includes('FURTO') || combinedText.includes('POLÍCIA')) {
            categories.push(Category.SECURITY);
        } else if (combinedText.includes('SOCIAL') || combinedText.includes('MORADOR') || combinedText.includes('RUA')) {
            categories.push(Category.HOMELESSNESS);
        } else if (combinedText.includes('COMLURB') || combinedText.includes('LIXO') || combinedText.includes('LIMPEZA')) {
            categories.push(Category.CLEANING);
        } else if (combinedText.includes('CETRIO') || combinedText.includes('TRÂNSITO') || combinedText.includes('SMTR')) {
            categories.push(Category.TRANSPORT);
        } else if (combinedText.includes('SEOP') || combinedText.includes('ORDEM')) {
            categories.push(Category.ORDER);
        } else {
            categories.push(Category.INFRASTRUCTURE);
        }
    }

    // Coordinates
    let lat: number | undefined;
    let lng: number | undefined;
    const coordsRaw = getVal(row, 'coords'); 
    if (coordsRaw && coordsRaw.includes('Point')) {
        const match = coordsRaw.match(/Point \(([-\d.]+) ([-\d.]+)\)/);
        if (match) {
            lng = parseFloat(match[1]);
            lat = parseFloat(match[2]);
        }
    }

    // Process Custom Fields
    const customFields: Record<string, string> = {};
    if (customMapping) {
        Object.entries(customMapping).forEach(([csvHeader, targetKey]) => {
            const index = colIndex[csvHeader];
            if (index !== undefined && row[index]) {
                customFields[targetKey] = row[index].trim();
            }
        });
    }

    demands.push({
        id,
        hotelName,
        region,
        neighborhood,
        address,
        contactEmail,
        category: categories, // Array
        description,
        status,
        dateOpened: isoDate,
        dateResolved: status === Status.RESOLVED ? isoDate : undefined,
        assignedAgency: assignedAgency || 'Outros',
        lat,
        lng,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined
    });
  });

  return demands;
};

// Legacy function kept for initial seed if needed
export const parseCSV = (csvText: string): Demand[] => {
  const standardMap = {
    id: "OP",
    dateOpened: "Data da Solicitação",
    hotelName: "Nome do Hotel", 
    status: "Status",
    region: "Região do hotel",
    neighborhood: "Bairro do hotel",
    address: "Endereço do Hotel",
    contactEmail: "E-mail do responsável",
    category: "Categorias de demanda de ordem pública",
    description: "demandas:", 
    assignedAgency: "Categorias de demanda de ordem pública", 
    coords: "Localização (GEO): Coordenadas"
  };

  const customMap = {
    "Observações adicionais": "Observações Adicionais"
  };

  return parseMappedCSV(csvText, standardMap, customMap);
};

export const getStaticDemands = (): Demand[] => {
  return parseCSV(CSV_CONTENT);
};

export const getLegalSeedDemands = (): Demand[] => {
  const systemMap = {
    id: 'NÂº da SolicitaÃ§Ã£o',
    dateOpened: 'Adicionado Ã s',
    hotelName: 'Nome do hotel',
    category: 'Selecione o assunto desejado',
    description: 'Breve descriÃ§Ã£o da solicitaÃ§Ã£o',
    contactEmail: 'Email',
    assignedAgency: 'ResponsÃ¡vel pela tarefa',
  };

  const customMap = {
    'Responsavel pelo Preenchimento': 'Responsavel pelo Preenchimento',
    Cargo: 'Cargo',
    WhatsApp: 'WhatsApp',
    'Nome da referÃªncia': 'Nome da Referencia',
  };

  return parseMappedCSV(legalReportCsv, systemMap, customMap).map((demand) => ({
    ...demand,
    id: demand.id.startsWith('AJ-') ? demand.id : `AJ-${demand.id}`,
    region: 'Assessoria Juridica',
    neighborhood: 'Nao informado',
    address: demand.address || '',
    assignedAgency: demand.assignedAgency || 'Equipe Juridica HotéisRIO',
    status: demand.status || Status.OPEN,
  }));
};
