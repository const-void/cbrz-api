import express, { NextFunction, Router, Request, Response } from 'express';
import { CboDb } from './db';

const port = 3000;
const db = CboDb.get();
var app = express();
var router = Router()

router.get('/inspect', (req:Request, res:Response, next:NextFunction) => {
  var sql="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";
  db.db.all(sql,[],(err,rows)=>{
    if (err) { throw err}
    res.json(rows);
  });
});

router.get('/inspect/:table', (req:Request, res:Response, next:NextFunction) => {
  var sql="SELECT sql FROM sqlite_master WHERE type='table' and tbl_name=?";
  sql=`PRAGMA table_info('${req.params.table}')`;
  console.log(`inspecting ${req.params.table}`);

  db.db.all(sql,[],(err,rows)=>{
    if (err) { throw err}
    res.json(rows);
  });
});

// /cboid/id
// -> look up table, id 

router.get('/crud/:table', (req:Request, res:Response, next:NextFunction) => {
  var sql=`SELECT * FROM ${req.params.table}`
  console.log(`read ${req.params.table}`);

  db.db.all(sql,[],(err,rows)=>{
    if (err) { throw err}
    res.json(rows);
  });
});

router.get('/crud/:table/:id', (req:Request, res:Response, next:NextFunction) => {
  var sql=`SELECT * FROM ${req.params.table} where id=?`
  console.log(`read ${req.params.table} (${req.params.id})`);

  db.db.all(sql,[req.params.id],(err,rows)=>{
    if (err) { throw err}
    res.json(rows);
  });
});

app.use('/api',router);


/*app.use(function(req, res, next) {
  require('./crud')(req, res, next);
});*/

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});
app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  
  return console.log(`server is listening on ${port}`);
});