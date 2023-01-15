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
    table.string('issue_id').notNullable()
    table.string('issue_key').notNullable()
    table.integer('epic_id').notNullable()
    table.string('epic_key').notNullable()
    table.string('epic_name')
    table.string('epic_summary')
  })
  .then(() => console.log("Table epics created"))

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
  .then(() => console.log("Table stories created"))
  
  db.schema
  .dropTableIfExists('tasks')
  .createTable('tasks', function (table) {
    table.integer('id').notNullable()
    table.string('type').notNullable()
    table.string('key').notNullable()
    table.string('project').notNullable()
    table.string('created_at').notNullable()
    table.string('creator')
    table.string('summary')
    table.string('label')
    table.string('resolution')
    table.string('resolution_date')
  })
  .then(() => console.log("Table tasks created"))

  db.schema
  .dropTableIfExists('story_tasks')
  .createTable('story_tasks', function (table) {
    table.integer('story_id').notNullable()
    table.string('task_id').notNullable()
  })
  .then(() => console.log("Table story_tasks created"))

  db.schema
  .dropTableIfExists('history_items')
  .createTable('history_items', function (table) {
    table.integer('issue_id').notNullable()
    table.string('type').notNullable()
    table.string('author').notNullable()
    table.string('change_at').notNullable()
    table.string('field_name').notNullable()
    table.string('from_state')
    table.string('to_state').notNullable()
  })
  .then(() => console.log("Table history_items created"))

  db.schema
  .dropTableIfExists('sprints')
  .createTable('sprints', function (table) {
    table.integer('issue_id').notNullable()
    table.string('issue_type').notNullable()
    table.string('issue_key').notNullable()
    table.string('issue_project').notNullable()
    table.integer('issue_sprint_id')
    table.string('issue_sprint_name')
    table.string('issue_sprint_state')
    table.string('issue_sprint_goal')
    table.string('issue_sprint_startDate')
    table.string('issue_sprint_endDate')
    table.string('issue_sprint_completeDate')
  })
  .then(() => console.log("Table sprints created"))