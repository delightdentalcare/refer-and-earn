// story upload & view
const {credit,db,auth,storage} = window.appHelpers||{};

if(window.location.pathname.endsWith('upload-story.html')){
  auth.onAuthStateChanged(user=>{ if(!user) return location.href='index.html'; });
  document.getElementById('btn-upload-story').onclick = async ()=>{
    const user = auth.currentUser; if(!user) return alert('Login first');
    const title = document.getElementById('story-title').value.trim();
    const cat = document.getElementById('story-category').value;
    const text = document.getElementById('story-text').value.trim();
    const file = document.getElementById('story-file').files[0];
    const video = document.getElementById('story-video').value.trim();
    const meta = {uid:user.uid,title,cat,text,video,ts:Date.now(),approved:false};
    const newKey = db.ref('stories').push().key;
    if(file){
      const ref = storage.ref('stories/'+newKey+'/'+file.name);
      const snap = await ref.put(file);
      const url = await ref.getDownloadURL();
      meta.img = url;
    }
    await db.ref('stories/'+newKey).set(meta);
    // reward uploader ₦10
    await credit(user.uid,10,'Upload story');
    document.getElementById('upload-status').textContent = 'Uploaded — pending approval';
  }
}

if(window.location.pathname.endsWith('story.html')){
  document.getElementById('cat-filter').onchange = loadStories;
  loadStories();
}

async function loadStories(){
  const cat = document.getElementById('cat-filter').value;
  const q = db.ref('stories').orderByChild('approved').equalTo(true);
  const snap = await q.once('value');
  const grid = document.getElementById('stories-grid'); grid.innerHTML='';
  snap.forEach(s=>{
    const st = s.val(); if(cat!=='all' && st.cat!==cat) return;
    const el = document.createElement('div'); el.className='story-card card';
    el.innerHTML = `<h4>${st.title||''}</h4>${st.img?`<img src='${st.img}' style='width:100%'/>`:''}<p>${st.text||''}</p>`;
    grid.appendChild(el);
  });
        }
