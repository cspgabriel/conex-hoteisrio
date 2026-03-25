import React, { useEffect, useState, useRef } from 'react';
import { Building2, Mail, Send, CheckCircle2, ArrowLeft, User, Briefcase, Phone, FileText, MapPin, Camera, X } from 'lucide-react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { REGIONS } from '../services/locations';
import CATEGORIES from '../services/categories';

interface PublicDemandOrderFormProps {
  isModal?: boolean;
  onModalClose?: () => void;
}

interface Attachment {
  file: File;
  preview: string;
}

const initialFormData = {
  hotelName: '',
  responsibleName: '',
  responsibleRole: '',
  contactEmail: '',
  responsiblePhone: '+55 ',
  neighborhood: '',
  address: '',
  region: '',
  selectedCategories: [] as string[],
  description: '',
  referenceLocation: '',
};

const PublicDemandOrderForm: React.FC<PublicDemandOrderFormProps> = ({ isModal = false, onModalClose }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isModal) {
      document.title = 'CONEX HotéisRIO - Demandas Estratégicas';
    }
  }, [isModal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter((c) => c !== category)
        : [...prev.selectedCategories, category],
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(file.type)) {
        alert('Apenas imagens (JPG, PNG, GIF) e PDFs são permitidos.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo não pode exceder 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = event.target?.result as string;
        setAttachments((prev) => [...prev, { file, preview }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.hotelName ||
      !formData.responsibleName ||
      !formData.responsibleRole ||
      !formData.contactEmail ||
      !formData.responsiblePhone ||
      !formData.neighborhood ||
      !formData.address ||
      !formData.region ||
      formData.selectedCategories.length === 0 ||
      !formData.description ||
      !formData.referenceLocation
    ) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `CX-${Date.now().toString().slice(-8)}`;
      const today = new Date().toISOString().split('T')[0];

      // Upload attachments to Firebase Storage would go here
      // For now, we'll store them as base64 data
      const attachmentData = attachments.map((att, index) => ({
        name: att.file.name,
        url: att.preview, // In production, upload to Firebase Storage and get real URL
        uploadedAt: today,
      }));

      const newDemand: Demand = {
        id: newId,
        hotelName: formData.hotelName,
        neighborhood: formData.neighborhood,
        region: formData.region,
        address: formData.address,
        contactEmail: formData.contactEmail,
        category: formData.selectedCategories,
        description: formData.description,
        status: Status.OPEN,
        dateOpened: today,
        assignedAgency: 'CONEX HotéisRIO',
        attachments: attachmentData,
        customFields: {
          'Responsavel pelo Preenchimento': formData.responsibleName,
          Cargo: formData.responsibleRole,
          WhatsApp: formData.responsiblePhone,
          'Localização Precisa': formData.referenceLocation,
          'Total de Anexos': attachments.length.toString(),
        },
      };

      await demandService.add(newDemand);
      await demandService.sendAutomaticNotification(newDemand);

      setProtocol(newId);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting demand:', error);
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Demanda enviada com sucesso!</h2>
          <p className="text-slate-600 mb-6">
            Sua solicitação de conexão estratégica foi registrada com sucesso. Nossa equipe institucional entrará em contato em breve.
          </p>
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
                setAttachments([]);
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
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 uppercase tracking-tight">
              Solicitação Estratégica CONEX
            </h1>
            <p className="text-slate-600 mb-2">HotéisRIO Institucional</p>
            <p className="text-sm text-slate-500">
              Utilize este formulário para demandas complexas de conexão, grupos, eventos ou visitas técnicas.
            </p>
          </div>
        )}

        <div className={`${isModal ? '' : 'bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Seção 1: Identificação */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2 flex items-center gap-2">
                <User className="w-5 h-5" /> 1. Identificação do Responsável
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    name="responsibleName"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Seu nome completo"
                    value={formData.responsibleName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    name="responsibleRole"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: Gerente, Recepcionista"
                    value={formData.responsibleRole}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" /> E-mail *
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="seu.email@hotel.com.br"
                    value={formData.contactEmail}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-500" /> Celular *
                  </label>
                  <input
                    type="tel"
                    name="responsiblePhone"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="+55 21 99999-9999"
                    value={formData.responsiblePhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Seção 2: Hotel */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> 2. Informações do Hotel
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Nome do Hotel *
                  </label>
                  <input
                    type="text"
                    name="hotelName"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Nome do hotel"
                    value={formData.hotelName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Ex: Copacabana, Botafogo"
                    value={formData.neighborhood}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" /> Região *
                  </label>
                  <select
                    name="region"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.region}
                    onChange={handleChange}
                  >
                    <option value="">Selecione a região...</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Endereço do Hotel *
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Rua, número e complemento"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Seção 3: Categorias */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2">
                3. Categorias de Demanda *
              </h2>
              <p className="text-sm text-slate-600">Selecione uma ou mais categorias que se aplicam à sua demanda:</p>
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((category) => (
                  <label
                    key={category}
                    className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Seção 4: Descrição e Localização */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2">
                4. Detalhamento da Demanda
              </h2>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Detalhamento das demandas selecionadas acima *
                </label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Descreva detalhadamente o problema, incluindo frequência e impacto no hotel..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" /> Localização precisa / Ponto de referência *
                </label>
                <textarea
                  name="referenceLocation"
                  required
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  placeholder="Descreva exatamente onde o problema ocorre (ex: frente do hotel, lado direito, etc.)"
                  value={formData.referenceLocation}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Seção 5: Anexos */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-blue-600 border-b border-blue-100 pb-2 flex items-center gap-2">
                <Camera className="w-5 h-5" /> 5. Anexos (Documentos/Briefings)
              </h2>
              <p className="text-sm text-slate-600">
                Anexe documentos ou briefings que auxiliem na compreensão da demanda (PDF, JPG, PNG). Máximo 5MB por arquivo.
              </p>
              
              <div className="flex items-center justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-6 py-8 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-blue-500" />
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">Clique para adicionar fotos ou documentos</p>
                    <p className="text-xs text-slate-500 mt-1">ou arraste arquivos aqui</p>
                  </div>
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    {attachments.length} arquivo(s) selecionado(s):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {attachments.map((att, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                      >
                        {att.file.type.startsWith('image/') ? (
                          <img
                            src={att.preview}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-slate-100">
                            <FileText className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-slate-600 p-2 truncate">{att.file.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50 text-lg"
              >
                {isSubmitting ? 'Enviando...' : (
                  <>
                    Enviar Demanda <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {!isModal && (
          <div className="mt-8 text-center">
            <Link to="/consultar" className="text-blue-600 font-semibold hover:underline flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Já possui uma demanda? Consulte aqui
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDemandOrderForm;
