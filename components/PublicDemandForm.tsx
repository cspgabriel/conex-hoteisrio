import React, { useEffect, useState } from 'react';
import { Building2, Mail, Send, CheckCircle2, ArrowLeft, User, Briefcase, Phone, FileText, Check } from 'lucide-react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import CATEGORIES from '../services/categories';

interface PublicDemandFormProps {
  isModal?: boolean;
  onModalClose?: () => void;
}

const initialFormData = {
  hotelName: '',
  responsibleName: '',
  responsibleRole: '',
  contactEmail: '',
  responsiblePhone: '+55 ',
  subject: '',
  description: '',
};

const PublicDemandForm: React.FC<PublicDemandFormProps> = ({ isModal = false, onModalClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');

  useEffect(() => {
    if (!isModal) {
      document.title = 'CONEX HotéisRIO - Nova Solicitação';
    }
  }, [isModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (category: string) => {
    setFormData((prev) => ({ ...prev, subject: category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hotelName || !formData.responsibleName || !formData.responsibleRole || !formData.contactEmail || !formData.responsiblePhone || !formData.subject || !formData.description) {
      alert('Por favor, preencha todos os campos obrigatórios e selecione uma categoria.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `CX-${Date.now().toString().slice(-8)}`;
      const today = new Date().toISOString().split('T')[0];

      const newDemand: Demand = {
        id: newId,
        hotelName: formData.hotelName,
        neighborhood: 'Não informado',
        region: 'CONEX',
        address: '',
        contactEmail: formData.contactEmail,
        contactPhone: formData.responsiblePhone,
        category: [formData.subject],
        description: formData.description,
        status: Status.OPEN,
        dateOpened: today,
        assignedAgency: 'CONEX HotéisRIO',
        customFields: {
          'Responsável pelo Preenchimento': formData.responsibleName,
          Cargo: formData.responsibleRole,
          Assunto: formData.subject,
        },
      };

      await demandService.add(newDemand);
      await demandService.sendAutomaticNotification(newDemand);

      setProtocol(newId);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting connection request:', error);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`${isModal ? 'p-6' : 'min-h-screen bg-slate-50 py-12 px-4'} flex flex-col items-center justify-center`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center ${isModal ? 'shadow-none border-none' : ''}`}
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação enviada!</h2>
          <p className="text-slate-600 mb-6">Seu pedido de conexão estratégica foi registrado com sucesso. Nossa equipe entrará em contato em breve.</p>
          <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Protocolo</p>
            <p className="text-3xl font-mono font-bold text-blue-600">{protocol}</p>
          </div>
          <div className="space-y-3">
            {isModal ? (
              <button
                onClick={onModalClose}
                className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Fechar
              </button>
            ) : (
              <Link
                to="/consultar"
                className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Ir para Consulta
              </Link>
            )}
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData(initialFormData);
              }}
              className="block w-full text-slate-500 py-2 text-sm font-medium hover:text-slate-800"
            >
              Enviar outra solicitação
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${isModal ? 'p-6' : 'min-h-screen bg-slate-50 py-12 px-4'}`}>
      <div className="max-w-4xl mx-auto">
        {!isModal && (
          <div className="text-center mb-10">
            <img
              src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png"
              alt="HotéisRIO"
              className="h-20 mx-auto mb-6"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
              Solicitação de Conexão (CONEX)
            </h1>
            <p className="text-slate-600 font-medium">Ponte direta entre hotéis associados e mercado B2B.</p>
          </div>
        )}

        <div className={`${isModal ? '' : 'bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Seção 1: Categoria - Agora com CARDS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> 1. Qual o foco da sua solicitação?
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Obrigatório</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all group overflow-hidden ${
                      formData.subject === category 
                        ? 'border-blue-600 bg-blue-50 shadow-md ring-4 ring-blue-50' 
                        : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-sm font-bold leading-tight ${formData.subject === category ? 'text-blue-700' : 'text-slate-700'}`}>
                        {category}
                      </span>
                      {formData.subject === category && (
                        <div className="bg-blue-600 rounded-full p-1 text-white animate-in fade-in zoom-in duration-300">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className={`h-1 w-0 group-hover:w-full bg-blue-200 transition-all duration-300 absolute bottom-0 left-0 ${formData.subject === category ? 'w-full bg-blue-600' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Seção 2: Identificação */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-5 h-5" /> 2. Identificação do Solicitante
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nome do Hotel ou Empresa *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="hotelName" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="Ex: Hotel Atlântico / Consulado X" value={formData.hotelName} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Responsável pelo preenchimento *
                  </label>
                  <input type="text" name="responsibleName" required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="Seu nome completo" value={formData.responsibleName} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cargo *
                  </label>
                  <input type="text" name="responsibleRole" required className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="Ex: Gerente Geral / Consul" value={formData.responsibleRole} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    E-mail de Contato *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="email" name="contactEmail" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="email@exemplo.com.br" value={formData.contactEmail} onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    WhatsApp para Retorno *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="tel" name="responsiblePhone" required className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400" placeholder="+55 21 99999-9999" value={formData.responsiblePhone} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção 3: Detalhes */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-5 h-5" /> 3. Detalhamento da Demanda
              </h2>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Descrição da sua necessidade *
                </label>
                <textarea name="description" required rows={6} className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder:text-slate-400" placeholder="Descreva brevemente sua demanda estratégica. Para grupos, informe número de pessoas e datas previstas." value={formData.description} onChange={handleChange} />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#0a2e50] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#0077c2] transition-all shadow-xl disabled:opacity-50 text-lg uppercase tracking-tight">
                {isSubmitting ? 'Processando...' : (
                  <>
                    Confirmar Envio Institucional <Send className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Ao enviar, sua demanda será encaminhada oficialmente pela equipe do HotéisRIO.
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center pb-12">
          {!isModal && (
            <Link to="/consultar" className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Já possui uma solicitação? Consulte o status aqui
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicDemandForm;
