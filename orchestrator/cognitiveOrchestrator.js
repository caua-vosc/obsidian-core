import { analyzeIntent } from "../cognition/semanticEngine.js";
import { selectModel } from "../models/modelRouter.js";
import { callGroq } from "../integrations/groq.js";

export async function cognitiveOrchestrator({

  message,
  memory = {},
  realtime = {}

}) {

  // =====================================
  // SEMANTIC ANALYSIS
  // =====================================

  const semantic = await analyzeIntent(message);

  // =====================================
  // MODEL SELECTION
  // =====================================

  const model = selectModel(semantic);

  // =====================================
  // CONTEXT FILTERING
  // =====================================

  const filteredContext = {

    relevant_memory: memory,
    realtime_context: realtime

  };

  // =====================================
  // EXECUTIVE PROMPT
  // =====================================

  const systemPrompt = `
Você é OBSIDIAN.

Uma IA cognitiva operacional premium inspirada no JARVIS.

COMPORTAMENTO:
- extremamente inteligente
- analítico
- direto
- sofisticado
- estratégico
- natural
- humano
- objetivo

NUNCA:
- fale como chatbot
- enrole
- faça perguntas desnecessárias
- repita contexto irrelevante

SEMPRE:
- raciocine profundamente
- interprete intenção implícita
- use lógica contextual
- use memória
- use comportamento
- use tempo
- use dados reais quando necessário

Seu objetivo é agir como um sistema operacional cognitivo pessoal.
`;

  // =====================================
  // FINAL RESPONSE
  // =====================================

  const response = await callGroq({

    model,

    temperature: 0.7,

    max_tokens: 1200,

    messages: [

      {
        role: "system",
        content: systemPrompt
      },

      {
        role: "user",
        content: `
MENSAGEM:
${message}

CONTEXTO:
${JSON.stringify(filteredContext, null, 2)}

ANÁLISE SEMÂNTICA:
${JSON.stringify(semantic, null, 2)}
`
      }

    ]

  });

  return {

    semantic,
    model,
    response

  };

}
