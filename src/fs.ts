import path  from 'path';
import fs, { Dirent, readSync } from 'fs';

// series of classes for interacting with local  file  system

// dir walk classes /////

//directory class does most of the  heavy lifting
export class DirEntity {
  icon:string;
  ext:string;
  basename:string;
  parentFolder:string;
  itms:DirEntity[]; 
  
  ///TODO - shift icons into configuration somehow
  constructor(public fn:string, public isDir:boolean, public depth:number, public id:number){
    this.itms=[];
    if (isDir) {
      this.icon="folder";
      this.ext="";
      this.basename=path.basename(fn);
      this.parentFolder="";
      if (id==1) {
        this.walkDir(id,depth,fn);
      }
    }
    else {
      this.icon="book";
      this.ext=path.extname(fn);
      this.basename=path.basename(fn,this.ext);
      this.parentFolder=path.dirname(fn);
    }
  }

  walkDir(id:number, depth:number, fn:string) {
      //console.log(`${id} - walking ${fn}`);
      let files=fs.readdirSync(fn, {withFileTypes:true});

      let pending=files.length;
      if (pending) {

        files.forEach((d:Dirent)=>{
          id++;
          if (d.isDirectory()) {
            this.add(new DirEntity(`${fn}/${d.name}`,true, depth+1, id));
            id=this.walkDir(id,depth+1,`${fn}/${d.name}`);
          }
          else {
            this.add(new DirEntity(`${fn}/${d.name}`,false, depth+1, id));
          }    
        });
      }
      return id;
  }
  

  add(itm:DirEntity) { 
    this.itms.push(itm);
  }
};
