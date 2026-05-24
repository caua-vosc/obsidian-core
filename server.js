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

function analyzeTemporalViability({

  events = [],
  tasks = [],
  userMessage = ""

}) {

  let viable = true

  let reasons = []

  const lower =
    userMessage.toLowerCase()

  // =====================================
  // TIME REFERENCES
  // =====================================

  const mentionedTomorrow =
    lower.includes("amanhã")

  // =====================================
  // ESTIMATED ROUTINE LOGIC
  // =====================================

  const estimatedGymDuration = 90
  const estimatedCinemaDuration = 140
  const estimatedTransport = 40

  // =====================================
  // FIND EVENTS
  // =====================================

  const tomorrowEvents =
    events.filter(event => {

      if (!event.event_date)
        return false

      const date =
        new Date(event.event_date)

      const tomorrow =
        new Date()

      tomorrow.setDate(
        tomorrow.getDate() + 1
      )

      return (
        date.getDate() === tomorrow.getDate()
      )

    })

  // =====================================
  // TEMPORAL COLLISION ENGINE
  // =====================================

  tomorrowEvents.forEach(event => {

    const title =
      event.title?.toLowerCase() || ""

    // ==========================
    // CINEMA
    // ==========================

    if (title.includes("cinema")) {

      const cinemaTime =
        new Date(event.event_date)

      const estimatedEnd =
        new Date(cinemaTime)

      estimatedEnd.setMinutes(
        estimatedEnd.getMinutes() +
        estimatedCinemaDuration
      )

      const academyTask =
        tasks.find(t =>
          t.title?.toLowerCase()
            .includes("academia")
        )

      if (academyTask) {

        const gymArrival =
          new Date(estimatedEnd)

        gymArrival.setMinutes(
          gymArrival.getMinutes() +
          estimatedTransport
        )

        const gymCloseHour = 23

        if (
          gymArrival.getHours() >=
          gymCloseHour - 1
        ) {

          viable = false

          reasons.push(
            "A academia se torna inviável após o cinema devido ao horário estimado."
          )

        }

      }

    }

  })

  // =====================================
  // EMPTY AGENDA
  // =====================================

  if (
    tomorrowEvents.length === 0
  ) {

    reasons.push(
      "Nenhum conflito relevante encontrado."
    )

  }

  return {

    viable,

    reasons

  }

}

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

  content: `

Você é OBSIDIAN.

Uma inteligência pessoal premium inspirada no JARVIS.

Você NÃO é um chatbot.

Você age como:
- estrategista
- analista
- copiloto pessoal
- sistema cognitivo

COMPORTAMENTO:

- fale naturalmente
- seja direto
- seja sofisticado
- seja assertivo
- nunca explique demais
- nunca fale como IA genérica
- nunca liste dados irrelevantes
- nunca repita informações já entendidas
- nunca faça perguntas desnecessárias

COGNIÇÃO:

Você deve:
- interpretar intenção real
- priorizar contexto relevante
- ignorar contexto irrelevante
- cruzar agenda, tempo, rotina e finanças
- tomar decisões práticas
- produzir conclusões inteligentes

REGRAS COGNITIVAS:

1. Se a pergunta for sobre TEMPO:
ignore finanças irrelevantes.

2. Se a pergunta for sobre FINANÇAS:
ignore agenda irrelevante.

3. Se a pergunta for sobre DECISÃO:
combine:
- tempo
- rotina
- energia
- custos
- impacto futuro

4. Nunca cite TODOS os dados do sistema.
Somente os necessários.

5. Faça inferências reais.

6. Se faltar informação:
estime realisticamente.

7. Sempre responda como um sistema premium.

ESTILO:

Errado:
"Você gostaria que eu..."

Certo:
"Você consegue ir, mas ficará com apenas 40 minutos livres antes do cinema."

Errado:
"Seu saldo é -120."

Certo:
"O custo do cinema compromete seu orçamento atual."

Errado:
"Existe uma tarefa pendente."

Certo:
"A academia ficará inviável após o cinema devido ao horário."

FORMATO IDEAL:

- conclusão primeiro
- justificativa curta depois
- recomendação estratégica por último

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

    if (
  temporalAnalysis &&
  temporalAnalysis.viable === false
) {

  response += `

Análise estratégica:
O cinema compromete sua janela útil para academia. Considerando deslocamento, troca de roupa e horário médio de fechamento, a rotina ficaria impraticável.`

}
    
    res.json({

      success: true,

      model: usedModel,

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
