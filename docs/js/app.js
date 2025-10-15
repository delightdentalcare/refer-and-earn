import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const signupBtn = document.getElementById("signupBtn");
const dashboard = document.getElementById("dashboard");
const authSection = document.getElementById("auth-section");

signupBtn.addEventListener("click", () => {
  const name = document.getElementById("name").value;
  const locality = document.getElementById("locality").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  const newUser = {
    name, locality, email, phone,
    level: 1,
    earnings: 0,
    timestamp: Date.now()
  };

  const userRef = push(ref(db, "users"));
  set(userRef, newUser);

  authSection.style.display = "none";
  dashboard.style.display = "block";
  document.getElementById("username").innerText = name;
});

window.upgrade = (level) => {
  let amount = level === 2 ? 3000 : 5000;
  let handler = PaystackPop.setup({
    key: "pk_test_9aa45bcaad7262c006c56d37d2c487fd2dd6afce",
    email: document.getElementById("email").value,
    amount: amount * 100,
    currency: "NGN",
    callback: function(response) {
      alert(`Payment successful! Upgraded to Level ${level} ⭐`);
      document.getElementById("userLevel").innerText = level;
    },
    onClose: function() {
      alert('Payment cancelled');
    }
  });
  handler.openIframe();
};
