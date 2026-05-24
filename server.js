import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.json({
    status: "Obsidian Core Online"
  });
});

app.post("/chat", async (req, res) => {

  try {

    const {
      user_id,
      message
    } = req.body;

    // HISTÓRICO

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // MEMÓRIAS

    const { data: memories } = await supabase
      .from("ai_memory")
      .select("*")
      .eq("user_id", user_id)
      .limit(10);

    // TAREFAS

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id)
      .eq("completed", false);

    // EVENTOS

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    // FINANÇAS

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id)
      .limit(20);

    // PROMPT CONTEXTUAL

    const prompt = `
Você é Obsidian, uma IA pessoal extremamente inteligente.

Você possui:
- memória persistente
- acesso à agenda
- acesso às tarefas
- acesso às finanças
- análise comportamental

Seu objetivo:
- organizar a vida do usuário
- responder dúvidas
- ajudar decisões
- agir como copiloto pessoal

MEMÓRIAS:
${JSON.stringify(memories)}

TAREFAS:
${JSON.stringify(tasks)}

AGENDA:
${JSON.stringify(events)}

FINANÇAS:
${JSON.stringify(finances)}

HISTÓRICO:
${JSON.stringify(history)}

USUÁRIO:
${message}
`;

    // OPENROUTER

    const completion = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "Você é Obsidian."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const response =
      completion.data.choices[0].message.content;

    // SALVAR USER

    await supabase
      .from("messages")
      .insert({
        conversation_id: null,
        role: "user",
        content: message
      });

    // SALVAR IA

    await supabase
      .from("messages")
      .insert({
        conversation_id: null,
        role: "assistant",
        content: response
      });

    res.json({
      success: true,
      response
    });

  } catch (error) {

    console.error(error?.response?.data || error);

    res.status(500).json({
      success: false,
      error: error?.response?.data || error.message
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Obsidian rodando na porta ${PORT}`);
});
