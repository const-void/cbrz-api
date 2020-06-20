import { FileRenamerDb } from '../db';
import { SettingsTbl } from '../interfaces/db-file-renamer';

interface Cfg {
    [key: string]: string;
}
 
export enum CFG {
    RENAME_PATH = "rename-path",
    FILE_MOVE_SOURCE_PATH = "file-move-source-path"
}

export class FileRenamerSettings  {
    private db:FileRenamerDb;
    private cfg:Cfg;
    protected static instance: FileRenamerSettings;

    constructor() {
        console.log('Loading file-renamer settings');
        this.db=FileRenamerDb.get();
        this.cfg={};
        this.getAll();
    }

    getAll() {
        let sql='SELECT * FROM settings';
        this.db.db.each(sql,[],(err,row:SettingsTbl)=>{
            this.cfg[row.key]=row.value;
        },
        (err: any,count:number)=>{
            if (err) { console.log(err); }
            console.log(`Loaded ${count} file-renamer settings`);
        });
    }

    get(key:CFG) {
        return this.cfg[key];
    }

    //inst=instance
    static inst():FileRenamerSettings {
        if (!FileRenamerSettings.instance) {
            FileRenamerSettings.instance=new FileRenamerSettings();
        }
        return FileRenamerSettings.instance;
    }

    //set(key, value)...todo

}

export function cfg(key:CFG):string {
    return FileRenamerSettings.inst().get(key);
}