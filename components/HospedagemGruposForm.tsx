import React, { useEffect, useState } from 'react';
import {
  Building2,
  Mail,
  Send,
  CheckCircle2,
  ArrowLeft,
  User,
  Phone,
  FileText,
  Calendar,
  Users,
  MapPin,
  Utensils,
  CreditCard,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckboxGroupProps {
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
  withOther?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selected,
  onChange,
  withOther = false,
  otherValue = '',
  onOtherChange,
}) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={selected.includes(opt)}
          onChange={() => onChange(opt)}
          className="w-4 h-4 accent-blue-600 rounded"
        />
        <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">{opt}</span>
      </label>
    ))}
    {withOther && (
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={selected.includes('Outro')}
          onChange={() => onChange('Outro')}
          className="w-4 h-4 accent-blue-600 rounded"
        />
        <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">Outro:</span>
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange?.(e.target.value)}
          disabled={!selected.includes('Outro')}
          placeholder="Especifique..."
          className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40"
        />
      </label>
    )}
  </div>
);

interface RadioGroupProps {
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  withOther?: boolean;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  withOther = false,
  otherValue = '',
  onOtherChange,
}) => (
  <div className="space-y-2">
    {options.map((opt) => (
      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
        <input
          type="radio"
          name={name}
          checked={value === opt}
          onChange={() => onChange(opt)}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">{opt}</span>
      </label>
    ))}
    {withOther && (
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="radio"
          name={name}
          checked={value === 'Outro'}
          onChange={() => onChange('Outro')}
          className="w-4 h-4 accent-blue-600"
        />
        <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">Outro:</span>
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange?.(e.target.value)}
          disabled={value !== 'Outro'}
          placeholder="Especifique..."
          className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40"
        />
      </label>
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  number: string;
  title: string;
  icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, icon }) => (
  <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-6">
    <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
      {number}
    </div>
    <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2">
      {icon} {title}
    </h2>
  </div>
);

// ─── Form State ───────────────────────────────────────────────────────────────

const DEMAND_TYPES = {
  GROUP: "Grupo (acima de 10 UH’s)",
  EVENT: 'Evento / Uso de salão (sem hospedagem)',
  GROUP_EVENT: 'Grupo + Evento',
  SITE_INSPECTION: 'Visita técnica (site inspection)',
} as const;

const initialFormData = {
  // Section 1 – Dados do Solicitante
  nomeCompleto: '',
  empresa: '',
  tipoInstituicao: '',
  tipoInstituicaoOutro: '',
  email: '',
  telefone: '',

  // Section 2 – Tipo de Demanda
  tipoDemanda: '',
  tipoDemandaOutro: '',

  // Section 3 – Informações da Hospedagem
  checkin: '',
  checkout: '',
  numeroNoites: '',
  quantidadeUHs: '',
  qtdSingle: '',
  qtdDuplo: '',
  qtdTwin: '',
  qtdTriplo: '',

  // Section 4 – Perfil, Localização e Categoria
  nacionalidade: '',
  perfilGrupo: '',
  categoriaHotel: '',
  localizacaoPreferencia: '',

  // Section 5 – Espaços e Infraestrutura
  precisaSala: '',
  datasSala: '',
  horarioUsoInicio: '',
  horarioUsoFim: '',
  numeroParticipantes: '',
  formatoSala: '',
  equipamentos: [] as string[],

  // Section 6 – A&B
  servicosAB: [] as string[],
  restricoesAlimentares: '',

  // Section 7 – Pagamento
  politicaPagamento: '',

  // Section 8 – Observações
  observacoes: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HospedagemGruposForm: React.FC = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState('');

  useEffect(() => {
    document.title = 'CONEX HotéisRIO – Hospedagem de Grupos / Espaços de Eventos';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxToggle = (field: 'equipamentos' | 'servicosAB', value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomeCompleto || !formData.email || !formData.telefone || !formData.tipoDemanda) {
      alert('Por favor, preencha os campos obrigatórios: Nome completo, E-mail, Telefone e Tipo de Demanda.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newId = `CX-${Date.now().toString().slice(-8)}`;
      const today = new Date().toISOString().split('T')[0];

      const demandType = formData.tipoDemanda === 'Outro' ? formData.tipoDemandaOutro || 'Outro' : formData.tipoDemanda;
      const institutionType =
        formData.tipoInstituicao === 'Outro'
          ? formData.tipoInstituicaoOutro || 'Outro'
          : formData.tipoInstituicao;

      const customFields: Record<string, string> = {
        'Nome Completo': formData.nomeCompleto,
        'Empresa / Instituição': formData.empresa,
        'Tipo de Instituição': institutionType,
        'Tipo de Demanda': demandType,
        'Check-in': formData.checkin,
        'Check-out': formData.checkout,
        'Número de Noites': formData.numeroNoites,
        'Quantidade de UHs': formData.quantidadeUHs,
        'Single': formData.qtdSingle,
        'Duplo': formData.qtdDuplo,
        'Twin': formData.qtdTwin,
        'Triplo': formData.qtdTriplo,
        'Nacionalidade': formData.nacionalidade,
        'Perfil do Grupo': formData.perfilGrupo,
        'Categoria de Hotel': formData.categoriaHotel,
        'Localização de Preferência': formData.localizacaoPreferencia,
        'Necessita Sala de Eventos': formData.precisaSala,
        'Data(s) do Evento': formData.datasSala,
        'Horário de Uso': formData.horarioUsoInicio && formData.horarioUsoFim
          ? `${formData.horarioUsoInicio} às ${formData.horarioUsoFim}`
          : '',
        'Número de Participantes': formData.numeroParticipantes,
        'Formato da Sala': formData.formatoSala,
        'Equipamentos': formData.equipamentos.join(', '),
        'Serviços A&B': formData.servicosAB.join(', '),
        'Restrições Alimentares': formData.restricoesAlimentares,
        'Política de Pagamento': formData.politicaPagamento,
      };

      // Determine region from location preference
      const locationToRegion: Record<string, string> = {
        'Zona Sul': 'Ipanema / Leblon',
        'Barra da Tijuca / Recreio': 'Barra / Recreio / São Conrado',
        'Centro': 'Centro / Santa Teresa / Lapa',
        'Indiferente': 'Outros',
      };
      const region = locationToRegion[formData.localizacaoPreferencia] || 'Outros';

      const newDemand: Demand = {
        id: newId,
        hotelName: formData.empresa || formData.nomeCompleto,
        neighborhood: 'Não informado',
        region,
        address: '',
        contactEmail: formData.email,
        contactPhone: formData.telefone,
        category: ['Hospedagem de Grupos (> 10 UHs)'],
        description: formData.observacoes || `Solicitação de ${demandType} por ${formData.nomeCompleto}`,
        status: Status.OPEN,
        dateOpened: today,
        assignedAgency: 'CONEX HotéisRIO',
        
        // Spec Fields
        fullName: formData.nomeCompleto,
        company: formData.empresa,
        institutionType: institutionType,
        demandType: demandType,
        checkIn: formData.checkin,
        checkOut: formData.checkout,
        numNights: formData.numeroNoites,
        numUHs: formData.quantidadeUHs,
        roomConfig: {
          single: formData.qtdSingle,
          double: formData.qtdDuplo,
          twin: formData.qtdTwin,
          triple: formData.qtdTriplo,
        },
        nationality: formData.nacionalidade,
        groupProfile: formData.perfilGrupo,
        hotelCategory: formData.categoriaHotel,
        preferredLocation: formData.localizacaoPreferencia,
        needsEventRoom: formData.precisaSala,
        eventDates: formData.datasSala,
        eventTime: formData.horarioUsoInicio && formData.horarioUsoFim
          ? `${formData.horarioUsoInicio} às ${formData.horarioUsoFim}`
          : '',
        numParticipants: formData.numeroParticipantes,
        roomSetup: formData.formatoSala,
        basicEquipment: formData.equipamentos,
        abServices: formData.servicosAB,
        foodRestrictions: formData.restricoesAlimentares,
        paymentPolicy: formData.politicaPagamento,
        
        // Maintain compatibility with customFields for detail page rendering
        customFields: {
          'Nome Completo': formData.nomeCompleto,
          'Empresa / Instituição': formData.empresa,
          'Tipo de Instituição': institutionType,
          'Tipo de Demanda': demandType,
          'Check-in': formData.checkin,
          'Check-out': formData.checkout,
          'Número de Noites': formData.numeroNoites,
          'Quantidade de UHs': formData.quantidadeUHs,
          'Single': formData.qtdSingle,
          'Duplo': formData.qtdDuplo,
          'Twin': formData.qtdTwin,
          'Triplo': formData.qtdTriplo,
          'Nacionalidade': formData.nacionalidade,
          'Perfil do Grupo': formData.perfilGrupo,
          'Categoria de Hotel': formData.categoriaHotel,
          'Localização de Preferência': formData.localizacaoPreferencia,
          'Necessita Sala de Eventos': formData.precisaSala,
          'Data(s) do Evento': formData.datasSala,
          'Horário de Uso': formData.horarioUsoInicio && formData.horarioUsoFim
            ? `${formData.horarioUsoInicio} às ${formData.horarioUsoFim}`
            : '',
          'Número de Participantes': formData.numeroParticipantes,
          'Formato da Sala': formData.formatoSala,
          'Equipamentos': formData.equipamentos.join(', '),
          'Serviços A&B': formData.servicosAB.join(', '),
          'Restrições Alimentares': formData.restricoesAlimentares,
          'Política de Pagamento': formData.politicaPagamento,
        },
      };

      await demandService.add(newDemand);
      
      // Fire and forget notification
      demandService.sendAutomaticNotification(newDemand).catch(() => {});

      setProtocol(newId);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Success Screen ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Solicitação enviada!</h2>
          <p className="text-slate-600 mb-6">
            Sua solicitação foi registrada com sucesso. Nossa equipe processará a demanda e os hotéis associados
            entrarão em contato em <strong>5 a 10 dias úteis</strong>.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl mb-8 border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Protocolo</p>
            <p className="text-3xl font-mono font-bold text-blue-600">{protocol}</p>
          </div>
          <div className="space-y-3">
            <Link
              to="/consultar"
              className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
            >
              Consultar Status
            </Link>
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

  // ─── Form ────────────────────────────────────────────────────────────────────

  const inputClass =
    'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 text-sm';
  const labelClass = 'block text-sm font-bold text-slate-700 mb-2';

  const needsRoom =
    formData.tipoDemanda === DEMAND_TYPES.GROUP ||
    formData.tipoDemanda === DEMAND_TYPES.GROUP_EVENT;
  const needsEvent =
    formData.tipoDemanda === DEMAND_TYPES.EVENT ||
    formData.tipoDemanda === DEMAND_TYPES.GROUP_EVENT;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <img
            src="https://sindhoteisrj.com.br/wp-content/uploads/2020/04/logo-hoteisrio-azul-fundo-transparente-178x171-1.png"
            alt="HotéisRIO"
            className="h-20 mx-auto mb-6"
          />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 uppercase tracking-tight">
            Solicitação de Hospedagem (Grupos) e/ou Espaços de Eventos
          </h1>
          <p className="text-slate-600 font-medium max-w-2xl mx-auto">
            Canal oficial que conecta sua demanda diretamente aos hotéis associados do Rio de Janeiro, sem
            intermediação financeira ou cobrança de comissões.
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-12">

            {/* ─── 1. Dados do Solicitante ─────────────────────────────────── */}
            <section>
              <SectionHeader number="1" title="Dados do Solicitante" icon={<User className="w-5 h-5" />} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>Nome completo *</label>
                  <input
                    type="text"
                    name="nomeCompleto"
                    required
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Empresa / Instituição</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      placeholder="Nome da empresa ou instituição"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Tipo de instituição</label>
                  <div className="space-y-2 mt-1">
                    {[
                      'Organizador de Eventos',
                      'Agência de Viagens',
                      'Operador de Turismo',
                      'Centro de Convenções',
                      'Consulado / Órgão Governamental',
                      'Empresa / Instituição Corporativa',
                    ].map((opt) => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="tipoInstituicao"
                          value={opt}
                          checked={formData.tipoInstituicao === opt}
                          onChange={() => setFormData((prev) => ({ ...prev, tipoInstituicao: opt }))}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">{opt}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="tipoInstituicao"
                        value="Outro"
                        checked={formData.tipoInstituicao === 'Outro'}
                        onChange={() => setFormData((prev) => ({ ...prev, tipoInstituicao: 'Outro' }))}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-slate-700 group-hover:text-blue-700 transition-colors">Outro:</span>
                      <input
                        type="text"
                        name="tipoInstituicaoOutro"
                        value={formData.tipoInstituicaoOutro}
                        onChange={handleChange}
                        disabled={formData.tipoInstituicao !== 'Outro'}
                        placeholder="Especifique..."
                        className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-40"
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>E-mail *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@exemplo.com.br"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Telefone / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="telefone"
                      required
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="+55 21 99999-9999"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ─── 2. Tipo de Demanda ──────────────────────────────────────── */}
            <section>
              <SectionHeader number="2" title="Tipo de Demanda" icon={<FileText className="w-5 h-5" />} />
              <RadioGroup
                name="tipoDemanda"
                options={[
                  DEMAND_TYPES.GROUP,
                  DEMAND_TYPES.EVENT,
                  DEMAND_TYPES.GROUP_EVENT,
                  DEMAND_TYPES.SITE_INSPECTION,
                ]}
                value={formData.tipoDemanda}
                onChange={(v) => setFormData((prev) => ({ ...prev, tipoDemanda: v }))}
                withOther
                otherValue={formData.tipoDemandaOutro}
                onOtherChange={(v) => setFormData((prev) => ({ ...prev, tipoDemandaOutro: v }))}
              />
            </section>

            {/* ─── 3. Informações da Hospedagem ───────────────────────────── */}
            {needsRoom && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionHeader
                  number="3"
                  title="Informações da Hospedagem (para grupos)"
                  icon={<Calendar className="w-5 h-5" />}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Data de check-in</label>
                    <input
                      type="date"
                      name="checkin"
                      value={formData.checkin}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Data de check-out</label>
                    <input
                      type="date"
                      name="checkout"
                      value={formData.checkout}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nº de noites</label>
                    <input
                      type="number"
                      name="numeroNoites"
                      min="1"
                      value={formData.numeroNoites}
                      onChange={handleChange}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Quantidade de apartamentos (UH’s)</label>
                    <input
                      type="number"
                      name="quantidadeUHs"
                      min="1"
                      value={formData.quantidadeUHs}
                      onChange={handleChange}
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className={labelClass}>Configuração desejada</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                    {[
                      { label: 'Single (1 pessoa)', name: 'qtdSingle' },
                      { label: 'Duplo (Casal)', name: 'qtdDuplo' },
                      { label: 'Twin (2 camas solteiro)', name: 'qtdTwin' },
                      { label: 'Triplo', name: 'qtdTriplo' },
                    ].map(({ label, name }) => (
                      <div key={name}>
                        <label className="block text-xs font-bold text-slate-600 mb-1">{label}</label>
                        <input
                          type="number"
                          name={name}
                          min="0"
                          value={formData[name as keyof typeof formData] as string}
                          onChange={handleChange}
                          placeholder="Qtd."
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            )}

            {/* ─── 4. Perfil, Localização e Categoria ─────────────────────── */}
            <section>
              <SectionHeader
                number="4"
                title="Perfil, Localização e Categoria"
                icon={<MapPin className="w-5 h-5" />}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className={labelClass}>Nacionalidade predominante</label>
                  <input
                    type="text"
                    name="nacionalidade"
                    value={formData.nacionalidade}
                    onChange={handleChange}
                    placeholder="Ex: Brasileira, Norte-americana..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Perfil do Grupo</label>
                  <RadioGroup
                    name="perfilGrupo"
                    options={['Corporativo', 'Lazer', 'Evento', 'Tripulação']}
                    value={formData.perfilGrupo}
                    onChange={(v) => setFormData((prev) => ({ ...prev, perfilGrupo: v }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Categoria de hotel pretendida</label>
                  <RadioGroup
                    name="categoriaHotel"
                    options={[
                      '5 estrelas / Luxo',
                      '4 estrelas / Superior',
                      '3 estrelas / Turístico',
                      'Econômico / Budget',
                      'Indiferente / De acordo com a melhor tarifa',
                    ]}
                    value={formData.categoriaHotel}
                    onChange={(v) => setFormData((prev) => ({ ...prev, categoriaHotel: v }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Localização de preferência</label>
                  <RadioGroup
                    name="localizacaoPreferencia"
                    options={['Zona Sul', 'Barra da Tijuca / Recreio', 'Centro', 'Indiferente']}
                    value={formData.localizacaoPreferencia}
                    onChange={(v) => setFormData((prev) => ({ ...prev, localizacaoPreferencia: v }))}
                  />
                </div>
              </div>
            </section>

            {/* ─── 5. Espaços e Infraestrutura ────────────────────────────── */}
            {needsEvent && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionHeader
                  number="5"
                  title="Necessidade de Espaços e Infraestrutura"
                  icon={<Users className="w-5 h-5" />}
                />
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>Haverá necessidade de sala de eventos?</label>
                    <RadioGroup
                      name="precisaSala"
                      options={['Sim', 'Não']}
                      value={formData.precisaSala}
                      onChange={(v) => setFormData((prev) => ({ ...prev, precisaSala: v }))}
                    />
                  </div>

                  {formData.precisaSala === 'Sim' && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pl-4 border-l-2 border-blue-100"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Data(s)</label>
                          <input
                            type="text"
                            name="datasSala"
                            value={formData.datasSala}
                            onChange={handleChange}
                            placeholder="Ex: 10/07/2025"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Horário de uso (Início)</label>
                          <input
                            type="time"
                            name="horarioUsoInicio"
                            value={formData.horarioUsoInicio}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Horário de uso (Fim)</label>
                          <input
                            type="time"
                            name="horarioUsoFim"
                            value={formData.horarioUsoFim}
                            onChange={handleChange}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Número de participantes</label>
                          <input
                            type="number"
                            name="numeroParticipantes"
                            min="1"
                            value={formData.numeroParticipantes}
                            onChange={handleChange}
                            placeholder="0"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Formato da sala (Setup)</label>
                          <RadioGroup
                            name="formatoSala"
                            options={['Auditório', 'Em U', 'Escolar', 'Banquete', 'Coquetel']}
                            value={formData.formatoSala}
                            onChange={(v) => setFormData((prev) => ({ ...prev, formatoSala: v }))}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>Equipamentos básicos</label>
                        <CheckboxGroup
                          options={[
                            'Projetor / Telão / Smart TV',
                            'Sonorização + Microfones',
                            'Wi-Fi Dedicado (alta performance)',
                            'Flipchart / Material de apoio',
                          ]}
                          selected={formData.equipamentos}
                          onChange={(v) => handleCheckboxToggle('equipamentos', v)}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.section>
            )}

            {/* ─── 6. Alimentos e Bebidas ──────────────────────────────────── */}
            <section>
              <SectionHeader
                number="6"
                title="Alimentos e Bebidas (A&B)"
                icon={<Utensils className="w-5 h-5" />}
              />
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Serviços desejados</label>
                  <CheckboxGroup
                    options={[
                      'Welcome Coffee',
                      'Coffee Break (Manhã / Tarde)',
                      'Almoço (Buffet ou Sugestão do Chef)',
                      'Jantar',
                      'Coquetel / Happy Hour',
                    ]}
                    selected={formData.servicosAB}
                    onChange={(v) => handleCheckboxToggle('servicosAB', v)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Observações / Restrições alimentares</label>
                  <textarea
                    name="restricoesAlimentares"
                    rows={3}
                    value={formData.restricoesAlimentares}
                    onChange={handleChange}
                    placeholder="Ex: vegetarianos, celíacos, kosher..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </section>

            {/* ─── 7. Responsabilidade de Pagamento ───────────────────────── */}
            <section>
              <SectionHeader
                number="7"
                title="Responsabilidade de Pagamento (Faturamento)"
                icon={<CreditCard className="w-5 h-5" />}
              />
              <RadioGroup
                name="politicaPagamento"
                options={[
                  'Tudo faturado para a empresa/instituição',
                  'Hospedagem faturada; Extras por conta do hóspede',
                  'Pagamento individual (Check-out por conta de cada participante)',
                ]}
                value={formData.politicaPagamento}
                onChange={(v) => setFormData((prev) => ({ ...prev, politicaPagamento: v }))}
              />
            </section>

            {/* ─── 8. Observações Gerais ───────────────────────────────────── */}
            <section>
              <SectionHeader
                number="8"
                title="Observações Gerais e Prazo de Resposta"
                icon={<MessageSquare className="w-5 h-5" />}
              />
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Observações adicionais</label>
                  <textarea
                    name="observacoes"
                    rows={4}
                    value={formData.observacoes}
                    onChange={handleChange}
                    placeholder="Informe qualquer necessidade especial ou detalhes relevantes para a sua solicitação."
                    className={`${inputClass} resize-none`}
                  />
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  <span className="font-bold">⚠️ Prazo de Atendimento:</span> O prazo para processamento da demanda
                  e envio das propostas pelos hotéis associados é de <strong>5 a 10 dias úteis</strong>.
                  Solicitações com prazos inferiores a este podem não obter retorno em tempo hábil devido à
                  complexidade da análise de disponibilidade e tarifário.
                </div>
              </div>
            </section>

            {/* ─── Institucional note ──────────────────────────────────────── */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <span className="font-bold">📢 Informação Institucional:</span> Esta solicitação é processada pelo
              CONEX HotéisRIO, canal oficial que conecta sua demanda diretamente aos hotéis associados do Rio de
              Janeiro, sem intermediação financeira ou cobrança de comissões. Após o encaminhamento institucional,
              o hotel selecionado entrará em contato diretamente com o solicitante.
            </div>

            {/* ─── Submit ───────────────────────────────────────────────────── */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0a2e50] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#0077c2] transition-all shadow-xl disabled:opacity-50 text-lg uppercase tracking-tight"
              >
                {isSubmitting ? (
                  'Processando...'
                ) : (
                  <>
                    Confirmar Envio Institucional <Send className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-400 mt-4">
                Ao enviar, sua demanda será encaminhada oficialmente pela equipe do CONEX HotéisRIO.
              </p>
            </div>
          </form>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center pb-12">
          <Link
            to="/consultar"
            className="text-blue-600 font-bold hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Já possui uma solicitação? Consulte o status aqui
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HospedagemGruposForm;
