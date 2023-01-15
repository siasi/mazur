import { Version3Client } from 'jira.js';

const JIRA_SERVER="https://boomimagestudio.atlassian.net"

//const JIRA_USER="valentin.popov@boom.co"
//const JIRA_APIKEY="1becJDCckjD7jOvZ7d8p4BF2"
const JIRA_USER="stefano.iasi@boom.co"
const JIRA_APIKEY="nPNPbtRIu4w5lLxi74TE0774"


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
