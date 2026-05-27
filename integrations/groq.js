import axios from "axios";

export async function callGroq({
  model,
  messages,
  temperature = 0.7,
  max_tokens = 1200
}) {

  try {

    const response = await axios.post(

      "https://api.groq.com/openai/v1/chat/completions",

      {
        model,
        messages,
        temperature,
        max_tokens
      },

      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }

    );

    return response.data.choices[0].message.content;

  } catch (error) {

    console.log("GROQ ERROR:");
    console.log(error?.response?.data || error.message);

    throw error;

  }

}
