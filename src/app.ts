import express, { NextFunction, Router, Request, Response } from 'express';
import bodyParser from 'body-parser';

import { app_quit, assignServerToExit } from './routes/app-quit';
import { file_router } from './routes/file-renamer';
import { file_mover } from './routes/file-mover';
import { comic_router } from './routes/comic-parser';
import { CbrzSettings } from './modules/settings';

//paths are managed in settings db
let cfg = CbrzSettings.inst();

const port = 3000;
var app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/app-quit', app_quit);

app.use('/file-renamer', file_router);
app.use('/file-mover', file_mover);
app.use('/comic-parser', comic_router);


app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

let server = app.listen(port, err => {
  if (err) {
    return console.error(err);
  }

  return console.log(`server is listening on ${port}`);
});

assignServerToExit(server);

