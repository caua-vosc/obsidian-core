import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {

  res.json({

    status: "OBSIDIAN ONLINE",

    cognition: true,

    orchestration: true,

    semantic_reasoning: true,

    temporal_reasoning: true,

    web_intelligence: true

  });

});

app.use("/chat", chatRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("================================");
  console.log("OBSIDIAN ONLINE");
  console.log("================================");

});
