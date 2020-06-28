To start:
npm run dev ... nodemon will keep the app running.

the cbo_id table is an index of cbo_ids to table

cbo_name is a FTS5 table that should have all the searchable text.  I probably should rename the text field from name to something else.  Later???


todos:
* transactions!!!
* routers!!!
* create db.ok_to_cont(err,resp)
    - return true if no err
    - return false if err, and do something common with err
* common logging...how?
* cbo_user.db -- user notes 
 notes
 --|--|--
 name | note | cboid 

when posting 
# Further reading
https://developer.okta.com/blog/2018/11/15/node-express-typescript
https://codebrains.io/setting-up-express-with-typescript/
https://gist.github.com/erikvullings/c7eed546a4be0ba43532f8b83048ef38 -- dir walk
https://xgrommx.github.io/rx-book/ RxJs

# db notes

a title is the precise title of a 

cbo_person
* associated cbo_id  is used to differeniate collisions

cbo_comic_frequency
    * monthly
    * bi-weekly
    * mini-series
    * one-shot

cbo_comic_type
    * trade
    * omnibus
    * collection
    * single issue
    * graphic novel

cbo_title
    * Title of a comic

cbo_series
    * Collection of titles under a common character/subject (ie Incal, X-Men, etc)

cbo_creator_roles
* penciller
* inker
* colorist
* letterist (i18n specific?)
