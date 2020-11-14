import express, { NextFunction, Router, Request, Response } from 'express';
import { appCors } from './app-cors';
export var comic_router = Router();
import { LocalFiles } from '../interfaces/local-files';
import { cfg, CFG } from '../modules/settings';
import { loadComic, ComicFile } from '../modules/comics';
import { ComicPage } from '../interfaces/comic-image';


comic_router.use(appCors);

comic_router.post('/get-page-len', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body, results: { page_count: "" } };
    //console.log(req.body);
    let f: LocalFiles = req.body;
    console.log(`getting page length of ${f.basename}`);
    let c: ComicFile = loadComic(f);
    res.json(c.getPageCount());
});

comic_router.post('/get-page/:pageNum', (req: Request, res: Response, next: NextFunction) => {
    var rv = { orig_params: req.params, orig_body: req.body };
    let f: LocalFiles = req.body;
    let n: number = +req.params.pageNum;
    let c: ComicFile = loadComic(f);
    c.getPage(n).then((p) => {
        //https://github.com/expressjs/express/issues/732
        //http://expressjs.com/en/api.html#res.set
        res.set('content-type', p.mimeType);
        res.set("content-disposition", "inline");
        //console.log(res.getHeaders());
        res.send(p.b);
        //res.end(p.b, 'binary');
    });


});


