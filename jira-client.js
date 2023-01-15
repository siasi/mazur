import { Version3Client } from 'jira.js';
// file system module to perform file operations
import * as fs from 'fs';

const JIRA_SERVER="https://boomimagestudio.atlassian.net"

//const JIRA_USER="valentin.popov@boom.co"
//const JIRA_APIKEY="1becJDCckjD7jOvZ7d8p4BF2"
const JIRA_USER="stefano.iasi@boom.co"
//const JIRA_APIKEY="nPNPbtRIu4w5lLxi74TE0774"
const JIRA_APIKEY="JVsKIBzJuAhCTw7zSc3J6041"
const client = new Version3Client({
    host: JIRA_SERVER,
    authentication: {
      basic: {
        email: JIRA_USER,
        apiToken: JIRA_APIKEY,
      },
    },
    newErrorHandling: true,
  });

let projectName =  `"Customer Engagement"`

var nextStart = 0
var chunkSize = 100
var results = []
while (true) {
  const reply = await client.issueSearch.searchForIssuesUsingJql({
    jql: `project = ${projectName}`,
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

saveToFile(results)

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
