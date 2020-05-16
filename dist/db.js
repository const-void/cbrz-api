"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CboDb = void 0;
const sqlite3_1 = require("sqlite3");
const DB_FILENAME = "cbodb_master.db";
class CboDb {
    constructor(fn) {
        this.fn = fn;
        this.db = new sqlite3_1.Database(fn, (err) => {
            if (err) {
                console.log(err.message);
                throw (err);
            }
            else {
                console.log(`connected to ${fn}`);
            }
        });
    }
    static get() {
        if (!CboDb.instance) {
            CboDb.instance = new CboDb(DB_FILENAME);
        }
        return CboDb.instance;
    }
}
exports.CboDb = CboDb;
//# sourceMappingURL=db.js.map