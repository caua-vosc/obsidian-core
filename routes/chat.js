import express from "express";
        {

          role: "system",

          content:
            buildSystemPrompt()

        },

        {

          role: "user",

          content: `

MENSAGEM:
${message}

COGNIÇÃO:
${JSON.stringify(cognition, null, 2)}

`

        }

      ]);

    // SAVE USER

    await supabase
      .from("messages")
      .insert({

        user_id,

        role: "user",

        content: message

      });

    // SAVE AI

    await supabase
      .from("messages")
      .insert({

        user_id,

        role: "assistant",

        content: completion.response

      });

    res.json({

      success: true,

      model:
        completion.model,

      semantic_intent:
        semanticIntent,

      cognition,

      response:
        completion.response

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});

export default router;
