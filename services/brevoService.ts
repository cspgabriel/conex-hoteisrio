
import { Demand } from '../types';

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY as string;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const row = (label: string, value: string | undefined | null) =>
  value ? `
  <tr>
    <td style="padding:10px 20px;border-bottom:1px solid #e2e8f0;width:35%;">
      <span style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">${label}</span>
    </td>
    <td style="padding:10px 20px;border-bottom:1px solid #e2e8f0;">
      <span style="color:#0f172a;font-size:14px;">${value}</span>
    </td>
  </tr>` : '';

const buildEmailTemplate = (d: Demand): string => {
  const roomConfig = d.roomConfig
    ? Object.entries(d.roomConfig)
        .filter(([, v]) => v && v !== '0')
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
    : null;

  const equipment = d.basicEquipment?.length ? d.basicEquipment.join(', ') : null;
  const abServices = d.abServices?.length ? d.abServices.join(', ') : null;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:620px;" cellpadding="0" cellspacing="0">

        <!-- Header -->
        <tr>
          <td style="background:#1a3c6e;padding:28px 40px;text-align:center;border-radius:12px 12px 0 0;">
            <img src="https://sindhoteisrj.com.br/wp-content/uploads/2023/04/Logo-HoteisRIO-Branca-Fundo-Transparente.png"
                 alt="HoteisRio" style="height:40px;display:block;margin:0 auto 12px;" />
            <h1 style="color:#fff;margin:0;font-size:18px;font-weight:700;">Nova Demanda — Portal CONEX</h1>
            <p style="color:#93b8dc;margin:6px 0 0;font-size:12px;">
              Protocolo: <strong style="color:#fff;">${d.id}</strong> &nbsp;·&nbsp;
              ${new Date(d.dateOpened).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </td>
        </tr>

        <!-- Category badge -->
        <tr>
          <td style="background:#fff;padding:20px 40px 0;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${d.category.map(c => `<span style="background:#dbeafe;color:#1e40af;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-right:6px;">${c}</span>`).join('')}
            ${d.demandType ? `<span style="background:#f0fdf4;color:#166534;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${d.demandType}</span>` : ''}
          </td>
        </tr>

        <!-- Main data -->
        <tr>
          <td style="background:#fff;padding:20px 40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
              ${row('Nome / Responsável', d.fullName)}
              ${row('Hotel / Empresa', d.hotelName || d.company)}
              ${row('Tipo de Instituição', d.institutionType)}
              ${row('E-mail', d.contactEmail ? `<a href="mailto:${d.contactEmail}" style="color:#1a3c6e;">${d.contactEmail}</a>` : null)}
              ${row('Telefone / WhatsApp', d.contactPhone)}
              ${row('Região', d.region)}
              ${row('Bairro', d.neighborhood)}
              ${row('Endereço', d.address)}
              ${row('Perfil do Grupo', d.groupProfile)}
              ${row('Nacionalidade', d.nationality)}
              ${row('Categoria do Hotel', d.hotelCategory)}
              ${row('Localização Preferida', d.preferredLocation)}
            </table>
          </td>
        </tr>

        ${(d.checkIn || d.numNights || d.numUHs) ? `
        <!-- Hospedagem -->
        <tr>
          <td style="background:#fff;padding:0 40px 20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <p style="color:#1a3c6e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:16px 0 8px;">Hospedagem</p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
              ${row('Check-in', d.checkIn)}
              ${row('Check-out', d.checkOut)}
              ${row('Noites', d.numNights)}
              ${row('Nº de UHs', d.numUHs)}
              ${row('Configuração de Quartos', roomConfig)}
              ${row('Política de Pagamento', d.paymentPolicy)}
            </table>
          </td>
        </tr>` : ''}

        ${(d.needsEventRoom === 'Sim' || d.eventDates) ? `
        <!-- Eventos -->
        <tr>
          <td style="background:#fff;padding:0 40px 20px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <p style="color:#1a3c6e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:16px 0 8px;">Sala de Eventos</p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;border-collapse:collapse;">
              ${row('Precisa de sala?', d.needsEventRoom)}
              ${row('Datas', d.eventDates)}
              ${row('Horário', d.eventTime)}
              ${row('Participantes', d.numParticipants)}
              ${row('Montagem', d.roomSetup)}
              ${row('Equipamentos', equipment)}
              ${row('A&B', abServices)}
              ${row('Restrições Alimentares', d.foodRestrictions)}
            </table>
          </td>
        </tr>` : ''}

        <!-- Descrição -->
        <tr>
          <td style="background:#fff;padding:0 40px 24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            <p style="color:#1a3c6e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;margin:0 0 8px;">Descrição / Observações</p>
            <div style="background:#f8fafc;border-left:4px solid #1a3c6e;padding:14px 18px;border-radius:0 8px 8px 0;
                        color:#334155;font-size:14px;line-height:1.7;white-space:pre-wrap;word-break:break-word;">
${d.description || '—'}
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:18px 40px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.5;">
              Enviado automaticamente pelo <strong>Portal CONEX · HoteisRio</strong><br>
              Para responder ao solicitante, utilize o e-mail acima.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export const brevoService = {
  sendDemandNotification: async (demand: Demand): Promise<void> => {
    if (!BREVO_API_KEY) {
      console.warn('[Brevo] VITE_BREVO_API_KEY não configurado.');
      return;
    }

    const ccList = demand.contactEmail
      ? [{ email: demand.contactEmail, name: demand.fullName || demand.hotelName }]
      : [];

    const payload = {
      sender: { name: 'Portal CONEX – HoteisRio', email: 'marketing@hoteisrio.com.br' },
      to: [{ email: 'marketing@hoteisrio.com.br', name: 'Marketing HoteisRio' }],
      cc: ccList,
      bcc: [
        { email: 'julie.souza@hoteisrio.com.br' },
        { email: 'theresa.jansen@hoteisrio.com.br' },
        { email: 'marketing@hoteisrio.com.br' },
      ],
      subject: `[CONEX] ${demand.category.join(', ')} — ${demand.hotelName || demand.fullName} (${demand.id})`,
      htmlContent: buildEmailTemplate(demand),
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[Brevo] Erro ${response.status}:`, err);
    }
  },
};
