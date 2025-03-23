localStorage.removeItem("chat");
localStorage.removeItem("message");
localStorage.removeItem("to");
localStorage.removeItem("group_messages");
localStorage.removeItem("token");
localStorage.removeItem("groupChat");
localStorage.removeItem("self");

let myForm = document.getElementById("login-form");

myForm.addEventListener("submit", login);

async function login(event) {
  event.preventDefault();
  let form = new FormData(myForm);
  let obj = {};
  for (const [key, value] of form.entries()) {
    obj[key] = value;
  }
  try {
    let res = await axios.post(api + "user/login", obj);
    if (res.status === 200) {
      const token = res.headers.token;
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("self", res.data.self);
      
        console.log("self:", localStorage.getItem("self"));
        console.log("token:", localStorage.getItem("token"));
        alert("Login successful");
        window.location = "./friends.html";
      } else {
        alert("Token not received");
      }
    } else {
      alert(res.data.message);
    }
  } catch (err) {
    console.error("Error during login:", err);
    alert(err.response?.data?.message || "Login failed");
  }
}
