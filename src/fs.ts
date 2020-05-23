import path  from 'path';
import fs, { Dirent, readSync } from 'fs';

// series of classes for interacting with local  file  system

// dir walk classes /////

// generic storage entity class
class StorageEntity {
    ext?:string;
    basename:string;
    constructor(public fn:string, public isDir:boolean) {
        if (isDir) {
            this.basename=path.basename(fn);
        }
        else {
            this.ext=path.extname(fn);
            this.basename=path.basename(fn,this.ext);
        }
    }
};

//directory class does most of the  heavy lifting
export class DirEntity extends StorageEntity {
  itms:StorageEntity[]; 
  
  constructor(fn:string, done: (err:Error|null, d?:DirEntity)=>void){
    super(fn,true);
    this.itms=[];
    //this.path=fn;
   

    //console.log(`process ${fn}`);

    fs.readdir(fn, {withFileTypes:true}, (err:Error|null,files:fs.Dirent[]) => {
      if (err) { return done(err); }

      let pending=files.length;
      if (!pending) {
        //console.log(`dir walk done ${fn} - empty files - ${pending}`)
        return done (null,this);
      }
      files.forEach((d:Dirent)=>{
        if (d.isDirectory()) {
          new DirEntity(`${fn}/${d.name}`,(err:Error|null,newD?:DirEntity)=>{
            if (err) {return done(err);}
            if (newD) { this.add(newD); }
            if (!--pending) {
              //console.log(`dir walk done ${fn} / ${d.name} - ${this.itms.length} files - ${pending}`)
              return(done(null,this))
            }
          });
        }
        else {
          this.add(new FileEntity(`${fn}/${d.name}`));
          if (!--pending) {
            //console.log(`dir walk done ${fn} - ${this.itms.length} files - ${pending}`)
            return(done(null,this))
          }  
        }    
      });

    });
  }

  add(itm:StorageEntity) { 
    this.itms.push(itm);
  }
};

// file entity
class FileEntity extends StorageEntity {
  path:string;

  constructor (fn:string) {
    super(fn,false);
    this.path=path.dirname(fn);
  }
}