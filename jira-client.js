import { Version3Client } from 'jira.js';
import * as fs from 'fs';

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

  var nextStart = 0
  var chunkSize = 100
  var results = []
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
  var textContent = JSON.stringify(results, null, 2); 
  
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

function transformIssue(issue, epicIdToName, output) {

  //console.log(issue.fields.issuetype.name + " " + issue.key)
  if (isATaskOrBug(issue)) {
    var task = newTask(issue);
    output.tasks.push(task)
    //console.log(task)
      
    /*if(len(issue.fields.labels) > 0) {
        for (label in issue.fields.labels) {
            new_dict['label'] = label
        }
    }*/
  }
  else if (isAStory(issue)) {
    var story = newStory(issue); 
    output.stories.push(story)
    //console.log(story)

    if (isAClonedStory(issue)) {
      transformClonedStoriesData(issue, output);
    }
  } 

  transformIssueToEpic(issue, epicIdToName, output)

  transformSubtasksRelationship(issue, output)

  transformHistoryData(issue, output)

  if (hasSprintData(issue)) {
    transformSprintData(issue, output)
  }         
}

function isAStory(issue) {
  return issue.fields.issuetype.name == 'Story'
}

function isATaskOrBug(issue) {
  return issue.fields.issuetype.name == 'Task' || issue.fields.issuetype.name == 'Bug'
}

function hasSprintData(issue) {
  return issue.fields.customfield_10020;
}

function transformSprintData(issue, output) {
  for (let s in issue.fields.customfield_10020) {
    var jiraSprint = issue.fields.customfield_10020[s];
    var sprint = newIssueToSprint(issue, jiraSprint);
    output.sprints.push(sprint);
  }
}

function newIssueToSprint(issue, jiraSprint) {
  var issueToSprint = {
    'issue_id': parseInt(issue.id),
    'issue_type': issue.fields.issuetype.name,
    'issue_key': issue.key,
    'issue_project': "CE",
    'issue_sprint_id': parseInt(jiraSprint.id),
    'issue_sprint_name': jiraSprint.name,
    'issue_sprint_state': jiraSprint.state
  };

  if (jiraSprint.goal) {
    issueToSprint.issue_sprint_goal = jiraSprint.goal;
  }

  if (jiraSprint.startDate) {
    issueToSprint.issue_sprint_startDate = Date.parse(jiraSprint.startDate);
  }

  if (jiraSprint.endDate) {
    issueToSprint.issue_sprint_endDate = Date.parse(issueToSprint.endDate);
  }

  if (jiraSprint.completeDate) {
    issueToSprint.issue_sprint_completeDate = Date.parse(issueToSprint.completeDate);
  }
  return issueToSprint;
}

function transformIssueToEpic(issue, epicIdToName, output) {
  
  if (issue.fields.parent) {
    var parent = issue.fields.parent
    console.log("Epic found: " + JSON.stringify(parent, null, 2))
    if (parent.fields.issuetype.name == "Epic") {
      
      var parentId = parseInt(parent.id)
      var issueToEpic = {
        issue_id : parseInt(issue.id),
        issue_key : issue.key,
        epic_id : parentId,
        epic_key : parent.key,
        epic_summary : parent.fields.summary,
        epic_name : epicIdToName.get(parentId)
      }

      output.issueToEpic.push(issueToEpic)
    }
  }
}

function transformHistoryData(issue, output) {
  for (let h in issue.changelog.histories) {
    var jiraHistory = issue.changelog.histories[h];
    for (let i in jiraHistory.items) {
      var jiraItem = jiraHistory.items[i];

      if (jiraItem.toString == 'Done' || jiraItem.toString == 'In Progress') {
        //console.log("Changelog (" + issue.key + ") " + (jiraItem.fromString || '') + " -> " + (jiraItem.toString || ''))
        var history = {
          'issue_id': parseInt(issue.id),
          'type': issue.fields.issuetype.name,
          'author': jiraHistory.author.displayName,
          'change_at': Date.parse(jiraHistory.created),
          'field_name': jiraItem.field,
          'from_state': jiraItem.fromString,
          'to_state': jiraItem.toString,
        };

        output.historyItems.push(history);
      }
    }
  }
}

function transformSubtasksRelationship(issue, output) {
  var subTasks = issue.fields.subtasks;
  for (let s in subTasks) {
    var jiraSubTask = subTasks[s];
    var subTask = {
      'story_id': parseInt(issue.id),
      'task_id': parseInt(jiraSubTask.id)
    };

    output.storyTasks.push(subTask);
  }
}

function transformClonedStoriesData(issue, output) {
  for (let i in issue.fields.issuelinks) {
    var issueLink = issue.fields.issuelinks[i];
    if (issueLink.outwardIssue) {
      //console.log("Clone " + issue.key + " from " + issueLink.outwardIssue.key)
      var clonedStory = {
        'issue_id': parseInt(issue.id),
        'issue_key': issue.key,
        'type': issueLink.type.name,
        'cloned_from_issue_id': parseInt(issueLink.outwardIssue.id),
        'cloned_from_issue_key': issueLink.outwardIssue.key,
        'cloned_from_issue_summary': issueLink.outwardIssue.fields.summary,
        'cloned_from_issue_status': issueLink.outwardIssue.fields.status.name
      };

      output.clonedStories.push(clonedStory);
      //console.log(clonedStory)
    }
  }
}

function isAClonedStory(issue) {
  return issue.fields.summary.indexOf("[CONTINUE]") != -1 && issue.fields.issuelinks.length > 0;
}

function newStory(issue) {
  var story = {
    id: parseInt(issue.id),
    //type : issue.fields.issuetype.name,
    key: issue.key,
    project: "CE",
    created_at: Date.parse(issue.fields.created),
    creator: issue.fields.creator.displayName,
    summary: issue.fields.summary,
  };

  if (issue.fields.resolution) {
    story.resolution = issue.fields.resolution.name;
    story.resolution_date = Date.parse(issue.fields.resolutiondate);
  }

  story.story_points = 0;
  if (issue.fields.customfield_10024) {
    story.story_points = parseInt(issue.fields.customfield_10024);
  }
  return story;
}

function newTask(issue) {
  var task = {
    id: parseInt(issue.id),
    type: issue.fields.issuetype.name,
    key: issue.key,
    project: "CE",
    created_at: Date.parse(issue.fields.created),
    creator: issue.fields.creator.displayName,
    summary: issue.fields.summary,
  };

  if (issue.fields.resolution) {
    task.resolution = issue.fields.resolution.name;
    task.resolution_date = Date.parse(issue.fields.resolutiondate);
  }
  return task;
}

function transform(issues) {
  var tuples = {
    stories : [],
    tasks : [],
    clonedStories : [],
    storyTasks : [],
    historyItems :[],
    issueToEpic : [],
    sprints : []
  }

  var epicIdToName = buildEpicIdToName(issues);

  for (let i=0; i<issues.length; i++) {
    transformIssue(issues[i], epicIdToName, tuples)
  }
  
  console.log("Created " + tuples.tasks.length + " Tasks/Bugs")
  console.log("Created " + tuples.stories.length + " Stories")
  console.log("Created " + tuples.clonedStories.length + " cloned Stories")
  console.log("Created " + tuples.storyTasks.length + " Subtasks")
  console.log("Created " + tuples.historyItems.length + " History items")
  console.log("Created " + tuples.issueToEpic.length + " Issue to Epic items")
  console.log("Created " + tuples.sprints.length + " Sprint items")

  return tuples;
}

var config = JSON.parse(fs.readFileSync("config.json"))
console.log(config)
var fileName = config.project + ".json"
// 1. List Projects
//listProjects(config)

// 2.1 Extract issues from Jira
//var issues = await extract(config)

// 2.2 Save Jira issues to file
//saveToFile(fileName, issues)

// 2.3 Read Jira issues from file
var issues = readFromFile(fileName)

// 3. Transform
var tuples = transform(issues)

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

function buildEpicIdToName(issues){
  var epicIdToName = new Map();
  for (let i = 0; i < issues.length; i++) {
    var issue = issues[i];
    if (issue.fields.issuetype.name == 'Epic') {
      if (issue.fields.customfield_10011) {
        epicIdToName.set(parseInt(issue.id), issue.fields.customfield_10011);
      } else {
        epicIdToName.set(parseInt(issue.id), "");
      }
    }
  }
  return epicIdToName
}

function saveRows(rows, tableName, returningField='id') {
  const chunkSize = 1000;
  db.batchInsert(tableName, rows, chunkSize)
  .returning(returningField)
  .then(function(ids) { console.log('Saved ' + ids.length + ' rows in ' + tableName + ' Table') })
  .catch(function(error) { console.log(error) });
}

saveRows(tuples.stories, 'stories');
saveRows(tuples.tasks, 'tasks');
saveRows(tuples.storyTasks, 'story_tasks', "story_id");
saveRows(tuples.historyItems, 'history_items', "issue_id");
//STORIES CLONE TO BE DONE
saveRows(tuples.sprints, 'sprints', "issue_id");
saveRows(tuples.issueToEpic, 'epics', "issue_id");