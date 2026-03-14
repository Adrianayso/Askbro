const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const promptTitle = document.getElementById("prompt-title");


function usePrompt(text){

input.value = text;

const prompts = document.querySelector(".prompt-suggestions");
if(prompts) prompts.style.display = "none";

promptTitle.remove();

input.focus();

}



function typeMessage(element, text, speed = 15) {

let i = 0;
element.innerHTML = "";

function typing(){

if(i < text.length){

if(text.charAt(i) === "\n"){
element.innerHTML += "<br>";
}
else{
element.innerHTML += text.charAt(i);
}

i++;
chatBox.scrollTop = chatBox.scrollHeight;

setTimeout(typing, speed);

}

}

typing();

}



async function sendMessage(){

const userMessage = input.value.trim();
if(!userMessage) return;

const prompts = document.querySelector(".prompt-suggestions");
if(prompts) prompts.style.display = "none";

if(promptTitle) promptTitle.remove();

const userDiv = document.createElement("div");
userDiv.classList.add("message","user");
userDiv.textContent = userMessage;
chatBox.appendChild(userDiv);

input.value="";

const loading = document.createElement("div");
loading.classList.add("message","ai");

loading.innerHTML=`
<div class="typing">
<span></span>
<span></span>
<span></span>
</div>
`;

chatBox.appendChild(loading);

chatBox.scrollTop = chatBox.scrollHeight;

try{

const response = await fetch("https://askbro.onrender.com/ask", {

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:userMessage})

});

const data = await response.json();

const aiReply =
data?.reply ||
data?.error ||
"Sorry, I didn’t understand that.";

typeMessage(loading, aiReply);

}
catch(err){

loading.textContent="AskBro is currently offline.";

}

}



sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress",(e)=>{
if(e.key==="Enter") sendMessage();
});



/* VOICE */

let recognition;

if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window){

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

recognition = new SpeechRecognition();

recognition.lang="en-US";
recognition.continuous=false;
recognition.interimResults=false;

recognition.onresult=function(event){

const transcript = event.results[0][0].transcript;

input.value = transcript;

sendMessage();

};

}



function startVoice(){

if(!recognition){

alert("Voice recognition not supported in this browser.");
return;

}

recognition.start();

}