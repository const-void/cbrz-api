import path  from 'path';
import fs, { Dirent, readSync } from 'fs';

// series of classes for interacting with local  file  system

// dir walk classes /////

//directory class does most of the  heavy lifting

//refactor params into an interface!! way too 
export class DirEntity {
  icon:string;
  ext:string;
  basename:string;
  parentFolder:string;
  itms:DirEntity[]; 
  
  ///TODO - shift icons into configuration somehow
  constructor(public fn:string, public isDir:boolean, public depth:number, public id:number, dirOnly:boolean=false, exts:string[]=[]){
    this.itms=[];
    if (isDir) {
      this.icon="folder";
      this.ext="";
      this.basename=path.basename(fn);
      this.parentFolder="";
      if (id==1) {
        this.walkDir(id,depth,fn,dirOnly,exts);
      }
    }
    else {
      if (!dirOnly) {
        this.icon="book";
        this.ext=path.extname(fn);
        this.basename=path.basename(fn,this.ext);
        this.parentFolder=path.dirname(fn);
      }
      else {
        this.icon="";
        this.ext="";
        this.basename="";
        this.parentFolder="";
      }
    }
  }

  walkDir(id:number, depth:number, fn:string, dirOnly: boolean,exts:string[]) {
      //console.log(`${id} - walking ${fn}`);
      let files=fs.readdirSync(fn, {withFileTypes:true});

      let pending=files.length;
      if (pending) {

        files.forEach((d:Dirent)=>{
          id++;
          if (d.isDirectory()) {
            this.add(new DirEntity(`${fn}/${d.name}`,true, depth+1, id,dirOnly,exts),dirOnly, exts);
            id=this.walkDir(id,depth+1,`${fn}/${d.name}`,dirOnly,exts);
          }
          else {
              this.add(new DirEntity(`${fn}/${d.name}`,false, depth+1, id,dirOnly,exts),dirOnly, exts);
          }    
        });
      }
      return id;
  }
  

  add(itm:DirEntity, dirOnly:boolean,  exts:string[]) { 
    if (dirOnly) {
      if (itm.isDir) {
        this.itms.push(itm);  
      }
    }
    else {
      if ( itm.isDir ||  //Always add Directories 
        ( //File  
          (exts.length==0) || //*
          (exts.includes(itm.ext))  
        )
      ) {     
        this.itms.push(itm);
      }      
    }

  }
};
