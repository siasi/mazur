import { Version3Client } from 'jira.js';
// file system module to perform file operations
import * as fs from 'fs';

async function extract(config) {
  const client = new Version3Client({
      host: config.JIRA_SERVER,
      authentication: {
        basic: {
          email: config.JIRA_USER,
          apiToken: config.JIRA_APIKEY,
        },
      },
      newErrorHandling: true,
    });

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

function saveToFile(results) {
  // stringify JSON Object
  var textContent = JSON.stringify(results, null, 2); 
  
  fs.writeFile("output.json", textContent, 'utf8', function (err) {
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

function transform(issue, output) {

  console.log(issue.fields.issuetype.name + " " + issue.key)
  if (issue.fields.issuetype.name == 'Task' || issue.fields.issuetype.name == 'Bug') {
    var row = {
      id : parseInt(issue.id),
      type : issue.fields.issuetype.name,
      key : issue.key,
      project : "CE",
      created_at : Date.parse(issue.fields.created),
      creator : issue.fields.creator.displayName,
      summary : issue.fields.summary,
    }

    if (issue.fields.resolution) {
      row.resolution = issue.fields.resolution.name
      row.resolution_date = Date.parse(issue.fields.resolutiondate)
    }
    output.tasks.push(row)
    console.log(row)
      
    /*if(len(issue.fields.labels) > 0) {
        for (label in issue.fields.labels) {
            new_dict['label'] = label
        }
    }*/
  }
  else if (issue.fields.issuetype.name == 'Story') {
    var row = {
      id : parseInt(issue.id),
      type : issue.fields.issuetype.name,
      key : issue.key,
      project : "CE",
      created_at : Date.parse(issue.fields.created),
      creator : issue.fields.creator.displayName,
      summary : issue.fields.summary,
    }

    if (issue.fields.resolution) {
      row.resolution = issue.fields.resolution.name
      row.resolution_date = Date.parse(issue.fields.resolutiondate)
    }

    row.storyPoints = 0
    if (issue.fields.customfield_10024) {
      row.storyPoints = parseInt(issue.fields.customfield_10024)
    } 

    output.stories.push(row)
    console.log(row)

    /* Management of cloned stories */
    if (issue.fields.summary.indexOf("[CONTINUE]") != -1 && issue.fields.issuelinks.length > 0) {
      for (let i in issue.fields.issuelinks) {
        var issueLink = issue.fields.issuelinks[i]
        if (issueLink.outwardIssue) {
          console.log("Clone " + issue.key + " from " + issueLink.outwardIssue.key)

          var clonedStory = {
            'issue_id' : parseInt(issue.id),
            'issue_key' : issue.key,
            'type' : issueLink.type.name,
            'cloned_from_issue_id' : parseInt(issueLink.outwardIssue.id),
            'cloned_from_issue_key' : issueLink.outwardIssue.key,
            'cloned_from_issue_summary' : issueLink.outwardIssue.fields.summary,
            'cloned_from_issue_status' : issueLink.outwardIssue.fields.status.name
          }
          console.log(clonedStory)
          output.clonedStories.push(clonedStory);
        }
      }
    }
  } 
  else if (issue.fields.issuetype.name == 'Epic') {
    console.log("Epic " + issue.key)

    var epic = {
      'id_epic' : parseInt(issue.id),
      'issue_key' : issue.key
    }

    if (issue.fields.customfield_10011) {
      epic.epic_name = issue.fields.customfield_10011
    }
    
    console.log(epic)
    output.epics.push(epic);
  }

  /* Management of Story -> Subtasks relationship */
  var subTasks = issue.fields.subtasks
  for (let s in subTasks) {
    var jiraSubTask = subTasks[s]
    var subTask = {
      'story_id' : parseInt(issue.id),
      'task_id' : parseInt(jiraSubTask.id)
    }
    
    output.storiesTasks.push(subTask)
  }

  /* Management of History */
  for (let h in issue.changelog.histories) {
    var jiraHistory = issue.changelog.histories[h];
    for (let i in jiraHistory.items) {
      var jiraItem = jiraHistory.items[i]
      
      if (jiraItem.toString == 'Done' || jiraItem.toString == 'In Progress') {
        console.log("Changelog (" + issue.key + ") " + (jiraItem.fromString || '') + " -> " + (jiraItem.toString || ''))
        var history = {
          'issue_id' : parseInt(issue.id),
          'type' : issue.fields.issuetype.name,
          'author' : jiraHistory.author.displayName,
          'change_at' : Date.parse(jiraHistory.created),
          'field_name' : jiraItem.field,
          'from_state' : jiraItem.fromString,
          'to_state' : jiraItem.toString,
        }

        output.historyItems.push(history)
      }
    }
  }

  /* Management of Sprint */
  if (issue.fields.customfield_10020) {
    for (let s in issue.fields.customfield_10020) {
      var jiraSprint = issue.fields.customfield_10020[s]
      var sprint = {
        'issue_id' : parseInt(issue.id),
        'issue_type' :  issue.fields.issuetype.name,
        'issue_key' : issue.key,
        'issue_project' : "CE",
        'issue_sprint_id' : parseInt(jiraSprint.id),
        'issue_sprint_name' : jiraSprint.name,
        'issue_sprint_state' : jiraSprint.state
      }

      if (jiraSprint.goal) {
        sprint.issue_sprint_goal = jiraSprint.goal
      }
      
      if (jiraSprint.startDate) {
        sprint.issue_sprint_startDate = Date.parse(jiraSprint.startDate)
      }
              
      if (jiraSprint.endDate) {
        sprint.issue_sprint_endDate = Date.parse(sprint.endDate)
      }

      if (jiraSprint.completeDate) {
        sprint.issue_sprint_completeDate = Date.parse(sprint.completeDate)
      }

      output.sprints.push(sprint)
    }
  }         
}

//saveToFile(results)


//var data = readFromFile('output.json')
//console.log("There are " + data.length + " Jira items");

var config = JSON.parse(fs.readFileSync("config.json"))
console.log(config)
//var res = await extract(config)
var res = readFromFile("output.json")
console.log(res.length)
console.log(res[2])

var tuples = {
  stories : [],
  tasks : [],
  clonedStories : [],
  storiesTasks : [],
  historyItems :[],
  epics : [],
  sprints : []
}

for (let i=0; i<res.length; i++) {
  transform(res[i], tuples)
}

console.log("Found " + tuples.tasks.length + " Tasks/Bugs")
console.log("Found " + tuples.stories.length + " Stories")
console.log("Found " + tuples.clonedStories.length + " cloned Stories")
console.log("Found " + tuples.storiesTasks.length + " Subtasks")
console.log("Found " + tuples.historyItems.length + " History items")
console.log("Found " + tuples.epics.length + " Epic items")
console.log("Found " + tuples.sprints.length + " Sprint items")
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
