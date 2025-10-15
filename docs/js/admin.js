<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Admin — refer and earn</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <main class="container">
    <section class="card">
      <h2>Admin Panel</h2>
      <div id="admin-login">
        <input id="admin-user" placeholder="Admin username" />
        <input id="admin-pass" placeholder="Admin password" type="password" />
        <button id="btn-admin-login">Login</button>
      </div>

      <div id="admin-area" style="display:none">
        <h3>Stats</h3>
        <div id="stat-users">Users: 0</div>
        <div id="stat-pending">Pending withdrawals: 0</div>

        <h3>Withdrawals</h3>
        <div id="withdraw-list"></div>

        <h3>Ads</h3>
        <div id="ads-management"></div>

        <h3>Stories</h3>
        <div id="stories-management"></div>
      </div>
    </section>
  </main>

  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>
