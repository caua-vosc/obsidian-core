export function reasoningEngine({

  semanticIntent,

  filteredContext,

  temporal,

  constraints,

  webData

}) {

  return {

    semanticIntent,

    filteredContext,

    temporal,

    constraints,

    webData,

    final_decision: {

      viable:
        !constraints.blocked,

      confidence:
        "high"

    }

  };

}
