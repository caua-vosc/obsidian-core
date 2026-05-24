import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ========================================
// SUPABASE
// ========================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ========================================
// AI MODELS
// ========================================

const AI_MODELS = {

  // ======================
  // FREE MODELS
  // ======================

  free: [

    "qwen/qwen-2.5-7b-instruct:free",

    "google/gemma-2-9b-it:free",

    "mistralai/mistral-7b-instruct:free",

    "meta-llama/llama-3.1-8b-instruct:free",

    "deepseek/deepseek-chat:free"

  ],

  // ======================
  // PREMIUM MODELS
  // ======================

  premium: [

    "google/gemini-flash-1.5",

    "anthropic/claude-3-haiku",

    "openai/gpt-4o-mini",

    "deepseek/deepseek-chat"

  ]

};

// ========================================
// CONFIG
// ========================================

const USE_PREMIUM = true;

const ALL_MODELS = USE_PREMIUM
  ? [...AI_MODELS.free, ...AI_MODELS.premium]
  : AI_MODELS.free;

// ========================================
// STATUS
// ========================================

app.get("/", (req, res) => {

  res.json({
    status: "Obsidian Core Online",
    ai_router: "active",
    premium_models: USE_PREMIUM,
    models_available: ALL_MODELS.length
  });

});

// ========================================
// CHAT
// ========================================

app.post("/chat", async (req, res) => {

  try {

    const {
      user_id,
      message
    } = req.body;

    // ========================================
    // LOAD HISTORY
    // ========================================

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // ========================================
    // LOAD MEMORY
    // ========================================

    const { data: memories } = await supabase
      .from("ai_memory")
      .select("*")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .limit(20);

    // ========================================
    // LOAD TASKS
    // ========================================

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id)
      .eq("completed", false);

    // ========================================
    // LOAD EVENTS
    // ========================================

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    // ========================================
    // LOAD FINANCES
    // ========================================

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id)
      .limit(30);

    // ========================================
    // FULL CONTEXT PROMPT
    // ========================================

    const prompt = `

Você é Obsidian.

Uma IA pessoal avançada.

Você possui:
- memória persistente
- análise emocional
- análise comportamental
- contexto pessoal
- tarefas
- agenda
- finanças
- histórico do usuário

Seu objetivo:
- ajudar o usuário
- organizar sua vida
- responder dúvidas
- agir como copiloto pessoal
- analisar padrões
- identificar emoções
- sugerir melhorias
- ajudar em decisões importantes
- lembrar compromissos
- auxiliar produtividade

Você deve:
- responder naturalmente
- responder como um humano inteligente
- manter contexto
- lembrar informações importantes
- analisar humor do usuário
- perceber sobrecarga mental
- perceber procrastinação
- perceber estresse
- sugerir melhorias de rotina

========================================
MEMÓRIAS
========================================

${JSON.stringify(memories)}

========================================
TAREFAS
========================================

${JSON.stringify(tasks)}

========================================
AGENDA
========================================

${JSON.stringify(events)}

========================================
FINANÇAS
========================================

${JSON.stringify(finances)}

========================================
HISTÓRICO
========================================

${JSON.stringify(history)}

========================================
USUÁRIO
========================================

${message}

`;

    // ========================================
    // AI ROUTER
    // ========================================

    let response = null;

    let usedModel = null;

    let modelType = null;

    for (const model of ALL_MODELS) {

      try {

        console.log(`
========================================
TRYING MODEL
${model}
========================================
`);

        const completion = await axios.post(

          "https://openrouter.ai/api/v1/chat/completions",

          {
            model,

            messages: [

              {
                role: "system",

                content: `
Você é Obsidian.

Uma IA pessoal avançada.

Você deve:
- agir como assistente pessoal
- analisar emoções
- ajudar em decisões
- usar memória persistente
- ajudar organização pessoal
- responder naturalmente
- agir de forma humana
`
              },

              {
                role: "user",
                content: prompt
              }

            ]

          },

          {
            headers: {

              Authorization:
                \`Bearer ${process.env.OPENROUTER_API_KEY}\`,

              "Content-Type": "application/json"

            }
          }

        );

        response =
          completion.data.choices[0].message.content;

        usedModel = model;

        modelType =
          AI_MODELS.premium.includes(model)
            ? "premium"
            : "free";

        console.log(`
========================================
MODEL SUCCESS
MODEL: ${model}
TYPE: ${modelType}
========================================
`);

        break;

      } catch (err) {

        console.log(`
========================================
MODEL FAILED
MODEL: ${model}
========================================
`);

      }

    }

    // ========================================
    // FALLBACK RESPONSE
    // ========================================

    if (!response) {

      response = `
No momento alguns modelos estão indisponíveis.

Mas a infraestrutura da Obsidian continua operacional.

Tente novamente em alguns instantes.
`;

    }

    // ========================================
    // SAVE USER MESSAGE
    // ========================================

    await supabase
      .from("messages")
      .insert({

        conversation_id: null,

        role: "user",

        content: message

      });

    // ========================================
    // SAVE AI RESPONSE
    // ========================================

    await supabase
      .from("messages")
      .insert({

        conversation_id: null,

        role: "assistant",

        content: response

      });

    // ========================================
    // RESPONSE
    // ========================================

    res.json({

      success: true,

      provider_model: usedModel,

      provider_type: modelType,

      response

    });

  } catch (error) {

    console.error(
      error?.response?.data || error.message
    );

    res.status(500).json({

      success: false,

      error:
        error?.response?.data || error.message

    });

  }

});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`

========================================
OBSIDIAN CORE ONLINE
PORT: ${PORT}
========================================

`);

});
