import { askFastModel } from "../providers/router.js";

export async function analyzeIntent(message) {

  try {

    const result = await askFastModel([

      {
        role: "system",
        content: `
Você é um mecanismo cognitivo semântico.

Sua função:
identificar intenção real.

Retorne SOMENTE JSON.

{
  "intent": "",
  "domains": [],
  "priority": "",
  "requires_reasoning": true,
  "requires_web_search": false,
  "requires_temporal_analysis": false,
  "requires_financial_analysis": false,
  "requires_schedule_analysis": false,
  "requires_behavioral_analysis": false
}
`
      },

      {
        role: "user",
        content: message
      }

    ]);

    return JSON.parse(result);

  } catch {

    return {
      intent: "general",
      domains: [],
      priority: "medium",
      requires_reasoning: true
    };

  }

}
