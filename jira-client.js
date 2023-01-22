import { Version3Client } from 'jira.js'

// Print the list of projects for the Jira account
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
    console.log('Got ' + projects.length + ' projects:')
    projects.forEach((project) => console.log(project.name))
  }
}

// Return all the issues for the project passed in the config
export async function extract(config) {
  const client = newJiraClient(config)

  let nextStart = 0
  let chunkSize = 100
  let results = []
  let reply
  do {
    reply = await client.issueSearch.searchForIssuesUsingJql({
      jql: `project = "${config.project}"`,
      startAt: nextStart,
      maxResults: chunkSize,
      expand: ['changelog'],
    })
    results = results.concat(reply.issues)
    console.log('Got ' + reply.issues.length + ' items')
    nextStart += chunkSize
  } while (reply.issues.length < chunkSize)

  console.log('TOTAL = ' + results.length)
  return results
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
  })
}
