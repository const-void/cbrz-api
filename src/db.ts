import { Database } from 'sqlite3'

const CBODB_FN="cbodb_master.db"
const FILE_RENAMER_FN="cbodb_file_renamer.db"

class Db {
    protected static instance: Db;
    readonly db:Database; 
    
    protected constructor(private fn:string){
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

}

export class CboDb extends Db {
    static get():CboDb {
        if (!CboDb.instance) {
            CboDb.instance=new CboDb(CBODB_FN);
        }
        return CboDb.instance;
    }
}


export class FileRenamerDb extends Db {
    static get():FileRenamerDb {
        if (!FileRenamerDb.instance) {
            FileRenamerDb.instance=new FileRenamerDb(FILE_RENAMER_FN);
        }
        return FileRenamerDb.instance;
    }
}
