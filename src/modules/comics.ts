import { LocalFiles } from '../interfaces/local-files';
import AdmZip from 'adm-zip';
import FileType, { FileTypeResult } from 'file-type';
import { ComicPage, defaultComicPage } from '../interfaces/comic-image';

export enum COMIC_FILE_TYPE {
    CBZ,
    CBR,
    PDF,
    UNKNOWN
}

function get_comic_type(f: LocalFiles): COMIC_FILE_TYPE {
    let ext: string = f.ext.toLowerCase();
    switch (ext) {
        case 'cbz': return COMIC_FILE_TYPE.CBZ;
        case 'cbr': return COMIC_FILE_TYPE.CBZ;
        case 'pdf': return COMIC_FILE_TYPE.PDF;
    }
    return COMIC_FILE_TYPE.UNKNOWN;
}

export abstract class ComicFile {
    constructor(public f: LocalFiles, public comicType: COMIC_FILE_TYPE) { }
    abstract getPageCount(): number;
    abstract getPage(n: number): ComicPage;
}

export class ComicFileCBZ extends ComicFile {
    //https://github.com/cthackers/adm-zip

    z: AdmZip;
    e: AdmZip.IZipEntry[];

    constructor(f: LocalFiles) {
        super(f, COMIC_FILE_TYPE.CBZ);
        console.log(`Loading zip ${this.f.fn}`);
        this.z = new AdmZip(this.f.fn);
        console.log(`Loaded ${this.f.fn}`);
        this.e = this.z.getEntries(); //includes directories....i guess???

    }

    getPageCount(): number {
        console.log(`Page count: ${this.e.length}`);
        return this.e.length;
    }

    getPage(n: number): ComicPage {
        let c: ComicPage = defaultComicPage();
        c.pageNum = n - 1;
        let p: AdmZip.IZipEntry = this.e[c.pageNum];
        while (p.isDirectory) {
            p = this.e[c.pageNum++];
        }
        console.log(`loading page ${n} (${c.pageNum})...`);
        c.b = p.getData();
        console.log(`loaded`);
        //https://github.com/sindresorhus/file-type/
        (async () => {
            let t = await FileType.fromBuffer(c.b);
            if (t) {
                c.ext = t.ext;
                c.mimeType = t.mime;
                console.log(`ext: ${c.ext} (${c.mimeType})`);
            }
        })();
        return c;
    }
}

export class ComicFileUnknown extends ComicFile {

    constructor(f: LocalFiles) {
        super(f, COMIC_FILE_TYPE.UNKNOWN);
    }

    getPageCount(): number {
        return 0;
    }

    getPage(n: number): ComicPage {
        return defaultComicPage();
    }
}

//factory function
export function loadComic(f: LocalFiles): ComicFile {
    let comic_type: COMIC_FILE_TYPE = get_comic_type(f);
    let c: ComicFile;
    switch (comic_type) {
        case COMIC_FILE_TYPE.CBZ: c = new ComicFileCBZ(f); break;
        case COMIC_FILE_TYPE.CBR:
        case COMIC_FILE_TYPE.PDF:
        default: c = new ComicFileUnknown(f); break;
    }
    return (c);
}