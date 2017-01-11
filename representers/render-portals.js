var d3 = require('d3-selection');
var accessor = require('accessor');
// var findWhere = require('lodash.findwhere');

var getName = accessor('name');

function identity(x) {
  return x;
}

function render({portalData}) {
  console.log('portals', portalData);
  var portalsRoot = d3.select('#portals');
  var portals = portalsRoot.selectAll('.portal').data(portalData, getName);

  portals.exit().remove();

  var newPortals = portals.enter().append('section').classed('portal', true);
  newPortals.append('h3').classed('portal-name', true);
  newPortals.append('h4').classed('time-span', true);

  newPortals.append('ul').classed('projects', true).classed('main-projects', true);
  newPortals.append('ul').classed('projects', true).classed('side-projects', true);

  var updatePortals = newPortals.merge(portals);
  updatePortals.selectAll('.portal-name').text(getName);
  updatePortals.selectAll('.time-span').text(getPortalTimeSpanText);

  renderProjects(updatePortals, 'main-projects', 'mainProjects');
  renderProjects(updatePortals, 'side-projects', 'sideProjects');

  // var dimensions = updatePortals.selectAll('.dimension')
  //   .data(accessor('dimensionKits'), accessor());
  // dimensions.exit().remove();
  // var newDimensions = dimensions.enter().append('div').classed('dimension', true);
  // newDimensions.append('h4').classed('dimension-name', true);
  // newDimensions.append('ul').classed('projects', true);

  // var updateDimensions = newDimensions.merge(dimensions);
  // updateDimensions.selectAll('.dimension-name').text(getDimensionName);


}

function renderProjects(portals, projectRootClass, projectsPropertyName) {
  var projects = portals.select('.' + projectRootClass).selectAll('.project')
    .data(accessor(projectsPropertyName), accessor());
  projects.exit().remove();

  var newProjects = projects.enter().append('li').classed('project', true);
  newProjects.append('div').classed('project-name', true);
  newProjects.append('div').classed('project-time-span', true);
  newProjects.append('div').classed('project-types', true);

  var updateProjects = newProjects.merge(projects);
  updateProjects.selectAll('.project-name').text(getName);
  updateProjects.selectAll('.project-time-span').text(getProjectTimeSpanText);

  var projectTypes = updateProjects.selectAll('.project-types')
    .selectAll('.project-type')
    .data(accessor('projectTypes'), identity);
  projectTypes.exit().remove();
  projectTypes.enter().append('span').classed('project-type', true)
    .merge(projectTypes).text(identity);
}

function getPortalTimeSpanText(portal) {
  return portal.hoursPerSpan + ' hours';
}

function getProjectTimeSpanText(project) {
  return project.neededTimeSpanTotal + ' hours';
}

// function getDimensionName(dimensionKit) {
//   return dimensionKit.projectTypes.join(' ');
// }

module.exports = render;
