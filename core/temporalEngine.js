export function temporalReasoning({

  events,
  currentHour,
  gymClosingHour = 23,
  estimatedTravelMinutes = 30,
  workoutMinimumMinutes = 75

}) {

  const result = {

    viable: true,

    reasoning: [],

    estimated_free_window: 0

  };

  const activeEvent = events?.[0];

  if (!activeEvent?.event_date) {

    return result;

  }

  const eventDate = new Date(activeEvent.event_date);

  const eventEndHour = eventDate.getHours() + 2;

  const estimatedArrival =
    eventEndHour + (estimatedTravelMinutes / 60);

  const remainingHours =
    gymClosingHour - estimatedArrival;

  result.estimated_free_window = remainingHours;

  if (remainingHours < (workoutMinimumMinutes / 60)) {

    result.viable = false;

    result.reasoning.push(
      "Janela operacional insuficiente para treino completo."
    );

  }

  return result;
}
