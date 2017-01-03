var d3 = require('d3-selection');
var accessor = require('accessor');
// var findWhere = require('lodash.findwhere');

var getName = accessor('name');

function render({portalData}) {
  console.log('portals', portalData);
  var portalsRoot = d3.select('.portals');
  var portals = portalsRoot.selectAll('.portal').data(portalData, getName);

  portals.exit().remove();

  var newPortals = portals.enter().append('section').classed('portal', true);
  newPortals.append('h3').classed('portal-name', true);
  newPortals.append('h4').classed('time-span', true);

  var updatePortals = newPortals.merge(portals);
  updatePortals.selectAll('.portal-name').text(getName);
  updatePortals.selectAll('.time-span').text(getTimeSpanText);

  var dimensions = updatePortals.selectAll('.dimension')
    .data(accessor('dimensionKits'), accessor());
  dimensions.exit().remove();
  var newDimensions = dimensions.enter().append('div').classed('dimension', true);
  newDimensions.append('h4').classed('dimension-name', true);
  newDimensions.append('ul').classed('projects', true);

  var updateDimensions = newDimensions.merge(dimensions);
  updateDimensions.selectAll('.dimension-name').text(getDimensionName);

  var projects = updateDimensions.selectAll('.project')
    .data(accessor('projects'), accessor());
  projects.exit().remove();
  var newProjects = projects.enter().append('li').classed('project', true);
  newProjects.append('div').classed('project-name', true);
  newProjects.append('div').classed('project-time-span', true);

  var updateProjects = newProjects.merge(projects);
  updateProjects.selectAll('.project-name').text(getName);
  updateProjects.selectAll('.project-time-span').text(getTimeSpanText);
}

function getTimeSpanText(d) {
  return d.weeklyTimeSpan + ' hours per week';
}

function getDimensionName(dimensionKit) {
  return dimensionKit.projectTypes.join(' ');
}

module.exports = render;
