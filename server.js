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

  free: [

    "openai/gpt-4o-mini"

  ],

  premium: []


const USE_PREMIUM = false;

const ALL_MODELS = USE_PREMIUM
  ? [...AI_MODELS.free, ...AI_MODELS.premium]
  : AI_MODELS.free;

// ========================================
// ROOT
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

    const { user_id, message } = req.body;

    // =========================
    // LOAD DATA
    // =========================

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .limit(20);

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id);

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id)
      .limit(20);

    // =========================
    // PROMPT
    // =========================

    const prompt = `
Você é Obsidian.

Uma IA pessoal avançada.

Você possui:
- memória persistente
- agenda
- finanças
- tarefas
- contexto do usuário

Seu objetivo:
- ajudar o usuário
- responder naturalmente
- analisar emoções
- ajudar decisões
- agir como copiloto pessoal

TAREFAS:
${JSON.stringify(tasks)}

AGENDA:
${JSON.stringify(events)}

FINANÇAS:
${JSON.stringify(finances)}

HISTÓRICO:
${JSON.stringify(history)}

USUÁRIO:
${message}
`;

    // =========================
    // AI ROUTER
    // =========================

    let response = null;
    let usedModel = null;
    let modelType = null;

    for (const model of ALL_MODELS) {

      try {

        console.log("Tentando modelo:", model);

        const completion = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",

          {
            model,

            messages: [
              {
                role: "system",
                content: "Você é Obsidian, uma IA pessoal inteligente."
              },

              {
                role: "user",
                content: prompt
              }
            ]
          },

          {
            headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

        console.log("Modelo funcionando:", model);

        break;

      } catch (err) {

        console.log("Modelo falhou:", model);

console.log(
  err?.response?.data || err.message
);
      }

    }

    // =========================
    // FALLBACK
    // =========================

    if (!response) {

      response =
        "Nenhum modelo disponível no momento.";

    }

    // =========================
    // SAVE USER MESSAGE
    // =========================

    await supabase
      .from("messages")
      .insert({
        role: "user",
        content: message
      });

    // =========================
    // SAVE AI RESPONSE
    // =========================

    await supabase
      .from("messages")
      .insert({
        role: "assistant",
        content: response
      });

    // =========================
    // RESPONSE
    // =========================

    res.json({
      success: true,
      provider_model: usedModel,
      provider_type: modelType,
      response
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("=================================");
  console.log("OBSIDIAN CORE ONLINE");
  console.log("PORT:", PORT);
  console.log("=================================");

});
