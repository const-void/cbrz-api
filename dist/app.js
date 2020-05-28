"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const db_1 = require("./db");
const cors_1 = __importDefault(require("cors"));
const fs_1 = require("./fs");
const port = 3000;
const db = db_1.CboDb.get();
var app = express_1.default();
var router = express_1.Router();
//https://brianflove.com/2017-03-22/express-cors-typescript/
//options for cors midddleware
const options = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: "http://localhost:4200",
    preflightContinue: false
};
//use cors middleware
router.use(cors_1.default(options));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
router.get('/files', (req, res, next) => {
    let d = new fs_1.DirEntity('/Local/Downloads/Kabuki (1994 - 2000, David Mack)', true, 1, 1);
    res.json(d);
});
//inspect should be part of a load process that caches tables into memory
//there should be a refresh command that rereshes the cache
router.get('/inspect', (req, res, next) => {
    var sql = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name";
    db.db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});
router.get('/inspect/:table', (req, res, next) => {
    var sql = "SELECT sql FROM sqlite_master WHERE type='table' and tbl_name=?";
    sql = `PRAGMA table_info('${req.params.table}')`;
    console.log(`inspecting ${req.params.table}`);
    db.db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});
// /cboid/id
router.get('/cbo/:id', (req, res, next) => {
    var sql = "SELECT tbl FROM cbo_id WHERE id=?";
    console.log(`inspecting cboid ${req.params.id}`);
    db.db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }
        if (rows.length > 0) {
            var sql2 = `SELECT * from ${rows[0].tbl} where id=?`;
            db.db.all(sql2, [req.params.id], (err2, rows2) => {
                if (err2) {
                    throw err2;
                }
                rows2[0].table = rows[0].tbl;
                res.json(rows2[0]);
            });
        }
    });
});
// -> look up table, id 
router.get('/crud/:table', (req, res, next) => {
    var sql = `SELECT * FROM ${req.params.table}`;
    console.log(`read ${req.params.table}`);
    db.db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});
router.get('/crud/:table/:id', (req, res, next) => {
    var sql = `SELECT * FROM ${req.params.table} where id=?`;
    console.log(`read ${req.params.table} (${req.params.id})`);
    db.db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows[0]);
    });
});
//insert
router.post('/crud/:table', (req, res, next) => {
    var rv = { orig_params: req.params, orig_body: req.body, id: 0 };
    //todo - confirm there is no id in body
    //https://www.sqlite.org/lang_transaction.html
    //https://github.com/mapbox/node-sqlite3/wiki/Control-Flow
    //
    console.log('no / null id in json body--create');
    //create an insert sql--interrogate body parameters
    var col_names = Object.keys(req.body);
    col_names.push('id');
    var values = Array(col_names.length).fill('?').toString();
    var cols = col_names.toString();
    var vals = Object.values(req.body);
    var insert_sql = `INSERT INTO ${req.params.table} (${cols}) VALUES (${values})`;
    console.log(insert_sql);
    let ts = Date.now();
    db.db.run('INSERT INTO cbo_id (tbl, created_ts, modified_ts) VALUES (?,?,?)', [req.params.table, ts, ts], function (err) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        vals.push(this.lastID);
        rv.id = this.lastID;
        console.log(`created cboid ${this.lastID}`);
        db.db.run(insert_sql, vals, function (err) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            res.json(rv);
        });
    });
});
//update
router.post('/crud/:table/:id', (req, res, next) => {
    var rv = { orig_params: req.params, orig_body: req.body, id: req.params.id };
    delete req.body.id;
    var sql = `UPDATE ${req.params.table} SET `;
    var first_flag = true;
    for (let col_name of Object.keys(req.body)) {
        if (first_flag) {
            first_flag = false;
        }
        else {
            sql += ",";
        }
        sql += `${col_name}=?`;
    }
    sql += ` WHERE id=?`;
    var vals = Object.values(req.body);
    vals.push(req.params.id);
    console.log(sql);
    db.db.run(sql, vals, function (err) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        let cboid_sql = "UPDATE cbo_id SET modified_ts=? where id=?";
        let ts = Date.now();
        db.db.run(cboid_sql, [ts, req.params.id], function (err) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            res.json(rv);
        });
    });
});
//delete - delete from source table first, then from cboid table nextr
//todo - make this a transaction...somehow!!!
router.delete('/crud/:id', (req, res, next) => {
    var rv = { orig_params: req.params, orig_body: req.body, id: req.params.id };
    var sql = `select tbl from cbo_id where id=${req.params.id}`;
    console.log(`get cboid table --  ${sql}`);
    db.db.get(sql, [], function (err, row) {
        if (err) {
            console.log(err);
            res.json(err);
        }
        console.log(row);
        var sql2 = `delete from ${row.tbl} where id=${req.params.id}`;
        console.log(sql2);
        db.db.run(sql2, [], function (err) {
            if (err) {
                console.log(err);
                res.json(err);
            }
            var sql3 = `delete from cbo_id where id=${req.params.id}`;
            console.log(sql3);
            db.db.run(sql3, [], function (err) {
                if (err) {
                    console.log(err);
                    res.json(err);
                }
                console.log('success!');
                res.json(rv);
            });
        });
    });
});
//update
router.post('/crud/:table/:id', (req, res, next) => {
    //some sort of table<->id validator here
    var sql = `SELECT * FROM ${req.params.table} where id=?`;
    console.log(`read ${req.params.table} (${req.params.id})`);
    db.db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows[0]);
    });
});
app.use('/api', router);
/*app.use(function(req, res, next) {
  require('./crud')(req, res, next);
});*/
app.get('/', (req, res) => {
    res.send('The sedulous hyena ate the antelope!');
});
app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    return console.log(`server is listening on ${port}`);
});
//# sourceMappingURL=app.js.map