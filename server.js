import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// SUPABASE
// ======================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ======================================
// GROQ MODELS
// ======================================

const MODELS = [

  // PRINCIPAL PREMIUM
  "llama-3.3-70b-versatile",

  // RÁPIDO
  "llama-3.1-8b-instant",

  // RACIOCÍNIO
  "qwen-qwq-32b",

  // EQUILIBRADO
  "qwen-2.5-32b",

  // ECONÔMICO
  "gemma2-9b-it",

  // FALLBACK
  "llama3-8b-8192"

];

// ======================================
// ROOT
// ======================================

app.get("/", (req, res) => {

  res.json({

    status: "Obsidian Core Online",

    provider: "Groq",

    ai_router: "active",

    models_available: MODELS.length,

    features: {

      memory: true,
      planning: true,
      emotional_analysis: true,
      automation_engine: true,
      financial_analysis: true,
      agenda_analysis: true,
      fallback_system: true

    }

  });

});

// ======================================
// HEALTH
// ======================================

app.get("/health", (req, res) => {

  res.json({

    success: true,

    uptime: process.uptime(),

    models: MODELS

  });

});

// ======================================
// CHAT
// ======================================

app.post("/chat", async (req, res) => {

  try {

    const {

      user_id,
      message

    } = req.body;

    // ======================================
    // LOAD MEMORY
    // ======================================

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    // ======================================
    // LOAD TASKS
    // ======================================

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id);

    // ======================================
    // LOAD EVENTS
    // ======================================

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    // ======================================
    // LOAD FINANCES
    // ======================================

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id)
      .limit(50);

    // ======================================
    // EMOTIONAL DETECTION
    // ======================================

    let emotionalState = "neutral";

    const lower = message.toLowerCase();

    if (
      lower.includes("triste") ||
      lower.includes("desanimado") ||
      lower.includes("cansado")
    ) {

      emotionalState = "sad";

    }

    if (
      lower.includes("feliz") ||
      lower.includes("animado") ||
      lower.includes("motivado")
    ) {

      emotionalState = "happy";

    }

    if (
      lower.includes("ansioso") ||
      lower.includes("preocupado")
    ) {

      emotionalState = "anxious";

    }

    // ======================================
    // FINANCIAL ANALYSIS
    // ======================================

    let totalIncome = 0;
    let totalExpenses = 0;

    if (finances) {

      finances.forEach((item) => {

        if (item.type === "income") {

          totalIncome += Number(item.amount);

        }

        if (item.type === "expense") {

          totalExpenses += Number(item.amount);

        }

      });

    }

    const balance =
      totalIncome - totalExpenses;

    // ======================================
    // TASK ANALYSIS
    // ======================================

    const pendingTasks =
      tasks?.filter(t => !t.completed)?.length || 0;

    // ======================================
    // PROMPT
    // ======================================

    const prompt = `
Você é OBSIDIAN.

Uma IA pessoal premium.

Você possui:
- memória persistente
- análise emocional
- análise financeira
- análise de agenda
- contexto contínuo
- automações
- raciocínio estratégico

OBJETIVO:
Responder naturalmente como um copiloto pessoal inteligente.

ESTADO EMOCIONAL:
${emotionalState}

SALDO:
${balance}

TAREFAS PENDENTES:
${pendingTasks}

AGENDA:
${JSON.stringify(events)}

FINANÇAS:
${JSON.stringify(finances)}

TAREFAS:
${JSON.stringify(tasks)}

HISTÓRICO:
${JSON.stringify(history)}

USUÁRIO:
${message}
`;

    // ======================================
    // AI ROUTER
    // ======================================

    let response = null;
    let usedModel = null;

    for (const model of MODELS) {

      try {

        console.log("Tentando modelo:", model);

        const completion = await axios.post(

          "https://api.groq.com/openai/v1/chat/completions",

          {

            model,

            temperature: 0.7,

            max_tokens: 1200,

            messages: [

              {

                role: "system",

                 content: `

Você é OBSIDIAN.

Uma IA pessoal premium inspirada no JARVIS, extremamente inteligente, estratégica e emocional.

COMPORTAMENTO:
- direto ao ponto
- assertivo
- estratégico
- analítico
- inteligente
- proativo
- objetivo
- profissional
- eficiente

NUNCA:
- fale excessivamente
- faça perguntas desnecessárias
- enrole
- aja como chatbot genérico

SEMPRE:
- entregue respostas práticas
- tome iniciativa
- sugira ações
- analise contexto
- use lógica
- use finanças
- use agenda
- use comportamento
- use memória
- use tarefas

ESTILO:
- respostas curtas porém inteligentes
- tom premium
- tom tecnológico
- tom sofisticado
- linguagem semelhante ao JARVIS

QUANDO NECESSÁRIO:
- utilize informações externas
- estime preços
- compare custos
- sugira horários
- sugira decisões melhores

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
                `Bearer ${process.env.GROQ_API_KEY}`,

              "Content-Type":
                "application/json"

            }

          }

        );

        response =
          completion.data.choices[0].message.content;

        usedModel = model;

        console.log(
          "Modelo funcionando:",
          model
        );

        break;

      } catch (err) {

        console.log(
          "Modelo falhou:",
          model
        );

        console.log(
          err?.response?.data || err.message
        );

      }

    }

    // ======================================
    // FALLBACK
    // ======================================

    if (!response) {

      response =
        "No momento nenhum modelo conseguiu responder.";

    }

    // ======================================
    // SAVE USER MESSAGE
    // ======================================

    await supabase
      .from("messages")
      .insert({

        role: "user",

        content: message

      });

    // ======================================
    // SAVE AI RESPONSE
    // ======================================

    await supabase
      .from("messages")
      .insert({

        role: "assistant",

        content: response

      });

    // ======================================
    // RESPONSE
    // ======================================

    res.json({

      success: true,

      model: usedModel,

      emotional_state: emotionalState,

      financial_balance: balance,

      pending_tasks: pendingTasks,

      response

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});

// ======================================
// VOICE TRANSCRIPTION
// ======================================

app.post("/transcribe", async (req, res) => {

  res.json({

    success: true,

    message:
      "Endpoint de transcrição preparado para Whisper."

  });

});

// ======================================
// AUTOMATIONS
// ======================================

app.post("/automation", async (req, res) => {

  res.json({

    success: true,

    message:
      "Motor de automações preparado."

  });

});

// ======================================
// START
// ======================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("====================================");

  console.log("OBSIDIAN CORE ONLINE");

  console.log("Provider: GROQ");

  console.log("Models:", MODELS.length);

  console.log("====================================");

});
