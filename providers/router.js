import axios from "axios";

const MODELS = [

  "llama-3.3-70b-versatile",

  "qwen-qwq-32b",

  "qwen-2.5-32b",

  "llama-3.1-8b-instant",

  "gemma2-9b-it",

  "llama3-8b-8192"

];

// ======================================
// FAST MODEL
// ======================================

export async function askFastModel(messages) {

  try {

    const response = await axios.post(

      "https://api.groq.com/openai/v1/chat/completions",

      {

        model: "llama-3.1-8b-instant",

        temperature: 0.1,

        messages

      },

      {

        headers: {

          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,

          "Content-Type":
            "application/json"

        }

      }

    );

    return response.data.choices[0].message.content;

  } catch (error) {

    console.log(error?.response?.data || error.message);

    return "{}";

  }

}

// ======================================
// MAIN MODEL
// ======================================

export async function askMainModel(messages) {

  for (const model of MODELS) {

    try {

      console.log("Tentando:", model);

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

            "Content-Type":
              "application/json"

          }

        }

      );

      console.log("Modelo ativo:", model);

      return {

        model,

        response:
          response.data.choices[0].message.content

      };

    } catch (error) {

      console.log(
        "Falha:",
        model
      );

      console.log(
        error?.response?.data || error.message
      );

    }

  }

  return {

    model: null,

    response:
      "Nenhum modelo conseguiu responder."

  };

}
