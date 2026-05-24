export function filterContext({

  semanticIntent,

  events,

  tasks,

  finances,

  history

}) {

  const context = {};

  switch (semanticIntent.intent) {

    case "financial_analysis":

      context.finances = finances;

      break;

    case "schedule_analysis":

      context.events = events;
      context.tasks = tasks;

      break;

    case "decision":

      context.events = events;
      context.tasks = tasks;
      context.finances = finances;

      break;

    default:

      context.events = events;
      context.tasks = tasks;
      context.finances = finances;

  }

  context.history = history;

  return context;

}
