export function temporalReasoning({

  events,

  gymClosingHour = 23,

  workoutMinutes = 75,

  travelMinutes = 30

}) {

  const result = {

    viable: true,

    reasoning: []

  };

  if (!events || events.length === 0) {

    return result;

  }

  const nextEvent = events[0];

  if (!nextEvent.event_date) {

    return result;

  }

  const eventDate =
    new Date(nextEvent.event_date);

  const eventEndHour =
    eventDate.getHours() + 2;

  const arrivalHour =
    eventEndHour + (travelMinutes / 60);

  const availableHours =
    gymClosingHour - arrivalHour;

  if (availableHours < (workoutMinutes / 60)) {

    result.viable = false;

    result.reasoning.push(
      "Janela insuficiente para treino completo."
    );

  }

  return result;

}
