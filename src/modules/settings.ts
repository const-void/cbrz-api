import { CbrzDb } from '../db';
import { SettingsTbl } from '../interfaces/db-file-renamer';

interface Cfg {
    [key: string]: string;
}

export enum CFG {
    RENAME_PATH = "rename-path",
    FILE_MOVE_SOURCE_PATH = "file-move-source-path"
}

export class CbrzSettings {
    private db: CbrzDb;
    private cfg: Cfg;
    protected static instance: CbrzSettings;

    constructor() {
        console.log('Loading cbrz settings');
        this.db = CbrzDb.get();
        this.cfg = {};
        this.getAll();
    }

    getAll() {
        let sql = 'SELECT * FROM settings';
        this.db.db.each(sql, [], (err, row: SettingsTbl) => {
            this.cfg[row.key] = row.value;
        },
            (err: any, count: number) => {
                if (err) { console.log(err); }
                console.log(`Loaded ${count} cbrz settings`);
            });
    }

    get(key: CFG) {
        return this.cfg[key];
    }

    //inst=instance
    static inst(): CbrzSettings {
        if (!CbrzSettings.instance) {
            CbrzSettings.instance = new CbrzSettings();
        }
        return CbrzSettings.instance;
    }

    //set(key, value)...todo

}

export function cfg(key: CFG): string {
    return CbrzSettings.inst().get(key);
}