CREATE TABLE EPICS (
    epic_id int,
    key varchar(255), 
    parent_id int,
    parent_key varchar(255),
    parent_summary varchar(255),
    parent_issue_type varchar(255),
    id_epic int,
    issue_key varchar(255),
    epic_name varchar(255)
);

(id,`key`,parent_id,parent_key,parent_summary,parent_issue_type,id_epic,issue_key,epic_name) VALUES
	 (19093,'SUS-1',19016,'PLT-1316','Generig Bugfix Collection','Epic',19016,'PLT-1316','Bugfix collection'),