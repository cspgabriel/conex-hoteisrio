import { Demand, Status } from '../types';
import { normalizeRegion } from './locations';
import { supabase } from './supabase';
import { brevoService } from './brevoService';

const TABLE_NAME = 'demands';

const sanitizeData = (data: Demand): Demand => {
  const cleanData = { ...data } as any;
  Object.keys(cleanData).forEach((key) => {
    if (cleanData[key] === undefined) {
      cleanData[key] = null;
    }
  });
  return cleanData as Demand;
};

const normalizeDemand = (demand: any): Demand => ({
  ...demand,
  category: Array.isArray(demand.category) ? demand.category : [demand.category].filter(Boolean),
  region: normalizeRegion(demand.region || ''),
});

// Mapping frontend Demand fields (camelCase) to DB snake_case if needed
// But for now, we'll use camelCase in DB if possible, or mapping
// Actually, let's map it for robust DB practice
const toDB = (d: Demand) => ({
  id: d.id,
  hotel_name: d.hotelName,
  region: d.region,
  neighborhood: d.neighborhood,
  address: d.address,
  contact_email: d.contactEmail,
  contact_phone: d.contactPhone,
  category: d.category,
  description: d.description,
  status: d.status,
  date_opened: d.dateOpened,
  date_resolved: d.dateResolved,
  assigned_agency: d.assignedAgency,
  lat: d.lat,
  lng: d.lng,
  attachments: d.attachments || [],
  custom_fields: d.customFields || {}
});

const fromDB = (d: any): Demand => {
  const cf = d.custom_fields || {};
  return {
    id: d.id,
    hotelName: d.hotel_name,
    region: d.region,
    neighborhood: d.neighborhood,
    address: d.address,
    contactEmail: d.contact_email,
    contactPhone: d.contact_phone,
    category: d.category || [],
    description: d.description,
    status: d.status as Status,
    dateOpened: d.date_opened,
    dateResolved: d.date_resolved,
    assignedAgency: d.assigned_agency,
    lat: d.lat,
    lng: d.lng,
    attachments: d.attachments || [],
    
    // Reconstitute typed fields from custom_fields
    fullName: cf.fullName,
    company: cf.company,
    institutionType: cf.institutionType,
    demandType: cf.demandType,
    checkIn: cf.checkIn,
    checkOut: cf.checkOut,
    numNights: cf.numNights,
    numUHs: cf.numUHs,
    roomConfig: cf.roomConfig,
    nationality: cf.nationality,
    groupProfile: cf.groupProfile,
    hotelCategory: cf.hotelCategory,
    preferredLocation: cf.preferredLocation,
    needsEventRoom: cf.needsEventRoom,
    eventDates: cf.eventDates,
    eventTime: cf.eventTime,
    numParticipants: cf.numParticipants,
    roomSetup: cf.roomSetup,
    basicEquipment: cf.basicEquipment,
    abServices: cf.abServices,
    foodRestrictions: cf.foodRestrictions,
    paymentPolicy: cf.paymentPolicy,
    
    customFields: cf
  };
};

export const demandService = {
  async getAll(): Promise<Demand[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date_opened', { ascending: false });
    
    if (error) {
      console.error('Error fetching demands:', error);
      // Fallback to localStorage could be here, but let's stick to Supabase
      return [];
    }
    
    return (data || []).map(fromDB).map(normalizeDemand);
  },

  async replaceAll(demands: Demand[]): Promise<void> {
    const dbDemands = demands.map(toDB);
    // Be careful with large batches, but for simple sync it's fine
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(dbDemands);
    
    if (error) console.error('Error in replaceAll:', error);
  },

  async syncSeedDemands(seedVersion: string, demands: Demand[]): Promise<void> {
    // For now we skip seed in Supabase to avoid overwriting production data
    console.log('Seed sync skipped for Supabase.');
  },

  async update(demand: Demand): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update(toDB(demand))
      .eq('id', demand.id);
    
    if (error) console.error('Error updating demand:', error);
  },

  async add(demand: Demand): Promise<Demand> {
    const nextDemand = { ...demand };
    if (!nextDemand.id) {
       nextDemand.id = `CX-${Date.now()}`;
    }
    
    console.log('[SISTEMA] Iniciando salvamento no Supabase:', nextDemand.id);
    
    try {
      const dbData = toDB(nextDemand);
      console.log('[SISTEMA] Dados normalizados para DB:', dbData.id);

      // Race against a 15s timeout to avoid hanging UI
      const result = await Promise.race([
        supabase.from(TABLE_NAME).upsert([dbData]).select(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 15000))
      ]) as any;
      
      const { data, error } = result;
      
      if (error) {
         console.error('[SISTEMA-ERRO] Falha no upsert Supabase:', error);
         throw error;
      }
      
      console.log('[SISTEMA] Salvamento concluído com sucesso!');
      const savedDemand = data && data[0] ? fromDB(data[0]) : nextDemand;
      brevoService.sendDemandNotification(savedDemand).catch(() => {});
      return savedDemand;
    } catch (err) {
      if (err.message === 'TIMEOUT_EXCEEDED') {
        throw new Error('O sistema está demorando muito para responder. Por favor, tente novamente ou verifique sua conexão.');
      }
      console.error('[SISTEMA-CRÍTICO] Exceção ao salvar no Supabase:', err);
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);
    if (error) console.error('Error deleting demand:', error);
  },

  async batchDelete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in('id', ids);
    if (error) console.error('Error batch deleting:', error);
  },

  async batchAdd(demands: Demand[]): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(demands.map(toDB));
    if (error) console.error('Error batch adding:', error);
  },

  async sendAutomaticNotification(demand: Demand): Promise<void> {
    const message = `🚀 *Novo Lead CONEX HotéisRIO* 🚀
    
📌 *Protocolo:* ${demand.id}
🏨 *Hotel/Empresa:* ${demand.hotelName}
👤 *Solicitante:* ${demand.fullName || demand.customFields?.['Nome Completo'] || 'Não informado'}
🏷️ *Categoria:* ${demand.category.join(', ')}
📧 *E-mail:* ${demand.contactEmail}
📱 *WhatsApp:* ${demand.contactPhone || 'Não informado'}

📝 *Descrição:*
${demand.description}

---
_Acesse o painel para gerenciar:_ https://conex-hoteisrio.vercel.app/gestao`;

    // FIRE AND FORGET - Do not let this block the UI
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        fetch('http://localhost:3005/notify-conex', {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                groupName: 'Escritório HotéisRio',
                adminPhone: '5521970222013'
            }),
            signal: controller.signal
        })
        .then(() => clearTimeout(timeoutId))
        .catch(() => {/* silent skip */});
    } catch (err) {
        // Silente failure for notifications
    }
  },

  async sendStatusUpdateNotification(demand: Demand, customSubject?: string, customBody?: string): Promise<void> {
    // Similarly, we could send updates via WhatsApp here
    console.log('Sending status update notification (MOCK):', demand.id, customSubject || 'Status Updated');
  },
};
