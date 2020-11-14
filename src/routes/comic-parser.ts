import express, { NextFunction, Router, Request, Response } from 'express';
import { appCors } from './app-cors';
export var comic_router = Router();
import { LocalFiles } from '../interfaces/local-files';
import { cfg, CFG } from '../modules/settings';
import { loadComic, ComicFile } from '../modules/comics';
import { ComicPage } from '../interfaces/comic-image';


comic_router.use(appCors);

comic_router.get('/get-page-len', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body, results: { page_count: "" } };
    let f: LocalFiles = req.body;
    let c: ComicFile = loadComic(f);
    res.json(c.getPageCount());
});

comic_router.get('/get-page/:pageNum', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body };
    let f: LocalFiles = req.body;
    let n: number = +req.params.pageNum;
    let c: ComicFile = loadComic(f);
    let p: ComicPage = c.getPage(n);

    //https://github.com/expressjs/express/issues/732
    res.contentType(p.mimeType);
    res.end(p.b, 'binary');

});

