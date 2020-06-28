delete from cbo_name; 
    
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_arc;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_art_style;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_character;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_character_type;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_color;
/*insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_comic;*/
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_comic_frequency;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_comic_type;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_country;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_creator_roles;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_era;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_event;
/*insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_i18n;*/
/*insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_id;*/ 
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_null;
/*insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_person;*/
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_publisher;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_rating;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_series;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_setting;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_story_title;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_title;
insert into cbo_name(cbo_id,name_enUS) select id, name_enUS from cbo_universe;

select * from cbo_name;
