
import React, { useState, useEffect } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { Demand } from '../types';
import { demandService } from '../services/demandService';

interface EmailModalProps {
  demand: Demand | null;
  isOpen: boolean;
  onClose: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({ demand, isOpen, onClose }) => {
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Auto-generate content when demand changes
  useEffect(() => {
    if (demand) {
      setRecipient(demand.contactEmail || '');
      setSubject(`Atualização - Demanda ${demand.id} - ${demand.hotelName}`);
      
      const emailBody = `Prezados,

Informamos que o status da demanda registrada sob o ID ${demand.id}, referente à categoria "${demand.category}" no ${demand.hotelName}, foi atualizado.

Status Atual: ${demand.status.toUpperCase()}
Órgão Responsável: ${demand.assignedAgency}

Descrição da Solicitação:
"${demand.description}"

Continuamos acompanhando o caso junto aos órgãos competentes.

Atenciosamente,
Equipe HotéisRIO`;
      
      setBody(emailBody);
    }
  }, [demand]);

  const handleSend = async () => {
    if (!recipient) {
      alert("Por favor, informe o e-mail do destinatário.");
      return;
    }

    try {
      // Use the automatic notification system
      await demandService.sendStatusUpdateNotification(
        {
          ...demand,
          contactEmail: recipient // Use the recipient from the input field
        },
        subject,
        body
      );
      
      alert("E-mail enviado com sucesso via sistema automático!");
      onClose();
    } catch (error) {
      console.error("Error sending automatic email:", error);
      alert("Erro ao enviar e-mail. Tente novamente.");
    }
  };

  if (!isOpen || !demand) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" /> Enviar Status
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Destinatário</label>
             <input 
               type="email" 
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
               placeholder="exemplo@hotel.com.br"
               value={recipient}
               onChange={(e) => setRecipient(e.target.value)}
               autoFocus
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
             <input 
               type="text" 
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
               value={subject}
               onChange={(e) => setSubject(e.target.value)}
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem (Pré-visualização)</label>
             <textarea 
               className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono h-48 resize-none"
               value={body}
               onChange={(e) => setBody(e.target.value)}
             ></textarea>
           </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-600 font-medium text-sm hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
             onClick={handleSend}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" /> Enviar E-mail
          </button>
        </div>

      </div>
    </div>
  );
};

export default EmailModal;
