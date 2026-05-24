export function filterContext({

  semanticIntent,

  events,

  tasks,

  finances,

  history,

  message

}) {

  const lower =
    message.toLowerCase();

  const context = {

    priority_domain: null,

    relevant_data: {},

    ignored_domains: []

  };

  // =====================================
  // TEMPORAL / SCHEDULE
  // =====================================

  if (

    lower.includes("academia") ||
    lower.includes("cinema") ||
    lower.includes("horário") ||
    lower.includes("tempo") ||
    lower.includes("agenda")

  ) {

    context.priority_domain =
      "temporal";

    context.relevant_data.events =
      events;

    context.relevant_data.tasks =
      tasks;

    context.ignored_domains.push(
      "financial"
    );

    return context;

  }

  // =====================================
  // FINANCIAL
  // =====================================

  if (

    lower.includes("dinheiro") ||
    lower.includes("saldo") ||
    lower.includes("gasto") ||
    lower.includes("comprar")

  ) {

    context.priority_domain =
      "financial";

    context.relevant_data.finances =
      finances;

    context.ignored_domains.push(
      "temporal"
    );

    return context;

  }

  // =====================================
  // DEFAULT
  // =====================================

  context.priority_domain =
    "general";

  context.relevant_data.events =
    events;

  context.relevant_data.tasks =
    tasks;

  context.relevant_data.finances =
    finances;

  context.relevant_data.history =
    history;

  return context;

}
