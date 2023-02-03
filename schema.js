import knex from 'knex'
/*export const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : 'string123',
    database : 'postgres'
  }
});*/

export const db = knex({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'string123',
    database: 'mysql',
  },
})

const createStories = db.schema
  .dropTableIfExists('stories')
  .createTable('stories', function (table) {
    table.integer('id').notNullable()
    table.string('key').notNullable()
    table.string('project').notNullable()
    table.dateTime('created_at').notNullable()
    table.string('creator')
    table.string('summary')
    table.string('resolution')
    table.dateTime('resolution_date')
    table.integer('story_points')
    //table.timestamps(true, true)
  })
  .then(() => console.log('Table stories created'))

const createTasks = db.schema
  .dropTableIfExists('tasks')
  .createTable('tasks', function (table) {
    table.integer('id').notNullable()
    table.string('type').notNullable()
    table.string('key').notNullable()
    table.string('project').notNullable()
    table.dateTime('created_at').notNullable()
    table.string('creator')
    table.string('summary')
    table.string('label')
    table.string('resolution')
    table.dateTime('resolution_date')
  })
  .then(() => console.log('Table tasks created'))

const createHistoryItems = db.schema
  .dropTableIfExists('history_items')
  .createTable('history_items', function (table) {
    table.integer('issue_id').notNullable()
    table.string('type').notNullable()
    table.string('author').notNullable()
    table.dateTime('change_at').notNullable()
    table.string('field_name').notNullable()
    table.string('from_state')
    table.string('to_state').notNullable()
  })
  .then(() => console.log('Table history_items created'))

const createStoryTasks = db.schema
  .dropTableIfExists('story_tasks')
  .createTable('story_tasks', function (table) {
    table.integer('story_id').notNullable()
    table.string('task_id').notNullable()
  })
  .then(() => console.log('Table story_tasks created'))

const createIssueEpic = db.schema
  .dropTableIfExists('issue_epic')
  .createTable('issue_epic', function (table) {
    table.integer('issue_id').notNullable()
    table.string('issue_key').notNullable()
    table.integer('epic_id').notNullable()
    table.string('epic_key').notNullable()
    table.string('epic_name')
    table.string('epic_summary')
  })
  .then(() => console.log('Table issue_epic created'))

const createIssueSprints = db.schema
  .dropTableIfExists('issue_sprints')
  .createTable('issue_sprints', function (table) {
    table.integer('issue_id').notNullable()
    table.string('issue_type').notNullable()
    table.string('issue_key').notNullable()
    table.string('issue_project').notNullable()
    table.integer('sprint_id')
    table.string('sprint_name')
    table.string('sprint_state')
    table.string('sprint_goal')
    table.dateTime('sprint_startDate')
    table.dateTime('sprint_endDate')
    table.dateTime('sprint_completeDate')
  })
  .then(() => console.log('Table issue_sprints created'))

const createClonedStories = db.schema
  .dropTableIfExists('cloned_stories')
  .createTable('cloned_stories', function (table) {
    table.integer('first_story_id').notNullable()
    table.integer('last_story_id').notNullable()
  })
  .then(() => console.log('Table cloned_stories created'))

Promise.all([
  createStories,
  createTasks,
  createHistoryItems,
  createStoryTasks,
  createIssueEpic,
  createIssueSprints,
  createClonedStories,
]).then(() => db.destroy())
