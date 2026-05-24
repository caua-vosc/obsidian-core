import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// MODELS
// =======================

const AI_MODELS = [
  "openai/gpt-4o-mini"
];

// =======================
// ROOT
// =======================

app.get("/", (req, res) => {

  res.json({
    status: "Obsidian Core Online"
  });

});

// =======================
// CHAT
// =======================

app.post("/chat", async (req, res) => {

  try {

    const { message } = req.body;

    let response = null;

    for (const model of AI_MODELS) {

      try {

        const completion = await axios.post(

          "https://openrouter.ai/api/v1/chat/completions",

          {

            model,

            messages: [

              {
                role: "user",
                content: message
              }

            ]

          },

          {

            headers: {

              Authorization:
                `Bearer ${process.env.OPENROUTER_API_KEY}`,

              "Content-Type": "application/json"

            }

          }

        );

        response =
          completion.data.choices[0].message.content;

        break;

      } catch (err) {

        console.log("ERRO OPENROUTER:");

console.log(
  JSON.stringify(
    err?.response?.data || err.message,
    null,
    2
  )
);

      }

    }

    res.json({

      success: true,

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

// =======================
// START
// =======================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`Server running on ${PORT}`);

});
