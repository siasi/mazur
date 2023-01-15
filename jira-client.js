//import fetch from 'node-fetch'

const JIRA_SERVER="https://boomimagestudio.atlassian.net"
const JIRA_USER="valentin.popov@boom.co"
const JIRA_APIKEY="1becJDCckjD7jOvZ7d8p4BF2"

/*fetch(JIRA_SERVER + '/rest/api/3/issue/search?jql=' + `project = ${projectName} AND issuetype = "Epic"`, {
  method: 'GET',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      JIRA_USER + ':' + JIRA_APIKEY
    ).toString('base64')}`,
    'Accept': 'application/json'
  }
})
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));*/

import { Version3Client } from 'jira.js';
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


/*const projects = await client.projects.getAllProjects()

if (projects.length) {
     console.log("Got " + projects.length + " projects:")
     projects.forEach((project) => console.log(project.name))
}*/

let projectName =  `"Customer Engagement"`
const issues = await client.issueSearch.searchForIssuesUsingJql({
      jql: `project = ${projectName} AND issuetype = "Epic"`,
    });
    console.log(issues.issues[1]);
    const issue = issues.issues[0];
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
    }
    //issues.issues.forEach((issue) => console.log(issue.fields.summary))
// }
