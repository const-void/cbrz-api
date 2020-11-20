import { LocalFiles } from '../interfaces/local-files';
import AdmZip from 'adm-zip';
import { createExtractorFromData } from 'node-unrar-js';
import FileType, { FileTypeResult } from 'file-type';
import { ComicPage, defaultComicPage } from '../interfaces/comic-image';
import { ArcList, Extractor, FileHeader, Result } from 'node-unrar-js/dist/js/extractor';
import { readFileSync } from 'fs';


export enum COMIC_FILE_TYPE {
    CBZ,
    CBR,
    PDF,
    UNKNOWN
}

function get_comic_type(f: LocalFiles): COMIC_FILE_TYPE {
    let ext: string = f.ext.toLowerCase();
    switch (ext) {
        case 'cbz':
        case '.cbz': return COMIC_FILE_TYPE.CBZ;
        case 'cbr':
        case '.cbr': return COMIC_FILE_TYPE.CBR;
        case 'pdf':
        case '.pdf': return COMIC_FILE_TYPE.PDF;
    }
    return COMIC_FILE_TYPE.UNKNOWN;
}

export abstract class ComicFile {
    constructor(public f: LocalFiles, public comicType: COMIC_FILE_TYPE) { }
    abstract getPageCount(): number;
    abstract getPage(n: number): Promise<ComicPage>;
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

    orderPages() {
        this.e = this.e.sort((a, b) => (a.name > b.name) ? 1 : -1);
    }

    getPageCount(): number {
        console.log(`Page count: ${this.e.length}`);
        let max: number = 0;
        this.e.forEach((p) => { if (!p.isDirectory) { max++; } });
        return max;
    }

    async getPage(n: number): Promise<ComicPage> {
        let c: ComicPage = defaultComicPage();
        c.pageNum = n - 1;
        this.orderPages();
        let p: AdmZip.IZipEntry = this.e[c.pageNum];
        while (p.isDirectory) {
            p = this.e[c.pageNum++];
        }
        console.log(`loading page ${n} (${c.pageNum})...`);
        c.b = p.getData();
        console.log(`loaded`);
        //https://github.com/sindresorhus/file-type/

        let t = await FileType.fromBuffer(c.b);
        if (t) {
            c.ext = t.ext;
            c.mimeType = t.mime;
            console.log(`ext: ${c.ext} (${c.mimeType})`);

        }
        return c;
    }
}


export class ComicFileCBR extends ComicFile {
    //https://github.com/cthackers/adm-zip

    static z: Extractor; //rar extractor 
    static zFn: string = "";  //filename
    static zLoaded: boolean = false;
    eOk: boolean;
    static e: ArcList;  //pages

    constructor(f: LocalFiles) {
        super(f, COMIC_FILE_TYPE.CBR);
        this.eOk = false;
        if (ComicFileCBR.zLoaded) {
            console.log(`Using cached  ${ComicFileCBR.zFn} `);
            this.eOk = true;
        }
        else {
            console.log(`Loading rar ${this.f.fn} into memory`);
            var buf = Uint8Array.from(readFileSync(this.f.fn)).buffer;
            console.log('loaded')
            ComicFileCBR.z = createExtractorFromData(buf);
            console.log(`Ready to process ${this.f.fn}`);
            let rv = ComicFileCBR.z.getFileList(); //includes directories....i guess???

            if ((rv[0].state == 'SUCCESS') && (rv[1] != null)) {
                this.eOk = true;
                ComicFileCBR.e = rv[1];
                this.orderPages();
                ComicFileCBR.zFn = this.f.fn;
                ComicFileCBR.zLoaded = true;
            }
        }
    }

    orderPages() {
        if (this.eOk) {
            ComicFileCBR.e.fileHeaders = ComicFileCBR.e.fileHeaders.sort((a, b) => (a.name > b.name) ? 1 : -1);
        }
    }

    getPageCount(): number {
        console.log(`Quick page count: ${ComicFileCBR.e.fileHeaders.length}`);
        let max: number = 0;
        ComicFileCBR.e.fileHeaders.forEach((p) => { if (!p.flags.directory) { max++; } });
        return max;
    }

    async getPage(n: number): Promise<ComicPage> {
        let c: ComicPage = defaultComicPage();
        c.pageNum = n - 1;
        let p: FileHeader = ComicFileCBR.e.fileHeaders[c.pageNum];
        while (p.flags.directory) {
            p = ComicFileCBR.e.fileHeaders[c.pageNum++];
        }
        console.log(`loading page ${n} (idx ${c.pageNum}) - ${ComicFileCBR.e.fileHeaders[c.pageNum].name} ...`);
        let rv = ComicFileCBR.z.extractFiles([ComicFileCBR.e.fileHeaders[c.pageNum].name]);
        if ((rv[0].state == 'SUCCESS') && (rv[1] != null)) {
            if (rv[1].files[0] != null) {
                //console.log(rv[1].files[0]);
                if ((rv[1].files[0].extract[0].state == 'SUCCESS') && (rv[1].files[0].extract[1] != null)) {
                    //console.log(`${rv[1].files[0].extract[1].length} bytes `);
                    c.b = Buffer.from(rv[1].files[0].extract[1]);
                }
                else {
                    console.log(`file extract failed ${rv[1].files[0].extract[1]}`);
                }
            }
            else {
                console.log('null file');
            }
        }
        else {
            console.log(`extract failed ${rv[0].state}`);
        }
        console.log(`loaded`);
        //https://github.com/sindresorhus/file-type/

        //this could go in parent class method
        let t = await FileType.fromBuffer(c.b);
        if (t) {
            c.ext = t.ext;
            c.mimeType = t.mime;
            console.log(`ext: ${c.ext} (${c.mimeType})`);

        }
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

    getPage(n: number): Promise<ComicPage> {
        return new Promise((resolve, reject) => { resolve(defaultComicPage()); })
    }
}

//factory function
export function loadComic(f: LocalFiles): ComicFile {
    let comic_type: COMIC_FILE_TYPE = get_comic_type(f);
    console.log(`comic ${f.fn} is ${comic_type}`);
    let c: ComicFile;
    switch (comic_type) {
        case COMIC_FILE_TYPE.CBZ: c = new ComicFileCBZ(f); break;
        case COMIC_FILE_TYPE.CBR: c = new ComicFileCBR(f); break;
        case COMIC_FILE_TYPE.PDF:
        default: c = new ComicFileUnknown(f); break;
    }
    return (c);
}