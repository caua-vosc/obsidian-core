import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoute);

app.get("/", (req, res) => {

  res.json({

    status: "OBSIDIAN ONLINE",
    cognition: true,
    orchestration: true,
    provider: "Groq"

  });

});

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("");
  console.log("================================");
  console.log("OBSIDIAN CORE ONLINE");
  console.log("COGNITIVE SYSTEM ACTIVE");
  console.log("================================");
  console.log("");

});
