import { askFastModel } from "../providers/router.js";

export async function analyzeIntent(message) {

  try {

    const result =
      await askFastModel([

        {

          role: "system",

          content: `

Você é um motor cognitivo semântico.

Analise intenção real.

Retorne APENAS JSON.

{
  "intent": "",
  "requires_reasoning": true,
  "requires_web_search": false,
  "requires_temporal_analysis": false,
  "requires_financial_analysis": false
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

      requires_reasoning: true,

      requires_web_search: false

    };

  }

}
