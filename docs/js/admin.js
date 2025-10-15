import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMV7NUVLf-9aEer5jlhqOv5u_Z7XM5oVo",
  authDomain: "refer-and-earn-74706.firebaseapp.com",
  databaseURL: "https://refer-and-earn-74706-default-rtdb.firebaseio.com",
  projectId: "refer-and-earn-74706",
  storageBucket: "refer-and-earn-74706.firebasestorage.app",
  messagingSenderId: "681290792261",
  appId: "1:681290792261:web:982ae0c9f81b7291bc922c",
  measurementId: "G-GYJ5D768D6"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

document.getElementById("loginBtn").addEventListener("click", () => {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;

  if (u === "batir" && p === "mubsbatir") {
    document.getElementById("login").style.display = "none";
    document.getElementById("adminDashboard").style.display = "block";

    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      const list = document.getElementById("usersList");
      list.innerHTML = "";
      for (const id in data) {
        const user = data[id];
        list.innerHTML += `<li>${user.name} - Level ${user.level} - ₦${user.earnings}</li>`;
      }
    });
  } else {
    alert("Invalid admin login");
  }
});
