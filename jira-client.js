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

function transform(issue) {
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

    
    console.log(row)
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
for (let i=0; i<res.length; i++) {
  transform(res[i])
}

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
