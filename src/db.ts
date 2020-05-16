import { Database } from 'sqlite3'

const DB_FILENAME="cbodb_master.db"

class CboDb {
    private static instance: CboDb;
    readonly db:Database; 

    private constructor(private fn:string){
        this.db=new Database(fn, ( err )=>{
            if (err) {
                console.log(err.message);
                throw(err);
            }
            else {
                console.log(`connected to ${fn}`);
            }
        });
             
    }

    static get():CboDb {
        if (!CboDb.instance) {
            CboDb.instance=new CboDb(DB_FILENAME);
        }

        return CboDb.instance;
    }

}

export { CboDb };