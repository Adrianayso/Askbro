const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // show user message
  chatBox.innerHTML += `<div class="message user">${userMessage}</div>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // loading text
  const loading = document.createElement("div");
  loading.classList.add("message", "ai");
  loading.textContent = "AskBro is thinking...";
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // send the user's message to your local backend
    const response = await fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    console.log("Gemini response:", data);

    // extract AI reply safely
    const aiReply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      "Sorry, I didn’t understand that.";

    loading.innerHTML = aiReply.replace(/\n/g, "<br>");
  } catch (err) {
    loading.textContent =
      "Error connecting to AskBro. Please make sure the server is running.";
    console.error(err);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
