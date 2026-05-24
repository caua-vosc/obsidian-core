export function reasoningEngine({

  semanticIntent,
  filteredContext,
  temporal,
  constraints,
  webData

}) {

  return {

    intent: semanticIntent,

    context: filteredContext,

    temporal_analysis: temporal,

    constraints,

    web_data: webData,

    final_reasoning: {

      viable:
        !constraints.blocked,

      confidence:
        "high"

    }

  };

}
