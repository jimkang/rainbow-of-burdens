var cloneDeep = require('lodash.clonedeep');
const hoursPerWeek = 10; // TODO: Parameterize

function calculateCompletion(projects) {
  var spans = [];
  var simProjects = projects.filter(projectIsValid).map(makeSimProject);

  while (simProjects.length > 0) {
    // Renew workPeriods each span. Do not renew projects.
    spans.push(workForASpan(simProjects, makeSimWorkPeriod(hoursPerWeek)));
    // console.log('Remaining projects:', simProjects.map(p => p.name));
    if (spans.length > 520) {
      break;
    }
  }

  return spans;
}

function makeSimProject(project) {
  var simProject = cloneDeep(project);
  simProject.hoursLeft = +simProject.neededTimeSpanTotal;
  return simProject;
}

function makeSimWorkPeriod(hoursPerWorkPeriod) {
  return {
    hoursPerSpan: hoursPerWorkPeriod,
    hoursLeft: hoursPerWorkPeriod
  };
}

function workForASpan(projects, workPeriod) {
  var weekLog = {
    projectsCompleted: []
  };

  var completedProjectsIndexes = [];

  projects.some(workOnProjectForASpan);
  removeItemsAtIndexes(projects, completedProjectsIndexes);
  return weekLog;

  // Returns true if there are no hours left.
  function workOnProjectForASpan(project, projectIndex) {
    if (workPeriod.hoursLeft < 0.01) {
      return true;
    }

    if (workPeriod.hoursLeft > project.hoursLeft) {
      workPeriod.hoursLeft -= project.hoursLeft;
      project.hoursLeft = 0;
      weekLog.projectsCompleted.push(project);
      completedProjectsIndexes.unshift(projectIndex);
    } else {
      project.hoursLeft -= workPeriod.hoursLeft;
      workPeriod.hoursLeft = 0;
    }
  }
}

function removeItemsAtIndexes(array, indexesHighToLow) {
  indexesHighToLow.forEach(removeIndex);
  function removeIndex(index) {
    array.splice(index, 1);
  }
}

function projectIsValid(project) {
  return project && project.neededTimeSpanTotal !== undefined;
}

module.exports = calculateCompletion;
