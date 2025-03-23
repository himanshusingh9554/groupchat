// groupchat.js
let chatForm = document.getElementById("chat-form");
let chatBox = document.getElementById("message-box");
let deleteGroupBtn = document.getElementById("delete-group-btn");

chatForm.addEventListener("submit", sendMessage);
deleteGroupBtn.addEventListener("click", deleteGroup);

let lastIndex = 0;




window.addEventListener("DOMContentLoaded", getAllMessages);

async function sendMessage(event) {
  event.preventDefault();
  const formData = new FormData(chatForm);
  let message = {};
  for (const [key, value] of formData.entries()) {
    message[key] = value;
  }
  const groupId = localStorage.getItem("groupChat");
  if (!groupId) {
    alert("Please Select a Group");
    window.location = "./friend.html";
    return;
  }
  message["groupId"] = groupId;
  try {
    await axios.post(api + "group/message", message);
    chatForm.reset();
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

function getAllMessages() {
  const groupId = localStorage.getItem("groupChat");
  if (!groupId) return;
  const store = JSON.parse(localStorage.getItem("group_messages")) || [];
  const groupData = store.find((g) => Number(g.group) === Number(groupId));
  if (groupData && groupData.group_messages.length > 0) {
    lastIndex = groupData.group_messages[groupData.group_messages.length - 1].id;
    renderMessages(groupData.group_messages, localStorage.getItem("self"));
  }
  setInterval(() => {
    fromBackend();
  }, 1000);
}

async function fromBackend() {
  const groupId = localStorage.getItem("groupChat");
  if (!groupId) return;
  try {
   
    let res = await axios.get(`${api}group/message?id=${groupId}&skip=${lastIndex}`);
    const data = res.data.data.messages || [];
    const self = res.data.data.self;
    localStorage.setItem("self", self);
    if (data.length === 0) {
      console.log("No new messages");
      return;
    }
    storeMessagesLocally(groupId, data);
    renderMessages(data, self);
    data.forEach((msg) => {
      if (msg.id > lastIndex) lastIndex = msg.id;
    });
  } catch (err) {
    console.log("Error fetching new messages:", err);
  }
}

function renderMessages(messages, self) {
  messages.forEach((msg) => {

    const messageElement = document.createElement("div");
    if (Number(msg.user.id) === Number(self)) {
      messageElement.innerHTML = `<div class="col col-12 text-end p-2">${msg.message}</div>`;
      messageElement.className = "row bg-chat";
    } else {
      messageElement.innerHTML = `<div class="col col-12 p-2">${msg.message}</div>`;
      messageElement.className = "row";
    }
    chatBox.appendChild(messageElement);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function storeMessagesLocally(groupId, newMessages) {
  if (!newMessages.length) return;
  let store = JSON.parse(localStorage.getItem("group_messages")) || [];
  let groupObj = store.find((g) => Number(g.group) === Number(groupId));
  if (!groupObj) {
    groupObj = { group: groupId, group_messages: [] };
    store.push(groupObj);
  }
  newMessages.forEach((msg) => {
    groupObj.group_messages.push(msg);
    if (groupObj.group_messages.length > 10) {
      groupObj.group_messages.shift();
    }
  });
  localStorage.setItem("group_messages", JSON.stringify(store));
}

async function deleteGroup() {
  const groupId = localStorage.getItem("groupChat");
  if (!groupId) {
    alert("No group selected!");
    return;
  }
  try {
    await axios.delete(`${api}group/${groupId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    alert("Group deleted successfully");
    localStorage.removeItem("groupChat");
    localStorage.removeItem("group_messages");
    window.location = "./friends.html";
  } catch (err) {
    console.error("Failed to delete group:", err);
    alert("Failed to delete group");
  }
}
