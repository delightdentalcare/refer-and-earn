// Main app logic (index + dashboard)
// NOTE: Replace FIREBASE_CONFIG with your project's config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBMV7NUVLf-9aEer5jlhqOv5u_Z7XM5oVo",
  authDomain: "refer-and-earn-74706.firebaseapp.com",
  databaseURL: "https://refer-and-earn-74706-default-rtdb.firebaseio.com",
  projectId: "refer-and-earn-74706",
  storageBucket: "refer-and-earn-74706.firebasestorage.app",
  messagingSenderId: "681290792261",
  appId: "1:681290792261:web:982ae0c9f81b7291bc922c",
  measurementId: "G-GYJ5D768D6"
};

const PAYSTACK_PUBLIC_KEY = 'pk_test_9aa45bcaad7262c006c56d37d2c487fd2dd6afce';

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// SPLASH
window.addEventListener('load', ()=>{
  setTimeout(()=>{
    document.getElementById('splash').style.display='none';
    document.getElementById('main-app').style.display='block';
    initAuthUi();
  },900);
});

function initAuthUi(){
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  showSignup?.addEventListener('click', e=>{e.preventDefault();toggleForms(true)});
  showLogin?.addEventListener('click', e=>{e.preventDefault();toggleForms(false)});

  document.getElementById('btn-signup')?.addEventListener('click', signup);
  document.getElementById('btn-login')?.addEventListener('click', login);
}

function toggleForms(signup){
  document.getElementById('login-form').style.display = signup? 'none':'block';
  document.getElementById('signup-form').style.display = signup? 'block':'none';
}

async function signup(){
  const email = document.getElementById('su-email').value.trim();
  const pass = document.getElementById('su-password').value;
  const username = document.getElementById('su-username').value.trim();
  const refcode = document.getElementById('su-ref').value.trim();
  if(!email||!pass||!username) return alert('Complete fields');

  try{
    const userCredential = await auth.createUserWithEmailAndPassword(email,pass);
    const uid = userCredential.user.uid;
    // ensure username unique — quick naive check
    const unameSnap = await db.ref('usernames/'+username).once('value');
    if(unameSnap.exists()){ alert('Username taken'); await userCredential.user.delete(); return; }
    await db.ref('usernames/'+username).set(uid);

    const profile = {uid,username,email,balance:0,createdAt:Date.now(),dailyClaim:0,referrer: refcode||null,shares:0};
    await db.ref('users/'+uid).set(profile);
    // if refcode present, credit referrer ₦50
    if(refcode){
      const refUidSnap = await db.ref('usernames/'+refcode).once('value');
      if(refUidSnap.exists()){
        const refUid = refUidSnap.val();
        await credit(refUid,50,'Referral signup');
      }
    }
    // auto-generate referral slug is username
    // done
    alert('Account created — please login');
    toggleForms(false);
  }catch(err){console.error(err);alert(err.message)}
}

async function login(){
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  try{
    await auth.signInWithEmailAndPassword(email,pass);
    // redirect to dashboard
    window.location.href = 'dashboard.html';
  }catch(err){alert(err.message)}
}

// Credit helper
async function credit(uid,amount,reason){
  const balRef = db.ref('users/'+uid+'/balance');
  const snap = await balRef.once('value');
  const current = snap.exists()? Number(snap.val()):0;
  const updated = current + Number(amount);
  await balRef.set(updated);
  // log
  const tx = {uid,amount,reason,ts:Date.now()};
  await db.ref('transactions').push(tx);
}

// Dashboard logic (runs on dashboard.html)
if(window.location.pathname.endsWith('dashboard.html')){
  auth.onAuthStateChanged(async user=>{
    if(!user) return window.location.href='index.html';
    const uid = user.uid;
    const profSnap = await db.ref('users/'+uid).once('value');
    const profile = profSnap.val();
    document.getElementById('u-name').textContent = profile.username;
    document.getElementById('u-balance').textContent = profile.balance||0;
    const base = location.origin.replace(/https?:\/\//,'');
    const link = `${location.origin}/?ref=${profile.username}`;
    document.getElementById('ref-link').value = link;

    // Show ads
    db.ref('ads').orderByChild('approved').equalTo(true).once('value',snap=>{
      const adsEl = document.getElementById('ads-list'); adsEl.innerHTML='';
      snap.forEach(s=>{ const a = s.val(); const img = document.createElement('img'); img.src=a.img; img.onclick=()=>window.open(a.link,'_blank'); adsEl.appendChild(img); });
    });

    // Share actions
    document.getElementById('copy-ref').onclick = ()=>{ navigator.clipboard.writeText(link); alert('Link copied'); }
    document.getElementById('share-wa').onclick = ()=>{ shareTo(`https://wa.me/?text=${encodeURIComponent(link)}`, uid); }
    document.getElementById('share-fb').onclick = ()=>{ shareTo(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, uid); }
    document.getElementById('share-tw').onclick = ()=>{ shareTo(`https://twitter.com/intent/tweet?text=${encodeURIComponent(link)}`, uid); }
    document.getElementById('share-tele').onclick = ()=>{ shareTo(`https://t.me/share/url?url=${encodeURIComponent(link)}`, uid); }

    document.getElementById('btn-daily').onclick = async ()=>{
      const userRef = db.ref('users/'+uid+'/dailyClaim');
      const last = (await userRef.once('value')).val()||0;
      const now = Date.now();
      if(now - last < 24*3600*1000) return alert('Daily bonus already claimed');
      await userRef.set(now);
      await credit(uid,25,'Daily bonus');
      alert('Daily bonus credited ₦25');
      document.getElementById('u-balance').textContent = (Number(profile.balance||0)+25);
    }

    document.getElementById('btn-upload').onclick = ()=>{ window.location.href='upload-story.html'; }

    document.getElementById('btn-withdraw').onclick = async ()=>{
      const amt = Number(document.getElementById('withdraw-amount').value||0);
      const account = document.getElementById('withdraw-account').value.trim();
      if(!amt||amt<=0) return alert('Enter valid amount');
      // push request — admin approves
      await db.ref('withdrawals').push({uid,amt,account,ts:Date.now(),status:'pending'});
      document.getElementById('withdraw-status').textContent = 'Requested — awaiting admin approval';
    }

  });
}

function shareTo(url, uid){
  window.open(url,'_blank');
  // reward share instantly
  credit(uid,10,'Share to social');
}

// Expose credit for other pages (story.js, admin.js)
window.appHelpers = {credit,db,auth,storage};
