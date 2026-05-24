import express from "express";
import { createClient } from "@supabase/supabase-js";

import { analyzeIntent } from "../core/intentEngine.js";
import { filterContext } from "../core/contextEngine.js";
import { temporalReasoning } from "../core/temporalEngine.js";
import { validateConstraints } from "../core/constraintEngine.js";
import { reasoningEngine } from "../core/reasoningEngine.js";
import { buildSystemPrompt } from "../core/responseEngine.js";
import { webSearch } from "../core/webSearchEngine.js";

import { askMainModel } from "../providers/router.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.post("/", async (req, res) => {

  try {

    const {
      user_id,
      message
    } = req.body;

    // =====================================
    // MEMORY
    // =====================================

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", {
        ascending: false
      })
      .limit(20);

    // =====================================
    // TASKS
    // =====================================

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id);

    // =====================================
    // EVENTS
    // =====================================

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    // =====================================
    // FINANCES
    // =====================================

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id);

    // =====================================
    // SEMANTIC ANALYSIS
    // =====================================

    const semanticIntent =
      await analyzeIntent(message);

    // =====================================
    // CONTEXT FILTERING
    // =====================================

    const filteredContext =
      filterContext({

        semanticIntent,

        events,
        tasks,
        finances,
        history,
        message

      });

    // =====================================
    // TEMPORAL ENGINE
    // =====================================

    const temporal =
      temporalReasoning({

        events,

        currentHour:
          new Date().getHours()

      });

    // =====================================
    // FINANCIAL ANALYSIS
    // =====================================

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

    // =====================================
    // EMOTIONAL STATE
    // =====================================

    let emotionalState = "neutral";

    const lower =
      message.toLowerCase();

    if (
      lower.includes("cansado") ||
      lower.includes("exausto")
    ) {

      emotionalState = "exhausted";

    }

    if (
      lower.includes("feliz") ||
      lower.includes("animado")
    ) {

      emotionalState = "motivated";

    }

    // =====================================
    // CONSTRAINT ENGINE
    // =====================================

    const constraints =
      validateConstraints({

        temporal,

        balance,

        emotionalState

      });

    // =====================================
    // WEB INTELLIGENCE
    // =====================================

    const webData =
      semanticIntent.requires_web_search

      ? await webSearch(message)

      : null;

    // =====================================
    // REASONING ENGINE
    // =====================================

    const cognition =
      reasoningEngine({

        semanticIntent,

        filteredContext,

        temporal,

        constraints,

        webData

      });

    // =====================================
    // AI COMPLETION
    // =====================================

    const completion =
      await askMainModel([

        {

          role: "system",

          content: buildSystemPrompt()

        },

        {

          role: "user",

          content: `

USUÁRIO:
${message}

DECISÃO FINAL:
${JSON.stringify(cognition.final_decision)}

CONTEXTO RELEVANTE:
${JSON.stringify(filteredContext.relevant_data)}

RESTRIÇÕES:
${JSON.stringify(cognition.constraints)}

INSTRUÇÃO:

Responda SOMENTE a intenção principal do usuário.

Ignore completamente:
- domínios irrelevantes
- explicações longas
- análises desnecessárias
- recomendações genéricas

Entregue apenas:
- conclusão objetiva
- decisão
- resposta executiva

`

        }

      ]);

    // =====================================
    // SAVE USER MESSAGE
    // =====================================

    await supabase
      .from("messages")
      .insert({

        user_id,

        role: "user",

        content: message

      });

    // =====================================
    // SAVE AI MESSAGE
    // =====================================

    await supabase
      .from("messages")
      .insert({

        user_id,

        role: "assistant",

        content: completion.response

      });

    // =====================================
    // RESPONSE
    // =====================================

    res.json({

      success: true,

      model:
        completion.model,

      semantic_intent:
        semanticIntent,

      cognition,

      balance,

      emotional_state:
        emotionalState,

      response:
        completion.response

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});

export default router;
