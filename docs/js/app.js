import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getDatabase, ref, get, set, push, onValue } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMV7NUVLf-9aEer5jlhqOv5u_Z7XM5oVo",
  authDomain: "refer-and-earn-74706.firebaseapp.com",
  databaseURL: "https://refer-and-earn-74706-default-rtdb.firebaseio.com",
  projectId: "refer-and-earn-74706",
  storageBucket: "refer-and-earn-74706.appspot.com",
  messagingSenderId: "681290792261",
  appId: "1:681290792261:web:982ae0c9f81b7291bc922c"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    onValue(userRef, (snap) => {
      const data = snap.val();
      if (!data.approved) {
        document.body.innerHTML = "<h3>Waiting for admin approval...</h3>";
      } else {
        document.getElementById("userInfo").innerHTML = `
          <p>Email: ${data.email}</p>
          <p>Balance: ₦${data.balance}</p>
          <p>Level: ${data.stars}</p>
        `;
        document.getElementById("refLink").value = `${location.origin}/index.html?ref=${uid}`;
      }
    });

    document.getElementById("uploadPost").addEventListener("click", async () => {
      const text = document.getElementById("postText").value;
      const file = document.getElementById("postImage").files[0];
      const newPost = push(ref(db, "posts/"));
      await set(newPost, { uid, text, timestamp: Date.now() });
      alert("Posted!");
    });

    onValue(ref(db, "posts/"), (snap) => {
      const feed = document.getElementById("feed");
      feed.innerHTML = "";
      snap.forEach((child) => {
        const post = child.val();
        feed.innerHTML += `<div class='post'><p>${post.text}</p><small>${new Date(post.timestamp).toLocaleString()}</small></div>`;
      });
    });
  } else {
    window.location.href = "index.html";
  }
});
