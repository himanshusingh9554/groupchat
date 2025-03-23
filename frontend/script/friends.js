
let friendTable = document.getElementById("friend-list");
let groupTable = document.getElementById("group-list");
let createGroup = document.getElementById("create-group");
let checkBox = document.getElementById("check-box");

window.addEventListener("DOMContentLoaded", () => {
  console.log("self:", localStorage.getItem("self"));
  console.log("token:", localStorage.getItem("token"));

  getAllFriends();
  groupList();
  listFriends();
});

async function getAllFriends() {
  try {
    const res = await axios.get(api + "friend", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const friends = res.data?.data?.friends || [];
    if (!friends.length) {
      console.log("No friends found");
      return;
    }

    let friendTableHead = `
      <thead>
        <th>Friend Name</th>
        <th>Start Chat</th>
      </thead>
    `;
    let tableBody = document.createElement("tbody");

    for (const friend of friends) {
      tableBody.innerHTML += `
        <tr>
          <td>${friend.name}</td>
          <td>
            <button class="btn btn-primary" onclick="startChat(this)" value="${friend.id}">
              Start Chat
            </button>
          </td>
        </tr>
      `;
    }

    friendTable.innerHTML = friendTableHead;
    friendTable.appendChild(tableBody);
  } catch (err) {
    console.error("Error fetching friends:", err);
  }
}

function startChat(event) {
  localStorage.setItem("chat", event.value);
  window.location = "./chat.html";
}

async function groupList() {
  try {
    const res = await axios.get(api + "user/group/list", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    console.log("Response from server =>", res.data);

    const groups = res.data || [];

    console.log("Received groups =>", groups);

    if (!groups.length) {
      console.log("No groups found");
      groupTable.innerHTML = "<p>No groups available</p>";
      return;
    }

    let groupTableHead = `
      <thead>
        <th>Group Name</th>
        <th>Start Chat</th>
        <th>Admin</th>
      </thead>
    `;
    let tableBody = document.createElement("tbody");

    for (const group of groups) {
      if (!group.group || !group.group.id || !group.group.name) {
        console.error("Malformed group data:", group);
        continue;
      }

      let isAdmin = group.isAdmin
        ? `<td><button class="btn btn-info" onclick="adminPage(this)" value="${group.group.id}">Admin</button></td>`
        : "<td></td>";

      tableBody.innerHTML += `
        <tr>
          <td>${group.group.name}</td>
          <td>
            <button class="btn btn-primary" onclick="startGroupChat(this)" value="${group.group.id}">
              Start Chat
            </button>
          </td>
          ${isAdmin}
        </tr>
      `;
    }

    groupTable.innerHTML = groupTableHead;
    groupTable.appendChild(tableBody);
  } catch (err) {
    console.error("Error fetching groups:", err);
  }
}

function startGroupChat(event) {
  localStorage.setItem("groupChat", event.value);
  window.location = "./groupchat.html";
}

function adminPage(event) {
  localStorage.setItem("groupChat", event.value);
  window.location = "./admin.html";
}

async function listFriends() {
  try {
    const res = await axios.get(api + "friend", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    const friends = res.data?.data?.friends || [];
    if (!friends.length) {
      console.log("No friends found");
      return;
    }

    checkBox.innerHTML = "";

    for (const friend of friends) {
      const structure = `
        <input
          class="form-check-input"
          type="checkbox"
          value="${friend.id}"
          id="flexCheckDefault"
          name="${friend.name}-${friend.id}"
        />
        <label class="form-check-label" for="flexCheckDefault">
          ${friend.name}
        </label>
      `;
      const ele = document.createElement("div");
      ele.setAttribute("class", "form-check ms-3");
      ele.innerHTML = structure;
      checkBox.appendChild(ele);
    }
  } catch (err) {
    console.error("Error listing friends:", err);
  }
}

createGroup.addEventListener("submit", async (event) => {
  event.preventDefault();

  const form = new FormData(createGroup);
  const obj = { name: "", users: [] };

  for (const [key, value] of form.entries()) {
    if (key === "name") {
      obj.name = value;
    } else {
      obj.users.push(Number(value));
    }
  }

  const selfId = Number(localStorage.getItem("self"));
  if (!obj.users.includes(selfId)) {
    obj.users.push(selfId);
  }

  try {
    const res = await axios.post(api + "group/create", obj, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    if (res.data.status === "success") {
      alert("Group Created");
      window.location.reload();
    } else {
      console.error("Error creating group:", res.data.message);
    }
  } catch (err) {
    console.error("Error creating group:", err);
  }
});
