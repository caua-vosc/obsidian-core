import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ======================================================
// SUPABASE
// ======================================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ======================================================
// MODELS
// ======================================================

const MODELS = [

  "llama-3.3-70b-versatile",

  "qwen-qwq-32b",

  "qwen-2.5-32b",

  "llama-3.1-8b-instant",

  "gemma2-9b-it",

  "llama3-8b-8192"

];

// ======================================================
// ROOT
// ======================================================

app.get("/", (req, res) => {

  res.json({

    status: "OBSIDIAN ONLINE",

    ai: true,

    cognition: true,

    temporal_engine: true,

    semantic_engine: true,

    models: MODELS.length

  });

});

// ======================================================
// SEMANTIC ENGINE
// ======================================================

async function semanticAnalysis(message) {

  const lower = message.toLowerCase();

  return {

    intent:

      lower.includes("academia")
        ? "gym"

      : lower.includes("cinema")
        ? "cinema"

      : lower.includes("comprar")
        ? "purchase"

      : lower.includes("tempo")
        ? "time"

      : "general",

    requires_temporal:
      lower.includes("academia") ||
      lower.includes("cinema") ||
      lower.includes("tempo"),

    requires_financial:
      lower.includes("comprar") ||
      lower.includes("dinheiro") ||
      lower.includes("saldo")

  };

}

// ======================================================
// TEMPORAL ENGINE
// ======================================================

function temporalAnalysis({

  events,
  message

}) {

  const result = {

    viable: true,

    reasons: []

  };

  const lower =
    message.toLowerCase();

  // ==================================================
  // GYM ANALYSIS
  // ==================================================

  if (lower.includes("academia")) {

    const cinemaEvent =
      events.find(event =>
        event.title?.toLowerCase().includes("cinema")
      );

    if (cinemaEvent?.event_date) {

      const cinemaTime =
        new Date(cinemaEvent.event_date);

      // duração média cinema
      const movieDuration = 130;

      // deslocamento médio
      const transport = 40;

      // treino
      const gymDuration = 90;

      // academia fecha
      const gymCloseHour = 23;

      // fim cinema
      const cinemaEnd =
        new Date(
          cinemaTime.getTime() +
          movieDuration * 60000
        );

      // chegada
      const arrival =
        new Date(
          cinemaEnd.getTime() +
          transport * 60000
        );

      // fim academia
      const gymEnd =
        new Date(
          arrival.getTime() +
          gymDuration * 60000
        );

      const closeTime =
        new Date(arrival);

      closeTime.setHours(
        gymCloseHour,
        0,
        0,
        0
      );

      if (gymEnd > closeTime) {

        result.viable = false;

        result.reasons.push(
          "Você chegaria tarde demais para concluir o treino."
        );

      }

    }

  }

  return result;

}

// ======================================================
// CONTEXT FILTER
// ======================================================

function filterContext({

  semantic,

  events,
  tasks,
  finances

}) {

  // ==================================================
  // GYM
  // ==================================================

  if (semantic.intent === "gym") {

    return {

      events,

      tasks

    };

  }

  // ==================================================
  // PURCHASE
  // ==================================================

  if (semantic.intent === "purchase") {

    return {

      finances

    };

  }

  // ==================================================
  // DEFAULT
  // ==================================================

  return {

    events,
    tasks,
    finances

  };

}

// ======================================================
// SYSTEM PROMPT
// ======================================================

function buildSystemPrompt() {

  return `

Você é OBSIDIAN.

Uma IA premium inspirada no JARVIS.

COMPORTAMENTO:

- inteligente
- lógico
- executivo
- sofisticado
- estratégico
- direto
- humano

NUNCA:

- fale como chatbot
- faça textos longos
- explique demais
- faça relatórios
- fale "com base na análise"
- fale "considerando os dados"

SEMPRE:

- entregue conclusão objetiva
- fale naturalmente
- use lógica real
- use contexto silenciosamente

EXEMPLO:

Usuário:
"Consigo ir à academia amanhã?"

Resposta correta:
"Não.
Você sairia do cinema tarde demais para concluir o treino antes do fechamento da academia."

`;

}

// ======================================================
// CHAT
// ======================================================

app.post("/chat", async (req, res) => {

  try {

    const {

      user_id,
      message

    } = req.body;

    // ==================================================
    // HISTORY
    // ==================================================

    const { data: history } =
      await supabase
        .from("messages")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(20);

    // ==================================================
    // TASKS
    // ==================================================

    const { data: tasks } =
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user_id);

    // ==================================================
    // EVENTS
    // ==================================================

    const { data: events } =
      await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user_id);

    // ==================================================
    // FINANCES
    // ==================================================

    const { data: finances } =
      await supabase
        .from("financial_transactions")
        .select("*")
        .eq("user_id", user_id);

    // ==================================================
    // BALANCE
    // ==================================================

    let income = 0;
    let expenses = 0;

    finances?.forEach(item => {

      if (item.type === "income") {

        income += Number(item.amount);

      }

      if (item.type === "expense") {

        expenses += Number(item.amount);

      }

    });

    const balance =
      income - expenses;

    // ==================================================
    // EMOTIONAL STATE
    // ==================================================

    let emotionalState = "neutral";

    const lower =
      message.toLowerCase();

    if (
      lower.includes("triste") ||
      lower.includes("desanimado")
    ) {

      emotionalState = "sad";

    }

    if (
      lower.includes("ansioso")
    ) {

      emotionalState = "anxious";

    }

    if (
      lower.includes("feliz")
    ) {

      emotionalState = "happy";

    }

    // ==================================================
    // SEMANTIC
    // ==================================================

    const semantic =
      await semanticAnalysis(message);

    // ==================================================
    // TEMPORAL
    // ==================================================

    const temporal =
      temporalAnalysis({

        events,
        message

      });

    // ==================================================
    // FILTERED CONTEXT
    // ==================================================

    const filteredContext =
      filterContext({

        semantic,

        events,
        tasks,
        finances

      });

    // ==================================================
    // DECISION
    // ==================================================

    const finalDecision = {

      viable:
        temporal.viable,

      reasons:
        temporal.reasons

    };

    // ==================================================
    // USER PROMPT
    // ==================================================

    const userPrompt = `

USUÁRIO:
${message}

INTENÇÃO:
${JSON.stringify(semantic)}

CONTEXTO:
${JSON.stringify(filteredContext)}

DECISÃO:
${JSON.stringify(finalDecision)}

SALDO:
${balance}

ESTADO EMOCIONAL:
${emotionalState}

IMPORTANTE:

- responda objetivamente
- não explique demais
- não fale como chatbot
- use lógica
- entregue apenas a conclusão

`;

    // ==================================================
    // MODEL ROUTER
    // ==================================================

    let response = null;
    let usedModel = null;

    for (const model of MODELS) {

      try {

        console.log("Tentando:", model);

        const completion =
          await axios.post(

            "https://api.groq.com/openai/v1/chat/completions",

            {

              model,

              temperature: 0.4,

              max_tokens: 400,

              messages: [

                {

                  role: "system",

                  content:
                    buildSystemPrompt()

                },

                {

                  role: "user",

                  content:
                    userPrompt

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
          completion.data
            .choices[0]
            .message.content;

        usedModel = model;

        break;

      } catch (err) {

        console.log(
          "Falha modelo:",
          model
        );

      }

    }

    // ==================================================
    // FALLBACK
    // ==================================================

    if (!response) {

      response =
        "Nenhum modelo disponível.";

    }

    // ==================================================
    // SAVE USER
    // ==================================================

    await supabase
      .from("messages")
      .insert({

        role: "user",

        content: message

      });

    // ==================================================
    // SAVE AI
    // ==================================================

    await supabase
      .from("messages")
      .insert({

        role: "assistant",

        content: response

      });

    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

      success: true,

      model: usedModel,

      cognition: {

        semantic,

        temporal,

        finalDecision

      },

      balance,

      emotional_state:
        emotionalState,

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

// ======================================================
// START
// ======================================================

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("");

  console.log("================================");

  console.log("OBSIDIAN CORE ONLINE");

  console.log("AI: ACTIVE");

  console.log("COGNITION: ACTIVE");

  console.log("TEMPORAL ENGINE: ACTIVE");

  console.log("================================");

  console.log("");

});
