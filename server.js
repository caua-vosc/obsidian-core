import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";
import voiceRoute from "./routes/voice.js";
import automationRoute from "./routes/automation.js";
import whatsappRoute from "./routes/whatsapp.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

  res.json({

    status: "OBSIDIAN ONLINE",

    cognition: "ACTIVE",

    architecture: "COGNITIVE",

    reasoning: true,

    orchestration: true,

    semantic_analysis: true,

    web_intelligence: true,

    temporal_reasoning: true

  });

});

app.use("/chat", chatRoute);
app.use("/voice", voiceRoute);
app.use("/automation", automationRoute);
app.use("/whatsapp", whatsappRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("================================");
  console.log("OBSIDIAN COGNITIVE CORE ONLINE");
  console.log("================================");

});
