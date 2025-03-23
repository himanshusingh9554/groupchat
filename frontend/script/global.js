const api =  "http://localhost:3000/";

axios.defaults.headers.common["Authorization"] = localStorage.getItem("token")
  ? `Bearer ${localStorage.getItem("token")}`
  : "";
