import express, { NextFunction, Router, Request, Response } from 'express';
import { appCors } from './app-cors';
export var file_mover = Router();
import { DirEntity } from '../fs';
import { LocalFiles, FileMove } from '../interfaces/local-files';
import { MkDir, RenameDir, DirRename } from '../interfaces/local-dirs';
import { CbrzDb } from '../db';
import { renameSync, mkdirSync } from 'fs';
import { cfg, CFG } from '../modules/settings';
import { join } from 'path';
import { sync } from 'move-file';

const db = CbrzDb.get();

file_mover.use(appCors);

file_mover.get('/list/:path', (req: Request, res: Response, next: NextFunction) => {
    let cfgKey = CFG[req.params.path.toUpperCase() as keyof typeof CFG];
    let cfgPath: string = cfg(cfgKey);

    let dirOnly: boolean = false;
    let exts: string[] = [];

    switch (cfgKey) {
        case CFG.RENAME_PATH: dirOnly = true; break;
        case CFG.FILE_MOVE_SOURCE_PATH: exts = [".cbr", ".cbz"]; break;
    }

    //todo - move inside database
    console.log(`Walk ${req.params.path} => ${cfgKey} = ${cfgPath}`);
    let d = new DirEntity(cfgPath, true, 1, 1, dirOnly, exts);
    res.json(d);
});

file_mover.post('/rename-dir', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body, results: { origPath: "", newPath: "" } };
    let f: DirRename = req.body;

    //create a return packet
    rv.results.origPath = join(f.parentFolder, f.origName);
    rv.results.newPath = join(f.parentFolder, f.newName);
    console.log(`RENAME [${rv.results.origPath}] => [${rv.results.newPath}]`);
    renameSync(rv.results.origPath, rv.results.newPath);
    res.json(rv.results);
});

file_mover.post('/mk-dir', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body };
    let f: MkDir = req.body;
    console.log(`MKDIR [${f.newPath}]`);
    mkdirSync(f.newPath);
    res.json(rv);
});

file_mover.post('/mv-files', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body };
    let opts: FileMove = req.body;
    let srcPath: string = "";
    let destPath: string = "";

    for (let i of opts.itms) {
        if (i.src) {
            srcPath = join(i.fn);
            destPath = join(opts.destPath, `${i.basename}${i.ext}`);
            sync(srcPath, destPath);
            console.log(`${srcPath}=>${destPath}`);
        }
    }
    res.json(rv);
});

