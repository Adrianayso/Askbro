const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// TEST
app.get("/", (req, res) => {
  res.send("AskBro AI server is running.");
});

// 🔐 API key from Render environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Route for AI requests
app.post("/ask", async (req, res) => {

  const { message, username, context } = req.body;

  try {

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
You are AskBro, an AI assistant that helps students with school work and programming.

User name: ${username}

Location: Philippines (Asia/Manila)
Today is ${context?.weekday}, ${context?.date}
Current time: ${context?.time}

IMPORTANT RULES:

• If the user asks for programming help, ALWAYS generate working code.
• Provide FULL code examples when asked.
• Format code using triple backticks with the language.

Example format:

\`\`\`html
<!DOCTYPE html>
<html>
<head>
<title>Example</title>
</head>
<body>

<h1>Hello World</h1>

</body>
</html>
\`\`\`

After giving the code, explain it briefly.

Talk casually and friendly like a helpful coding buddy.
Use the user's name sometimes.
Never guess the date or time.
`.trim()
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    const aiText =
      data?.choices?.[0]?.message?.content ||
      "Sorry bro, something went wrong.";

    res.json({ reply: aiText });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      reply: "AskBro is offline"
    });

  }

});


// IMPORTANT: Render uses dynamic ports
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});