import { GoogleGenAI, Type } from "@google/genai";
import { Demand, AIAnalysisResult, Status } from "../types";
import CATEGORIES from './categories';

// Helper to aggregate data for the prompt to save tokens and improve quality
const aggregateDataForPrompt = (demands: Demand[]) => {
  const total = demands.length;
  const byStatus = demands.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = demands.reduce((acc, d) => {
    const cats = Array.isArray(d.category) ? d.category : [d.category as unknown as string];
    cats.forEach(c => {
        if (c) acc[c] = (acc[c] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Limit to top 10 to avoid excessive token usage if many agencies exist
  const agencyCounts = demands.reduce((acc, d) => {
    const agency = d.assignedAgency || 'Não atribuído';
    acc[agency] = (acc[agency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byAgency = Object.entries(agencyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  // Limit to top 10 regions
  const regionCounts = demands.reduce((acc, d) => {
    const region = d.region || 'Não informado';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byRegion = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});

  const delayedCount = demands.filter(d => d.status === Status.DELAYED).length;

  return {
    total,
    byStatus,
    byCategory,
    byAgency,
    byRegion,
    delayedCount
  };
};

export const generateInsights = async (demands: Demand[]): Promise<AIAnalysisResult | null> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not set for Gemini");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataSummary = aggregateDataForPrompt(demands);

  const prompt = `
    Você é um analista sênior de dados turísticos e operacionais do Rio de Janeiro para a associação HotéisRIO.
    Analise os seguintes dados agregados de demandas/reclamações enviadas pelos hotéis para os órgãos públicos.

    Dados Agregados:
    ${JSON.stringify(dataSummary)}

    Gere um relatório JSON estruturado. Seja conciso.
    1. "summary": Um resumo executivo curto (máx 300 caracteres).
    2. "keyInsights": Lista de 3 insights chave curtos e diretos.
    3. "recommendations": Lista de 3 recomendações de ação curtas e práticas.
    
    Responda APENAS com o JSON válido. Não inclua markdown formatting como \`\`\`json.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                summary: { type: Type.STRING },
                keyInsights: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    let cleanText = text.trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanText = jsonMatch[0];
    }

    try {
        return JSON.parse(cleanText) as AIAnalysisResult;
    } catch (parseError) {
        console.warn("Failed to parse Gemini response JSON:", parseError);
        return null;
    }

  } catch (error) {
    return {
        summary: "Análise temporariamente indisponível. Verifique os dados no dashboard.",
        keyInsights: ["Aguardando regeneração da análise", "Dados brutos disponíveis nos gráficos", "Monitore os indicadores de status"],
        recommendations: ["Tente atualizar a análise novamente", "Verifique as demandas pendentes manualmente", "Exporte o relatório para análise externa"]
    };
  }
};

/**
 * Parses raw text input into a structured Demand object
 */
export const parseDemandFromText = async (rawText: string): Promise<Partial<Demand> | null> => {
  if (!process.env.API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const categories = CATEGORIES.join(', ');
  const statuses = Object.values(Status).join(', ');

  const prompt = `
    Analise o seguinte texto bruto que contém informações sobre uma demanda de ordem pública de um hotel.
    Extraia os dados para preencher um formulário estruturado.

    Texto:
    "${rawText}"

    Instruções:
    - Extraia o nome do hotel, endereço, bairro, região e e-mail se disponíveis.
    - Se houver uma data mencionada, formate como YYYY-MM-DD. Se não, use a data de hoje.
    - Categorize a demanda em uma destas categorias: [${categories}].
    - Defina o status baseado no texto (Ex: atendido, pendente, em aberto). Opções: [${statuses}]. Se não claro, use "Não Iniciado".
    - Resuma a descrição do problema de forma clara.
    - Extraia o órgão responsável se citado (ex: COMLURB, SEOP, PMRJ).
    - Se houver campos extras interessantes (ex: nome do solicitante), coloque em customFields.

    Retorne JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hotelName: { type: Type.STRING },
            dateOpened: { type: Type.STRING },
            category: { type: Type.STRING },
            status: { type: Type.STRING },
            description: { type: Type.STRING },
            neighborhood: { type: Type.STRING },
            region: { type: Type.STRING },
            address: { type: Type.STRING },
            contactEmail: { type: Type.STRING },
            assignedAgency: { type: Type.STRING },
            customFields: { 
                type: Type.OBJECT,
                properties: {
                    solicitante: { type: Type.STRING },
                    obs: { type: Type.STRING }
                }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as Partial<Demand>;

  } catch (error) {
    console.error("Error parsing demand with AI:", error);
    return null;
  }
};