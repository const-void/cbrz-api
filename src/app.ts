import express, { NextFunction, Router, Request, Response } from 'express';
import { CboDb } from './db';
import { reverse } from 'dns';

const port = 3000;
const db = CboDb.get();
var app = express();
var router = Router()


//inspect should be part of a load process that caches tables into memory
//there should be a refresh command that rereshes the cache

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
router.get('/cbo/:id', (req:Request, res:Response, next:NextFunction) => {
  var sql="SELECT tbl FROM cbo_id WHERE id=?";
 console.log(`inspecting cboid ${req.params.id}`);

  db.db.all(sql,[req.params.id],(err,rows)=>{
    if (err) { throw err}
    if (rows.length>0) {
      var sql2=`SELECT * from ${rows[0].tbl} where id=?`;
      db.db.all(sql2,[req.params.id],(err2,rows2)=>{
        if (err2) { throw err2}
        rows2[0].table=rows[0].tbl;
        res.json(rows2[0]);
      });
    }
  });
});

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
    res.json(rows[0]);
  });
});

//insert
router.post('/crud/:table', (req:Request, res:Response, next:NextFunction) => {
  var rv = { orig_params:req.params, id: 0 } ;

  if (req.params.id==null) {
    //https://www.sqlite.org/lang_transaction.html
    //https://github.com/mapbox/node-sqlite3/wiki/Control-Flow
    //
    console.log('no / null id in json body--create')
    db.db.run('INSERT INTO cbo_id (tbl) VALUES (?)',[req.params.table], function (this,err){
      if (err) { console.log(err); res.json(err); }

      db.db.serialize(()=>{
        console.log(`inserted ${this.lastID}`);
        rv.id=this.lastID;
      });
    });
    res.json(rv);
  
  }
  else {
    res.json(rv);
    console.log(`update found--${req.params.id}`)
  }
  
});

//update
router.post('/crud/:table/:id', (req:Request, res:Response, next:NextFunction) => {
  //some sort of table<->id validator here

  var sql=`SELECT * FROM ${req.params.table} where id=?`
  console.log(`read ${req.params.table} (${req.params.id})`);

  db.db.all(sql,[req.params.id],(err,rows)=>{
    if (err) { throw err}
    res.json(rows[0]);
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