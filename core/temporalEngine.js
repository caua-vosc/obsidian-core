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

    // estimativas REAIS
    const gymDuration = 90 // minutos
    const transportBuffer = 40 // ida + volta

    // academia fecha
    const gymCloseHour = 23

    // evento cinema
    const cinemaEvent =
      events.find(e =>
        e.title?.toLowerCase().includes("cinema")
      )

    if (cinemaEvent?.event_date) {

      const cinemaDate =
        new Date(cinemaEvent.event_date)

      // estimativa realista
      const movieDuration = 130

      const movieEnd =
        new Date(
          cinemaDate.getTime() +
          movieDuration * 60000
        )

      const arrivalHome =
        new Date(
          movieEnd.getTime() +
          40 * 60000
        )

      const latestPossibleGym =
        new Date(
          arrivalHome.getTime() +
          gymDuration * 60000
        )

      const closeTime =
        new Date(arrivalHome)

      closeTime.setHours(
        gymCloseHour,
        0,
        0,
        0
      )

      // =====================================
      // NÃO DÁ TEMPO
      // =====================================

      if (
        latestPossibleGym > closeTime
      ) {

        result.viable = false

        result.confidence = "high"

        result.reasons.push(
          "O treino terminaria após o horário de fechamento da academia."
        )

        return result
      }

    }

  }

  return result
}
