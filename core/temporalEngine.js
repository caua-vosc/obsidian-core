export function temporalReasoning({
  events,
  tasks,
  userMessage
}) {

  const result = {
    viable: true,
    confidence: "high",
    reasons: [],
    suggested_window: null
  }

  const lower =
    userMessage.toLowerCase()

  // =====================================
  // ACADEMIA
  // =====================================

  const askingGym =
    lower.includes("academia")

  if (askingGym) {

    // duração treino
    const gymDuration = 90

    // deslocamento total
    const transportBuffer = 40

    // academia fecha
    const gymCloseHour = 23

    // procurar evento cinema
    const cinemaEvent =
      events.find(e =>
        e.title?.toLowerCase().includes("cinema")
      )

    if (cinemaEvent?.event_date) {

      const cinemaDate =
        new Date(cinemaEvent.event_date)

      // duração média filme
      const movieDuration = 130

      // fim do filme
      const movieEnd =
        new Date(
          cinemaDate.getTime() +
          movieDuration * 60000
        )

      // chegada em casa
      const arrivalHome =
        new Date(
          movieEnd.getTime() +
          transportBuffer * 60000
        )

      // horário final treino
      const endGym =
        new Date(
          arrivalHome.getTime() +
          gymDuration * 60000
        )

      // fechamento academia
      const closeTime =
        new Date(arrivalHome)

      closeTime.setHours(
        gymCloseHour,
        0,
        0,
        0
      )

      // =====================================
      // CONFLITO
      // =====================================

      if (endGym > closeTime) {

        result.viable = false

        result.confidence = "high"

        result.reasons.push(
          "O treino terminaria após o fechamento da academia."
        )

      }

    }

  }

  return result

}
