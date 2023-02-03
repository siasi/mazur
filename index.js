import { transform } from './extract.js'
import { readFromFile, saveRows, db } from './persistency.js'
import * as fs from 'fs'

let config = JSON.parse(fs.readFileSync('config.json'))
console.log(config)
let fileName = config.project + '.json'
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

Promise.all([
  //saveRows(tuples.stories, 'stories'),
  saveRows(tuples.tasks, 'tasks'),
  saveRows(tuples.storyToTasks, 'story_tasks', 'story_id'),
  saveRows(tuples.historyItems, 'history_items', 'issue_id'),
  //saveRows(tuples.issueToSprints, 'issue_sprints', "issue_id"),
  saveRows(tuples.issueToEpic, 'issue_epic', 'issue_id'),
  saveRows(tuples.clonedStories, 'cloned_stories', 'first_story_id'),
]).then(() => db.destroy())

// TO BE MOVED
//#! /usr/bin/env node

/*import { program } from 'commander'
import extract from 'jira-client';
import * as fs from 'fs';

var config = JSON.parse(fs.readFileSync("config.json"))
console.log(config)
await extract(config)*/
/*program
    .command('listProjects')
    .description('List all the Jira Projects')
    .action(listProjects(config))

program.parse()*/

//saveToFile(results)

//var data = readFromFile('output.json')
//console.log("There are " + data.length + " Jira items");

//var res = await extract(config)
/*var res = readFromFile("output.json")
console.log(res.length)
console.log(res[2])*/

/*
const row = { 
  epic_id : issue.id,
  key : issue.key,
  parent_id : 19016,
  parent_key : '???',
  parent_summary : '???',
  parent_issue_type : 'Epic',
  id_epic : 19016,
  issue_key : '???',
  epic_name : '???'
}*/
