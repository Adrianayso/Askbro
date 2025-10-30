const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // ✅ correct import for CommonJS

const app = express();
app.use(cors());
app.use(bodyParser.json());

const GEMINI_API_KEY = "AIzaSyB76QfqN-zjJAEVV9M4-TN89_xXTmMxbIA"; // replace with your actual Gemini API key

app.post("/ask", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response:", data);
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));

