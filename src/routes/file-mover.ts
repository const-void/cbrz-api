import express, { NextFunction, Router, Request, Response } from 'express';
import {appCors} from './app-cors';
export var file_mover = Router();
import { DirEntity }  from '../fs';
import { LocalFiles } from '../interfaces/local-files';
import { MkDir, RenameDir } from '../interfaces/local-dirs';
import {FileRenamerDb} from '../db';
import { renameSync, mkdirSync } from 'fs';
import { cfg,CFG } from '../modules/settings';

const db = FileRenamerDb.get();

file_mover.use(appCors);

file_mover.get('/list/:path',(req:Request, res:Response, next:NextFunction)=>{
    let cfgKey=CFG[req.params.path.toUpperCase() as keyof typeof CFG];
    let cfgPath:string = cfg(cfgKey);

    let dirOnly:boolean=false;
    let exts:string[]=[];

    switch (cfgKey) {
        case CFG.RENAME_PATH: dirOnly=true; break;
        case CFG.FILE_MOVE_SOURCE_PATH: exts=[".cbr",".cbz",".rar",".zip"]; break;
    } 

    //todo - move inside database
    console.log(`Walk ${req.params.path} => ${cfgKey} = ${cfgPath}`);
    let d =new DirEntity(cfgPath, true, 1,1,dirOnly, exts);
    res.json(d);
  });

  file_mover.post('/rename-dir', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body } ;
    let f:RenameDir=req.body;
    console.log(`RENAME [${f.origPath}] => [${f.newPath}]`);
    renameSync(f.origPath,f.newPath);
    res.json(rv);
});

file_mover.post('/mk-dir', (req:Request, res:Response, next:NextFunction) => {
    var rv = { orig_params:req.params, orig_body:req.body } ;
    let f:MkDir=req.body;
    console.log(`MKDIR [${f.newPath}]`);
    mkdirSync(f.newPath);
    res.json(rv);
});