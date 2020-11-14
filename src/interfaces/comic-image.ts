export interface ComicPage {
    pageNum: number;
    ext: string;
    mimeType: string;
    b: Buffer;
}

export function defaultComicPage(): ComicPage {
    return { pageNum: 0, ext: "", mimeType: "", b: Buffer.from("") }
}