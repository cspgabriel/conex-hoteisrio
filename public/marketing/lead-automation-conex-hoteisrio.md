# 📧 Lead Automation & Sequence — CONEX HotéisRIO

Estrutura de pós-conversão para leads que preencheram o formulário na Landing Page.

---

## 📝 1. Estrutura do Formulário (Campos Estratégicos)

Para filtragem e encaminhamento automático (via Make/Zapier):
- **Nome Completo:** [Texto]
- **Empresa / Instituição:** [Texto]
- **E-mail Corporativo:** [E-mail] (Validar domínios corporativos)
- **WhatsApp (Com DDD):** [Telefone]
- **Tipo de Cliente:** [Centros de Eventos / Consulados / Agência / Empresa]
- **Nº Estimado de UHs:** [10-20 / 21-50 / 51-100 / 100+]
- **Data do Grupo / Evento:** [Data]
- **Necessita de Visita Técnica?** [Sim / Não]
- **Breve Descrição da Demanda:** [Textarea]

---

## 📩 2. Sequência de E-mails (Nurture Drip)

### E-mail 01: Boas-vindas & Confirmação (Enviado no Momento 0)
**Assunto:** Sua solicitação hoteleira no Rio foi recebida — CONEX HotéisRIO
**Corpo:**
Olá, {{primeiro_nome}}.

Recebemos sua demanda para o projeto {{nome_empresa}} via canal oficial CONEX HotéisRIO.

Neste momento, nossa equipe institucional está analisando sua solicitação para encaminhá-la aos Diretores Comerciais e Gerentes Gerais dos hotéis associados que melhor atendem ao seu perfil de grupo/evento.

**O que esperar agora?**
Em breve, os decisores dos hotéis entrarão em contato direto com você para as propostas comerciais.

Atenciosamente,
**Equipe CONEX HotéisRIO**
*Iniciativa Institucional HotéisRIO*

---

### E-mail 02: O Atalho para o Decisor (Enviado +24h)
**Assunto:** O atalho institucional para o seu próximo evento no Rio
**Corpo:**
Olá, {{primeiro_nome}}.

Enquanto processamos sua demanda, gostaríamos de compartilhar o porquê o CONEX HotéisRIO é o canal favorito de grandes consulados e organizadores de congressos.

Diferente de sistemas de reservas comuns, nossa ponte é **institucional e direta**. Isso significa que sua demanda chega na mesa de quem tem alçada para negociar condições diferenciadas e blocos de quartos (10+ UHs) em tempo recorde.

Se precisar de qualquer suporte adicional em relação a visitas técnicas ou inspeções hoteleiras, sinta-se à vontade para responder a este e-mail.

Ficamos à disposição,
**CONEX HotéisRIO**

---

### E-mail 03: Visita Técnica & Inspeção (Enviado +72h)
**Assunto:** Planejando uma visita técnica hoteleira no Rio?
**Corpo:**
Olá, {{primeiro_nome}}.

Sabemos que para grandes eventos, olhar cada detalhe do espaço é fundamental.

Você sabia que o CONEX também facilita o agendamento de inspeções e visitas técnicas nos salões e infraestruturas dos hotéis associados?

Se ainda houver alguma pendência na sua prospecção de local para o evento {{nome_projeto}}, conte conosco para abrir as portas da hotelaria carioca.

Abraços,
**Equipe HotéisRIO**

---

## 📱 3. Scripts de WhatsApp (Follow-up)

### Script 01: Primeiro Contato (Pós-Lead)
*"Olá, {{primeiro_nome}}! Sou da equipe institucional do **CONEX HotéisRIO**. Acabamos de receber sua solicitação para o grupo/evento da {{nome_empresa}}. Já estamos encaminhando sua demanda para os diretores comerciais dos hotéis associados. Qualquer dúvida específica na negociação, estou à disposição por aqui. 👍"*

### Script 02: Follow-up de Visita Técnica
*"Olá, {{primeiro_nome}}, passando para saber se você já recebeu as propostas iniciais e se gostaria que o **HOTÉISRIO** facilitasse alguma visita técnica nos hotéis para o seu evento. Ficamos à disposição!"*

---

## 🛠️ Configuração Técnica Recomendada
- **Gatilho:** Novo lead no formulário Landing Page.
- **Ação 1 (Webhook):** Disparar e-mail 01 e mensagem WhatsApp Automática.
- **Ação 2 (CRM):** Tagging do lead como "SQL - CONEX".
- **Ação 3 (Routing):** Envio de notificação para a Diretoria Comercial dos hotéis segmentados por porte/localização.
