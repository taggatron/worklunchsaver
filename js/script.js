// Constants for costs (in pence to avoid floating point issues)
const BUY_PENCE = 340;
const HOME_PENCE = 30;
const SAVE_PENCE = BUY_PENCE - HOME_PENCE; // 310 pence = £3.10

const STORAGE_KEY = 'worklunch_saver_v1';

function formatPence(pence){
  const pounds = (pence/100).toFixed(2);
  return `£${pounds}`;
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {totalPence:0,count:0,history:[]};
    return JSON.parse(raw);
  }catch(e){
    console.error('Failed to load state', e);
    return {totalPence:0,count:0,history:[]};
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const totalEl = document.getElementById('total');
const countEl = document.getElementById('count');
const addBtn = document.getElementById('addLunch');
const undoBtn = document.getElementById('undoLunch');
const resetBtn = document.getElementById('reset');

let state = loadState();

function render(){
  totalEl.textContent = formatPence(state.totalPence);
  countEl.textContent = state.count;
  undoBtn.disabled = state.history.length === 0;
}

addBtn.addEventListener('click', ()=>{
  state.totalPence += SAVE_PENCE;
  state.count += 1;
  state.history.push(SAVE_PENCE);
  saveState(state);
  render();
});

undoBtn.addEventListener('click', ()=>{
  if(state.history.length === 0) return;
  const last = state.history.pop();
  state.totalPence -= last;
  state.count = Math.max(0, state.count - 1);
  saveState(state);
  render();
});

resetBtn.addEventListener('click', ()=>{
  if(!confirm('Reset total saved and count? This cannot be undone.')) return;
  state = {totalPence:0,count:0,history:[]};
  saveState(state);
  render();
});

// Initial render
render();
