import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =================================
// MODELS
// =================================

const MODELS = [

  "llama-3.3-70b-versatile",

  "gemma2-9b-it"

];

// =================================
// ROOT
// =================================

app.get("/", (req, res) => {

  res.json({

    status: "Obsidian Core Online",
    provider: "Groq",
    models: MODELS.length

  });

});

// =================================
// CHAT
// =================================

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    let response = null;
    let usedModel = null;

    for (const model of MODELS) {

      try {

        console.log("Tentando:", model);

        const completion = await axios.post(

          "https://api.groq.com/openai/v1/chat/completions",

          {

            model,

            messages: [

              {
                role: "system",
                content:
                  "Você é Obsidian, uma IA pessoal inteligente."
              },

              {
                role: "user",
                content: message
              }

            ]

          },

          {

            headers: {

              Authorization:
                `Bearer ${process.env.GROQ_API_KEY}`,

              "Content-Type": "application/json"

            }

          }

        );

        response =
          completion.data.choices[0].message.content;

        usedModel = model;

        break;

      } catch (err) {

        console.log(
          err?.response?.data || err.message
        );

      }

    }

    if (!response) {

      response =
        "Nenhum modelo respondeu.";

    }

    res.json({

      success: true,
      model: usedModel,
      response

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});

// =================================
// START
// =================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on ${PORT}`);

});
