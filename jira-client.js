import { Version3Client } from 'jira.js';
import * as fs from 'fs';
import { transform } from './extract.js';

export async function listProjects(config) {
  const client = new Version3Client({
    host: config.JIRA_SERVER,
    authentication: {
      basic: {
        email: config.JIRA_USER,
        apiToken: config.JIRA_APIKEY,
      },
    },
    newErrorHandling: true,
  })

  const projects = await client.projects.getAllProjects()

  if (projects.length) {
     console.log("Got " + projects.length + " projects:")
     projects.forEach((project) => console.log(project.name))
  }
}

export async function extract(config) {
  const client = newJiraClient(config);

  let nextStart = 0
  let chunkSize = 100
  let results = []
  while (true) {
    const reply = await client.issueSearch.searchForIssuesUsingJql({
      jql: `project = "${config.project}"`,
      startAt: nextStart,
      maxResults: chunkSize,
      expand: ['changelog']
    });
    results = results.concat(reply.issues)
    console.log("Got " + reply.issues.length + " items")
    if (reply.issues.length < chunkSize) {
      break
    }
    nextStart += chunkSize
  }

  console.log("TOTAL = " + results.length)
  return results;
}

function newJiraClient(config) {
  return new Version3Client({
    host: config.JIRA_SERVER,
    authentication: {
      basic: {
        email: config.JIRA_USER,
        apiToken: config.JIRA_APIKEY,
      },
    },
    newErrorHandling: true,
  });
}

function saveToFile(filename, results) {
  // stringify JSON Object
  let textContent = JSON.stringify(results, null, 2); 
  
  fs.writeFile(filename, textContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
  
      console.log("JSON file has been saved.");
  });
}

function readFromFile(path) {
  return JSON.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'})) 
}



function saveRows(rows, tableName, returningField='id') {
  const chunkSize = 1000;
  db.batchInsert(tableName, rows, chunkSize)
  .returning(returningField)
  .then(function(ids) { console.log('Saved ' + ids.length + ' rows in ' + tableName + ' Table') })
  .catch(function(error) { console.log(error) });
}

let config = JSON.parse(fs.readFileSync("config.json"))
console.log(config)
let fileName = config.project + ".json"
// 1. List Projects
//listProjects(config)

// 2.1 Extract issues from Jira
//let issues = await extract(config)

// 2.2 Save Jira issues to file
//saveToFile(fileName, issues)

// 2.3 Read Jira issues from file
let issues = readFromFile(fileName)

// 3. Transform
let tuples = transform(issues)

// 4. Save to DB
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

saveRows(tuples.stories, 'stories');
saveRows(tuples.tasks, 'tasks');
saveRows(tuples.storyToTasks, 'story_tasks', "story_id");
saveRows(tuples.historyItems, 'history_items', "issue_id");
saveRows(tuples.issueToSprints, 'issue_sprints', "issue_id");
saveRows(tuples.issueToEpic, 'issue_epic', "issue_id");
saveRows(tuples.clonedStories, 'cloned_stories', "first_story_id");

//STORIES CLONE TO BE DONE