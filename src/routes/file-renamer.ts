import express, { NextFunction, Router, Request, Response } from 'express';
import {appCors} from './app-cors';
export var file_router = Router();
import { DirEntity }  from '../fs';
import {FileRenamerDb} from '../db';

const db = FileRenamerDb.get();

file_router.use(appCors);
file_router.get('/list-files',(req:Request, res:Response, next:NextFunction)=>{
    let d =new DirEntity('/Local/Downloads', true, 1,1);
    res.json(d);
  });


file_router.get('/r/:table', (req:Request, res:Response, next:NextFunction) => {
    var sql=`SELECT * FROM ${req.params.table}`
    console.log(`read ${req.params.table}`);
  
    db.db.all(sql,[],(err,rows)=>{
      if (err) { throw err}
      res.json(rows);
    });
});
  
