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

  let estimatedTimeline = []

  // =====================================
  // DYNAMIC ESTIMATION ENGINE
  // =====================================

  function estimateDuration(text) {

    const lower =
      text.toLowerCase()

    // =================================
    // HEALTH
    // =================================

    if (
      lower.includes("academia") ||
      lower.includes("treino") ||
      lower.includes("corrida")
    ) {

      return 90

    }

    // =================================
    // CINEMA
    // =================================

    if (
      lower.includes("cinema") ||
      lower.includes("filme")
    ) {

      return 150

    }

    // =================================
    // WORK
    // =================================

    if (
      lower.includes("trabalho") ||
      lower.includes("reunião")
    ) {

      return 120

    }

    // =================================
    // ESTUDO
    // =================================

    if (
      lower.includes("estudo") ||
      lower.includes("faculdade")
    ) {

      return 180

    }

    // =================================
    // SOCIAL
    // =================================

    if (
      lower.includes("jantar") ||
      lower.includes("festa") ||
      lower.includes("encontro")
    ) {

      return 180

    }

    // =================================
    // DEFAULT AI ESTIMATION
    // =================================

    return 120

  }

  // =====================================
  // PRIORITY ENGINE
  // =====================================

  function estimatePriority(text) {

    const lower =
      text.toLowerCase()

    if (
      lower.includes("trabalho") ||
      lower.includes("médico") ||
      lower.includes("consulta")
    ) {

      return "high"

    }

    if (
      lower.includes("academia") ||
      lower.includes("estudo")
    ) {

      return "medium"

    }

    return "low"

  }

  // =====================================
  // BUILD TIMELINE
  // =====================================

  const allItems = [

    ...events.map(event => ({

      type: "event",

      title:
        event.title || "Evento",

      datetime:
        event.event_date,

      duration:
        estimateDuration(
          event.title || ""
        ),

      priority:
        estimatePriority(
          event.title || ""
        )

    })),

    ...tasks.map(task => ({

      type: "task",

      title:
        task.title || "Tarefa",

      datetime:
        task.due_date,

      duration:
        estimateDuration(
          task.title || ""
        ),

      priority:
        estimatePriority(
          task.title || ""
        )

    }))

  ]

  // =====================================
  // REMOVE INVALID DATES
  // =====================================

  const validItems =
    allItems.filter(
      item => item.datetime
    )

  // =====================================
  // SORT TIMELINE
  // =====================================

  validItems.sort((a, b) => {

    return (
      new Date(a.datetime) -
      new Date(b.datetime)
    )

  })

  // =====================================
  // COLLISION DETECTION
  // =====================================

  for (
    let i = 0;
    i < validItems.length - 1;
    i++
  ) {

    const current =
      validItems[i]

    const next =
      validItems[i + 1]

    const currentStart =
      new Date(current.datetime)

    const currentEnd =
      new Date(currentStart)

    currentEnd.setMinutes(
      currentEnd.getMinutes() +
      current.duration
    )

    const nextStart =
      new Date(next.datetime)

    // =================================
    // TRANSPORT BUFFER
    // =================================

    currentEnd.setMinutes(
      currentEnd.getMinutes() + 40
    )

    // =================================
    // COLLISION
    // =================================

    if (currentEnd > nextStart) {

      viable = false

      reasons.push(

        `${current.title} conflita com ${next.title}.`

      )

      // =============================
      // PRIORITY ANALYSIS
      // =============================

      if (
        current.priority === "high"
      ) {

        reasons.push(

          `${current.title} possui prioridade elevada.`

        )

      }

    }

  }

  // =====================================
  // EMPTY STATE
  // =====================================

  if (reasons.length === 0) {

    reasons.push(
      "Nenhum conflito crítico encontrado."
    )

  }

  // =====================================
  // USER MESSAGE CONTEXT
  // =====================================

  const lower =
    userMessage.toLowerCase()

  if (
    lower.includes("consigo") ||
    lower.includes("dá tempo") ||
    lower.includes("viável")
  ) {

    if (!viable) {

      reasons.unshift(
        "A rotina atual apresenta conflito temporal."
      )

    }

  }

  // =====================================
  // RETURN
  // =====================================

  return {

    viable,

    reasons,

    estimatedTimeline:
      validItems

  }

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

    const semanticIntent =
  await analyzeIntent(message)

const temporalAnalysis =
  analyzeTemporalViability({

    events,
    tasks,
    userMessage: message

  })

const cognition = {

  semantic: semanticIntent,

  temporal: temporalAnalysis,

  finalDecision: {

    viable:
      temporalAnalysis.viable,

    reasons:
      temporalAnalysis.reasons

  }

}

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
