import { CbrzDb } from './db';
import { SettingsTbl } from '../interfaces/app-cfg';

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
        this.loadSettings();
    }

    loadSettings() {
        let sql = 'SELECT * FROM settings';
        this.db.db.each(sql, [],
            (err, row: SettingsTbl) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this.cfg[row.key] = row.value;
                }
            },
            (err: any, count: number) => {
                if (err) { console.log(err); }
                console.log(`Loaded ${count} cbrz settings.`);
                this.validateSettings();
            });
    }

    validateSettings() {
        //detect new enumerations, and create if not present in db
        for (let enumKey of Object.values(CFG)) {
            if (!(enumKey in this.cfg)) {
                console.log(`missing ${enumKey}`);
                this.insertSetting(enumKey, '');
            }
        }

        //detect old database entries that no longer have an enumeration, and remove
        for (let dbKey in this.cfg) {
            if (!(Object.values(CFG).includes(dbKey as CFG))) {
                console.log(`old ${dbKey}`);
                this.removeSetting(dbKey);
            }
        }
    }


    removeSetting(key: string) {
        let sql = 'DELETE FROM settings WHERE key=?';
        this.db.db.run(sql, key, (err) => {
            if (err) {
                console.log(err.message);
            }
            delete this.cfg[key];
            console.log(`Removed ${key} from database.`);
        });

    }

    insertSetting(key: CFG, value: string) {
        let sql = 'INSERT INTO settings(key,value) values(?,?)';
        this.db.db.run(sql, [key, value], (err) => {
            if (err) {
                console.log(err.message);
            }
            console.log(`added ${key} = [${value}]`);
        });
    }

    set(key: CFG, value: string) {
        let sql = 'UPDATE settings SET value = ? WHERE key = ?';
        this.db.db.run(sql, [value, key], (err) => {
            if (err) {
                console.log(err.message);
            }
            this.cfg[key] = value;

            console.log(`${key} = [${value}]`);
        });
    }

    get(key: CFG): string {
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