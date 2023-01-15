const knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'string123',
      database : 'postgres'
    }
  });

  /*const users = [
    { id: 1, firstname: 'Stefano', lastname: 'Iasi', address: 'A1', city: 'Monza' },
    { id: 2, firstname: 'Giuliana', lastname: 'Manco', address: 'A1', city: 'Monza' },
    
]*/

/*knex('users').insert(users).then(() => console.log("data inserted"))
    .catch((err) => { console.log(err); throw err })
    .finally(() => {
        knex.destroy();
    });*/
    
const rows = [
  { 
    epic_id : 100,
    key : 'SUS-1',
    parent_id : 19016,
    parent_key : 'PLT-1316',
    parent_summary : 'Generig Bugfix Collection',
    parent_issue_type : 'Epic',
    id_epic : 19016,
    issue_key : 'PLT-1316',
    epic_name : 'Bugfix collection'
  }, 
  { 
    epic_id : 100,
    key : 'SUS-1',
    parent_id : 19016,
    parent_key : 'PLT-1316',
    parent_summary : 'Generig Bugfix Collection',
    parent_issue_type : 'Epic',
    id_epic : 19016,
    issue_key : 'PLT-1316',
    epic_name : 'Bugfix collection'
  },
  { 
    epic_id : 100,
    key : 'SUS-1',
    parent_id : 19016,
    parent_key : 'PLT-1316',
    parent_summary : 'Generig Bugfix Collection',
    parent_issue_type : 'Epic',
    id_epic : 19016,
    issue_key : 'PLT-1316',
    epic_name : 'Bugfix collection'
  },
  { 
    epic_id : 100,
    key : 'SUS-1',
    parent_id : 19016,
    parent_key : 'PLT-1316',
    parent_summary : 'Generig Bugfix Collection',
    parent_issue_type : 'Epic',
    id_epic : 19016,
    issue_key : 'PLT-1316',
    epic_name : 'Bugfix collection'
  }];


const chunkSize = 2;
knex.batchInsert('epics', rows, chunkSize)
  .returning('epic_id')
  .then(function(ids) { console.log('Saved ' + ids.length + ' rows') })
  .catch(function(error) { console.log(error) });