import express, { Express, NextFunction, Router, Request, Response } from 'express';
import { Server } from 'http';
import { appCors } from './app-cors';
export var app_quit = Router();

var app_server: Server;
var app_quit_ok: boolean = false;

export function assignServerToExit(s: Server) {
    app_server = s;
    app_quit_ok = true;
}

app_quit.use(appCors);

//Signal traps
process.on('SIGTERM', appExit);
process.on('SIGINT', appExit);

app_quit.get('/now', (req: Request, res: Response, next: NextFunction) => {
    if (app_quit_ok) {
        res.json({ state: "QUITTING NOW" });

        appExit();
    }
    else {
        res.json({ state: "UNREADY TO QUIT" });
    }

});

function appExit() {
    console.log('Exiting');

    app_server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(0);
    }, 10000);


}
