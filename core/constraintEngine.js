export function validateConstraints({

  temporal,
  balance,
  emotionalState

}) {

  const constraints = {

    blocked: false,

    reasons: []

  };

  if (!temporal.viable) {

    constraints.blocked = true;

    constraints.reasons.push(
      "Tempo operacional insuficiente."
    );

  }

  if (balance < 20) {

    constraints.reasons.push(
      "Saldo extremamente baixo."
    );

  }

  if (emotionalState === "exhausted") {

    constraints.reasons.push(
      "Estado emocional indica fadiga elevada."
    );

  }

  return constraints;
}
