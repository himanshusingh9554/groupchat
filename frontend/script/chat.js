
const socket = io("http://localhost:3000");

const chatForm = document.getElementById("chat-form");
const messageBox = document.getElementById("message-box");

let lastIndex = 0;


window.addEventListener("DOMContentLoaded", loadChatHistory);

async function loadChatHistory() {
  const friendId = localStorage.getItem("chat"); 
  if (!friendId) {
    alert("No friend selected for chat");
    return;
  }

  try {
    
    const res = await axios.post(
      api + "message/all",
      { to: friendId, skip: 0 },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const { messages, user } = res.data.data; 

    if (messages.length === 0) {
      console.log("No messages found");
    messageBox.innerHTML = "";
    }
  
    messages.forEach((msg) => {
      const isSender = Number(msg.userId) === Number(user);
      appendMessage({ message: msg.message, sender: isSender });
      if (msg.id > lastIndex) lastIndex = msg.id;
    });

    setInterval(fetchNewMessages, 1000);
  } catch (err) {
    console.error("Error loading chat history:", err);
  }
}

async function fetchNewMessages() {
  const friendId = localStorage.getItem("chat");
  if (!friendId) return;

  try {
    const res = await axios.post(
      api + "message/all",
      { to: friendId, skip: lastIndex },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );

    const { messages, user } = res.data.data;
    if (messages.length) {
      messages.forEach((msg) => {
        const isSender = Number(msg.userId) === Number(user);
        appendMessage({ message: msg.message, sender: isSender });
        if (msg.id > lastIndex) lastIndex = msg.id;
      });
    }
  } catch (err) {
    console.error("Error fetching new messages:", err);
  }
}

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = chatForm.message.value.trim();
  if (!input) return;

  socket.emit("sendMessage", {
    message: input,
    toUser: Number(localStorage.getItem("chat")),
  });

  try {
    await axios.post(
      api + "message",
      { message: input, to: localStorage.getItem("chat") },
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
  } catch (err) {
    console.error("Failed to store message:", err);
  }

  chatForm.message.value = "";
});


function appendMessage(data) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message");

  if (data.sender) {
    msgDiv.classList.add("sender");
    msgDiv.innerText = `You: ${data.message}`;
  } else {
    msgDiv.classList.add("receiver");
    msgDiv.innerText = `Friend: ${data.message}`;
  }

  messageBox.appendChild(msgDiv);

  messageBox.scrollTop = messageBox.scrollHeight;
}


socket.on("connect", () => {
  console.log("Connected to Socket.IO server:", socket.id);
});
