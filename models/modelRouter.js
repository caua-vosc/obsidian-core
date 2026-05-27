// ========================================
// OBSIDIAN MODEL ROUTER
// Dynamic Cognitive Model Selection
// ========================================

const MODELS = {

  // ====================================
  // EXECUTIVE MODELS
  // ====================================

  EXECUTIVE:
    "llama-3.3-70b-versatile",

  FAST:
    "llama-3.1-8b-instant",

  REASONING:
    "qwen-qwq-32b",

  BALANCED:
    "qwen-2.5-32b",

  ECONOMY:
    "gemma2-9b-it",

  FALLBACK:
    "llama3-8b-8192"

};

// ========================================
// COMPLEXITY SCORING
// ========================================

function calculateComplexity(intent = {}) {

  let score = 0;

  if (intent.requiresDeepReasoning)
    score += 4;

  if (intent.requiresFinancial)
    score += 2;

  if (intent.requiresTemporal)
    score += 1;

  if (intent.requiresBehavioral)
    score += 2;

  if (intent.requiresWebSearch)
    score += 2;

  if (
    intent.priority === "high"
  )
    score += 1;

  return score;

}

// ========================================
// MODEL ROUTER
// ========================================

export function selectModel(intent = {}) {

  const complexity =
    calculateComplexity(intent);

  // ====================================
  // FAST LOW COMPLEXITY
  // ====================================

  if (
    complexity <= 1
  ) {

    return {

      model: MODELS.FAST,

      reasoning: "fast_response"

    };

  }

  // ====================================
  // DEEP REASONING
  // ====================================

  if (
    complexity >= 6
  ) {

    return {

      model: MODELS.REASONING,

      reasoning: "deep_reasoning"

    };

  }

  // ====================================
  // BALANCED ANALYSIS
  // ====================================

  if (
    complexity >= 3
  ) {

    return {

      model: MODELS.BALANCED,

      reasoning: "balanced_analysis"

    };

  }

  // ====================================
  // DEFAULT EXECUTIVE
  // ====================================

  return {

    model: MODELS.EXECUTIVE,

    reasoning: "executive_response"

  };

}

// ========================================
// FALLBACK SYSTEM
// ========================================

export function getFallbackModels() {

  return [

    MODELS.EXECUTIVE,

    MODELS.BALANCED,

    MODELS.REASONING,

    MODELS.FAST,

    MODELS.ECONOMY,

    MODELS.FALLBACK

  ];

}
