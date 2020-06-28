create view if not exists v_cbo_txt(id,tbl,name_enUS)
as
	select i.id, i.tbl, n.name_enUS from cbo_id i, cbo_name n where i.id=n.cbo_id;

/*	select i.id, i.tbl, n.name_enUS from cbo_id i, cbo_name n where i.id=n.cbo_id and n.name_enUS match '"Ima"*';*/
