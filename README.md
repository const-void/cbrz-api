# cb[rz]
cb[rz] is a digital comic book file manager that makes it easy to organize and rename books from Humble Bundle, groupees, fanatical etc--who have TERRIBLE and CHAOTIC filenaming approaches.  

There are two  components, which are both intended to be run on the same computer and present a cohesive desktop experience. 

Tested on Win10 w/Chrome, but probably would work anywhere with anything.

Handy features include:
* Quickly moving a bundle of downloads to a directories of your choice
* One-click rename that takes care of all the goofy bundle stuff, including text removal (regular expressions!) and basic formatting of issue #, volume #, etc; includes a preview so you know what you are getting into!
* Regular expression search/replace to quickly rename groups of files.   Includes real time preview so no 'oopsies'!
* Eazy-peazy file rename where you can set the filename to whatever you want; keeps the current extension.
* Cover preview and one-click buttons to set the publishing year. 

Typical usage:
1. After downloading the latest humble bundle, you fire up the api and ui portions of cb[rz].  
2. From your browser, move files out of `~\Downloads` into a `Comic` staging area, creating subdirectories for each title.
3. Next, you fiddle with mass rename options, until you get "good" enough "one click" results: replace "_" with space, initial caps, issue/vol # sanitiation, getting rid of useless text etc.
4. Next, do global search & replace, adding additional title details as you need.  For onsie/twosie stuff, just key in the comic's actual title.
5. Then take a look at the first few pages of each comic so you (visually) can figure out the copyright year, since, for whatever reason, digital comic bundlers refuse to do so. 
6.  Finally, shutdown cb[rz]; manually s/ftp or drop the comics into a finalized location - a NAS, different directory, etc.

# install
```powershell
> mkdir cbrz
> cd cbrz
> git clone 
> git clone
```

# start - win10 shortcut
In  parent `cbrz` folder:
1. Create shortcut to `cbrz\cbrz-api\start_api.ps1`
2. Create shortcut to `cbrz\cbrz-ui\start_ui.ps1`
3. Pin both shortcuts to task bar
4. Click `start api` shortcut to launch express/api server 
5. Click `start ui` shortcut to launch ng serve/ui server

Chrome/default browser should open automatically.

# start - win10 powershell cmd-line
```powershell
> cd cbrz/cbrz-api
> start powershell .\start_api.ps1
> cd ../cbrz-ui
> start powershell .\start_ui.ps1
```

# stop
kill the twin servers: ctrl+c until dead, or otherwise kill the parent powershell process.

# cb[rz]-api notes
cb[rz] assumes *you* have control of your computer and there isn't anyone around looking to exploit it.  For now, I would not recommend leaving the api portion running for a super long time.  Like a thick .exe, fire it up when you need it, then shut it down when you don't. 

The ui side should be 100% safe; the api, by design, builds directories, moves and renames files. 

## development notes
To start:
npm run dev ... nodemon will keep the app running.

### install history 
npm install adm-zip
npm install @types/adm-zip
npm install file-type
npm install node-rar-js  2020-11-18 for unrarring
npm i mimetype   for figuring out mimetype of return object (png or  jpg etc)
 npm rm -D eslint
  20 npm i -D eslint
  21 npm rm -D @typescript-eslint/eslint-plugin @typescr... 
  22 npm i -D @typescript-eslint/eslint-plugin @typescri..

### todos:
* localhost only -- set an ipfilter to allow only localhost/127.0.01 requests.
* pdf 
* transactions!!!
* routers!!!
* create db.ok_to_cont(err,resp)
    - return true if no err
    - return false if err, and do something common with err
* common logging...how?


### bibliography
https://developer.okta.com/blog/2018/11/15/node-express-typescript
https://codebrains.io/setting-up-express-with-typescript/
https://gist.github.com/erikvullings/c7eed546a4be0ba43532f8b83048ef38 -- dir walk
https://xgrommx.github.io/rx-book/ RxJs
