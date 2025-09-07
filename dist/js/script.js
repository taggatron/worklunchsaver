// Constants for costs (in pence to avoid floating point issues)
const BUY_PENCE = 340;
const HOME_PENCE = 30;
const SAVE_PENCE = BUY_PENCE - HOME_PENCE; // 310 pence = £3.10

const STORAGE_KEY = 'worklunch_saver_v1';
const SERVER_STATE_URL = '/state';

function formatPence(pence){
  const pounds = (pence/100).toFixed(2);
  return `£${pounds}`;
}

async function loadState(){
  // Try server first
  try{
    const res = await fetch(SERVER_STATE_URL, {cache: 'no-store'});
    if(res.ok){
      const json = await res.json();
      return json;
    }
  }catch(e){
    // server not available, fall back to localStorage
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
  // Try writing to server; if it fails, write to localStorage
  try{
    const res = await fetch(SERVER_STATE_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(state)
    });
    if(res.ok) return;
  }catch(e){
    // ignore
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

// Export current state as JSON file
exportBtn.addEventListener('click', ()=>{
  const dataStr = JSON.stringify(state, null, 2);
  const blob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.download = `worklunchsaver-backup-${now}.json`;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Import: open file picker
importBtn.addEventListener('click', ()=>importFile.click());

importFile.addEventListener('change', (ev)=>{
  const file = ev.target.files && ev.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try{
      const parsed = JSON.parse(reader.result);
      // basic validation
      if(typeof parsed.totalPence !== 'number' || typeof parsed.count !== 'number' || !Array.isArray(parsed.history)){
        alert('Invalid backup file format');
        return;
      }
      if(!confirm('Importing will replace your current saved total. Continue?')) return;
      state = {totalPence: parsed.totalPence, count: parsed.count, history: parsed.history};
      await saveState(state);
      render();
      alert('Import successful');
    }catch(e){
      console.error('Failed to import', e);
      alert('Failed to read file as JSON');
    }
  };
  reader.readAsText(file);
  // clear input so same file can be selected again later
  importFile.value = '';
});

// Initial render
render();
