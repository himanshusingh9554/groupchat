let addFriends = document.getElementById("admin-add-friend");
let removeFriends = document.getElementById("admin-remove-friend");

window.addEventListener("DOMContentLoaded", loadFriends);

async function loadFriends() {
  const groupId = localStorage.getItem("groupChat");
  try {
    let res = await axios.get(api + "group/friends/list?id=" + groupId);
    let nonGroupUsers = res.data.data.notFriends || [];
    let groupUsers = res.data.data.friends || [];

    let addFriendsBody = "";
    nonGroupUsers.forEach(user => {
      addFriendsBody += `
        <tr>
          <td>${user.name}</td>
          <td>
            <button class="btn btn-primary" value="${user.id}" onclick="addUser(this)">Add</button>
          </td>
        </tr>`;
    });
    let addFriendsStructure = `
      <thead>
        <tr>
          <th>Friend</th>
          <th>Add</th>
        </tr>
      </thead>
      <tbody>
        ${addFriendsBody}
      </tbody>`;
    addFriends.innerHTML = addFriendsStructure;
    
    let removeFriendsBody = "";
    groupUsers.forEach(userObj => {
   
      let adminButton = `<button class="btn btn-primary" value="${userObj.user.id}" onclick="modifyAdmin(this)">Add Admin</button>`;
      if (userObj.isAdmin === true) {
        adminButton = `<button class="btn btn-danger" value="${userObj.user.id}" onclick="modifyAdmin(this)">Remove Admin</button>`;
      }
      removeFriendsBody += `
        <tr>
          <td>${userObj.user.name}</td>
          <td>
            <button class="btn btn-danger" value="${userObj.user.id}" onclick="removeUser(this)">Remove</button>
          </td>
          <td>${adminButton}</td>
        </tr>`;
    });
    let removeFriendsStructure = `
      <thead>
        <tr>
          <th>Friend</th>
          <th>Remove</th>
          <th>Admin</th>
        </tr>
      </thead>
      <tbody>
        ${removeFriendsBody}
      </tbody>`;
    removeFriends.innerHTML = removeFriendsStructure;
  } catch (err) {
    console.log(err);
  }
}

async function removeUser(btn) {
  const userId = btn.value;
  const groupId = localStorage.getItem("groupChat");
  try {
    let res = await axios.delete(api + "group/friends/remove", {
      data: { groupId, userId }
    });
    if (res) window.location.reload();
  } catch (err) {
    console.log(err);
  }
}

async function addUser(btn) {
  const userId = btn.value;
  const groupId = localStorage.getItem("groupChat");
  try {
    let res = await axios.post(api + "group/friends/add", { groupId, userId });
    if (res) window.location.reload();
  } catch (err) {
    console.log(err);
  }
}

async function modifyAdmin(btn) {
  const userId = btn.value;
  const groupId = localStorage.getItem("groupChat");
  try {
    let res = await axios.put(api + "group/admin/modify", { groupId, userId });
    if (res) window.location.reload();
  } catch (error) {
    console.log(error);
  }
}
