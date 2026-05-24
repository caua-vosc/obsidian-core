import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
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

    // BUSCAR ÚLTIMAS MENSAGENS

    const { data: history } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // BUSCAR MEMÓRIA

    const { data: memories } = await supabase
      .from("ai_memory")
      .select("*")
      .eq("user_id", user_id)
      .order("importance", { ascending: false })
      .limit(10);

    // BUSCAR TAREFAS

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user_id)
      .eq("completed", false);

    // BUSCAR EVENTOS

    const { data: events } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user_id);

    // BUSCAR FINANÇAS

    const { data: finances } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("user_id", user_id)
      .limit(20);

    // CONTEXTO

    const prompt = `
Você é Obsidian, uma IA pessoal contextual extremamente inteligente.

Você possui:
- memória persistente
- acesso à agenda
- acesso às finanças
- acesso às tarefas
- análise comportamental

Seu objetivo:
- ajudar o usuário
- organizar sua vida
- responder dúvidas
- sugerir melhorias
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

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(prompt);

    const response = result.response.text();

    // SALVAR MENSAGEM USUÁRIO

    await supabase
      .from("messages")
      .insert({
        conversation_id: null,
        role: "user",
        content: message
      });

    // SALVAR RESPOSTA IA

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

    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message
    });

  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Obsidian rodando na porta ${PORT}`);
});
