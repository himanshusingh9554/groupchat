console.log("Hello");

let myForm = document.getElementById("signup-form");

myForm.addEventListener("submit", signup);

async function signup(event) {
  event.preventDefault();

  let form = new FormData(myForm);
  let obj = {};
  for (const [key, value] of form) {
    obj[key] = value;
  }

  try {
    let res = await axios.post(api + "user/signup", obj);

    if (res.status === 201) {
      alert("Signup successful");
      window.location = "./login.html";
    } else {
      alert(res.data.message || "Signup failed");
    }
  } catch (err) {
    if (err.response?.status === 409) {
      alert("Email is already registered. Please use a different email.");
    } else {
      console.error("Error during signup:", err);
      alert(err.response?.data?.message || "Signup failed");
    }
  }
}
