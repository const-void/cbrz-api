import { Database } from 'sqlite3'

const FILE_RENAMER_FN = "cbrz.db"

class Db {
    protected static instance: Db;
    readonly db: Database;

    protected constructor(private fn: string) {
        this.db = new Database(fn, (err) => {
            if (err) {
                console.log(err.message);
                throw (err);
            }
            else {
                console.log(`connected to ${fn}`);
            }
        });

    }

}

export class CbrzDb extends Db {
    static get(): CbrzDb {
        if (!CbrzDb.instance) {
            CbrzDb.instance = new CbrzDb(FILE_RENAMER_FN);
        }
        return CbrzDb.instance;
    }
}
