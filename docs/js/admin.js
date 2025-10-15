// Simple admin control; admin credentials are stored in Realtime DB under /config/admins
// To set: in Firebase console -> Realtime Database -> set /config/admins/admin1 = {username:'admin',password:'strongpass'}

firebase.initializeApp(FIREBASE_CONFIG);
const dbAdmin = firebase.database();

if(window.location.pathname.endsWith('admin.html')){
  document.getElementById('btn-admin-login').onclick = async ()=>{
    const u = document.getElementById('admin-user').value.trim();
    const p = document.getElementById('admin-pass').value.trim();
    const snap = await dbAdmin.ref('config/admins').once('value');
    const admins = snap.val()||{};
    let ok=false, adminKey=null;
    Object.keys(admins).forEach(k=>{ if(admins[k].username===u && admins[k].password===p){ ok=true; adminKey=k; }});
    if(!ok) return alert('Invalid admin creds');
    document.getElementById('admin-login').style.display='none';
    document.getElementById('admin-area').style.display='block';
    loadStats();
    listenWithdrawals();
    loadAds();
    loadStoriesMgmt();
  }
}

async function loadStats(){
  const uSnap = await dbAdmin.ref('users').once('value');
  const users = uSnap.numChildren();
  document.getElementById('stat-users').textContent = `Users: ${users}`;
  const w = await dbAdmin.ref('withdrawals').orderByChild('status').equalTo('pending').once('value');
  document.getElementById('stat-pending').textContent = `Pending withdrawals: ${w.numChildren()}`;
}

function listenWithdrawals(){
  dbAdmin.ref('withdrawals').orderByChild('status').equalTo('pending').on('value',snap=>{
    const list = document.getElementById('withdraw-list'); list.innerHTML='';
    snap.forEach(s=>{
      const w = s.val(); const id = s.key;
      const el = document.createElement('div'); el.className='card';
      el.innerHTML = `<strong>${w.amt}₦</strong> from ${w.uid}<br/>Account:${w.account}<br/>`;
      const appr = document.createElement('button'); appr.textContent='Approve'; appr.onclick=()=>approveWithdraw(id,w);
      const rej = document.createElement('button'); rej.textContent='Reject'; rej.onclick=()=>rejectWithdraw(id,w);
      el.appendChild(appr); el.appendChild(rej);
      list.appendChild(el);
    });
  });
}

async function approveWithdraw(id,w){
  // Admin should process payment externally (Paystack transfer) then mark approved
  await dbAdmin.ref('withdrawals/'+id+'/status').set('approved');
  await dbAdmin.ref('withdrawals/'+id+'/approvedAt').set(Date.now());
  // Deduct user balance
  const userBalRef = dbAdmin.ref('users/'+w.uid+'/balance');
  const snap = await userBalRef.once('value');
  const bal = snap.val()||0;
  await userBalRef.set(Math.max(0,bal - Number(w.amt)));
  alert('Marked approved — remember to payout externally');
}

async function rejectWithdraw(id,w){
  await dbAdmin.ref('withdrawals/'+id+'/status').set('rejected');
  alert('Rejected');
}

async function loadAds(){
  const snap = await dbAdmin.ref('ads').once('value');
  const el = document.getElementById('ads-management'); el.innerHTML='';
  snap.forEach(s=>{ const a=s.val(); const cont=document.createElement('div'); cont.className='card'; cont.innerHTML=`<img src='${a.img}' style='max-width:120px'/><p>${a.text}</p><p>Approved: ${a.approved? 'Yes':'No'}</p>`;
    const toggle = document.createElement('button'); toggle.textContent = a.approved? 'Unapprove':'Approve'; toggle.onclick=()=>dbAdmin.ref('ads/'+s.key+'/approved').set(!a.approved);
    cont.appendChild(toggle); el.appendChild(cont);
  });
}

async function loadStoriesMgmt(){
  const snap = await dbAdmin.ref('stories').once('value');
  const el = document.getElementById('stories-management'); el.innerHTML='';
  snap.forEach(s=>{ const st=s.val(); const cont=document.createElement('div'); cont.className='card'; cont.innerHTML=`<h4>${st.title}</h4><p>${st.cat}</p><p>Approved: ${st.approved? 'Yes':'No'}</p>`;
    const aBtn=document.createElement('button'); aBtn.textContent='Approve'; aBtn.onclick=()=>dbAdmin.ref('stories/'+s.key+'/approved').set(true);
    const dBtn=document.createElement('button'); dBtn.textContent='Delete'; dBtn.onclick=()=>dbAdmin.ref('stories/'+s.key).remove();
    cont.appendChild(aBtn); cont.appendChild(dBtn); el.appendChild(cont);
  });
                    }
