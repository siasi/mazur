export function transform(issues) {
  let tuples = {
    stories: [],
    tasks: [],
    historyItems: [],
    clonedStories: [],
    storyToTasks: [],
    issueToEpic: [],
    issueToSprints: [],
  }

  let epicIdToName = buildEpicIdToName(issues)

  for (let issue of issues) {
    transformIssue(issue, epicIdToName, tuples)
  }

  tuples.clonedStories = buildCloningHistory(tuples.clonedStories)

  console.log('Created ' + tuples.tasks.length + ' Tasks/Bugs')
  console.log('Created ' + tuples.stories.length + ' Stories')
  console.log('Created ' + tuples.clonedStories.length + ' Cloned Stories')
  console.log('Created ' + tuples.storyToTasks.length + ' Subtasks')
  console.log('Created ' + tuples.historyItems.length + ' History items')
  console.log('Created ' + tuples.issueToEpic.length + ' Issue to Epic items')
  console.log('Created ' + tuples.issueToSprints.length + ' Sprint items')

  return tuples
}

function transformIssue(issue, epicIdToName, output) {
  //console.log(issue.fields.issuetype.name + " " + issue.key)
  if (isATaskOrBug(issue)) {
    let task = newTask(issue)
    output.tasks.push(task)
    //console.log(task)

    /*if(len(issue.fields.labels) > 0) {
        for (label in issue.fields.labels) {
            new_dict['label'] = label
        }
    }*/
  } else if (isAStory(issue)) {
    let story = newStory(issue)
    output.stories.push(story)
    //console.log(story)

    if (isAClonedStory(issue)) {
      transformClonedStoriesData(issue, output)
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
  return (
    issue.fields.issuetype.name == 'Task' ||
    issue.fields.issuetype.name == 'Bug'
  )
}

function hasSprintData(issue) {
  return issue.fields.customfield_10020
}

function transformSprintData(issue, output) {
  for (let jiraSprint of issue.fields.customfield_10020) {
    let sprint = newIssueToSprint(issue, jiraSprint)
    output.issueToSprints.push(sprint)
  }
}

function newIssueToSprint(issue, jiraSprint) {
  let issueToSprint = {
    issue_id: parseInt(issue.id),
    issue_type: issue.fields.issuetype.name,
    issue_key: issue.key,
    issue_project: 'CE',
    sprint_id: parseInt(jiraSprint.id),
    sprint_name: jiraSprint.name,
    sprint_state: jiraSprint.state,
  }

  if (jiraSprint.goal) {
    issueToSprint.sprint_goal = jiraSprint.goal
  }

  if (jiraSprint.startDate) {
    issueToSprint.sprint_startDate = Date.parse(jiraSprint.startDate)
  }

  if (jiraSprint.endDate) {
    issueToSprint.sprint_endDate = Date.parse(issueToSprint.endDate)
  }

  if (jiraSprint.completeDate) {
    issueToSprint.sprint_completeDate = Date.parse(issueToSprint.completeDate)
  }
  return issueToSprint
}

function transformIssueToEpic(issue, epicIdToName, output) {
  if (issue.fields.parent) {
    let parent = issue.fields.parent
    //console.log("Epic found: " + JSON.stringify(parent, null, 2))
    if (parent.fields.issuetype.name == 'Epic') {
      let parentId = parseInt(parent.id)
      let issueToEpic = {
        issue_id: parseInt(issue.id),
        issue_key: issue.key,
        epic_id: parentId,
        epic_key: parent.key,
        epic_summary: parent.fields.summary,
        epic_name: epicIdToName.get(parentId),
      }

      output.issueToEpic.push(issueToEpic)
    }
  }
}

function transformHistoryData(issue, output) {
  for (let jiraHistory of issue.changelog.histories) {
    for (let jiraItem of jiraHistory.items) {
      if (jiraItem.toString == 'Done' || jiraItem.toString == 'In Progress') {
        //console.log("Changelog (" + issue.key + ") " + (jiraItem.fromString || '') + " -> " + (jiraItem.toString || ''))
        let history = {
          issue_id: parseInt(issue.id),
          type: issue.fields.issuetype.name,
          author: jiraHistory.author.displayName,
          change_at: Date.parse(jiraHistory.created),
          field_name: jiraItem.field,
          from_state: jiraItem.fromString,
          to_state: jiraItem.toString,
        }

        output.historyItems.push(history)
      }
    }
  }
}

function transformSubtasksRelationship(issue, output) {
  let subTasks = issue.fields.subtasks
  for (let jiraSubTask of subTasks) {
    let storyToTask = {
      story_id: parseInt(issue.id),
      task_id: parseInt(jiraSubTask.id),
    }

    output.storyToTasks.push(storyToTask)
  }
}

function transformClonedStoriesData(issue, output) {
  for (let issueLink of issue.fields.issuelinks) {
    if (issueLink.outwardIssue) {
      //console.log("Clone " + issue.key + " from " + issueLink.outwardIssue.key)
      let clonedStory = {
        issue_id: parseInt(issue.id),
        issue_key: issue.key,
        type: issueLink.type.name,
        cloned_from_issue_id: parseInt(issueLink.outwardIssue.id),
        cloned_from_issue_key: issueLink.outwardIssue.key,
        cloned_from_issue_summary: issueLink.outwardIssue.fields.summary,
        cloned_from_issue_status: issueLink.outwardIssue.fields.status.name,
      }

      output.clonedStories.push(clonedStory)
      //console.log(clonedStory)
    }
  }
}

function isAClonedStory(issue) {
  return (
    issue.fields.summary.indexOf('[CONTINUE]') != -1 &&
    issue.fields.issuelinks.length > 0
  )
}

function newStory(issue) {
  let story = {
    id: parseInt(issue.id),
    //type : issue.fields.issuetype.name,
    key: issue.key,
    project: 'CE',
    created_at: Date.parse(issue.fields.created),
    creator: issue.fields.creator.displayName,
    summary: issue.fields.summary,
  }

  if (issue.fields.resolution) {
    story.resolution = issue.fields.resolution.name
    story.resolution_date = Date.parse(issue.fields.resolutiondate)
  }

  story.story_points = 0
  if (issue.fields.customfield_10024) {
    story.story_points = parseInt(issue.fields.customfield_10024)
  }
  return story
}

function newTask(issue) {
  let task = {
    id: parseInt(issue.id),
    type: issue.fields.issuetype.name,
    key: issue.key,
    project: 'CE',
    created_at: new Date(issue.fields.created),
    creator: issue.fields.creator.displayName,
    summary: issue.fields.summary,
  }

  if (issue.fields.resolution) {
    task.resolution = issue.fields.resolution.name
    //task.resolution_date = Date.parse(issue.fields.resolutiondate);
    task.resolution_date = new Date(issue.fields.resolutiondate)
  }
  return task
}

function buildCloningHistory(clonedStories) {
  let storyToClonedFrom = clonedStories.map((cloned) => ({
    merged: false,
    cloningHistory: [cloned.issue_id, cloned.cloned_from_issue_id],
  }))
  //console.log(storyToClonedFrom);
  let storiesToDelete = []
  // Contain the list of cloned stories from the last to the first
  for (const [indexCloned, cloned] of storyToClonedFrom.entries()) {
    let currentClonedStory = cloned.cloningHistory[0]
    for (const [indexFrom, from] of storyToClonedFrom.entries()) {
      if (storyToClonedFrom[indexFrom].merged) {
        continue
      }
      // If the current cloned story is the "cloned from" another story
      let currentClonedFrom =
        from.cloningHistory[from.cloningHistory.length - 1]
      if (currentClonedStory == currentClonedFrom) {
        //collapse the two list into one
        let newSequence = [...from.cloningHistory]
        newSequence.push(
          cloned.cloningHistory[cloned.cloningHistory.length - 1]
        )
        storiesToDelete.push(currentClonedStory)
        storyToClonedFrom[indexCloned].cloningHistory = newSequence
        storyToClonedFrom[indexFrom].merged = true
      }
    }
  }
  //console.log(storyToClonedFrom);

  let cloningFirstLast = storyToClonedFrom
    .filter((x) => !x.merged)
    .map((x) => ({
      first_story_id: x.cloningHistory[x.cloningHistory.length - 1],
      last_story_id: x.cloningHistory[0],
    }))
  //console.log(cloningFirstLast);
  return cloningFirstLast
}

function buildEpicIdToName(issues) {
  let epicIdToName = new Map()
  for (let issue of issues) {
    if (issue.fields.issuetype.name == 'Epic') {
      if (issue.fields.customfield_10011) {
        epicIdToName.set(parseInt(issue.id), issue.fields.customfield_10011)
      } else {
        epicIdToName.set(parseInt(issue.id), '')
      }
    }
  }
  return epicIdToName
}
