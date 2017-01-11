var cloneDeep = require('lodash.clonedeep');
var dimensionKeyKit = require('./dimension-key-kit');

function calculateCompletion({projects, portals}) {

  // This variable is named "spans", but it can be whatever time span the portal
  // is described in.
  var spans = [];
  var simProjects = projects.filter(projectIsValid).map(makeSimProject);
  if (portals.length < 1) {
    return spans;
  }

  while (simProjects.length > 0) {
    // Renew portals each span. Do not renew projects.
    spans.push(workForASpan(simProjects, portals.map(makeSimPortal)));
    // console.log(spans.length, 'spans');
    // console.log('Remaining projects:', simProjects.map(p => p.name));
    if (spans.length > 520) {
      break;
    }
  }

  return spans;
}

function makeSimProject(project) {
  var simProject = cloneDeep(project);
  simProject.hoursLeft = simProject.neededTimeSpanTotal;
  return simProject;
}

function makeSimPortal(portal) {
  var simPortal = cloneDeep(portal);
  simPortal.hoursLeft = simPortal.hoursPerSpan;
  return simPortal;
}

function workForASpan(projects, portals) {
  // console.log('portals for this week:', portals);
  var weekLog = {
    projectsWorkedOnInPortals: {},
    projectsCompleted: []
  };

  var completedProjectsIndexes = [];

  projects.some(workOnProjectForASpan);
  removeItemsAtIndexes(projects, completedProjectsIndexes);
  return weekLog;

  // Returns true if project is complete.
  function workOnProjectForASpan(project, projectIndex) {
    portals.some(workOnProjectForASpanInPortal);

    // Returns true if project is complete or portal is depleted.
    function workOnProjectForASpanInPortal(portal) {
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
