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
      "Restrição temporal detectada."
    );

  }

  if (balance < 20) {

    constraints.reasons.push(
      "Saldo muito baixo."
    );

  }

  if (emotionalState === "exhausted") {

    constraints.reasons.push(
      "Fadiga detectada."
    );

  }

  return constraints;

}
