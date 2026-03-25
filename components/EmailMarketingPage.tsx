import React, { useEffect, useMemo, useState, useRef } from 'react';
import { demandService } from '../services/demandService';
import { Demand, Status } from '../types';
import { Link } from 'react-router-dom';

const LOGO_URL = 'https://sindhoteisrj.com.br/wp-content/uploads/2023/04/Logo-HoteisRIO-Branca-Fundo-Transparente.png';

type Template = {
  id: string;
  title: string;
  preheader?: string;
  paragraphs: string[];
  ctaPrimary: string;
  ctaSecondary?: string;
};

const templates: Template[] = [
  {
    id: 'concise',
    title: 'Canal Direto — Rápido e Eficiente',
    preheader: 'Registre ocorrências e acompanhe a resolução pelo nosso canal exclusivo',
    paragraphs: [
      'Seu canal direto para demandas de ordem pública está pronto para uso. Com ele, você reporta problemas de forma rápida e recebemos as informações necessárias para encaminhar às equipes responsáveis.',
      'Registre poda de árvores, manutenção de iluminação, limpeza de via, sinalização, atuação da Guarda Municipal e outras ocorrências com poucos cliques.'
    ],
    ctaPrimary: 'Criar Nova Demanda',
    ctaSecondary: 'Consultar Status'
  },
  {
    id: 'community',
    title: 'Juntos Melhoramos Nossa Cidade',
    preheader: 'A participação dos associados faz a diferença na segurança e imagem da região',
    paragraphs: [
      'Ao reportar uma demanda você colabora para que ruas e entorno do seu hotel fiquem mais seguros, limpos e acolhedores — fatores que impactam diretamente a experiência dos hóspedes.',
      'Nosso canal exclusivo agiliza o encaminhamento e aumenta a chance de resolução rápida pelos órgãos competentes. Contamos com sua colaboração.'
    ],
    ctaPrimary: 'Registrar Ocorrência',
    ctaSecondary: 'Ver Pedidos'
  },
  {
    id: 'report',
    title: 'Resultados e Transparência — 1º Trimestre 2026',
    preheader: 'Números do trimestre e como você pode continuar contribuindo',
    paragraphs: [
      'No 1º trimestre consolidamos uma operação integrada com os órgãos municipais para tratar demandas reportadas pela rede hoteleira. A colaboração dos associados foi determinante para os resultados apresentados.',
      'Para manter a agilidade, solicitamos que continue reportando ocorrências assim que forem identificadas — quanto antes recebermos as informações, mais rápido elas são resolvidas.'
    ],
    ctaPrimary: 'Criar Nova Demanda',
    ctaSecondary: 'Consultar Status'
  }
];

const EmailMarketingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [q1Demands, setQ1Demands] = useState<Demand[]>([]);
  const [selected, setSelected] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const all = await demandService.getAll();
        if (!mounted) return;
        const filtered = all.filter(d => {
          const dt = new Date(d.dateOpened);
          return !isNaN(dt.getTime()) && dt.getFullYear() === 2026 && (dt.getMonth() + 1) <= 3;
        });
        setQ1Demands(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const total = q1Demands.length;
    const resolved = q1Demands.filter(d => d.status === Status.RESOLVED).length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, resolved, rate };
  }, [q1Demands]);

  const PUBLIC_SUBMISSION_URL = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '') + '/enviar';
  const PUBLIC_CONSULTATION_URL = (import.meta.env.VITE_PUBLIC_URL || window.location.origin).replace(/\/$/, '') + '/consultar';

  const buildOutlookHtml = (t: Template) => {
    return `<!doctype html>\n<html>\n<head>\n  <meta charset="utf-8" />\n  <meta name="viewport" content="width=device-width,initial-scale=1" />\n  <title>HotéisRIO — ${t.title}</title>\n</head>\n<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;">\n  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">\n    <tr><td align="center">\n      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:8px;overflow:hidden;">\n        <tr>\n          <td style="background:linear-gradient(90deg,#0ea5e9,#0b60b8);padding:24px;color:#ffffff;">\n            <table width="100%" role="presentation"><tr>\n              <td style="vertical-align:middle;"><img src="${LOGO_URL}" alt="HotéisRIO" width="110" style="display:block;filter:brightness(0) invert(1);" /></td>\n              <td style="text-align:right;vertical-align:middle;"> <h1 style="margin:0;font-size:20px;color:#ffffff;font-weight:700">${t.title}</h1></td>\n            </tr></table>\n          </td>\n        </tr>\n        <tr><td style="padding:18px;color:#0f172a;">\n          ${t.paragraphs.map(p=>`<p style="margin:0 0 12px;font-size:15px;color:#374151">${p}</p>`).join('')}\n\n          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:18px 0;">\n            <tr><td align="center">\n              <a href="${PUBLIC_SUBMISSION_URL}" style="display:inline-block;width:100%;max-width:420px;background:#0b63d6;color:#ffffff;padding:14px 18px;border-radius:8px;font-weight:700;text-decoration:none;">${t.ctaPrimary}</a>\n            </td></tr>\n            <tr><td style="height:8px"></td></tr>\n            <tr><td align="center">\n              <a href="${PUBLIC_CONSULTATION_URL}" style="display:inline-block;width:100%;max-width:420px;background:#e6f0ff;color:#0b63d6;padding:12px 18px;border-radius:8px;font-weight:700;text-decoration:none;">${t.ctaSecondary || 'Consultar Status'}</a>\n            </td></tr>\n          </table>\n\n          <p style="margin:0;font-size:13px;color:#6b7280;">Template pronto para colar no Outlook — estrutura em tabelas e estilos inline para preservar formatação.</p>\n        </td></tr>\n        <tr><td style="background:linear-gradient(90deg,#0ea5e9,#0b60b8);padding:14px;color:#ffffff;text-align:center;"> <div style="font-size:13px;">HotéisRIO — Gestão de Demandas · suporte: atendimento@hoteisrio.com.br</div></td></tr>\n      </table>\n    </td></tr>\n  </table>\n</body>\n</html>`;
  };

  const copyOutlookHtml = async (idx: number) => {
    const html = buildOutlookHtml(templates[idx]);
    try {
      await navigator.clipboard.writeText(html);
      alert('HTML (compatível com Outlook) copiado para a área de transferência.');
    } catch (e) {
      console.error(e);
      alert('Falha ao copiar HTML.');
    }
  };

  const copyVisual = async () => {
    if (!contentRef.current) {
      alert('Preview não disponível.');
      return;
    }
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body>${contentRef.current.innerHTML}</body></html>`;
    try {
      await navigator.clipboard.writeText(html);
      alert('Visual do e-mail copiado — cole no Outlook.');
    } catch (e) {
      console.error(e);
      alert('Falha ao copiar visual.');
    }
  };

  if (loading) return <div className="p-6">Carregando conteúdo do Email MKT...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={LOGO_URL} alt="HotéisRIO" className="h-14 w-auto" />
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Modelos de Email — HotéisRIO</h1>
            <p className="text-sm text-slate-500">Escolha um modelo, visualize e copie para o Outlook.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="text-sm text-blue-600 hover:underline">Voltar à Dashboard</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {templates.map((t, i) => (
          <button key={t.id} onClick={() => setSelected(i)} className={`text-left p-4 rounded-lg border ${selected===i? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}>
            <div className="font-bold text-blue-700 mb-1">{t.title}</div>
            <div className="text-xs text-slate-500">{t.preheader}</div>
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        <button onClick={() => copyOutlookHtml(selected)} className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Copiar HTML (Outlook)</button>
        <button onClick={copyVisual} className="px-4 py-2 bg-slate-100 rounded-md">Copiar Visual</button>
      </div>

      <div ref={contentRef} className="bg-white shadow rounded-lg overflow-hidden" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <div style={{ background: 'linear-gradient(90deg,#0ea5e9,#0b60b8)' }} className="p-6 text-white flex items-center gap-4">
          <img src={LOGO_URL} alt="HotéisRIO" className="h-16 w-auto" />
          <div>
            <h2 className="text-2xl font-bold">{templates[selected].title}</h2>
            {templates[selected].preheader && <p className="text-sm opacity-90">{templates[selected].preheader}</p>}
          </div>
        </div>

        <div className="p-6 text-slate-800">
          {templates[selected].paragraphs.map((p, idx) => (
            <p key={idx} className="mb-4 text-base">{p}</p>
          ))}

          <div className="mb-6 flex flex-col items-center gap-3">
            <a href={PUBLIC_SUBMISSION_URL} target="_blank" rel="noopener noreferrer" className="w-full max-w-2xl text-center bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">{templates[selected].ctaPrimary}</a>
            <a href={PUBLIC_CONSULTATION_URL} target="_blank" rel="noopener noreferrer" className="w-full max-w-2xl text-center bg-white border border-slate-200 text-blue-700 px-6 py-3 rounded-lg font-semibold">{templates[selected].ctaSecondary || 'Consultar Status'}</a>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(90deg,#0ea5e9,#0b60b8)' }} className="p-4 text-white text-center">
          <div className="text-sm">HotéisRIO — Gestão de Demandas · suporte: atendimento@hoteisrio.com.br</div>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketingPage;

