var cloneDeep = require('lodash.clonedeep');
var dimensionKeyKit = require('./dimension-key-kit');

function calculateCompletion({projects, portals}) {
  // This variable is named "weeks", but it can be whatever time span the portal
  // is described in.
  var weeks = [];
  var simProjects = projects.filter(projectIsValid).map(makeSimProject);
  if (portals.length < 1) {
    return weeks;
  }

  while (simProjects.length > 0) {
    // Renew portals each week. Do not renew projects.
    weeks.push(workForAWeek(simProjects, portals.map(makeSimPortal)));
    // console.log(weeks.length, 'weeks');
    // console.log('Remaining projects:', simProjects.map(p => p.name));
    if (weeks.length > 520) {
      break;
    }
  }

  return weeks;
}

function makeSimProject(project) {
  var simProject = cloneDeep(project);
  simProject.hoursLeft = simProject.neededTimeSpanTotal;
  return simProject;
}

function makeSimPortal(portal) {
  var simPortal = cloneDeep(portal);
  simPortal.hoursLeft = simPortal.weeklyTimeSpan;
  return simPortal;
}

function workForAWeek(projects, portals) {
  var weekLog = {
    projectsWorkedOnInPortals: {},
    projectsCompleted: []
  };

  var completedProjectsIndexes = [];

  projects.some(workOnProjectForAWeek);
  removeItemsAtIndexes(projects, completedProjectsIndexes);
  return weekLog;

  // Returns true if project is complete.
  function workOnProjectForAWeek(project, projectIndex) {
    portals.some(workOnProjectForAWeekInPortal);

    // Returns true if project is complete or portal is depleted.
    function workOnProjectForAWeekInPortal(portal) {
      if (portal.hoursLeft < 0.01) {
        return true;
      }

      var projectLog = weekLog.projectsWorkedOnInPortals[portal.name];
      if (!projectLog) {
        projectLog = [];
      }

      if (projectCanBeWorkedOnInPortal(project, portal)) {
        projectLog.push(project.name);
        weekLog.projectsWorkedOnInPortals[portal.name] = projectLog;

        if (portal.hoursLeft > project.hoursLeft) {
          portal.hoursLeft -= project.hoursLeft;
          project.hoursLeft = 0;
          weekLog.projectsCompleted.push(project);
          completedProjectsIndexes.unshift(projectIndex);
          return true;
        }
        else {
          project.hoursLeft -= portal.hoursLeft;
          portal.hoursLeft = 0;
        }
      }
    }
  }
}

function projectCanBeWorkedOnInPortal(project, portal) {
  var potentialKeys = dimensionKeyKit
    .getPossibleDimensionKeysFromProjectTypes(portal.projectTypes);

  var dimensionKey = dimensionKeyKit
    .getDimensionKeyFromProjectTypes(project.projectTypes);
  
  return potentialKeys.indexOf(dimensionKey) !== -1;
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
