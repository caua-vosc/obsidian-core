import axios from "axios";
    }

  );

  return response.data.choices[0].message.content;

}

export async function askMainModel(messages) {

  for (const model of MODELS) {

    try {

      const response = await axios.post(

        "https://api.groq.com/openai/v1/chat/completions",

        {

          model,

          temperature: 0.6,

          max_tokens: 1200,

          messages

        },

        {

          headers: {

            Authorization:
              `Bearer ${process.env.GROQ_API_KEY}`,

            "Content-Type": "application/json"

          }

        }

      );

      return {

        model,

        response:
          response.data.choices[0].message.content

      };

    } catch {}

  }

  return {

    model: null,

    response:
      "Nenhum modelo conseguiu responder."

  };

}
