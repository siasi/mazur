import knex from 'knex'
const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      port : 5432,
      user : 'postgres',
      password : 'string123',
      database : 'postgres'
    }
  });

db.schema
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


  db.schema
  .dropTableIfExists('stories')
  .createTable('stories', function (table) {
    table.integer('id').notNullable()
    table.string('key').notNullable()
    table.string('project').notNullable()
    table.string('created_at').notNullable()
    table.string('creator')
    table.string('summary')
    table.string('resolution')
    table.string('resolution_date')
    table.integer('story_points')
    //table.timestamps(true, true)
  })
  .then(() => console.log("Table Stories created"))