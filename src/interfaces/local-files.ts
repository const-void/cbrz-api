export interface LocalFiles {
    id:number;
    fn:string;
    isDir:boolean;
    depth:number;
    path:string;
    basename:string;
    ext:string;
    itms:LocalFiles[];
    dest_ext:string;
    dest_basename:string;
    isDestDifferent:boolean;
    parentFolder:string;
    renamed:boolean;
  }