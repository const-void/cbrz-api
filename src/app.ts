import express, { NextFunction, Router, Request, Response } from 'express';
import bodyParser from 'body-parser';

import {cbo_router} from './routes/cbo';  //via /api 
import {file_router}  from './routes/file-renamer'; 
import {file_mover} from   './routes/file-mover';
import { FileRenamerSettings } from './modules/settings';

//paths are managed in settings db
let cfg=FileRenamerSettings.inst();

const port = 3000;
var app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api',cbo_router);
app.use('/file-renamer',file_router);
app.use('/file-mover',file_mover);

app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  
  return console.log(`server is listening on ${port}`);
});