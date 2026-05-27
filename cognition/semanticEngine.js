import { callGroq } from "../integrations/groq.js";

export async function analyzeIntent(message) {

  const prompt = `
Você é o núcleo semântico do OBSIDIAN.

Analise profundamente a intenção do usuário.

Responda APENAS JSON.

Formato:

{
  "intent": "",
  "domains": [],
  "priority": "",
  "requiresTemporal": false,
  "requiresFinancial": false,
  "requiresBehavioral": false,
  "requiresWebSearch": false,
  "requiresDeepReasoning": false,
  "requiresFastResponse": false
}
`;

  const response = await callGroq({

    model: "llama-3.1-8b-instant",

    temperature: 0.1,

    messages: [

      {
        role: "system",
        content: prompt
      },

      {
        role: "user",
        content: message
      }

    ]

  });

  try {

    return JSON.parse(response);

  } catch {

    return {

      intent: "general",
      domains: ["general"],
      priority: "medium"

    };

  }

}
