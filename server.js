import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { cognitiveOrchestrator }
from "./orchestrator/cognitiveOrchestrator.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ======================================
// ROOT
// ======================================

app.get("/", (req, res) => {

  res.json({

    status: "OBSIDIAN CORE ONLINE",
    cognition: true,
    orchestrator: true,
    agents: true

  });

});

// ======================================
// CHAT
// ======================================

app.post("/chat", async (req, res) => {

  try {

    const {

      message

    } = req.body;

    const cognition =
      await cognitiveOrchestrator({

        message,

        memory: {},

        realtime: {}

      });

    res.json({

      success: true,

      model: cognition.model,

      semantic: cognition.semantic,

      response: cognition.response

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,
      error: error.message

    });

  }

});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("================================");
  console.log("OBSIDIAN CORE ONLINE");
  console.log("COGNITIVE ORCHESTRATOR ACTIVE");
  console.log("================================");

});
