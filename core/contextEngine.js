export function filterContext({

  semanticIntent,
  events,
  tasks,
  finances,
  history,
  behavior

}) {

  const context = {};

  switch (semanticIntent.intent) {

    case "schedule_analysis":

      context.events = events;
      context.tasks = tasks;

      break;

    case "financial_analysis":

      context.finances = finances;

      break;

    case "decision":

      context.events = events;
      context.tasks = tasks;
      context.finances = finances;
      context.behavior = behavior;

      break;

    case "behavioral_analysis":

      context.history = history;
      context.behavior = behavior;

      break;

    default:

      context.events = events;
      context.tasks = tasks;
      context.finances = finances;

  }

  return context;
}
