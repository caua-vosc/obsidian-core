import express from "express"
import axios from "axios"

import { supabase } from "../lib/supabase.js"

import { semanticIntentAnalysis }
from "../core/semanticEngine.js"

import { filterContext }
from "../core/contextFilter.js"

import { temporalReasoning }
from "../core/temporalEngine.js"

import { buildSystemPrompt }
from "../core/responseEngine.js"

const router = express.Router()

// =====================================
// MODELOS
// =====================================

const MODELS = [

  "llama-3.3-70b-versatile",

  "qwen-qwq-32b",

  "qwen-2.5-32b",

  "llama-3.1-8b-instant",

  "gemma2-9b-it",

  "llama3-8b-8192"

]

// =====================================
// CHAT
// =====================================

router.post("/", async (req, res) => {

  try {

    const {
      user_id,
      message
    } = req.body

    // =====================================
    // LOAD HISTORY
    // =====================================

    const { data: history } =
      await supabase
        .from("messages")
        .select("*")
        .order("created_at", {
          ascending: false
        })
        .limit(20)

    // =====================================
    // LOAD TASKS
    // =====================================

    const { data: tasks } =
      await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user_id)

    // =====================================
    // LOAD EVENTS
    // =====================================

    const { data: events } =
      await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user_id)

    // =====================================
    // LOAD FINANCES
    // =====================================

    const { data: finances } =
      await supabase
        .from("financial_transactions")
        .select("*")
        .eq("user_id", user_id)

    // =====================================
    // BALANCE
    // =====================================

    let income = 0
    let expenses = 0

    finances?.forEach(item => {

      if (item.type === "income") {
        income += Number(item.amount)
      }

      if (item.type === "expense") {
        expenses += Number(item.amount)
      }

    })

    const balance =
      income - expenses

    // =====================================
    // EMOTIONAL STATE
    // =====================================

    let emotionalState = "neutral"

    const lower =
      message.toLowerCase()

    if (
      lower.includes("triste") ||
      lower.includes("desanimado")
    ) {

      emotionalState = "sad"

    }

    if (
      lower.includes("ansioso") ||
      lower.includes("preocupado")
    ) {

      emotionalState = "anxious"

    }

    if (
      lower.includes("feliz") ||
      lower.includes("motivado")
    ) {

      emotionalState = "happy"

    }

    // =====================================
    // SEMANTIC INTENT
    // =====================================

    const semanticIntent =
      await semanticIntentAnalysis(message)

    // =====================================
    // CONTEXT FILTER
    // =====================================

    const filteredContext =
      filterContext({

        semanticIntent,

        events,

        tasks,

        finances,

        history

      })

    // =====================================
    // CONSTRAINTS
    // =====================================

    const constraints = {

      blocked: false,

      reasons: []

    }

    if (
      semanticIntent.requires_financial_analysis
    ) {

      if (balance <= 0) {

        constraints.blocked = true

        constraints.reasons.push(
          "Saldo insuficiente."
        )

      }

    }

    // =====================================
    // TEMPORAL ENGINE
    // =====================================

    const temporal =
      temporalReasoning({

        events,

        tasks,

        userMessage: message

      })

    // =====================================
    // WEB DATA
    // =====================================

    let webData = null

    // =====================================
    // COGNITION
    // =====================================

    const cognition = {

      semanticIntent,

      filteredContext,

      temporal,

      constraints,

      webData,

      final_decision: {

        viable:
          temporal.viable &&
          !constraints.blocked,

        confidence: "high"

      }

    }

    // =====================================
    // USER PROMPT
    // =====================================

    const userPrompt = `

USUÁRIO:
${message}

DECISÃO FINAL:
${JSON.stringify(
  cognition.final_decision
)}

ANÁLISE TEMPORAL:
${JSON.stringify(
  temporal
)}

RESTRIÇÕES:
${JSON.stringify(
  constraints
)}

CONTEXTO RELEVANTE:
${JSON.stringify(
  filteredContext.relevant_data
)}

RESPONDA:
- de forma objetiva
- sem explicar demais
- sem parecer chatbot
- sem relatar análise interna

`

    // =====================================
    // MODEL ROUTER
    // =====================================

    let response = null
    let usedModel = null

    for (const model of MODELS) {

      try {

        const completion =
          await axios.post(

            "https://api.groq.com/openai/v1/chat/completions",

            {

              model,

              temperature: 0.4,

              max_tokens: 500,

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

          )

        response =
          completion
            .data
            .choices[0]
            .message
            .content

        usedModel = model

        break

      } catch (err) {

        console.log(
          "MODEL FAILED:",
          model
        )

      }

    }

    // =====================================
    // FALLBACK
    // =====================================

    if (!response) {

      response =
        "Nenhum modelo conseguiu responder."

    }

    // =====================================
    // SAVE USER MESSAGE
    // =====================================

    await supabase
      .from("messages")
      .insert({

        role: "user",

        content: message

      })

    // =====================================
    // SAVE AI MESSAGE
    // =====================================

    await supabase
      .from("messages")
      .insert({

        role: "assistant",

        content: response

      })

    // =====================================
    // RESPONSE
    // =====================================

    res.json({

      success: true,

      model: usedModel,

      balance,

      emotional_state:
        emotionalState,

      response

    })

  } catch (error) {

    console.log(error)

    res.status(500).json({

      success: false,

      error: error.message

    })

  }

})

export default router
