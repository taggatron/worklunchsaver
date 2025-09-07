// Constants for costs (in pence to avoid floating point issues)
const BUY_PENCE = 340;
const HOME_PENCE = 30;
const SAVE_PENCE = BUY_PENCE - HOME_PENCE; // 310 pence = £3.10

const STORAGE_KEY = 'worklunch_saver_v1';
// Try same-origin first, then fallback to localhost:3000 for the Node server
const SERVER_STATE_URLS = ['/state', 'http://localhost:3000/state'];

function formatPence(pence){
  const pounds = (pence/100).toFixed(2);
  return `£${pounds}`;
}

async function tryFetchState(url){
  try{
    const res = await fetch(url, {cache: 'no-store'});
    if(res.ok) return await res.json();
  }catch(e){/* ignore */}
  return null;
}

async function loadState(){
  // Try configured server endpoints in order
  for(const url of SERVER_STATE_URLS){
    const s = await tryFetchState(url);
    if(s) return s;
  }

  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {totalPence:0,count:0,history:[]};
    return JSON.parse(raw);
  }catch(e){
    console.error('Failed to load state', e);
    return {totalPence:0,count:0,history:[]};
  }
}

async function saveState(state){
  // Try writing to server endpoints in order; if none succeed, write to localStorage
  for(const url of SERVER_STATE_URLS){
    try{
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(state)
      });
      if(res.ok) return;
    }catch(e){/* try next */}
  }

  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.error('Failed to save state locally', e);
  }
}

const totalEl = document.getElementById('total');
const countEl = document.getElementById('count');
const addBtn = document.getElementById('addLunch');
const undoBtn = document.getElementById('undoLunch');
const resetBtn = document.getElementById('reset');
// export/import UI removed — keep compatibility if present in DOM
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

let state = {totalPence:0,count:0,history:[]};

// Initialize asynchronously
(async ()=>{
  state = await loadState();
  render();
})();

function render(){
  totalEl.textContent = formatPence(state.totalPence);
  countEl.textContent = state.count;
  undoBtn.disabled = state.history.length === 0;
}

addBtn.addEventListener('click', async ()=>{
  state.totalPence += SAVE_PENCE;
  state.count += 1;
  state.history.push(SAVE_PENCE);
  await saveState(state);
  render();
});

undoBtn.addEventListener('click', async ()=>{
  if(state.history.length === 0) return;
  const last = state.history.pop();
  state.totalPence -= last;
  state.count = Math.max(0, state.count - 1);
  await saveState(state);
  render();
});

resetBtn.addEventListener('click', async ()=>{
  if(!confirm('Reset total saved and count? This cannot be undone.')) return;
  state = {totalPence:0,count:0,history:[]};
  await saveState(state);
  render();
});

// Export/import UI intentionally removed from HTML — if buttons exist do nothing
if(exportBtn){
  exportBtn.style.display = 'none';
}
if(importBtn){
  importBtn.style.display = 'none';
}
if(importFile){
  importFile.style.display = 'none';
}

// Initial render
render();
