import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzmCtbUAYH4VhbLj-Shh4SaVkS08KehhA",
  authDomain: "askbro-f579f.firebaseapp.com",
  projectId: "askbro-f579f",
  storageBucket: "askbro-f579f.firebasestorage.app",
  messagingSenderId: "472432054781",
  appId: "1:472432054781:web:d0a5f6bc1f09ee1e344994",
  measurementId: "G-41HEEHVLGF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("userInput");
const chatHistoryEl = document.getElementById("chatHistory");
const userNameEl = document.getElementById("userName");
const newChatBtn = document.getElementById("newChatBtn");


// ================= PROTECT PAGE =================
if (localStorage.getItem("askbro_loggedin") !== "true") {
  window.location.href = "login.html";
}


// ================= USER INFO =================
const username = localStorage.getItem("askbro_username") || "bro";
const storageKey = `askbro_chats_${username}`;

if (userNameEl) userNameEl.textContent = username;


// ================= CHAT STORAGE =================
let chats = JSON.parse(localStorage.getItem(storageKey)) || [];
let activeChatIndex = null;


// ================= SIDEBAR ELEMENTS =================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const logoHome = document.getElementById("logoHome");


// ================= CREATE NEW CHAT =================
function createNewChat() {

  const newChat = {
    title: "New Chat",
    messages: []
  };

  chats.push(newChat);
  activeChatIndex = chats.length - 1;

  localStorage.setItem(storageKey, JSON.stringify(chats));

  renderHistory();
  loadActiveChat();

  // SHOW PROMPTS AGAIN
  const prompts = document.querySelector(".prompt-suggestions");
  if (prompts) {
    prompts.style.display = "flex";
  }

}


// ================= DELETE CHAT =================
function deleteChat(index) {

  chats.splice(index, 1);

  if (activeChatIndex === index) {
    activeChatIndex = null;
    chatBox.innerHTML = "";
  } 
  else if (activeChatIndex > index) {
    activeChatIndex--;
  }

  localStorage.setItem(storageKey, JSON.stringify(chats));
  renderHistory();
}


// ================= RIGHT CLICK MENU =================
function showContextMenu(x, y, index) {

  const existing = document.getElementById("chatContextMenu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.id = "chatContextMenu";

  menu.style.position = "fixed";
  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.background = "#020617";
  menu.style.border = "1px solid #1f2937";
  menu.style.padding = "8px 0";
  menu.style.borderRadius = "8px";
  menu.style.zIndex = "1000";
  menu.style.minWidth = "130px";

  const deleteOption = document.createElement("div");
  deleteOption.textContent = "Delete chat";
  deleteOption.style.padding = "8px 14px";
  deleteOption.style.cursor = "pointer";
  deleteOption.style.color = "#f87171";

  deleteOption.addEventListener("mouseenter", () => {
    deleteOption.style.background = "#1e293b";
  });

  deleteOption.addEventListener("mouseleave", () => {
    deleteOption.style.background = "transparent";
  });

  deleteOption.onclick = () => {
    deleteChat(index);
    menu.remove();
  };

  menu.appendChild(deleteOption);
  document.body.appendChild(menu);

  document.addEventListener("click", () => {
    menu.remove();
  }, { once: true });
}


// ================= RENDER SIDEBAR =================
function renderHistory() {

  chatHistoryEl.innerHTML = "";

  chats.forEach((chat, index) => {

    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = chat.title;

    div.addEventListener("click", () => {
      activeChatIndex = index;
      loadActiveChat();
      highlightActive();
    });

    div.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      showContextMenu(e.clientX, e.clientY, index);
    });

    chatHistoryEl.appendChild(div);

  });

  highlightActive();
}


// ================= HIGHLIGHT ACTIVE =================
function highlightActive() {

  const items = document.querySelectorAll(".chat-item");

  items.forEach((item, index) => {

    item.style.background =
      index === activeChatIndex ? "#1e293b" : "#020617";

  });

}


// ================= LOAD CHAT =================
function loadActiveChat() {

  if (activeChatIndex === null) {
    chatBox.innerHTML = "";
    return;
  }

  chatBox.innerHTML = chats[activeChatIndex].messages.join("");
  chatBox.scrollTop = chatBox.scrollHeight;

}


// ================= ESCAPE HTML =================
function escapeHTML(text) {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


// ================= AI TYPING ANIMATION =================
function typeMessage(element, html, callback) {

  let index = 0;
  const speed = 15;

  function type() {

    element.innerHTML = html.slice(0, index);
    index++;

    chatBox.scrollTop = chatBox.scrollHeight;

    if (index <= html.length) {
      setTimeout(type, speed);
    } else {
      if (callback) callback();
    }

  }

  type();
}


// ================= SEND MESSAGE =================
async function sendMessage() {

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // HIDE PROMPTS WHEN MESSAGE IS SENT (TEXT OR MIC)
  const prompts = document.querySelector(".prompt-suggestions");
  if (prompts) prompts.style.display = "none";

  if (activeChatIndex === null) {
    createNewChat();
  }

  const currentChat = chats[activeChatIndex];

  const userHTML = `<div class="message user">${userMessage}</div>`;
  chatBox.innerHTML += userHTML;

  input.value = "";

  const loading = document.createElement("div");
  loading.className = "message ai";
  loading.innerHTML = `
  <div class="typing">
  <span></span>
  <span></span>
  <span></span>
  </div>`;

  chatBox.appendChild(loading);


  // Philippines time
  const now = new Date();

  const options = {
    timeZone: "Asia/Manila",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  };

  const formatted = new Intl.DateTimeFormat("en-PH", options).format(now);
  const [weekday, date, time] = formatted.split(", ");
  const context = { weekday, date, time };


  try {

    const response = await fetch("https://askbro.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userMessage,
        username,
        context
      })
    });

    const data = await response.json();


    let safeReply = escapeHTML(data.reply);

    safeReply = safeReply.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");
    safeReply = safeReply.replace(/\n/g, "<br>");

    const aiDiv = document.createElement("div");
    aiDiv.className = "message ai";

    loading.replaceWith(aiDiv);


    typeMessage(aiDiv, safeReply, async () => {

  const aiHTML = `<div class="message ai">${safeReply}</div>`;

  // SAVE CHAT TO FIREBASE
  try {
    await addDoc(collection(db, "chats"), {
      user: username,
      message: userMessage,
      reply: safeReply,
      time: new Date()
    });
  } catch (err) {
    console.error("Firestore save error:", err);
  }

  if (currentChat.title === "New Chat") {
    currentChat.title = userMessage.slice(0, 30);
  }

  currentChat.messages.push(userHTML, aiHTML);

  localStorage.setItem(storageKey, JSON.stringify(chats));

  renderHistory();

});

  } catch {

    loading.textContent = "AskBro is offline.";

  }

  chatBox.scrollTop = chatBox.scrollHeight;

}


// ================= EVENTS =================
input.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

if (newChatBtn) {

  newChatBtn.addEventListener("click", () => {
    createNewChat();
  });

}


// ================= SIDEBAR TOGGLE =================
if (menuToggle) {

  menuToggle.addEventListener("click", () => {

    sidebar.classList.toggle("open");
    sidebar.classList.toggle("closed");

    main.classList.toggle("full");

  });

}


// ================= LOGO BEHAVIOR =================
if (logoHome) {

  logoHome.addEventListener("click", () => {

    // use same toggle behavior as menu button
    if (sidebar && main) {

      sidebar.classList.remove("open");
      sidebar.classList.add("closed");

      main.classList.add("full");

    }

    // return to home chat
    activeChatIndex = null;
    chatBox.innerHTML = "";

    const title = document.getElementById("prompt-title");
    if (title) title.style.display = "block";

    // SHOW PROMPTS AGAIN
    const prompts = document.querySelector(".prompt-suggestions");
    if (prompts) prompts.style.display = "flex";

    highlightActive();

  });

}

// ================= INITIAL LOAD =================
renderHistory();

if (chats.length > 0) {
  activeChatIndex = chats.length - 1;
  loadActiveChat();
}

// ================= PROMPT BUTTON =================

function usePrompt(text){

// put prompt text in input
input.value = text;

// focus input
input.focus();

// hide prompts after clicking
const prompts = document.querySelector(".prompt-suggestions");

if(prompts){
prompts.style.display = "none";
}

}

// ================= VOICE RECOGNITION =================

let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

recognition = new SpeechRecognition();

recognition.lang = "en-US";
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = function(event){

const transcript = event.results[0][0].transcript;

input.value = transcript;

// hide prompts when using voice
const prompts = document.querySelector(".prompt-suggestions");
if(prompts){
  prompts.style.display = "none";
}

// automatically send after speaking
sendMessage();

};

recognition.onerror = function(event){

console.log("Voice error:", event.error);

};

}

function startVoice(){

if(!recognition){
alert("Voice recognition not supported in this browser.");
return;
}

recognition.start();

}

window.sendMessage = sendMessage;
window.usePrompt = usePrompt;
window.startVoice = startVoice;