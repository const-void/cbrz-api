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
  constructor(public fn:string, public isDir:boolean, public depth:number, done: (err:Error|null, d?:DirEntity)=>void){
    this.itms=[];
    if (isDir) {
      this.icon="folder";
      this.ext="";
      this.basename=path.basename(fn);
      this.parentFolder="";
      this.walkDir(done);
    }
    else {
      this.icon="book";
      this.ext=path.extname(fn);
      this.basename=path.basename(fn,this.ext);
      this.parentFolder=path.dirname(fn);
      done(null,this);
    }
  }

  walkDir(done: (err:Error|null, d?:DirEntity)=>void) {
      fs.readdir(this.fn, {withFileTypes:true}, (err:Error|null,files:fs.Dirent[]) => {
      if (err) { return done(err); }

      let pending=files.length;
      if (!pending) {
        //console.log(`dir walk done ${fn} - empty files - ${pending}`)
        return done (null,this);
      }
      files.forEach((d:Dirent)=>{
        if (d.isDirectory()) {
          new DirEntity(`${this.fn}/${d.name}`,true, this.depth+1, (err:Error|null,newD?:DirEntity)=>{
            if (err) {return done(err);}
            if (newD) { this.add(newD); }
            if (!--pending) {
              //console.log(`dir walk done ${fn} / ${d.name} - ${this.itms.length} files - ${pending}`)
              return(done(null,this))
            }
          });
        }
        else {
          this.add(new DirEntity(`${this.fn}/${d.name}`,false,this.depth+1,(err:Error|null,newD?:DirEntity)=>{
            if (!--pending) {
              //console.log(`dir walk done ${fn} - ${this.itms.length} files - ${pending}`)
              return(done(null,this))
            }    
          }));
        }    
      });

    });
  }

  add(itm:DirEntity) { 
    this.itms.push(itm);
  }
};
