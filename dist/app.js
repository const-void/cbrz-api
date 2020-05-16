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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const db_1 = require("./db");
const port = 3000;
const db = db_1.CboDb.get();
var app = express_1.default();
var router = express_1.Router();
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
        res.json(rows);
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