const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const promptTitle = document.getElementById("prompt-title");

async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Remove prompt title on first message
  if (promptTitle) {
    promptTitle.remove();
  }

  // Show user message
  chatBox.innerHTML += `<div class="message user">${userMessage}</div>`;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Loading message
  const loading = document.createElement("div");
  loading.classList.add("message", "ai");
  loading.textContent = "AskBro is thinking...";
  chatBox.appendChild(loading);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    console.log("AI response:", data);

    const aiReply =
      data?.reply ||
      data?.error ||
      "Sorry, I didn’t understand that.";

    loading.innerHTML = aiReply.replace(/\n/g, "<br>");
  } catch (err) {
    loading.textContent =
      "This site is a demo project. Live server features are currently disabled.";
    console.error(err);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

