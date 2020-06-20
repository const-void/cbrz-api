import express, { NextFunction, Router, Request, Response } from 'express';
import {appCors} from './app-cors';
export var file_router = Router();
import { DirEntity }  from '../fs';
import { LocalFiles } from '../interfaces/local-files';
import {FileRenamerDb} from '../db';
import { renameSync } from 'fs';
import { cfg, CFG } from '../modules/settings';

const db = FileRenamerDb.get();

file_router.use(appCors);

file_router.get('/list-files',(req:Request, res:Response, next:NextFunction)=>{
    let d =new DirEntity(cfg(CFG.RENAME_PATH), true, 1,1);
    res.json(d);
  });

file_router.post('/rename-files', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body } ;
    let f:LocalFiles=req.body;
    let leading_spaces:string="";
    let src:string="";
    let tgt:string="";

    console.log(`Processing ${f.fn}`);
    for (let itm of f.itms) {
      leading_spaces="  ".repeat(itm.depth);
      if (itm.isDir) {
        //console.log(`SKIP ${leading_spaces}${itm.basename}\\`);
      }
      else {     
        if (itm.isDestDifferent) {
          src=`${itm.parentFolder}/${itm.basename}${itm.ext}`;
          tgt=`${itm.parentFolder}/${itm.dest_basename}${itm.dest_ext}`;
          
          console.log(`[${src}] => [${tgt}]`);
          renameSync(src,tgt);
        }
        else {
          //console.log(`SKIP ${leading_spaces}${itm.basename}${itm.ext}`);
          
        }
      }
    }
    res.json(rv);
});

file_router.get('/r/:table', (req:Request, res:Response, next:NextFunction) => {
    var sql=`SELECT * FROM ${req.params.table}`
    console.log(`read ${req.params.table}`);
  
    db.db.all(sql,[],(err,rows)=>{
      if (err) { throw err}
      res.json(rows);
    });
});

file_router.post('/i/:table', (req:Request, res:Response, next:NextFunction) => {
  var rv = { orig_params:req.params, orig_body:req.body } ;
 
  //https://www.sqlite.org/lang_transaction.html
  //https://github.com/mapbox/node-sqlite3/wiki/Control-Flow
  //
  //create an insert sql--interrogate body parameters, use key:value where key = field name, value = field value
  var col_names=Object.keys(req.body);
  var values=Array(col_names.length).fill('?').toString()
  var cols=col_names.toString();
  var vals=Object.values(req.body);
  var insert_sql=`INSERT INTO ${req.params.table} (${cols}) VALUES (${values})`;
  console.log(insert_sql);
  db.db.run(insert_sql,vals,function(this,err){
    if (err) { console.log(err); res.json(err); }
    res.json(rv);
  });      
  
});

 //todo - make this a transaction...somehow!!!
 //also...what about using the body for the delete?
 file_router.delete('/d/:table', (req:Request, res:Response, next:NextFunction) => {
  var rv = { orig_params:req.params, orig_body:req.body } ;
 
    var sql=`delete from ${req.params.table} where `;
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
    var vals=Object.values(req.body);
    console.log(sql);
    db.db.run(sql,vals,function (this,err){
      if (err) { console.log(err); res.json(err); }
      console.log('success!');
      res.json(rv);
    });

});


