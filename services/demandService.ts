import { Demand, Status } from '../types';
import { normalizeRegion } from './locations';
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'CONEX_SOLICITACOES';
// Firestore batches support up to 500 operations; we keep headroom for future metadata writes in the same commit.
const FIRESTORE_BATCH_LIMIT = 450;

const sanitizeValue = (value: unknown): unknown => {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    );
  }
  return value;
};

const normalizeDemand = (demand: any): Demand => ({
  ...demand,
  category: Array.isArray(demand.category) ? demand.category : [demand.category].filter(Boolean),
  region: normalizeRegion(demand.region || ''),
});

const toFirestore = (demand: Demand): Demand => sanitizeValue({
  ...demand,
  category: Array.isArray(demand.category) ? demand.category : [demand.category].filter(Boolean),
  customFields: demand.customFields || {},
  attachments: demand.attachments || [],
}) as Demand;

const fromFirestore = (id: string, data: any): Demand => normalizeDemand({
  ...data,
  id,
  status: (data.status as Status) || Status.OPEN,
});

const getCollectionRef = () => collection(db, COLLECTION_NAME);

const commitInChunks = async <T>(items: T[], handler: (batch: ReturnType<typeof writeBatch>, item: T) => void) => {
  for (let index = 0; index < items.length; index += FIRESTORE_BATCH_LIMIT) {
    const chunk = items.slice(index, index + FIRESTORE_BATCH_LIMIT);
    const batch = writeBatch(db);
    chunk.forEach((item) => handler(batch, item));
    await batch.commit();
  }
};

export const demandService = {
  async getAll(): Promise<Demand[]> {
    try {
      const snapshot = await getDocs(query(getCollectionRef(), orderBy('dateOpened', 'desc')));
      return snapshot.docs.map((item) => fromFirestore(item.id, item.data()));
    } catch (error) {
      console.error('Error fetching demands from Firebase:', error);
      return [];
    }
  },

  async replaceAll(demands: Demand[]): Promise<void> {
    await commitInChunks(demands, (batch, demand) => {
      batch.set(doc(db, COLLECTION_NAME, demand.id), toFirestore(demand));
    });
  },

  async syncSeedDemands(seedVersion: string, demands: Demand[]): Promise<void> {
    console.log('Seed sync skipped for Firebase.');
  },

  async update(demand: Demand): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, demand.id), toFirestore(demand), { merge: true });
    } catch (error) {
      console.error('Error updating demand in Firebase:', error);
    }
  },

  async add(demand: Demand): Promise<Demand> {
    const nextDemand = { ...demand };
    if (!nextDemand.id) {
       nextDemand.id = `CX-${Date.now()}`;
    }
    
    console.log('[SISTEMA] Iniciando salvamento no Firebase:', nextDemand.id);
    
    try {
      const dbData = toFirestore(nextDemand);
      console.log('[SISTEMA] Dados normalizados para DB:', dbData.id);

      await Promise.race([
        setDoc(doc(db, COLLECTION_NAME, nextDemand.id), dbData),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 15000)),
      ]);
      
      console.log('[SISTEMA] Salvamento concluído com sucesso!');
      return nextDemand;
    } catch (err) {
      if (err instanceof Error && err.message === 'TIMEOUT_EXCEEDED') {
        throw new Error('O sistema está demorando para responder. Por favor, aguarde e tente novamente.');
      }
      console.error('[SISTEMA-CRÍTICO] Exceção ao salvar no Firebase:', err);
      throw err;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting demand from Firebase:', error);
    }
  },

  async batchDelete(ids: string[]): Promise<void> {
    await commitInChunks(ids, (batch, id) => {
      batch.delete(doc(db, COLLECTION_NAME, id));
    });
  },

  async batchAdd(demands: Demand[]): Promise<void> {
    await commitInChunks(demands, (batch, demand) => {
      batch.set(doc(db, COLLECTION_NAME, demand.id), toFirestore(demand), { merge: true });
    });
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
