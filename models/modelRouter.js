export function selectModel(intent = {}) {

  if (intent.requiresDeepReasoning) {

    return "qwen-qwq-32b";

  }

  if (intent.requiresFastResponse) {

    return "llama-3.1-8b-instant";

  }

  return "llama-3.3-70b-versatile";

}
