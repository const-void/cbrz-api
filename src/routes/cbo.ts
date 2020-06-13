import express, { NextFunction, Router, Request, Response } from 'express';
import {appCors} from './app-cors';
export var cbo_router = Router();
import { DirEntity }  from '../fs';
import { CboDb } from '../db';

const db = CboDb.get();

cbo_router.use(appCors);

cbo_router.get('/files',(req:Request, res:Response, next:NextFunction)=>{
    let d =new DirEntity('/Local/Downloads/Kabuki (1994 - 2000, David Mack)', true, 1,1);
    res.json(d);
  });
  
  //inspect should be part of a load process that caches tables into memory
  //there should be a refresh command that rereshes the cache
  cbo_router.get('/inspect', (req:Request, res:Response, next:NextFunction) => {
    var sql="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";
    db.db.all(sql,[],(err,rows)=>{
      if (err) { throw err}
      res.json(rows);
    });
  });
  
  cbo_router.get('/inspect/:table', (req:Request, res:Response, next:NextFunction) => {
    var sql="SELECT sql FROM sqlite_master WHERE type='table' and tbl_name=?";
    sql=`PRAGMA table_info('${req.params.table}')`;
    console.log(`inspecting ${req.params.table}`);
  
    db.db.all(sql,[],(err,rows)=>{
      if (err) { throw err}
      res.json(rows);
    });
  });
  
  // /cboid/id
  cbo_router.get('/cbo/:id', (req:Request, res:Response, next:NextFunction) => {
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
  
  cbo_router.get('/crud/:table', (req:Request, res:Response, next:NextFunction) => {
    var sql=`SELECT * FROM ${req.params.table}`
    console.log(`read ${req.params.table}`);
  
    db.db.all(sql,[],(err,rows)=>{
      if (err) { throw err}
      res.json(rows);
    });
  });
  
  cbo_router.get('/crud/:table/:id', (req:Request, res:Response, next:NextFunction) => {
    var sql=`SELECT * FROM ${req.params.table} where id=?`
    console.log(`read ${req.params.table} (${req.params.id})`);
  
    db.db.all(sql,[req.params.id],(err,rows)=>{
      if (err) { throw err}
      res.json(rows[0]);
    });
  });
  
  //insert
  cbo_router.post('/crud/:table', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body, id: 0 } ;
    //todo - confirm there is no id in body
  
    //https://www.sqlite.org/lang_transaction.html
    //https://github.com/mapbox/node-sqlite3/wiki/Control-Flow
    //
    console.log('no / null id in json body--create')
    //create an insert sql--interrogate body parameters
    var col_names=Object.keys(req.body);
    col_names.push('id');
    var values=Array(col_names.length).fill('?').toString()
    var cols=col_names.toString();
    var vals=Object.values(req.body);
    var insert_sql=`INSERT INTO ${req.params.table} (${cols}) VALUES (${values})`;
    console.log(insert_sql);
  
    let ts=Date.now()
    db.db.run('INSERT INTO cbo_id (tbl, created_ts, modified_ts) VALUES (?,?,?)',[req.params.table,ts,ts], function (this,err){
      if (err) { console.log(err); res.json(err); }
      vals.push(this.lastID);
      rv.id=this.lastID;
      console.log(`created cboid ${this.lastID}`);
      db.db.run(insert_sql,vals,function(this,err){
        if (err) { console.log(err); res.json(err); }
        res.json(rv);
      });      
    });
  });
  
  //update
  cbo_router.post('/crud/:table/:id', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body, id: req.params.id } ;
    delete req.body.id;
     //todo - make this a transaction!
    var sql=`UPDATE ${req.params.table} SET `;
    var first_flag=true;
    for (let col_name of Object.keys(req.body)) {
      if (first_flag) {
        first_flag=false;
      }
      else {
        sql+=",";
      }
      sql+=`${col_name}=?`
    }
    sql+=` WHERE id=?`
    var vals=Object.values(req.body);
    vals.push(req.params.id);
   
    console.log(sql);
  
    db.db.run(sql,vals, function (this,err){
      if (err) { console.log(err); res.json(err); }
   
      let cboid_sql="UPDATE cbo_id SET modified_ts=? where id=?";
      let ts=Date.now();
      db.db.run(cboid_sql,[ts,req.params.id],function (this,err) {
        if (err) { console.log(err); res.json(err); }
        res.json(rv);    
      });   
    });
  });
  
  //delete - delete from source table first, then from cboid table nextr
  //todo - make this a transaction...somehow!!!
  cbo_router.delete('/crud/:id', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body, id: req.params.id } ;
   
    var sql=`select tbl from cbo_id where id=${req.params.id}`;
    console.log(`get cboid table --  ${sql}`);
    db.db.get(sql,[],function (this,err,row){
      if (err) { console.log(err); res.json(err); }
      console.log(row);
      var sql2=`delete from ${row.tbl} where id=${req.params.id}`;
      console.log(sql2);
      db.db.run(sql2,[],function (this,err){
        if (err) { console.log(err); res.json(err); }
        var sql3=`delete from cbo_id where id=${req.params.id}`;
        console.log(sql3);
        db.db.run(sql3,[], function(this,err){
          if (err) { console.log(err); res.json(err); }
          console.log('success!');
          res.json(rv);
        });
      });
  
    });
  });
  
  
  //update
  cbo_router.post('/crud/:table/:id', (req:Request, res:Response, next:NextFunction) => {
    //some sort of table<->id validator here
  
    var sql=`SELECT * FROM ${req.params.table} where id=?`
    console.log(`read ${req.params.table} (${req.params.id})`);
  
    db.db.all(sql,[req.params.id],(err,rows)=>{
      if (err) { throw err}
      res.json(rows[0]);
    });
  });