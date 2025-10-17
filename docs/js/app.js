import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMV7NUVLf-9aEer5jlhqOv5u_Z7XM5oVo",
  authDomain: "refer-and-earn-74706.firebaseapp.com",
  databaseURL: "https://refer-and-earn-74706-default-rtdb.firebaseio.com",
  projectId: "refer-and-earn-74706",
  storageBucket: "refer-and-earn-74706.firebasestorage.app",
  messagingSenderId: "681290792261",
  appId: "1:681290792261:web:982ae0c9f81b7291bc922c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const userRef = ref(db, "users/" + username);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    document.getElementById("statusMsg").innerText = "Login successful!";
    window.location.href = "dashboard.html?user=" + username;
  } else {
    await set(userRef, {
      email,
      password,
      level: 1,
      earnings: 0,
      approved: false
    });
    document.getElementById("statusMsg").innerText = "Account created! Wait for admin approval.";
  }
});

// Admin login
document.getElementById("loginAdmin").addEventListener("click", () => {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;
  if (u === "admin" && p === "admin123") {
    window.location.href = "admin.html";
  } else {
    alert("Wrong admin credentials");
  }
});
