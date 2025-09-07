const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'db.json');

app.use(bodyParser.json());

function readDB(){
  try{
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  }catch(e){
    return {totalPence:0,count:0,history:[]};
  }
}

function writeDB(state){
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf8');
}

app.get('/state', (req, res) => {
  const state = readDB();
  res.json(state);
});

app.post('/state', (req, res) => {
  const body = req.body;
  if(typeof body.totalPence !== 'number' || typeof body.count !== 'number' || !Array.isArray(body.history)){
    return res.status(400).json({error: 'Invalid state shape'});
  }
  writeDB(body);
  res.json({status: 'ok'});
});

app.use(express.static(path.join(__dirname)));

app.listen(PORT, ()=>{
  console.log(`Server listening on http://localhost:${PORT}`);
});
