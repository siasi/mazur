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

knex.schema
  .dropTableIfExists('epics')
  .createTable('epics', function (table) {
    table.string('epic_id')
    table.string('key').notNullable()
    table.integer('parent_id').notNullable()
    table.string('parent_key').notNullable()
    table.string('parent_summary')
    table.string('parent_issue_type')
    table.integer('id_epic')
    table.string('issue_key')
    table.string('epic_name')
    table.timestamps(true, true)
  })
  .then(() => console.log("Table Epics created"))